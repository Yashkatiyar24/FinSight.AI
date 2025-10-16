import { supabase } from './supabase'
import type { 
  User, 
  Transaction, 
  Upload, 
  Rule, 
  Report, 
  Billing,
  DashboardMetrics,
  UsageStats
} from './types'

// User Service
export class UserService {
  static async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data as User
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data as User
  }

  static async getUserUsageStats(userId: string): Promise<UsageStats> {
    const { data, error } = await supabase
      .rpc('get_user_usage_stats', { user_uuid: userId } as any)
    
    if (error) throw error
    return data as UsageStats
  }
}

// Transaction Service
export class TransactionService {
  static async getTransactions(
    userId: string, 
    options: {
      page?: number
      limit?: number
      search?: string
      category?: string
      startDate?: string
      endDate?: string
      minAmount?: number
      maxAmount?: number
    } = {}
  ): Promise<{ transactions: Transaction[], count: number }> {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      category, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount 
    } = options

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('tx_date', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`description.ilike.%${search}%,merchant.ilike.%${search}%`)
    }
    
    if (category) {
      query = query.eq('final_category', category)
    }
    
    if (startDate) {
      query = query.gte('tx_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('tx_date', endDate)
    }
    
    if (minAmount !== undefined) {
      query = query.gte('amount', minAmount)
    }
    
    if (maxAmount !== undefined) {
      query = query.lte('amount', maxAmount)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error
    return { transactions: (data || []) as Transaction[], count: count || 0 }
  }

  static async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction as any)
      .select()
      .single()
    
    if (error) throw error
    return data as Transaction
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Transaction
  }

  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  static async getDashboardMetrics(
    userId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<DashboardMetrics> {
    const { data, error } = await supabase
      .rpc('get_dashboard_metrics', { 
        user_uuid: userId,
        start_date: startDate,
        end_date: endDate
      } as any)
    
    if (error) throw error
    return data as DashboardMetrics
  }

  static async getRecentTransactions(userId: string, limit = 5): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('tx_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return (data || []) as Transaction[]
  }
}

// Upload Service
export class UploadService {
  static async createUpload(upload: Partial<Upload>): Promise<Upload> {
    const { data, error } = await supabase
      .from('uploads')
      .insert(upload as any)
      .select()
      .single()
    
    if (error) throw error
    return data as Upload
  }

  static async updateUpload(id: string, updates: Partial<Upload>): Promise<Upload> {
    const { data, error } = await supabase
      .from('uploads')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Upload
  }

  static async getUploads(userId: string): Promise<Upload[]> {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []) as Upload[]
  }

  static async getUpload(id: string): Promise<Upload | null> {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Upload
  }
}

// Rule Service
export class RuleService {
  static async getRules(userId: string): Promise<Rule[]> {
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []) as Rule[]
  }

  static async createRule(rule: Partial<Rule>): Promise<Rule> {
    const { data, error } = await supabase
      .from('rules')
      .insert(rule as any)
      .select()
      .single()
    
    if (error) throw error
    return data as Rule
  }

  static async updateRule(id: string, updates: Partial<Rule>): Promise<Rule> {
    const { data, error } = await supabase
      .from('rules')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Rule
  }

  static async deleteRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('rules')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  static async toggleRule(id: string, enabled: boolean): Promise<Rule> {
    const { data, error } = await supabase
      .from('rules')
      .update({ enabled } as any)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Rule
  }
}

// Report Service
export class ReportService {
  static async getReports(userId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []) as Report[]
  }

  static async createReport(report: Partial<Report>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert(report as any)
      .select()
      .single()
    
    if (error) throw error
    return data as Report
  }

  static async deleteReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Billing Service
export class BillingService {
  static async getBilling(userId: string): Promise<Billing | null> {
    const { data, error } = await supabase
      .from('billing')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data as Billing
  }

  static async updateBilling(userId: string, updates: Partial<Billing>): Promise<Billing> {
    const { data, error } = await supabase
      .from('billing')
      .update(updates as any)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data as Billing
  }

  static async createBilling(billing: Partial<Billing>): Promise<Billing> {
    const { data, error } = await supabase
      .from('billing')
      .insert(billing as any)
      .select()
      .single()
    
    if (error) throw error
    return data as Billing
  }
}

// Audit Service
export class AuditService {
  static async logAction(
    userId: string,
    action: string,
    details?: any,
    resourceType?: string,
    resourceId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: null, // TODO: Get from request
        user_agent: navigator.userAgent
      } as any)
    
    if (error) console.error('Failed to log audit action:', error)
  }
}

// Category Feedback Service
export class CategoryFeedbackService {
  static async submitFeedback(
    userId: string,
    transactionId: string,
    originalCategory: string | null,
    correctedCategory: string,
    confidenceScore?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('category_feedback')
      .insert({
        user_id: userId,
        transaction_id: transactionId,
        original_category: originalCategory,
        corrected_category: correctedCategory,
        confidence_score: confidenceScore
      } as any)
    
    if (error) throw error
  }
}
