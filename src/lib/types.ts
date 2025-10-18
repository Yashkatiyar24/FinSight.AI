// Database types for FinSight.AI
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          gstin: string | null
          address: string | null
          phone: string | null
          plan_tier: 'free' | 'pro' | 'business'
          verified: boolean
          notification_email: boolean
          notification_sms: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          gstin?: string | null
          address?: string | null
          phone?: string | null
          plan_tier?: 'free' | 'pro' | 'business'
          verified?: boolean
          notification_email?: boolean
          notification_sms?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          gstin?: string | null
          address?: string | null
          phone?: string | null
          plan_tier?: 'free' | 'pro' | 'business'
          verified?: boolean
          notification_email?: boolean
          notification_sms?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          user_id: string
          original_name: string
          file_path: string
          file_type: 'csv' | 'xls' | 'xlsx' | 'pdf'
          size_bytes: number
          status: 'received' | 'parsing' | 'parsed' | 'failed'
          parsed_rows: number
          failed_rows: number
          error_details: any | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          original_name: string
          file_path: string
          file_type: 'csv' | 'xls' | 'xlsx' | 'pdf'
          size_bytes: number
          status?: 'received' | 'parsing' | 'parsed' | 'failed'
          parsed_rows?: number
          failed_rows?: number
          error_details?: any | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          original_name?: string
          file_path?: string
          file_type?: 'csv' | 'xls' | 'xlsx' | 'pdf'
          size_bytes?: number
          status?: 'received' | 'parsing' | 'parsed' | 'failed'
          parsed_rows?: number
          failed_rows?: number
          error_details?: any | null
          created_at?: string
          processed_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          tx_date: string
          description: string
          merchant: string | null
          amount: number
          gst_rate: number | null
          gst_amount: number | null
          gstin: string | null
          category: string | null
          final_category: string | null
          ml_confidence: number | null
          ml_predicted_category: string | null
          source_upload_id: string | null
          rule_applied_id: string | null
          is_income: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tx_date: string
          description: string
          merchant?: string | null
          amount: number
          gst_rate?: number | null
          gst_amount?: number | null
          gstin?: string | null
          category?: string | null
          final_category?: string | null
          ml_confidence?: number | null
          ml_predicted_category?: string | null
          source_upload_id?: string | null
          rule_applied_id?: string | null
          is_income?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tx_date?: string
          description?: string
          merchant?: string | null
          amount?: number
          gst_rate?: number | null
          gst_amount?: number | null
          gstin?: string | null
          category?: string | null
          final_category?: string | null
          ml_confidence?: number | null
          ml_predicted_category?: string | null
          source_upload_id?: string | null
          rule_applied_id?: string | null
          is_income?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          enabled: boolean
          priority: number
          conditions: any
          actions: any
          match_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          enabled?: boolean
          priority?: number
          conditions: any
          actions: any
          match_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          enabled?: boolean
          priority?: number
          conditions?: any
          actions?: any
          match_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'expense' | 'tax' | 'pnl'
          period_start: string
          period_end: string
          file_url: string | null
          file_path: string | null
          metrics: any | null
          parameters: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'expense' | 'tax' | 'pnl'
          period_start: string
          period_end: string
          file_url?: string | null
          file_path?: string | null
          metrics?: any | null
          parameters?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'expense' | 'tax' | 'pnl'
          period_start?: string
          period_end?: string
          file_url?: string | null
          file_path?: string | null
          metrics?: any | null
          parameters?: any | null
          created_at?: string
        }
      }
      billing: {
        Row: {
          id: string
          user_id: string
          razorpay_subscription_id: string | null
          razorpay_customer_id: string | null
          plan: 'free' | 'pro' | 'business'
          status: 'active' | 'trialing' | 'canceled' | 'past_due'
          current_period_start: string | null
          current_period_end: string | null
          trial_ends_at: string | null
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          plan?: 'free' | 'pro' | 'business'
          status?: 'active' | 'trialing' | 'canceled' | 'past_due'
          current_period_start?: string | null
          current_period_end?: string | null
          trial_ends_at?: string | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          plan?: 'free' | 'pro' | 'business'
          status?: 'active' | 'trialing' | 'canceled' | 'past_due'
          current_period_start?: string | null
          current_period_end?: string | null
          trial_ends_at?: string | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string | null
          resource_id: string | null
          details: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      category_feedback: {
        Row: {
          id: string
          user_id: string
          transaction_id: string
          original_category: string | null
          corrected_category: string
          confidence_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id: string
          original_category?: string | null
          corrected_category: string
          confidence_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string
          original_category?: string | null
          corrected_category?: string
          confidence_score?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_usage_stats: {
        Args: {
          user_uuid: string
        }
        Returns: any
      }
      get_dashboard_metrics: {
        Args: {
          user_uuid: string
          start_date?: string
          end_date?: string
        }
        Returns: any
      }
    }
    Enums: {
      plan_tier: 'free' | 'pro' | 'business'
      file_type: 'csv' | 'xls' | 'xlsx' | 'pdf'
      upload_status: 'received' | 'parsing' | 'parsed' | 'failed'
      report_type: 'expense' | 'tax' | 'pnl'
      subscription_status: 'active' | 'trialing' | 'canceled' | 'past_due'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type User = Database['public']['Tables']['users']['Row']
export type Upload = Database['public']['Tables']['uploads']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Rule = Database['public']['Tables']['rules']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Billing = Database['public']['Tables']['billing']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type CategoryFeedback = Database['public']['Tables']['category_feedback']['Row']

export type PlanTier = Database['public']['Enums']['plan_tier']
export type FileType = Database['public']['Enums']['file_type']
export type UploadStatus = Database['public']['Enums']['upload_status']
export type ReportType = Database['public']['Enums']['report_type']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']

// Business logic types
export interface DashboardMetrics {
  total_revenue: number
  total_expenses: number
  net_profit: number
  total_transactions: number
  total_gst: number
  categories: Array<{
    category: string
    amount: number
    count: number
  }>
}

export interface UsageStats {
  uploads_count: number
  transactions_count: number
  rules_count: number
  reports_count: number
  current_month_uploads: number
}

export interface PlanLimits {
  code: PlanTier
  price: number
  limit_uploads: number
  limit_rows: number
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    code: 'free',
    price: 0,
    limit_uploads: 3,
    limit_rows: 5000
  },
  pro: {
    code: 'pro',
    price: 499,
    limit_uploads: 50,
    limit_rows: 100000
  },
  business: {
    code: 'business',
    price: 1999,
    limit_uploads: 500,
    limit_rows: 1000000
  }
}

// Transaction categories
export const TRANSACTION_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Medical',
  'Travel',
  'Education',
  'Business',
  'Investment',
  'Transfer',
  'Bills & Utilities',
  'Insurance',
  'Taxes',
  'Other'
] as const

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number]

// GST rates
export const GST_RATES = [0, 3, 5, 12, 18, 28] as const
export type GSTRate = typeof GST_RATES[number]
