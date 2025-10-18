import * as XLSX from 'xlsx'

export interface ParsedRow {
  [key: string]: string | number
}

export interface XlsxParseResult {
  data: ParsedRow[]
  errors: string[]
  meta: {
    sheetName?: string
    totalSheets?: number
  }
}

export function parseXlsx(buffer: Buffer): XlsxParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        data: [],
        errors: ['Excel file contains no sheets'],
        meta: { totalSheets: 0 }
      }
    }
    
    // Use the first sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    if (!worksheet) {
      return {
        data: [],
        errors: [`Sheet "${sheetName}" not found`],
        meta: { sheetName, totalSheets: workbook.SheetNames.length }
      }
    }
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Get raw array data first
      defval: '', // Default value for empty cells
      blankrows: false
    }) as any[][]
    
    if (jsonData.length === 0) {
      return {
        data: [],
        errors: [`Sheet "${sheetName}" is empty`],
        meta: { sheetName, totalSheets: workbook.SheetNames.length }
      }
    }
    
    // First row as headers
    const headers = jsonData[0].map((header: any) => 
      String(header || '').trim()
    ).filter(Boolean)
    
    if (headers.length === 0) {
      return {
        data: [],
        errors: [`Sheet "${sheetName}" has no valid headers`],
        meta: { sheetName, totalSheets: workbook.SheetNames.length }
      }
    }
    
    // Convert data rows
    const data: ParsedRow[] = []
    const errors: string[] = []
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      const rowData: ParsedRow = {}
      
      try {
        headers.forEach((header, index) => {
          const cellValue = row[index]
          if (cellValue !== undefined && cellValue !== null) {
            // Handle dates that Excel converts to numbers
            if (typeof cellValue === 'number' && header.toLowerCase().includes('date')) {
              const excelDate = XLSX.SSF.parse_date_code(cellValue)
              if (excelDate) {
                rowData[header] = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`
              } else {
                rowData[header] = String(cellValue)
              }
            } else {
              rowData[header] = typeof cellValue === 'string' ? cellValue.trim() : cellValue
            }
          } else {
            rowData[header] = ''
          }
        })
        
        // Only add rows that have at least some data
        if (Object.values(rowData).some(value => value !== '')) {
          data.push(rowData)
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return {
      data,
      errors,
      meta: { sheetName, totalSheets: workbook.SheetNames.length }
    }
    
  } catch (error) {
    return {
      data: [],
      errors: [`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      meta: {}
    }
  }
}

export function validateXlsxData(data: ParsedRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.length === 0) {
    errors.push('Excel file is empty or has no valid data rows')
    return { valid: false, errors }
  }
  
  // Check if we have essential columns
  const firstRow = data[0]
  const headers = Object.keys(firstRow)
  
  if (headers.length === 0) {
    errors.push('Excel file has no columns')
    return { valid: false, errors }
  }
  
  return { valid: true, errors }
}
