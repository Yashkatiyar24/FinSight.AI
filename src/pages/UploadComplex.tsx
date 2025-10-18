import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  FileText,
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useTransactionStore } from '../store/transactionStore'
import { ApiService } from '../services/api'
import { toast } from 'sonner'
import { useAuth } from '../context/SupabaseAuthContext'

interface UploadedFile extends File {
  id?: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
}

const UploadPage: React.FC = () => {
  const { user } = useAuth()
  const { addTransactions } = useTransactionStore()
  const navigate = useNavigate()
  const [files, setFiles] = useState<UploadedFile[]>([])

  // Simple file validation
  const validateFileName = (filename: string): { valid: boolean; error?: string } => {
    if (!filename || typeof filename !== 'string') {
      return { valid: false, error: 'Invalid filename: (unnamed)' }
    }
    
    if (filename.trim().length === 0) {
      return { valid: false, error: 'Invalid filename: empty' }
    }
    
    const extension = filename.toLowerCase().split('.').pop()
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

  // Import the proper file detection function
  const detectFileType = (file: File) => {
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
    const extension = originalName.toLowerCase().split('.').pop()
    if (extension) {
      switch (extension) {
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
    
    throw new Error(`Unsupported file type: ${extension || 'unknown'} (allowed: .csv, .xlsx, .pdf)`)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('=== FILE DROP EVENT ===')
    console.log('User authenticated:', !!user)
    console.log('Accepted files:', acceptedFiles.map(f => ({ 
      name: f.name, 
      size: f.size, 
      type: f.type,
      lastModified: new Date(f.lastModified).toISOString()
    })))
    
    if (!user) {
      console.warn('No user authenticated - running in DEMO MODE')
    }

    // Filter out files without proper names or extensions
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateFileName(file.name)
      if (!validation.valid) {
        console.error('File rejected:', validation.error)
        // Show error for invalid files
        setFiles(prev => [...prev, {
          ...file,
          status: 'failed',
          progress: 0,
          error: validation.error
        }])
        return false
      }
      return true
    })

    if (validFiles.length !== acceptedFiles.length) {
      console.warn(`Filtered ${acceptedFiles.length - validFiles.length} invalid files`)
    }

    const newFiles = validFiles.map(file => ({
      ...file,
      status: 'uploading' as const,
      progress: 0
    }))

    console.log('Adding files to state:', newFiles.length)
    setFiles(prev => [...prev, ...newFiles])

    // Process each file
    for (const file of newFiles) {
      try {
        console.log(`Starting to process file: ${file.name}`)
        console.log(`File details:`, { 
          name: file.name, 
          size: file.size, 
          type: file.type,
          status: file.status 
        })
        await processFile(file)
        console.log(`Successfully processed file: ${file.name}`)
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error)
        updateFileStatus(file.name, 'failed', 100, error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }, [user])

  const processFile = async (file: UploadedFile) => {
    // Allow demo mode for testing
    const demoMode = !user
    console.log('Processing file in', demoMode ? 'DEMO MODE' : 'AUTHENTICATED MODE')

    try {
      console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      // Update status to uploading
      updateFileStatus(file.name, 'uploading', 25)

      // Get file type
      const detection = detectFileType(file)
      console.log('File type detection result:', { fileName: file.name, detection })

      console.log('File type detected:', detection.kind)

      // For demo mode, simulate processing
      if (demoMode) {
        updateFileStatus(file.name, 'processing', 50)
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate demo transactions
        const demoTransactions = generateDemoTransactions(file.name)
        
        updateFileStatus(file.name, 'processing', 75)
        
        // Add to transaction store
        addTransactions(demoTransactions)
        
        updateFileStatus(file.name, 'completed', 100)
        
        // Show success message
        toast.success(`Demo processing completed for ${file.name}`)
        console.log(`Demo processing completed for ${file.name}`)
        
        // Navigate to dashboard after successful upload
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
        
        return
      }

      // Real processing with API service
      updateFileStatus(file.name, 'processing', 50)
      
      const apiService = new ApiService(user.id)
      
      // Upload file
      const uploadResult = await apiService.uploadFile(file)
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }
      
      updateFileStatus(file.name, 'processing', 75)
      
      // Process file
      const ingestResult = await apiService.processFile(uploadResult.fileId)
      
      updateFileStatus(file.name, 'completed', 100)
      
      // Show success message
      toast.success(`Successfully processed ${ingestResult.inserted} transactions from ${file.name}`)
      
      // Navigate to dashboard after successful upload
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('Error in processFile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      updateFileStatus(file.name, 'failed', 100, errorMessage)
      toast.error(`Failed to process ${file.name}: ${errorMessage}`)
    }
  }

  const generateDemoTransactions = (fileName: string) => {
    const userId = user?.id || 'demo-user'
    const baseId = Date.now()
    
    const baseTransactions = [
      {
        id: `${baseId}-1`,
        user_id: userId,
        tx_date: '2024-01-15',
        description: 'Coffee Shop Purchase',
        amount: -4.95,
        merchant: 'Starbucks',
        final_category: 'Meals & Entertainment',
        is_income: false,
        is_recurring: false,
        ai_confidence: 0.95,
        source_upload_id: fileName,
        created_at: new Date().toISOString()
      },
      {
        id: `${baseId}-2`,
        user_id: userId,
        tx_date: '2024-01-16',
        description: 'Salary Deposit',
        amount: 3500.00,
        merchant: 'ACME Corp',
        final_category: 'Salary',
        is_income: true,
        is_recurring: true,
        ai_confidence: 0.99,
        source_upload_id: fileName,
        created_at: new Date().toISOString()
      },
      {
        id: `${baseId}-3`,
        user_id: userId,
        tx_date: '2024-01-17',
        description: 'Grocery Shopping',
        amount: -87.32,
        merchant: 'Whole Foods',
        final_category: 'Groceries',
        is_income: false,
        is_recurring: false,
        ai_confidence: 0.89,
        source_upload_id: fileName,
        created_at: new Date().toISOString()
      },
      {
        id: `${baseId}-4`,
        user_id: userId,
        tx_date: '2024-01-18',
        description: 'Netflix Subscription',
        amount: -9.99,
        merchant: 'Netflix',
        final_category: 'Subscriptions',
        is_income: false,
        is_recurring: true,
        ai_confidence: 0.98,
        source_upload_id: fileName,
        created_at: new Date().toISOString()
      }
    ]
    
    return baseTransactions
  }

  const updateFileStatus = (
    fileName: string, 
    status: UploadedFile['status'], 
    progress?: number, 
    error?: string
  ) => {
    setFiles(prev => prev.map(file => 
      file.name === fileName 
        ? { ...file, status, progress: progress ?? file.progress, error }
        : file
    ))
  }

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.csv'],
      'application/csv': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    onDropRejected: (rejectedFiles) => {
      console.log('Rejected files:', rejectedFiles)
      rejectedFiles.forEach(({ file, errors }) => {
        console.log('File:', file.name || 'Unknown file', 'Errors:', errors)
        const errorMsg = errors.map(e => e.message).join(', ')
        const fileName = file.name || `Unknown file (${file.size} bytes)`
        setFiles(prev => [...prev, {
          ...file,
          name: fileName, // Ensure we have a name for display
          status: 'failed',
          progress: 0,
          error: errorMsg
        }])
      })
    }
  })

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'csv':
        return <FileSpreadsheet className="w-8 h-8 text-green-400" />
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-8 h-8 text-blue-400" />
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-400" />
      default:
        return <UploadIcon className="w-8 h-8 text-gray-400" />
    }
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="mx-auto max-w-[1600px] p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Upload Transactions</h1>
          <p className="mt-1 text-gray-400">
            Upload your CSV, Excel, or PDF files to automatically categorize transactions
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Demo Mode</span>
              </div>
              <p className="text-yellow-300 text-sm mt-1">
                You're not logged in. Files will be processed as demo data.
              </p>
            </div>
          )}
        </motion.div>

        {/* Upload Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neo-card p-8 mb-8"
        >
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-all duration-300 ease-in-out
              ${isDragActive 
                ? 'border-purple-400 bg-purple-500/10' 
                : 'border-slate-600 hover:border-purple-500 hover:bg-purple-500/5'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <UploadIcon className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload Transaction Files'}
                </h3>
                <p className="text-gray-400 text-lg">
                  Drag & drop your files here, or click to browse
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Supports CSV, Excel (.xlsx, .xls), and PDF files up to 10MB
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neo-card"
          >
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white">Upload Progress</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg"
                >
                  {getFileIcon(file.name)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        <span className="text-sm text-gray-400 capitalize">{file.status}</span>
                      </div>
                    </div>
                    
                    {file.status !== 'failed' && (
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {file.error && (
                      <p className="text-red-400 text-sm mt-2">{file.error}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeFile(file.name)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default UploadPage
