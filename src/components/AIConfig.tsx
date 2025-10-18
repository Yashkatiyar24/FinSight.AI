import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, Brain, Save, AlertCircle, CheckCircle } from 'lucide-react'
import TransactionAnalyzer from '../lib/ai/transaction-analyzer'

interface AIConfigProps {
  onClose?: () => void
}

export default function AIConfig({ onClose }: AIConfigProps) {
  const [apiKey, setApiKey] = useState('')
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Load existing API key from localStorage
    const existingKey = localStorage.getItem('finsight_openai_key')
    if (existingKey) {
      setApiKey(existingKey)
      setIsValidKey(true)
    }
  }, [])

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return

    setIsSaving(true)
    try {
      // Basic validation - OpenAI keys start with 'sk-'
      if (!apiKey.startsWith('sk-')) {
        setIsValidKey(false)
        return
      }

      // Set the API key in the analyzer
      TransactionAnalyzer.setApiKey(apiKey)
      setIsValidKey(true)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        onClose?.()
      }, 2000)

    } catch (error) {
      console.error('Error saving API key:', error)
      setIsValidKey(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveKey = () => {
    localStorage.removeItem('finsight_openai_key')
    setApiKey('')
    setIsValidKey(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-card p-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Configuration</h2>
          <p className="text-gray-400 text-sm">Configure OpenAI integration for smart transaction categorization</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Key className="w-4 h-4 inline mr-2" />
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 bg-[#1A1F2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none"
            />
            {isValidKey === true && (
              <CheckCircle className="w-5 h-5 text-green-400 absolute right-3 top-3.5" />
            )}
            {isValidKey === false && (
              <AlertCircle className="w-5 h-5 text-red-400 absolute right-3 top-3.5" />
            )}
          </div>
          {isValidKey === false && (
            <p className="text-red-400 text-sm mt-2">Invalid API key format. Keys should start with 'sk-'</p>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-blue-400 font-medium mb-2">How AI Categorization Works</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Analyzes transaction descriptions and merchant names</li>
            <li>• Provides confidence scores for categorizations</li>
            <li>• Detects recurring transactions automatically</li>
            <li>• Falls back to rule-based categorization without API key</li>
          </ul>
        </div>

        {/* Get API Key Info */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h3 className="text-purple-400 font-medium mb-2">Getting an OpenAI API Key</h3>
          <p className="text-sm text-gray-300 mb-3">
            Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">OpenAI Platform</a> to create an API key.
          </p>
          <p className="text-xs text-gray-400">
            Note: API usage will be charged to your OpenAI account. FinSight.AI does not store or have access to your API key.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveKey}
            disabled={!apiKey.trim() || isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-5 h-5" />
              </motion.div>
            ) : showSuccess ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {showSuccess ? 'Saved!' : 'Save Configuration'}
          </button>
          
          {apiKey && (
            <button
              onClick={handleRemoveKey}
              className="px-4 py-3 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              Remove Key
            </button>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </motion.div>
  )
}
