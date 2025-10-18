import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function VerifyEmail() {
  const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'resending'>('pending')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const email = searchParams.get('email') || 'your email'
  const token = searchParams.get('token')

  useEffect(() => {
    // If there's a token in the URL, automatically verify it
    if (token) {
      verifyEmailToken(token)
    }
  }, [token])

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      // Simulate email verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, verify with Supabase
      const isValid = verificationToken.length > 10 // Simple validation
      
      if (isValid) {
        setStatus('success')
        setTimeout(() => {
          navigate('/login?verified=true')
        }, 3000)
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
    }
  }

  const resendVerificationEmail = async () => {
    setStatus('resending')
    setCanResend(false)
    setCountdown(60)

    try {
      // Simulate resending email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, call Supabase resend function
      setStatus('pending')
    } catch (error) {
      console.error('Resend email error:', error)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#C44569] bg-clip-text text-transparent">
            FinSight.AI
          </h1>
        </div>

        <div className="neo-card p-8 text-center">
          {status === 'pending' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#FF6B9D] to-[#C44569] rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Check Your Email
              </h2>
              <p className="text-gray-400 mb-6">
                We've sent a verification link to{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Click the link in your email to verify your account. If you don't see the email, check your spam folder.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={resendVerificationEmail}
                  disabled={!canResend}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#FF6B9D] to-[#C44569] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}

          {status === 'resending' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#FF6B9D] to-[#C44569] rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Sending Email
              </h2>
              <p className="text-gray-400">
                Please wait while we send another verification email...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Email Verified!
              </h2>
              <p className="text-gray-400 mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <p className="text-[#FF6B9D] text-sm">
                Redirecting to login page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#EF4444] to-[#F87171] rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Verification Failed
              </h2>
              <p className="text-gray-400 mb-6">
                The verification link is invalid or has expired. Please request a new verification email.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={resendVerificationEmail}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#FF6B9D] to-[#C44569] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Send New Verification Email
                </button>
                
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3 px-4 border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors"
                >
                  Back to Sign Up
                </button>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Having trouble?{" "}
            <a
              href="mailto:support@finsight.ai"
              className="text-[#FF6B9D] hover:text-[#FF6B9D]/80 transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
