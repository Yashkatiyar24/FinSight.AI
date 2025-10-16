import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Types
interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // Simulate checking for existing session
        const savedUser = localStorage.getItem('finsight_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Demo credentials for testing
      const validCredentials = [
        { email: 'demo@finsight.ai', password: 'demo123', name: 'Demo User' },
        { email: 'test@example.com', password: 'test123', name: 'Test User' },
        { email: 'admin@finsight.ai', password: 'admin123', name: 'Admin User' },
        { email: 'user@demo.com', password: 'user123', name: 'Demo Account' }
      ]

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check credentials
      const validUser = validCredentials.find(
        cred => cred.email === email && cred.password === password
      )

      if (!validUser) {
        throw new Error('Invalid email or password')
      }
      
      const mockUser: User = {
        id: '1',
        email: validUser.email,
        name: validUser.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }
      
      setUser(mockUser)
      localStorage.setItem('finsight_user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      // Simulate sign up validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Basic validation
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }
      
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }
      
      setUser(mockUser)
      localStorage.setItem('finsight_user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Simulate sign out - in real app, use Supabase
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUser(null)
      localStorage.removeItem('finsight_user')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Simulate password reset - in real app, use Supabase
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Password reset email sent to:', email)
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
