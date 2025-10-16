import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, AuthUser, AuthSession } from '@/lib/supabase'

// Types
interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider - Getting initial session...')
        
        // First check for demo user
        const demoUser = localStorage.getItem('finsight_demo_user');
        if (demoUser) {
          const parsedUser = JSON.parse(demoUser);
          console.log('AuthProvider - Demo user found in localStorage:', parsedUser);
          setUser(parsedUser);
          setSession({
            access_token: 'demo-token',
            refresh_token: 'demo-refresh',
            user: parsedUser
          });
          setLoading(false);
          return;
        }

        console.log('AuthProvider - No demo user, checking Supabase session...')
        // Then check for real Supabase session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('AuthProvider - Supabase session:', session)
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('AuthProvider - Error getting session:', error)
      } finally {
        console.log('AuthProvider - Setting loading to false')
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider - Auth state change:', event, session)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle specific events
        if (event === 'SIGNED_IN' && session) {
          console.log('AuthProvider - User signed in:', session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider - User signed out')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Session will be set automatically by the auth state change listener
      console.log('Sign in successful:', data.user)
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          }
        }
      })

      if (error) throw error

      console.log('Sign up successful:', data.user)
      
      // Note: User might need to verify email depending on settings
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
      // Check if it's a demo user
      const demoUser = localStorage.getItem('finsight_demo_user');
      if (demoUser) {
        localStorage.removeItem('finsight_demo_user');
        setUser(null);
        setSession(null);
        return;
      }

      // Otherwise sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state (will also be cleared by auth state change listener)
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
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
