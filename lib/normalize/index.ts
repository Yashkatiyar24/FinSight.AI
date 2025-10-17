// Data normalization for transaction files
import { format, parse, isValid } from 'date-fns'
import { createHash } from 'crypto'

export interface RawTransaction {
  [key: string]: string | number | null
}

export interface NormalizedTransaction {
  date: string // YYYY-MM-DD format
  description: string
  amount: number
  merchant?: string
  category?: string
  gst_rate?: number
  gst_amount?: number
  gstin?: string
  is_income: boolean
  raw_data: RawTransaction
  dedupe_hash: string
}

export interface NormalizationResult {
  transactions: NormalizedTransaction[]
  errors: string[]
  stats: {
    total_rows: number
    successful: number
    failed: number
    duplicates: number
  }
}

// Common column mappings for different bank/financial formats
const COLUMN_MAPPINGS = {
  date: [
    'date', 'transaction_date', 'txn_date', 'posting_date', 'value_date',
    'transaction date', 'txn date', 'posting date', 'value date',
    'Date', 'Transaction Date', 'Txn Date', 'Posting Date', 'Value Date'
  ],
  description: [
    'description', 'narration', 'particulars', 'details', 'transaction_details',
    'Description', 'Narration', 'Particulars', 'Details', 'Transaction Details',
    'memo', 'reference', 'Memo', 'Reference'
  ],
  amount: [
    'amount', 'debit', 'credit', 'withdrawal', 'deposit', 'value', 'sum', 'total',
    'Amount', 'Debit', 'Credit', 'Withdrawal', 'Deposit', 'Value', 'Sum', 'Total'
  ],
  merchant: [
    'merchant', 'payee', 'vendor', 'supplier', 'counterparty', 'beneficiary',
    'Merchant', 'Payee', 'Vendor', 'Supplier', 'Counterparty', 'Beneficiary'
  ],
  category: [
    'category', 'type', 'classification', 'tag', 'group',
    'Category', 'Type', 'Classification', 'Tag', 'Group'
  ]
}

