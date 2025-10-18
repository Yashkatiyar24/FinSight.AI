import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key'

// Check if we're in demo mode
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || supabaseUrl === 'https://demo.supabase.co'

if (!isDemoMode && !supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!isDemoMode && !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create a mock client for demo mode to prevent connection errors
const createMockSupabaseClient = (): any => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Demo mode - authentication disabled' } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Demo mode - authentication disabled' } }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: { message: 'Demo mode - password reset disabled' } }),
    signInWithOAuth: async () => ({ data: { user: null, session: null }, error: { message: 'Demo mode - OAuth disabled' } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: 'Demo mode - storage disabled' } }),
      createSignedUrl: async () => ({ data: { signedUrl: '' }, error: { message: 'Demo mode - storage disabled' } }),
      remove: async () => ({ error: { message: 'Demo mode - storage disabled' } })
    })
  }
})

export const supabase = isDemoMode ? createMockSupabaseClient() : createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth types
export type AuthUser = {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    full_name?: string
  }
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  user: AuthUser
}

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true
    })
  
  if (error) throw error
  return data
}

export const getSignedUrl = async (bucket: string, path: string, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  
  if (error) throw error
  return data.signedUrl
}

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
}
