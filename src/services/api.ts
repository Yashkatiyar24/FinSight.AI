// API service layer for FinSight.AI
import { supabase } from '../lib/supabase'
import { detectFileType } from '../../lib/file/detect'
import { parseCsv } from '../../lib/file/parseCsv'
import { parseXlsx } from '../../lib/file/parseXlsx'
import { parsePdf } from '../../lib/file/parsePdf'
import { detectColumnMapping, normalizeTransaction } from '../../lib/mapping/columnHeuristics'
import { applyRules } from '../../lib/rules/engine'
import { categorizeTransaction } from '../../lib/ml/categorize'
import type { Rule, DashboardMetrics } from '../lib/types'

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

export interface ProcessedTransaction {
  id?: string
  user_id: string
  tx_date: string
  description: string
  merchant?: string
  amount: number
  gst_rate?: number
  gst_amount?: number
  category?: string
  final_category?: string
  ml_confidence?: number
  ml_predicted_category?: string
  source_upload_id?: string
  rule_applied_id?: string
  is_income: boolean
  notes?: string
  raw?: any
  dedupe_hash?: string
}

export class ApiService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // File upload and processing
  async uploadFile(file: File): Promise<UploadResult> {
    try {
      console.log(`Starting upload for file: ${file.name}`)

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
      const { data: _, error: dbError } = await supabase
        .from('uploads')
        .insert({
          id: fileId,
          user_id: this.userId,
          original_name: file.name,
          file_path: filePath,
          file_type: detection.kind as any,
          size_bytes: file.size,
          status: 'received'
        })
        .select()
        .single()
      
      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`)
      }
      
      console.log('File uploaded successfully:', fileId)
      
      return { fileId, success: true }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('Upload failed:', errorMsg)
      
      return { fileId: '', success: false, error: errorMsg }
    }
  }

  async processFile(fileId: string): Promise<IngestResult> {
    const startTime = Date.now()
    
    try {
      console.log('Starting file processing:', fileId)

      // Update file status
      await this.updateFileStatus(fileId, 'parsing')
      
      // Get file record
      const { data: fileRecord, error: fileError } = await supabase
        .from('uploads')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', this.userId)
        .single()
      
      if (fileError || !fileRecord) {
        throw new Error('File not found')
      }
      
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('uploads')
        .download(fileRecord.file_path)
      
      if (downloadError || !fileData) {
        throw new Error(`Download failed: ${downloadError?.message}`)
      }
      
      // Parse file based on type
      const buffer = await fileData.arrayBuffer()
      const parseResult = await this.parseFileContent(buffer, fileRecord.file_type)
      
      if (parseResult.errors.length > 0) {
        console.warn('Parse warnings:', parseResult.errors)
      }
      
      // Get user rules
      const { data: rules } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', this.userId)
        .eq('enabled', true)
      
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
      
      console.log('Processing completed:', {
        inserted: insertResult.inserted,
        skipped: insertResult.skipped,
        durationMs 
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
      
      console.error('Processing failed:', errorMsg)
      
      return {
        inserted: 0,
        skipped: 0,
        errors: [errorMsg],
        durationMs: Date.now() - startTime
      }
    }
  }

  private async parseFileContent(buffer: ArrayBuffer, fileType: string) {
    const bufferObj = Buffer.from(buffer)
    
    switch (fileType.toLowerCase()) {
      case 'csv':
        const csvContent = bufferObj.toString('utf-8')
        return parseCsv(csvContent)
        
      case 'xlsx':
      case 'xls':
        return parseXlsx(bufferObj)
        
      case 'pdf':
        return await parsePdf(bufferObj)
        
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  private async processTransactions(
    rawData: any[], 
    fileId: string, 
    rules: Rule[]
  ): Promise<ProcessedTransaction[]> {
    if (rawData.length === 0) return []
    
    // Detect column mapping
    const headers = Object.keys(rawData[0])
    const mapping = detectColumnMapping(headers)
    
    const transactions: ProcessedTransaction[] = []
    
    for (const row of rawData) {
      // Normalize transaction
      const normalized = normalizeTransaction(row, mapping)
      if (!normalized) continue
      
      // Apply rules first
      let categoryResult = applyRules(normalized, rules as any)
      
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
      
      // Determine if it's income
      const isIncome = normalized.amount > 0
      
      transactions.push({
        user_id: this.userId,
        tx_date: normalized.date,
        description: normalized.description,
        amount: normalized.amount,
        merchant: normalized.merchant,
        gst_rate: categoryResult?.gst_rate || normalized.gst_rate || 0,
        gst_amount: normalized.amount * (categoryResult?.gst_rate || normalized.gst_rate || 0) / 100,
        category: categoryResult?.category || 'Misc',
        final_category: categoryResult?.category || 'Misc',
        ml_confidence: categoryResult?.confidence || 0,
        ml_predicted_category: categoryResult?.matched_by === 'ml' ? categoryResult.category : undefined,
        source_upload_id: fileId,
        rule_applied_id: categoryResult?.matched_by === 'rule' ? categoryResult.rule_id?.toString() : undefined,
        is_income: isIncome,
        raw: normalized.raw,
        dedupe_hash: dedupeHash
      })
    }
    
    return transactions
  }

  private async insertTransactions(transactions: ProcessedTransaction[]) {
    if (transactions.length === 0) {
      return { inserted: 0, skipped: 0 }
    }
    
    // Bulk insert with ON CONFLICT ignore for deduplication
    const { data, error } = await supabase
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
    status: 'received' | 'parsing' | 'parsed' | 'failed',
    error?: string
  ) {
    await supabase
      .from('uploads')
      .update({ 
        status, 
        error_details: error ? { error } : null,
        processed_at: status === 'parsed' ? new Date().toISOString() : null
      })
      .eq('id', fileId)
      .eq('user_id', this.userId)
  }

  // Dashboard data
  async getDashboardMetrics(startDate?: string, endDate?: string): Promise<DashboardMetrics> {
    const { data, error } = await supabase.rpc('get_dashboard_metrics', {
      user_uuid: this.userId,
      start_date: startDate,
      end_date: endDate
    })

    if (error) {
      console.error('Error fetching dashboard metrics:', error)
      return {
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0,
        total_transactions: 0,
        total_gst: 0,
        categories: []
      }
    }

    return data || {
      total_revenue: 0,
      total_expenses: 0,
      net_profit: 0,
      total_transactions: 0,
      total_gst: 0,
      categories: []
    }
  }

  // Transactions
  async getTransactions(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', this.userId)
      .order('tx_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return data || []
  }

  // Rules
  async getRules() {
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rules:', error)
      return []
    }

    return data || []
  }

  async createRule(rule: Partial<Rule>) {
    const { data, error } = await supabase
      .from('rules')
      .insert({
        user_id: this.userId,
        ...rule
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create rule: ${error.message}`)
    }

    return data
  }

  async updateRule(ruleId: string, updates: Partial<Rule>) {
    const { data, error } = await supabase
      .from('rules')
      .update(updates)
      .eq('id', ruleId)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update rule: ${error.message}`)
    }

    return data
  }

  async deleteRule(ruleId: string) {
    const { error } = await supabase
      .from('rules')
      .delete()
      .eq('id', ruleId)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete rule: ${error.message}`)
    }
  }

  // Reports
  async generateReport(type: 'expense' | 'tax' | 'pnl', startDate: string, endDate: string) {
    // This would integrate with a report generation service
    // For now, return a placeholder
    const reportId = crypto.randomUUID()
    
    const { data, error } = await supabase
      .from('reports')
      .insert({
        id: reportId,
        user_id: this.userId,
        name: `${type.toUpperCase()} Report - ${startDate} to ${endDate}`,
        type,
        period_start: startDate,
        period_end: endDate,
        metrics: {},
        parameters: { startDate, endDate }
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create report: ${error.message}`)
    }

    return data
  }

  // File management
  async getUploads() {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching uploads:', error)
      return []
    }

    return data || []
  }
}

// Utility function to generate dedupe hash
function generateDedupeHash(userId: string, date: string, description: string, amount: number): string {
  const content = `${userId}-${date}-${description}-${amount}`
  // Simple hash function - in production, use crypto.subtle.digest
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

export { generateDedupeHash }
