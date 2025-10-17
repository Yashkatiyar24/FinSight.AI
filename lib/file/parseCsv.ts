import Papa from 'papaparse'

export interface ParsedRow {
  [key: string]: string
}

export interface CsvParseResult {
  data: ParsedRow[]
  errors: string[]
  meta: {
    fields?: string[]
    delimiter?: string
    linebreak?: string
    aborted?: boolean
    truncated?: boolean
  }
}

export function parseCsv(content: string): CsvParseResult {
  try {
    const result = Papa.parse<ParsedRow>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      delimiter: '', // Auto-detect
      encoding: 'UTF-8'
    })

    return {
      data: result.data,
      errors: result.errors.map(error => `Row ${error.row}: ${error.message}`),
      meta: result.meta
    }
  } catch (error) {
    return {
      data: [],
      errors: [`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      meta: {}
    }
  }
}

export function validateCsvData(data: ParsedRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.length === 0) {
    errors.push('CSV file is empty or has no valid data rows')
    return { valid: false, errors }
  }
  
  // Check if we have essential columns
  const firstRow = data[0]
  const headers = Object.keys(firstRow)
  
  if (headers.length === 0) {
    errors.push('CSV file has no columns')
    return { valid: false, errors }
  }
  
  // Look for date-like columns
  const hasDateColumn = headers.some(header => 
    /^(date|txn[\s_-]*date|posting|transaction[\s_-]*date)$/i.test(header)
  )
  
  if (!hasDateColumn) {
    console.warn('No obvious date column found. Headers:', headers)
  }
  
  // Look for amount-like columns
  const hasAmountColumn = headers.some(header => 
    /^(amount|debit|credit|value|sum|total)$/i.test(header)
  )
  
  if (!hasAmountColumn) {
    console.warn('No obvious amount column found. Headers:', headers)
  }
  
  return { valid: true, errors }
}
