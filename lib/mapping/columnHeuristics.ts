// Map arbitrary bank headers to normalized fields

export interface NormalizedTransaction {
  date: string
  description: string
  amount: number
  merchant?: string
  gst_rate?: number
  raw: any
}

export interface ColumnMapping {
  date?: string
  description?: string
  amount?: string
  debit?: string
  credit?: string
  merchant?: string
  gst?: string
}

export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  
  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim()
    
    // Date patterns
    if (!mapping.date && /^(date|txn[\s_-]*date|posting|transaction[\s_-]*date|value[\s_-]*date|trans[\s_-]*date)$/i.test(normalizedHeader)) {
      mapping.date = header
    }
    
    // Description patterns
    if (!mapping.description && /^(description|narration|details|particulars|transaction[\s_-]*details|reference|remark|memo)$/i.test(normalizedHeader)) {
      mapping.description = header
    }
    
    // Amount patterns (single column)
    if (!mapping.amount && /^(amount|value|sum|total|transaction[\s_-]*amount)$/i.test(normalizedHeader)) {
      mapping.amount = header
    }
    
    // Debit column
    if (!mapping.debit && /^(debit|debits|dr|withdrawal|outgoing|paid)$/i.test(normalizedHeader)) {
      mapping.debit = header
    }
    
    // Credit column
    if (!mapping.credit && /^(credit|credits|cr|deposit|incoming|received)$/i.test(normalizedHeader)) {
      mapping.credit = header
    }
    
    // Merchant patterns
    if (!mapping.merchant && /^(merchant|vendor|payee|counterparty|party|beneficiary)$/i.test(normalizedHeader)) {
      mapping.merchant = header
    }
    
    // GST patterns
    if (!mapping.gst && /^(gst|tax|vat|cgst|sgst|igst|tax[\s_-]*rate)$/i.test(normalizedHeader)) {
      mapping.gst = header
    }
  }
  
  return mapping
}

export function normalizeTransaction(row: any, mapping: ColumnMapping): NormalizedTransaction | null {
  try {
    // Extract date
    const dateValue = mapping.date ? row[mapping.date] : null
    const normalizedDate = normalizeDate(dateValue)
    
    if (!normalizedDate) {
      throw new Error(`Invalid date: ${dateValue}`)
    }
    
    // Extract description
    const description = mapping.description ? String(row[mapping.description] || '').trim() : ''
    if (!description) {
      throw new Error('Missing description')
    }
    
    // Extract amount
    let amount: number
    
    if (mapping.amount) {
      // Single amount column
      amount = normalizeAmount(row[mapping.amount])
    } else if (mapping.debit && mapping.credit) {
      // Separate debit/credit columns
      const debitValue = normalizeAmount(row[mapping.debit])
      const creditValue = normalizeAmount(row[mapping.credit])
      
      if (debitValue !== 0) {
        amount = -Math.abs(debitValue) // Debits are negative
      } else if (creditValue !== 0) {
        amount = Math.abs(creditValue) // Credits are positive
      } else {
        throw new Error('No amount found in debit or credit columns')
      }
    } else {
      throw new Error('No amount column found')
    }
    
    if (isNaN(amount)) {
      throw new Error('Invalid amount')
    }
    
    // Extract optional fields
    const merchant = mapping.merchant ? String(row[mapping.merchant] || '').trim() : undefined
    const gstRate = mapping.gst ? normalizeAmount(row[mapping.gst]) : undefined
    
    return {
      date: normalizedDate,
      description,
      amount,
      merchant: merchant || undefined,
      gst_rate: gstRate || undefined,
      raw: row
    }
    
  } catch (error) {
    console.error('Failed to normalize transaction:', error, row)
    return null
  }
}

function normalizeDate(dateValue: any): string | null {
  if (!dateValue) return null
  
  try {
    let dateStr = String(dateValue).trim()
    
    // Handle Excel date numbers
    if (!isNaN(Number(dateStr))) {
      const excelDate = new Date((Number(dateStr) - 25569) * 86400 * 1000)
      if (!isNaN(excelDate.getTime())) {
        return excelDate.toISOString().split('T')[0]
      }
    }
    
    // Handle various date formats
    let date: Date
    
    // Try ISO format first
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      date = new Date(dateStr)
    }
    // Try DD/MM/YYYY or DD-MM-YYYY
    else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(dateStr)) {
      const parts = dateStr.split(/[\/\-]/)
      if (parts.length === 3) {
        let [day, month, year] = parts
        
        // Handle 2-digit years
        if (year.length === 2) {
          const currentYear = new Date().getFullYear()
          const centuryPrefix = Math.floor(currentYear / 100) * 100
          year = String(centuryPrefix + parseInt(year))
        }
        
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        return null
      }
    }
    // Try MM/DD/YYYY
    else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(dateStr)) {
      date = new Date(dateStr)
    }
    else {
      date = new Date(dateStr)
    }
    
    if (isNaN(date.getTime())) {
      return null
    }
    
    return date.toISOString().split('T')[0]
    
  } catch {
    return null
  }
}

function normalizeAmount(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0
  }
  
  try {
    let amountStr = String(value).trim()
    
    // Remove currency symbols and commas
    amountStr = amountStr.replace(/[₹$€£,\s()]/g, '')
    
    // Handle negative indicators
    const isNegative = amountStr.includes('-') || amountStr.includes('(')
    amountStr = amountStr.replace(/[-()]/g, '')
    
    // Handle decimal separators
    const amount = parseFloat(amountStr)
    
    if (isNaN(amount)) {
      return 0
    }
    
    return isNegative ? -Math.abs(amount) : amount
    
  } catch {
    return 0
  }
}

<<<<<<< HEAD
export function validateMapping(mapping: ColumnMapping, _headers: string[]): { valid: boolean; errors: string[] } {
=======
export function validateMapping(mapping: ColumnMapping, headers: string[]): { valid: boolean; errors: string[] } {
>>>>>>> b2959ab69516f91b71bffba9aa21bf00ee004093
  const errors: string[] = []
  
  if (!mapping.date) {
    errors.push('No date column detected. Expected headers like: Date, Transaction Date, Posting Date')
  }
  
  if (!mapping.description) {
    errors.push('No description column detected. Expected headers like: Description, Narration, Details')
  }
  
  if (!mapping.amount && !(mapping.debit && mapping.credit)) {
    errors.push('No amount column detected. Expected headers like: Amount, or separate Debit/Credit columns')
  }
  
  return { valid: errors.length === 0, errors }
}
