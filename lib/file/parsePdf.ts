const pdf = require('pdf-parse')

export interface ParsedRow {
  [key: string]: string
}

export interface PdfParseResult {
  data: ParsedRow[]
  errors: string[]
  meta: {
    pages?: number
    title?: string
    text?: string
  }
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  try {
    const pdfData = await pdf(buffer)
    
    if (!pdfData.text) {
      return {
        data: [],
        errors: ['PDF contains no extractable text'],
        meta: { pages: pdfData.numpages }
      }
    }
    
    // Naive row inference using regex patterns
    const transactions = extractTransactionsFromText(pdfData.text)
    
    return {
      data: transactions,
      errors: transactions.length === 0 ? ['No transaction data found in PDF'] : [],
      meta: {
        pages: pdfData.numpages,
        title: pdfData.info?.Title,
        text: pdfData.text.substring(0, 500) // First 500 chars for debugging
      }
    }
    
  } catch (error) {
    return {
      data: [],
      errors: [`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      meta: {}
    }
  }
}

function extractTransactionsFromText(text: string): ParsedRow[] {
  const transactions: ParsedRow[] = []
  const lines = text.split('\n').filter(line => line.trim())
  
  // Common bank statement patterns
  const patterns = [
    // Pattern 1: Date Amount Description
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+([+-]?\d+[.,]\d{2})\s+(.+)/,
    
    // Pattern 2: Date Description Amount
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([+-]?\d+[.,]\d{2})$/,
    
    // Pattern 3: Description Date Amount
    /^(.+?)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+([+-]?\d+[.,]\d{2})$/
  ]
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        try {
          // Different field order based on pattern
          let date: string, description: string, amount: string
          
          if (pattern === patterns[0]) {
            [, date, amount, description] = match
          } else if (pattern === patterns[1]) {
            [, date, description, amount] = match
          } else {
            [, description, date, amount] = match
          }
          
          // Normalize date format
          const normalizedDate = normalizeDate(date)
          
          // Normalize amount
          const normalizedAmount = normalizeAmount(amount)
          
          if (normalizedDate && normalizedAmount !== null) {
            transactions.push({
              Date: normalizedDate,
              Description: description.trim(),
              Amount: normalizedAmount.toString(),
              Merchant: extractMerchant(description)
            })
          }
        } catch (error) {
          // Skip malformed lines
          continue
        }
        break // Found a match, no need to try other patterns
      }
    }
  }
  
  return transactions
}

function normalizeDate(dateStr: string): string | null {
  try {
    // Handle various date formats: DD/MM/YYYY, DD-MM-YYYY, etc.
    const parts = dateStr.split(/[\/\-]/)
    
    if (parts.length === 3) {
      let [day, month, year] = parts
      
      // Handle 2-digit years
      if (year.length === 2) {
        const currentYear = new Date().getFullYear()
        const centuryPrefix = Math.floor(currentYear / 100) * 100
        year = String(centuryPrefix + parseInt(year))
      }
      
      // Convert to ISO format (YYYY-MM-DD)
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    }
    
    return null
  } catch {
    return null
  }
}

function normalizeAmount(amountStr: string): number | null {
  try {
    // Remove currency symbols and normalize decimal separators
    const cleaned = amountStr
      .replace(/[₹$€£,\s]/g, '')
      .replace(/\./g, '.')
    
    const amount = parseFloat(cleaned)
    
    if (!isNaN(amount)) {
      return amount
    }
    
    return null
  } catch {
    return null
  }
}

function extractMerchant(description: string): string {
  // Simple merchant extraction - take first few meaningful words
  const words = description.trim().split(/\s+/)
  
  // Remove common banking terms
  const filteredWords = words.filter(word => 
    !/(payment|transfer|withdrawal|deposit|fee|charge|ref|txn)/i.test(word)
  )
  
  // Return first 2-3 meaningful words as merchant
  return filteredWords.slice(0, 3).join(' ') || words.slice(0, 2).join(' ')
}

export function validatePdfData(data: ParsedRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.length === 0) {
    errors.push('PDF contains no extractable transaction data')
    return { valid: false, errors }
  }
  
  return { valid: true, errors }
}
