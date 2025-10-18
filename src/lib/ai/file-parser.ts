/**
 * File parsing utilities for CSV, Excel, and PDF files
 * Extracts transaction data and applies AI categorization
 */

import TransactionAnalyzer from './transaction-analyzer'

export interface ParsedTransaction {
  date: string
  description: string
  merchant: string
  amount: number
  category?: string
  subcategory?: string
  confidence?: number
  is_recurring?: boolean
  raw_data?: Record<string, any>
}

export interface ParseResult {
  transactions: ParsedTransaction[]
  summary: {
    total_rows: number
    parsed_rows: number
    failed_rows: number
    categories_detected: string[]
  }
  errors: string[]
}

// Common CSV column mappings
const COLUMN_MAPPINGS = {
  date: ['date', 'transaction date', 'post date', 'posted date', 'tx date', 'transaction_date'],
  description: ['description', 'transaction description', 'desc', 'memo', 'details', 'payee'],
  merchant: ['merchant', 'vendor', 'payee', 'business', 'company'],
  amount: ['amount', 'transaction amount', 'debit', 'credit', 'value', 'sum'],
  category: ['category', 'type', 'classification'],
  // Handle debit/credit separately
  debit: ['debit', 'debit amount', 'withdrawal', 'out'],
  credit: ['credit', 'credit amount', 'deposit', 'in']
}

export class FileParser {
  private analyzer = TransactionAnalyzer

  // Parse CSV file content
  async parseCSV(fileContent: string, _fileName?: string): Promise<ParseResult> {
    const lines = fileContent.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const dataRows = lines.slice(1)

    // Detect column mappings
    const columnMap = this.detectColumnMapping(headers)
    
    const transactions: ParsedTransaction[] = []
    const errors: string[] = []

    for (let i = 0; i < dataRows.length; i++) {
      try {
        const rowData = this.parseCSVRow(dataRows[i])
        if (rowData.length !== headers.length) {
          errors.push(`Row ${i + 2}: Column count mismatch`)
          continue
        }

        const transaction = await this.extractTransactionFromRow(rowData, headers, columnMap, i + 2)
        if (transaction) {
          transactions.push(transaction)
        }
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Parse error'}`)
      }
    }

    return this.createParseResult(transactions, dataRows.length, errors)
  }

  // Parse Excel-like data (simplified - assumes CSV format for now)
  async parseExcel(fileContent: string, fileName?: string): Promise<ParseResult> {
    // For now, treat Excel as CSV
    // In a real implementation, you'd use a library like xlsx
    return this.parseCSV(fileContent, fileName)
  }

  // Parse PDF (placeholder - requires OCR)
  async parsePDF(_fileContent: string, _fileName: string): Promise<ParseResult> {
    // PDF parsing would require OCR and more complex extraction
    // For now, return an error with instructions
    throw new Error('PDF parsing not yet implemented. Please convert to CSV or Excel format.')
  }

  // Main parsing method - detects file type and routes to appropriate parser
  async parseFile(file: File): Promise<ParseResult> {
    const fileName = file.name.toLowerCase()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          
          if (fileName.endsWith('.csv')) {
            const result = await this.parseCSV(content, file.name)
            resolve(result)
          } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            const result = await this.parseExcel(content, file.name)
            resolve(result)
          } else if (fileName.endsWith('.pdf')) {
            const result = await this.parsePDF(content, file.name)
            resolve(result)
          } else {
            reject(new Error('Unsupported file format'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Detect which columns contain what data
  private detectColumnMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {}

    for (const [field, patterns] of Object.entries(COLUMN_MAPPINGS)) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i] || ''
        if (patterns.some(pattern => header.includes(pattern))) {
          mapping[field] = i
          break
        }
      }
    }

    return mapping
  }

  // Parse a single CSV row, handling quoted values
  private parseCSVRow(row: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  // Extract transaction data from a row
  private async extractTransactionFromRow(
    rowData: string[], 
    headers: string[], 
    columnMap: Record<string, number>,
    rowNumber: number
  ): Promise<ParsedTransaction | null> {
    try {
      // Extract basic fields
      const dateIndex = columnMap.date
      const descIndex = columnMap.description
      const merchantIndex = columnMap.merchant || columnMap.description
      const amountIndex = columnMap.amount
      const debitIndex = columnMap.debit
      const creditIndex = columnMap.credit

      if (dateIndex === undefined || descIndex === undefined) {
        throw new Error('Missing required fields (date, description)')
      }

      // Parse date
      const dateStr = rowData[dateIndex]?.replace(/"/g, '').trim()
      if (!dateStr) throw new Error('Empty date field')
      
      const date = this.parseDate(dateStr)
      if (!date) throw new Error(`Invalid date format: ${dateStr}`)

      // Parse description and merchant
      const description = rowData[descIndex]?.replace(/"/g, '').trim() || 'Unknown transaction'
      const merchant = merchantIndex !== undefined 
        ? rowData[merchantIndex]?.replace(/"/g, '').trim() || description
        : description

      // Parse amount
      let amount = 0
      if (amountIndex !== undefined) {
        // Single amount column
        const amountStr = rowData[amountIndex]?.replace(/"/g, '').replace(/[$,]/g, '').trim()
        amount = parseFloat(amountStr) || 0
      } else if (debitIndex !== undefined && creditIndex !== undefined) {
        // Separate debit/credit columns
        const debitStr = rowData[debitIndex]?.replace(/"/g, '').replace(/[$,]/g, '').trim() || '0'
        const creditStr = rowData[creditIndex]?.replace(/"/g, '').replace(/[$,]/g, '').trim() || '0'
        const debit = parseFloat(debitStr) || 0
        const credit = parseFloat(creditStr) || 0
        amount = credit - debit // Credit is positive, debit is negative
      } else {
        throw new Error('No amount column found')
      }

      if (amount === 0) {
        return null // Skip zero-amount transactions
      }

      // Use rule-based categorization for stability (AI integration disabled for now)
      const categorization = this.analyzer.categorizeWithRules(description, merchant, amount)

      // Create raw data object
      const raw_data: Record<string, any> = {}
      headers.forEach((header, index) => {
        raw_data[header] = rowData[index]?.replace(/"/g, '').trim()
      })

      return {
        date: date.toISOString().split('T')[0],
        description,
        merchant,
        amount,
        category: categorization.category,
        subcategory: categorization.subcategory,
        confidence: categorization.confidence,
        is_recurring: false, // Set to false for now
        raw_data
      }

    } catch (error) {
      console.error(`Error parsing row ${rowNumber}:`, error)
      return null
    }
  }

  // Parse various date formats
  private parseDate(dateStr: string): Date | null {
    // Try common date formats
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
    ]

    for (const format of formats) {
      if (format.test(dateStr)) {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }

    // Try natural language parsing
    const date = new Date(dateStr)
    return !isNaN(date.getTime()) ? date : null
  }

  // Create standardized parse result
  private createParseResult(transactions: ParsedTransaction[], totalRows: number, errors: string[]): ParseResult {
    const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))]
    
    return {
      transactions,
      summary: {
        total_rows: totalRows,
        parsed_rows: transactions.length,
        failed_rows: totalRows - transactions.length,
        categories_detected: categories as string[]
      },
      errors
    }
  }
}

export default new FileParser()