export function normalizeTransactions(
  rawData: RawTransaction[],
  userId: string
): NormalizationResult {
  const result: NormalizationResult = {
    transactions: [],
    errors: [],
    stats: {
      total_rows: rawData.length,
      successful: 0,
      failed: 0,
      duplicates: 0
    }
  }

  if (rawData.length === 0) {
    result.errors.push('No data to normalize')
    return result
  }

  // Detect column mappings
  const columnMap = detectColumns(rawData[0])
  console.log('Detected column mappings:', columnMap)

  const seenHashes = new Set<string>()

  for (let i = 0; i < rawData.length; i++) {
    try {
      const normalized = normalizeRow(rawData[i], columnMap, userId)
      
      if (normalized) {
        // Check for duplicates
        if (seenHashes.has(normalized.dedupe_hash)) {
          result.stats.duplicates++
          continue
        }
        
        seenHashes.add(normalized.dedupe_hash)
        result.transactions.push(normalized)
        result.stats.successful++
      } else {
        result.stats.failed++
        result.errors.push(`Row ${i + 1}: Unable to normalize transaction`)
      }
    } catch (error) {
      result.stats.failed++
      result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return result
}

function detectColumns(sampleRow: RawTransaction): Record<string, string | null> {
  const headers = Object.keys(sampleRow)
  const columnMap: Record<string, string | null> = {
    date: null,
    description: null,
    amount: null,
    merchant: null,
    category: null
  }

  for (const [field, possibleNames] of Object.entries(COLUMN_MAPPINGS)) {
    for (const possibleName of possibleNames) {
      const match = headers.find(header => 
        header.toLowerCase().trim() === possibleName.toLowerCase().trim()
      )
      if (match) {
        columnMap[field] = match
        break
      }
    }
  }

  // Fallback: try fuzzy matching
  if (!columnMap.date) {
    columnMap.date = headers.find(h => /date/i.test(h)) || null
  }
  
  if (!columnMap.description) {
    columnMap.description = headers.find(h => /desc|narr|part|detail/i.test(h)) || null
  }
  
  if (!columnMap.amount) {
    columnMap.amount = headers.find(h => /amount|debit|credit|value|sum/i.test(h)) || null
  }

  return columnMap
}

function normalizeRow(
  row: RawTransaction,
  columnMap: Record<string, string | null>,
  userId: string
): NormalizedTransaction | null {
  // Extract date
  const dateValue = columnMap.date ? row[columnMap.date] : null
  const normalizedDate = normalizeDate(dateValue)
  if (!normalizedDate) {
    throw new Error('Invalid or missing date')
  }

  // Extract description
  const descValue = columnMap.description ? row[columnMap.description] : null
  const description = String(descValue || '').trim()
  if (!description) {
    throw new Error('Missing description')
  }

  // Extract amount
  const amountValue = columnMap.amount ? row[columnMap.amount] : null
  const amount = normalizeAmount(amountValue)
  if (amount === null) {
    throw new Error('Invalid or missing amount')
  }

  // Extract optional fields
  const merchant = columnMap.merchant ? String(row[columnMap.merchant] || '').trim() : undefined
  const category = columnMap.category ? String(row[columnMap.category] || '').trim() : undefined

  // Determine if it's income (positive amount usually means credit/income)
  const is_income = amount > 0

  // Create dedupe hash
  const dedupeString = `${userId}|${normalizedDate}|${description}|${Math.abs(amount)}`
  const dedupe_hash = createHash('sha1').update(dedupeString).digest('hex')

  return {
    date: normalizedDate,
    description,
    amount: Math.abs(amount), // Store as positive, use is_income flag
    merchant: merchant || undefined,
    category: category || undefined,
    is_income,
    raw_data: row,
    dedupe_hash
  }
}

function normalizeDate(value: any): string | null {
  if (!value) return null

  // Handle different date formats
  const dateStr = String(value).trim()
  
  // Common date formats to try
  const formats = [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'dd-MM-yyyy',
    'MM-dd-yyyy',
    'yyyy/MM/dd',
    'dd.MM.yyyy',
    'yyyy.MM.dd'
  ]

  for (const formatStr of formats) {
    try {
      const parsed = parse(dateStr, formatStr, new Date())
      if (isValid(parsed)) {
        return format(parsed, 'yyyy-MM-dd')
      }
    } catch {
      continue
    }
  }

  // Try native Date parsing as fallback
  try {
    const parsed = new Date(dateStr)
    if (isValid(parsed)) {
      return format(parsed, 'yyyy-MM-dd')
    }
  } catch {
    // Ignore
  }

  return null
}

function normalizeAmount(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  // Convert to string and clean
  let amountStr = String(value).trim()
  
  // Remove currency symbols and commas
  amountStr = amountStr.replace(/[₹$€£,\s]/g, '')
  
  // Handle parentheses (usually indicates negative)
  let isNegative = false
  if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
    isNegative = true
    amountStr = amountStr.slice(1, -1)
  }

  // Parse as float
  const parsed = parseFloat(amountStr)
  if (isNaN(parsed)) {
    return null
  }

  return isNegative ? -parsed : parsed
}

// Utility to validate normalized transactions
export function validateNormalizedTransaction(
  transaction: NormalizedTransaction
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!transaction.date || !/^\d{4}-\d{2}-\d{2}$/.test(transaction.date)) {
    errors.push('Invalid date format (expected YYYY-MM-DD)')
  }

  if (!transaction.description || transaction.description.length < 2) {
    errors.push('Description too short or missing')
  }

  if (typeof transaction.amount !== 'number' || transaction.amount < 0) {
    errors.push('Amount must be a positive number')
  }

  if (!transaction.dedupe_hash || transaction.dedupe_hash.length !== 40) {
    errors.push('Invalid dedupe hash')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}