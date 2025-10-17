// Billing and subscription management service
import { supabase } from '../lib/supabase'
import type { Billing, PlanTier } from '../lib/types'

// Plan configurations
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'INR',
    interval: 'month',
    features: [
      '3 file uploads per month',
      '5,000 transactions',
      'Basic categorization',
      'CSV export'
    ],
    limits: {
      uploads_per_month: 3,
      max_transactions: 5000
    }
  },
  pro: {
    name: 'Pro',
    price: 499,
    currency: 'INR',
    interval: 'month',
    features: [
      '50 file uploads per month',
      '100,000 transactions',
      'Advanced categorization',
      'Custom rules',
      'All export formats',
      'Priority support'
    ],
    limits: {
      uploads_per_month: 50,
      max_transactions: 100000
    }
  },
  business: {
    name: 'Business',
    price: 1999,
    currency: 'INR',
    interval: 'month',
    features: [
      'Unlimited uploads',
      'Unlimited transactions',
      'Advanced categorization',
      'Custom rules',
      'All export formats',
      'API access',
      'Priority support',
      'Custom integrations'
    ],
    limits: {
      uploads_per_month: -1, // unlimited
      max_transactions: -1 // unlimited
    }
  }
} as const

export interface CreateOrderRequest {
  plan: PlanTier
  userId: string
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  status: string
}

export class BillingService {
  static async getCurrentSubscription(userId: string): Promise<Billing | null> {
    try {
      const { data, error } = await supabase
        .from('billing')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw new Error(`Failed to fetch subscription: ${error.message}`)
      }

      return data || null
    } catch (error) {
      console.error('Subscription fetch failed:', error)
      return null
    }
  }

  static async createSubscription(userId: string, plan: PlanTier): Promise<Billing> {
    try {
      const { data, error } = await supabase
        .from('billing')
        .upsert({
          user_id: userId,
          plan,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create subscription: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Subscription creation failed:', error)
      throw error
    }
  }

  static async updateSubscription(userId: string, updates: Partial<Billing>): Promise<Billing> {
    try {
      const { data, error } = await supabase
        .from('billing')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Subscription update failed:', error)
      throw error
    }
  }

  static async cancelSubscription(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('billing')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to cancel subscription: ${error.message}`)
      }
    } catch (error) {
      console.error('Subscription cancellation failed:', error)
      throw error
    }
  }

  // Mock Razorpay integration (replace with real implementation)
  static async createRazorpayOrder(request: CreateOrderRequest): Promise<RazorpayOrder> {
    try {
      const planConfig = PLAN_CONFIG[request.plan]
      
      // In a real implementation, you would call Razorpay API here
      // For now, we'll return a mock order
      const mockOrder: RazorpayOrder = {
        id: `order_${Date.now()}`,
        amount: planConfig.price * 100, // Razorpay expects amount in paise
        currency: 'INR',
        status: 'created'
      }

      console.log('Mock Razorpay order created:', mockOrder)
      return mockOrder
    } catch (error) {
      console.error('Razorpay order creation failed:', error)
      throw new Error('Failed to create payment order')
    }
  }

  static async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string,
    plan: PlanTier
  ): Promise<boolean> {
    try {
      // In a real implementation, you would verify the signature with Razorpay
      // For now, we'll mock the verification
      console.log('Mock payment verification:', { orderId, paymentId, signature })

      // Update subscription after successful payment
      await this.createSubscription(userId, plan)

      return true
    } catch (error) {
      console.error('Payment verification failed:', error)
      return false
    }
  }

  static async getUsageStats(userId: string): Promise<{
    current_period_uploads: number
    current_period_transactions: number
    total_uploads: number
    total_transactions: number
  }> {
    try {
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      // Get current period stats
      const [uploadsResult, transactionsResult] = await Promise.all([
        supabase
          .from('uploads')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString()),
        
        supabase
          .from('transactions')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString())
      ])

      // Get total stats
      const [totalUploadsResult, totalTransactionsResult] = await Promise.all([
        supabase
          .from('uploads')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        supabase
          .from('transactions')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
      ])

      return {
        current_period_uploads: uploadsResult.count || 0,
        current_period_transactions: transactionsResult.count || 0,
        total_uploads: totalUploadsResult.count || 0,
        total_transactions: totalTransactionsResult.count || 0
      }
    } catch (error) {
      console.error('Usage stats fetch failed:', error)
      return {
        current_period_uploads: 0,
        current_period_transactions: 0,
        total_uploads: 0,
        total_transactions: 0
      }
    }
  }

  static canUploadFile(usage: any, plan: PlanTier): boolean {
    const planConfig = PLAN_CONFIG[plan]
    
    if (planConfig.limits.uploads_per_month === -1) {
      return true // unlimited
    }
    
    return usage.current_period_uploads < planConfig.limits.uploads_per_month
  }

  static canAddTransactions(usage: any, plan: PlanTier, additionalCount: number): boolean {
    const planConfig = PLAN_CONFIG[plan]
    
    if (planConfig.limits.max_transactions === -1) {
      return true // unlimited
    }
    
    return (usage.total_transactions + additionalCount) <= planConfig.limits.max_transactions
  }

  static getPlanFeatures(plan: PlanTier): string[] {
    return PLAN_CONFIG[plan].features
  }

  static getPlanPrice(plan: PlanTier): number {
    return PLAN_CONFIG[plan].price
  }

  static formatPrice(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount)
  }
}