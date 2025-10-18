// File upload and processing service

import { supabase, supabaseAdmin } from '../supabase'
import { detectFileType } from '../file/detect'
import { parseCsv } from '../file/parseCsv'
import { parseXlsx } from '../file/parseXlsx'
import { parsePdf } from '../file/parsePdf'
import { detectColumnMapping, normalizeTransaction } from '../mapping/columnHeuristics'
import { applyRules } from '../rules/engine'
import { categorizeTransaction } from '../ml/categorize'
import { generateDedupeHash } from '../utils'
import { log } from '../log'
import type { FileRecord, Transaction, Rule } from '../supabase'

export interface UploadResult {
  fileId: string
  success: boolean
  error?: string
}

export interface IngestResult {
  inserted: number
  skipped: number
  errors: string[]
  durationMs: number
}

export class FileService {
  private userId: string
  
  constructor(userId: string) {
    this.userId = userId
  }

  async uploadFile(file: File): Promise<UploadResult> {
    try {
      log({
        route: 'FileService.uploadFile',
        user_id: this.userId,
        message: `Starting upload for file: ${file.name}`,
        data: { size: file.size, type: file.type }
      })

      // Validate file
      const detection = detectFileType(file)
      
      // Generate unique file path
      const fileId = crypto.randomUUID()
      const filePath = `${this.userId}/${fileId}.${detection.ext}`
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }
      
      // Create file record
      const { data: fileRecord, error: dbError } = await supabaseAdmin
        .from('files')
        .insert({
          id: fileId,
          user_id: this.userId,
          original_name: file.name,
          mime_type: detection.mime,
          ext: detection.ext,
          size: file.size,
          status: 'uploaded'
        })
        .select()
        .single()
      
      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`)
      }
      
      log({
        route: 'FileService.uploadFile',
        user_id: this.userId,
        file_id: fileId,
        message: 'File uploaded successfully'
      })
      
      return { fileId, success: true }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      log({
        route: 'FileService.uploadFile',
        user_id: this.userId,
        message: 'Upload failed',
        level: 'error',
        data: { error: errorMsg }
      })
      
      return { fileId: '', success: false, error: errorMsg }
    }
  }

  async ingestFile(fileId: string): Promise<IngestResult> {
    const startTime = Date.now()
    
    try {
      log({
        route: 'FileService.ingestFile',
        user_id: this.userId,
        file_id: fileId,
        message: 'Starting file ingestion'
      })

      // Update file status
      await this.updateFileStatus(fileId, 'processing')
      
      // Get file record
      const { data: fileRecord, error: fileError } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', this.userId)
        .single()
      
      if (fileError || !fileRecord) {
        throw new Error('File not found')
      }
      
      // Download file from storage
      const filePath = `${this.userId}/${fileId}.${fileRecord.ext}`
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('uploads')
        .download(filePath)
      
      if (downloadError || !fileData) {
        throw new Error(`Download failed: ${downloadError?.message}`)
      }
      
      // Parse file based on type
      const buffer = await fileData.arrayBuffer()
      const parseResult = await this.parseFileContent(buffer, fileRecord.ext!)
      
      if (parseResult.errors.length > 0) {
        log({
          route: 'FileService.ingestFile',
          user_id: this.userId,
          file_id: fileId,
          message: 'Parse warnings',
          level: 'warn',
          data: { errors: parseResult.errors }
        })
      }
      
      // Get user rules
      const { data: rules } = await supabaseAdmin
        .from('rules')
        .select('*')
        .eq('user_id', this.userId)
        .eq('active', true)
      
      // Normalize and categorize transactions
      const transactions = await this.processTransactions(
        parseResult.data, 
        fileId, 
        rules || []
      )
      
      // Insert transactions with deduplication
      const insertResult = await this.insertTransactions(transactions)
      
      // Update file status
      await this.updateFileStatus(fileId, 'parsed')
      
      const durationMs = Date.now() - startTime
      
      log({
        route: 'FileService.ingestFile',
        user_id: this.userId,
        file_id: fileId,
        message: 'Ingestion completed',
        data: { 
          inserted: insertResult.inserted,
          skipped: insertResult.skipped,
          durationMs 
        }
      })
      
      return {
        inserted: insertResult.inserted,
        skipped: insertResult.skipped,
        errors: parseResult.errors,
        durationMs
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      await this.updateFileStatus(fileId, 'failed', errorMsg)
      
      log({
        route: 'FileService.ingestFile',
        user_id: this.userId,
        file_id: fileId,
        message: 'Ingestion failed',
        level: 'error',
        data: { error: errorMsg }
      })
      
      return {
        inserted: 0,
        skipped: 0,
        errors: [errorMsg],
        durationMs: Date.now() - startTime
      }
    }
  }

  private async parseFileContent(buffer: ArrayBuffer, ext: string) {
    const bufferObj = Buffer.from(buffer)
    
    switch (ext.toLowerCase()) {
      case 'csv':
        const csvContent = bufferObj.toString('utf-8')
        return parseCsv(csvContent)
        
      case 'xlsx':
      case 'xls':
        return parseXlsx(bufferObj)
        
      case 'pdf':
        return await parsePdf(bufferObj)
        
      default:
        throw new Error(`Unsupported file type: ${ext}`)
    }
  }

  private async processTransactions(
    rawData: any[], 
    fileId: string, 
    rules: Rule[]
  ) {
    if (rawData.length === 0) return []
    
    // Detect column mapping
    const headers = Object.keys(rawData[0])
    const mapping = detectColumnMapping(headers)
    
    const transactions: any[] = []
    
    for (const row of rawData) {
      // Normalize transaction
      const normalized = normalizeTransaction(row, mapping)
      if (!normalized) continue
      
      // Apply rules first
      let categoryResult = applyRules(normalized, rules)
      
      // Fallback to ML categorization
      if (!categoryResult) {
        categoryResult = categorizeTransaction(
          normalized.description, 
          normalized.merchant
        )
      }
      
      // Generate dedupe hash
      const dedupeHash = generateDedupeHash(
        this.userId,
        normalized.date,
        normalized.description,
        normalized.amount
      )
      
      transactions.push({
        user_id: this.userId,
        file_id: fileId,
        date: normalized.date,
        description: normalized.description,
        amount: normalized.amount,
        merchant: normalized.merchant,
        gst_rate: categoryResult?.gst_rate || normalized.gst_rate || 0,
        category: categoryResult?.category || 'Misc',
        category_confidence: categoryResult?.confidence || 0,
        raw: normalized.raw,
        dedupe_hash: dedupeHash
      })
    }
    
    return transactions
  }

  private async insertTransactions(transactions: any[]) {
    if (transactions.length === 0) {
      return { inserted: 0, skipped: 0 }
    }
    
    // Bulk insert with ON CONFLICT ignore for deduplication
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .upsert(transactions, { 
        onConflict: 'dedupe_hash',
        ignoreDuplicates: true 
      })
      .select('id')
    
    if (error) {
      throw new Error(`Transaction insert failed: ${error.message}`)
    }
    
    const inserted = data?.length || 0
    const skipped = transactions.length - inserted
    
    return { inserted, skipped }
  }

  private async updateFileStatus(
    fileId: string, 
    status: 'uploaded' | 'processing' | 'parsed' | 'failed',
    error?: string
  ) {
    await supabaseAdmin
      .from('files')
      .update({ 
        status, 
        error,
        ...(status === 'parsed' && { error: null })
      })
      .eq('id', fileId)
      .eq('user_id', this.userId)
  }
}
