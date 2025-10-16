import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, getCurrentUser, getCurrentSession } from './supabase'
import type { AuthUser, AuthSession } from './supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, options?: { data?: any }) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session as AuthSession)
        setUser(session?.user as AuthUser || null)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session as AuthSession)
        setUser(session?.user as AuthUser || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, options?: { data?: any }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Demo user functionality for development
export const createDemoUser = (): AuthUser => ({
  id: 'demo-user-id',
  email: 'demo@finsight.ai',
  user_metadata: {
    name: 'Demo User',
    full_name: 'Demo User'
  }
})

export const useDemoAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)

  const signInDemo = async () => {
    setLoading(true)
    setTimeout(() => {
      setUser(createDemoUser())
      setLoading(false)
    }, 1000)
  }

  const signOutDemo = async () => {
    setUser(null)
  }

  return {
    user,
    loading,
    signIn: signInDemo,
    signOut: signOutDemo,
    session: null,
    signUp: async () => {},
    signInWithGoogle: async () => {}
  }
}
