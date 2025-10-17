import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper to get authenticated user from request
export async function getAuthUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return user
}

// Helper to get user with error handling
export async function getUserOrThrow() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('Not authenticated')
  return user
}

// Types for our database
export interface Profile {
  user_id: string
  full_name: string | null
  created_at: string
}

export interface FileRecord {
  id: string
  user_id: string
  original_name: string
  mime_type: string | null
  ext: string | null
  size: number | null
  status: 'uploaded' | 'processing' | 'parsed' | 'failed'
  error: string | null
  created_at: string
}

export interface Rule {
  id: number
  user_id: string
  name: string
  conditions: string
  target_category: string
  gst_rate: number
  active: boolean
  created_at: string
}

export interface Transaction {
  id: number
  user_id: string
  file_id: string | null
  date: string
  description: string
  amount: number
  merchant: string | null
  gst_rate: number | null
  category: string | null
  category_confidence: number | null
  raw: any
  dedupe_hash: string | null
  created_at: string
}

export interface Report {
  id: string
  user_id: string
  kind: 'expense' | 'tax' | 'pl'
  period_from: string
  period_to: string
  format: 'pdf' | 'excel' | 'csv'
  url: string | null
  size_bytes: number | null
  created_at: string
}

export interface Subscription {
  user_id: string
  plan: string
  status: string
  razorpay_customer_id: string | null
  razorpay_subscription_id: string | null
  updated_at: string
}
