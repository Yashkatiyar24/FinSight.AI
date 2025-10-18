// Robust file type detection

export type FileKind = 'csv' | 'xlsx' | 'pdf'

export interface DetectionResult {
  kind: FileKind
  ext: string
  mime: string
}

export function detectFileType(file: File): DetectionResult {
  const originalName = file.name || 'unnamed'
  const mimeType = file.type || 'application/octet-stream'
  
  // First, try mime type
  if (mimeType.includes('text/csv') || mimeType.includes('application/csv')) {
    return { kind: 'csv', ext: 'csv', mime: mimeType }
  }
  
  if (mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    return { kind: 'xlsx', ext: 'xlsx', mime: mimeType }
  }
  
  if (mimeType.includes('application/vnd.ms-excel')) {
    return { kind: 'xlsx', ext: 'xls', mime: mimeType }
  }
  
  if (mimeType.includes('application/pdf')) {
    return { kind: 'pdf', ext: 'pdf', mime: mimeType }
  }
  
  // Fallback to file extension
  const extension = getFileExtension(originalName)
  if (extension) {
    switch (extension.toLowerCase()) {
      case 'csv':
        return { kind: 'csv', ext: 'csv', mime: 'text/csv' }
      case 'xlsx':
        return { kind: 'xlsx', ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      case 'xls':
        return { kind: 'xlsx', ext: 'xls', mime: 'application/vnd.ms-excel' }
      case 'pdf':
        return { kind: 'pdf', ext: 'pdf', mime: 'application/pdf' }
    }
  }
  
  // Last resort: attempt to sniff content (client-side limited)
  // This would require reading file content which we'll do server-side
  throw new Error(`Unsupported file type: ${extension || 'unknown'} (allowed: .csv, .xlsx, .pdf)`)
}

export function getFileExtension(filename: string): string | null {
  if (!filename || typeof filename !== 'string') {
    return null
  }
  
  const parts = filename.split('.')
  if (parts.length < 2) {
    return null
  }
  
  return parts[parts.length - 1].toLowerCase()
}

export function validateFileName(filename: string): { valid: boolean; error?: string } {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: 'Invalid filename: (unnamed)' }
  }
  
  if (filename.trim().length === 0) {
    return { valid: false, error: 'Invalid filename: empty' }
  }
  
  const extension = getFileExtension(filename)
  if (!extension) {
    return { valid: false, error: `Invalid filename: ${filename} (no extension)` }
  }
  
  const allowedExtensions = ['csv', 'xlsx', 'xls', 'pdf']
  if (!allowedExtensions.includes(extension)) {
    return { 
      valid: false, 
      error: `Unsupported file type: .${extension} (allowed: ${allowedExtensions.map(e => `.${e}`).join(', ')})` 
    }
  }
  
  return { valid: true }
}

// Server-side file content sniffing
export async function sniffFileContent(buffer: Buffer): Promise<FileKind> {
  // PDF signature
  if (buffer.slice(0, 4).toString() === '%PDF') {
    return 'pdf'
  }
  
  // XLSX/ZIP signature (PK)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
    return 'xlsx'
  }
  
  // Default to CSV for text-like content
  return 'csv'
}
