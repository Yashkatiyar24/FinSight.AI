import React, { useState, useCallback } from 'react'
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
import { useTransactionStore } from '../store/transactionStore'

interface UploadedFile extends File {
  id?: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
}

const UploadPage: React.FC = () => {
  const { addTransactions } = useTransactionStore()
  const navigate = useNavigate()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  // Simple file validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file.name) {
      return { valid: false, error: 'Invalid filename: (unnamed)' }
    }
    
    const extension = file.name.toLowerCase().split('.').pop()
    if (!extension) {
      return { valid: false, error: `Invalid filename: ${file.name} (no extension)` }
    }
    
    const allowedExtensions = ['csv', 'xlsx', 'xls', 'pdf']
    if (!allowedExtensions.includes(extension)) {
      return { 
        valid: false, 
        error: `Unsupported file type: .${extension} (allowed: .csv, .xlsx, .pdf)` 
      }
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { valid: false, error: 'File too large (max 10MB)' }
    }
    
    return { valid: true }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }, [])

  const processFiles = (fileList: File[]) => {
    console.log('Processing files:', fileList.map(f => f.name))
    
    fileList.forEach(file => {
      const validation = validateFile(file)
      
      if (!validation.valid) {
        setFiles(prev => [...prev, {
          ...file,
          status: 'failed',
          progress: 0,
          error: validation.error
        }])
        return
      }

      // Add file to list and start processing
      const uploadFile: UploadedFile = {
        ...file,
        status: 'uploading',
        progress: 0
      }
      
      setFiles(prev => [...prev, uploadFile])
      
      // Simulate file processing
      processFile(uploadFile)
    })
  }

  const processFile = async (file: UploadedFile) => {
    try {
      console.log('Processing file:', file.name)
      
      // Update progress
      updateFileStatus(file.name, 'uploading', 25)
      await sleep(500)
      
      updateFileStatus(file.name, 'processing', 50)
      await sleep(1000)
      
      updateFileStatus(file.name, 'processing', 75)
      
      // Generate demo transactions
      const demoTransactions = generateDemoTransactions(file.name)
      addTransactions(demoTransactions)
      
      updateFileStatus(file.name, 'completed', 100)
      
      // Navigate to dashboard after successful upload
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('Error processing file:', error)
      updateFileStatus(file.name, 'failed', 100, 'Processing failed')
    }
  }

  const generateDemoTransactions = (fileName: string) => {
    const baseId = Date.now()
    
    return [
      {
        id: `${baseId}-1`,
        user_id: 'demo-user',
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
        user_id: 'demo-user',
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
        user_id: 'demo-user',
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
        user_id: 'demo-user',
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

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Demo Mode</span>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              Files will be processed as demo data and automatically categorized.
            </p>
          </div>
        </motion.div>

        {/* Upload Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neo-card p-8 mb-8"
        >
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true) }}
            onDragLeave={() => setIsDragActive(false)}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-all duration-300 ease-in-out
              ${isDragActive 
                ? 'border-purple-400 bg-purple-500/10' 
                : 'border-slate-600 hover:border-purple-500 hover:bg-purple-500/5'
              }
            `}
          >
            <input 
              type="file" 
              multiple 
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
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
