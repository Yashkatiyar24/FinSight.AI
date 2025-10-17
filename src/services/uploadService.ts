// File upload and processing service
import { supabase } from '../lib/supabase'
import { detectFileType } from '../../lib/file/detect'
import { parseCsv } from '../../lib/file/parseCsv'
import { parseXlsx } from '../../lib/file/parseXlsx'
import { parsePdf } from '../../lib/file/parsePdf'
import { normalizeTransactions } from '../../lib/normalize'
import { categorizeTransaction } from '../../lib/ml/categorize'
import { applyRules } from '../../lib/rules/engine'
import type { Upload, Transaction } from '../lib/types'

export interface UploadProgress {
  stage: 'uploading' | 'parsing' | 'normalizing' | 'categorizing' | 'saving' | 'completed' | 'failed'
  progress: number
  message: string
  error?: string
}

export interface UploadResult {
  upload: Upload
  transactions: Transaction[]
  stats: {
    total_rows: number
    successful: number
    failed: number
    duplicates: number
  }
}

export class UploadService {
  private onProgress?: (progress: UploadProgress) => void

  constructor(onProgress?: (progress: UploadProgress) => void) {
    this.onProgress = onProgress
  }

  private updateProgress(stage: UploadProgress['stage'], progress: number, message: string, error?: string) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message, error })
    }
  }

  async uploadAndProcess(file: File, userId: string): Promise<UploadResult> {
    try {
      this.updateProgress('uploading', 10, 'Uploading file...')

      // 1. Upload file to Supabase Storage
      const uploadRecord = await this.uploadFile(file, userId)
      
      this.updateProgress('parsing', 25, 'Parsing file content...')

      // 2. Parse file content
      const rawTransactions = await this.parseFile(file)
      
      this.updateProgress('normalizing', 50, 'Normalizing transaction data...')

      // 3. Normalize transactions
      const normalizationResult = normalizeTransactions(rawTransactions, userId)
      
      this.updateProgress('categorizing', 70, 'Categorizing transactions...')

      // 4. Apply categorization and rules
      const categorizedTransactions = await this.categorizeTransactions(
        normalizationResult.transactions,
        userId
      )

      this.updateProgress('saving', 85, 'Saving to database...')

      // 5. Save transactions to database
      const savedTransactions = await this.saveTransactions(
        categorizedTransactions,
        uploadRecord.id,
        userId
      )

      // 6. Update upload record with results
      await this.updateUploadRecord(uploadRecord.id, {
        status: 'parsed',
        parsed_rows: normalizationResult.stats.successful,
        failed_rows: normalizationResult.stats.failed,
        processed_at: new Date().toISOString()
      })

      this.updateProgress('completed', 100, `Successfully processed ${savedTransactions.length} transactions`)

      return {
        upload: { ...uploadRecord, status: 'parsed' as const },
        transactions: savedTransactions,
        stats: normalizationResult.stats
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      this.updateProgress('failed', 100, 'Upload failed', errorMessage)
      throw error
    }
  }

  private async uploadFile(file: File, userId: string): Promise<Upload> {
    // Detect file type
    const fileDetection = detectFileType(file)
    
    // Generate unique file path
    const timestamp = Date.now()
    const filePath = `${userId}/${timestamp}-${file.name}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`)
    }

    // Create upload record in database
    const { data: uploadRecord, error: dbError } = await supabase
      .from('uploads')
      .insert({
        user_id: userId,
        original_name: file.name,
        file_path: filePath,
        file_type: fileDetection.kind,
        size_bytes: file.size,
        status: 'received'
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    return uploadRecord
  }

  private async parseFile(file: File): Promise<any[]> {
    const fileDetection = detectFileType(file)
    
    switch (fileDetection.kind) {
      case 'csv': {
        const content = await file.text()
        const result = parseCsv(content)
        
        if (result.errors.length > 0) {
          console.warn('CSV parsing warnings:', result.errors)
        }
        
        if (result.data.length === 0) {
          throw new Error('CSV file contains no data')
        }
        
        return result.data
      }
      
      case 'xlsx': {
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = parseXlsx(buffer)
        
        if (result.errors.length > 0) {
          console.warn('Excel parsing warnings:', result.errors)
        }
        
        if (result.data.length === 0) {
          throw new Error('Excel file contains no data')
        }
        
        return result.data
      }
      
      case 'pdf': {
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await parsePdf(buffer)
        
        if (result.errors.length > 0) {
          console.warn('PDF parsing warnings:', result.errors)
        }
        
        if (result.data.length === 0) {
          throw new Error('PDF file contains no transaction data')
        }
        
        return result.data
      }
      
      default:
        throw new Error(`Unsupported file type: ${fileDetection.kind}`)
    }
  }

  private async categorizeTransactions(
    transactions: any[],
    userId: string
  ): Promise<any[]> {
    // Get user rules
    const { data: userRules } = await supabase
      .from('rules')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)
      .order('priority', { ascending: false })

    return transactions.map(transaction => {
      // First, try to apply user rules
      const ruleResult = applyRules(transaction, userRules || [])
      
      if (ruleResult) {
        return {
          ...transaction,
          final_category: ruleResult.category,
          gst_rate: ruleResult.gst_rate,
          rule_applied_id: ruleResult.rule_id,
          ml_confidence: null,
          ml_predicted_category: null
        }
      }

      // Fallback to ML categorization
      const mlResult = categorizeTransaction(transaction.description, transaction.merchant)
      
      if (mlResult) {
        return {
          ...transaction,
          final_category: mlResult.category,
          gst_rate: mlResult.gst_rate,
          ml_confidence: mlResult.confidence,
          ml_predicted_category: mlResult.category,
          rule_applied_id: null
        }
      }

      // Default fallback
      return {
        ...transaction,
        final_category: 'Misc',
        gst_rate: 0,
        ml_confidence: 0.1,
        ml_predicted_category: 'Misc',
        rule_applied_id: null
      }
    })
  }

  private async saveTransactions(
    transactions: any[],
    uploadId: string,
    userId: string
  ): Promise<Transaction[]> {
    const transactionsToInsert = transactions.map(tx => ({
      user_id: userId,
      source_upload_id: uploadId,
      tx_date: tx.date,
      description: tx.description,
      merchant: tx.merchant,
      amount: tx.amount,
      gst_rate: tx.gst_rate,
      gst_amount: tx.gst_rate ? (tx.amount * tx.gst_rate / 100) : null,
      final_category: tx.final_category,
      ml_confidence: tx.ml_confidence,
      ml_predicted_category: tx.ml_predicted_category,
      rule_applied_id: tx.rule_applied_id,
      is_income: tx.is_income,
      raw_data: tx.raw_data,
      dedupe_hash: tx.dedupe_hash
    }))

    // Insert transactions in batches to avoid hitting limits
    const batchSize = 100
    const savedTransactions: Transaction[] = []

    for (let i = 0; i < transactionsToInsert.length; i += batchSize) {
      const batch = transactionsToInsert.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(batch)
        .select()

      if (error) {
        throw new Error(`Failed to save transactions: ${error.message}`)
      }

      savedTransactions.push(...(data || []))
    }

    return savedTransactions
  }

  private async updateUploadRecord(uploadId: string, updates: Partial<Upload>) {
    const { error } = await supabase
      .from('uploads')
      .update(updates)
      .eq('id', uploadId)

    if (error) {
      console.error('Failed to update upload record:', error)
    }
  }
}

