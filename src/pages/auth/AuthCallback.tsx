import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          setStatus('success')
          // Redirect to dashboard after a brief success message
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } else {
          throw new Error('No session found')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Authentication failed')
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/auth/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#0D0E12] flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D0E12] via-[#1a1b2e] to-[#0D0E12]" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-4">
        <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/[0.08]">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#00F5D4] to-[#0078FF] rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Processing...</h2>
              <p className="text-gray-400">Completing your authentication</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
              <p className="text-gray-400">Redirecting to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
