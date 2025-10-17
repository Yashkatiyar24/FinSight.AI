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
  Trash2,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../context/SupabaseAuthContext'
import { UploadService, createDemoData, type UploadProgress } from '../services/uploadService'
import { toast } from 'sonner'

interface UploadedFile extends File {
  id?: string
  status: 'uploading' | 'parsing' | 'normalizing' | 'categorizing' | 'saving' | 'completed' | 'failed'
  progress: number
  error?: string
  message?: string
}

const UploadPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [isCreatingDemo, setIsCreatingDemo] = useState(false)

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
    if (!user) {
      toast.error('Please log in to upload files')
      return
    }

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
        toast.error(`${file.name}: ${validation.error}`)
        return
      }

      // Add file to list and start processing
      const uploadFile: UploadedFile = {
        ...file,
        status: 'uploading',
        progress: 0,
        message: 'Starting upload...'
      }
      
      setFiles(prev => [...prev, uploadFile])
      
      // Process file with real upload service
      processFile(uploadFile)
    })
  }

  const processFile = async (file: UploadedFile) => {
    if (!user) return

    try {
      console.log('Processing file:', file.name)
      
      const uploadService = new UploadService((progress: UploadProgress) => {
        updateFileStatus(file.name, progress.stage, progress.progress, progress.message, progress.error)
      })

      const result = await uploadService.uploadAndProcess(file, user.id)
      
      console.log('Upload completed:', result)
      toast.success(`Successfully processed ${result.transactions.length} transactions from ${file.name}`)
      
      // Navigate to dashboard after successful upload
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Error processing file:', error)
      const errorMessage = error instanceof Error ? error.message : 'Processing failed'
      updateFileStatus(file.name, 'failed', 100, errorMessage, errorMessage)
      toast.error(`Failed to process ${file.name}: ${errorMessage}`)
    }
  }

  const handleCreateDemoData = async () => {
    if (!user) {
      toast.error('Please log in to create demo data')
      return
    }

    setIsCreatingDemo(true)
    
    try {
      const result = await createDemoData(user.id)
      console.log('Demo data created:', result)
      
      toast.success(`Created ${result.transactions.length} demo transactions`)
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('Error creating demo data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create demo data'
      toast.error(errorMessage)
    } finally {
      setIsCreatingDemo(false)
    }
  }

  const updateFileStatus = (
    fileName: string, 
    status: UploadedFile['status'], 
    progress?: number, 
    message?: string,
    error?: string
  ) => {
    setFiles(prev => prev.map(file => 
      file.name === fileName 
        ? { ...file, status, progress: progress ?? file.progress, message, error }
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
      case 'parsing':
      case 'normalizing':
      case 'categorizing':
      case 'saving':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading'
      case 'parsing': return 'Parsing'
      case 'normalizing': return 'Normalizing'
      case 'categorizing': return 'Categorizing'
      case 'saving': return 'Saving'
      case 'completed': return 'Completed'
      case 'failed': return 'Failed'
      default: return status
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
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Try Demo Data</span>
                </div>
                <p className="text-blue-300 text-sm mt-1">
                  New to Finsight? Try our demo data to explore features.
                </p>
              </div>
              <button
                onClick={handleCreateDemoData}
                disabled={isCreatingDemo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isCreatingDemo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Demo Data
                  </>
                )}
              </button>
            </div>
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
                          <span className="text-sm text-gray-400">{getStatusText(file.status)}</span>
                        </div>
                      </div>
                      
                      {file.message && (
                        <p className="text-xs text-gray-500 mb-2">{file.message}</p>
                      )}
                    
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