// Utility function to create demo data
export async function createDemoData(userId: string): Promise<UploadResult> {
  const demoTransactions = [
    {
      date: '2024-01-15',
      description: 'Coffee Shop Purchase',
      amount: 4.95,
      merchant: 'Starbucks',
      is_income: false,
      final_category: 'Meals & Entertainment',
      gst_rate: 5,
      ml_confidence: 0.95
    },
    {
      date: '2024-01-16',
      description: 'Salary Deposit',
      amount: 3500.00,
      merchant: 'ACME Corp',
      is_income: true,
      final_category: 'Salary',
      gst_rate: 0,
      ml_confidence: 0.99
    },
    {
      date: '2024-01-17',
      description: 'Grocery Shopping',
      amount: 87.32,
      merchant: 'Big Basket',
      is_income: false,
      final_category: 'Groceries',
      gst_rate: 0,
      ml_confidence: 0.89
    },
    {
      date: '2024-01-18',
      description: 'Netflix Subscription',
      amount: 9.99,
      merchant: 'Netflix',
      is_income: false,
      final_category: 'Subscriptions',
      gst_rate: 18,
      ml_confidence: 0.98
    },
    {
      date: '2024-01-19',
      description: 'Uber Ride',
      amount: 12.50,
      merchant: 'Uber',
      is_income: false,
      final_category: 'Travel',
      gst_rate: 5,
      ml_confidence: 0.92
    }
  ]

  // Create demo upload record
  const { data: uploadRecord, error: uploadError } = await supabase
    .from('uploads')
    .insert({
      user_id: userId,
      original_name: 'demo-transactions.csv',
      file_path: `demo/${userId}/demo-transactions.csv`,
      file_type: 'csv',
      size_bytes: 1024,
      status: 'parsed',
      parsed_rows: demoTransactions.length,
      failed_rows: 0,
      processed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (uploadError) {
    throw new Error(`Failed to create demo upload: ${uploadError.message}`)
  }

  // Insert demo transactions
  const transactionsToInsert = demoTransactions.map(tx => ({
    user_id: userId,
    source_upload_id: uploadRecord.id,
    tx_date: tx.date,
    description: tx.description,
    merchant: tx.merchant,
    amount: tx.amount,
    gst_rate: tx.gst_rate,
    gst_amount: tx.gst_rate ? (tx.amount * tx.gst_rate / 100) : null,
    final_category: tx.final_category,
    ml_confidence: tx.ml_confidence,
    ml_predicted_category: tx.final_category,
    is_income: tx.is_income,
    raw_data: tx,
    dedupe_hash: `demo-${Date.now()}-${Math.random()}`
  }))

  const { data: savedTransactions, error: txError } = await supabase
    .from('transactions')
    .insert(transactionsToInsert)
    .select()

  if (txError) {
    throw new Error(`Failed to save demo transactions: ${txError.message}`)
  }

  return {
    upload: uploadRecord,
    transactions: savedTransactions || [],
    stats: {
      total_rows: demoTransactions.length,
      successful: demoTransactions.length,
      failed: 0,
      duplicates: 0
    }
  }
}