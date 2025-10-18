// Razorpay billing integration for FinSight.AI
import { supabase } from '../lib/supabase'
import type { Billing, PlanTier } from '../lib/types'

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

export interface RazorpayPayment {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
  method: string
  created_at: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  features: string[]
  limits: {
    uploads: number
    transactions: number
  }
}

export const SUBSCRIPTION_PLANS: Record<PlanTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'INR',
    interval: 'monthly',
    features: [
      'Up to 3 file uploads per month',
      'Up to 5,000 transactions',
      'Basic categorization',
      'CSV export',
      'Email support'
    ],
    limits: {
      uploads: 3,
      transactions: 5000
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    description: 'For growing businesses',
    price: 499,
    currency: 'INR',
    interval: 'monthly',
    features: [
      'Up to 50 file uploads per month',
      'Up to 100,000 transactions',
      'Advanced AI categorization',
      'Custom rules engine',
      'All export formats (PDF, Excel, CSV)',
      'Priority support',
      'API access'
    ],
    limits: {
      uploads: 50,
      transactions: 100000
    }
  },
  business: {
    id: 'business',
    name: 'Business Plan',
    description: 'For established businesses',
    price: 1999,
    currency: 'INR',
    interval: 'monthly',
    features: [
      'Unlimited file uploads',
      'Unlimited transactions',
      'Advanced AI categorization',
      'Custom rules engine',
      'All export formats',
      'White-label reports',
      'Priority support',
      'API access',
      'Custom integrations',
      'Dedicated account manager'
    ],
    limits: {
      uploads: -1, // Unlimited
      transactions: -1 // Unlimited
    }
  }
}

export class BillingService {
  private userId: string
  private razorpayKeyId: string

  constructor(userId: string) {
    this.userId = userId
    this.razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
  }

  async createOrder(planId: string, amount: number): Promise<RazorpayOrder> {
    try {
      // In a real implementation, this would call your backend API
      // which would create the order with Razorpay
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const order: RazorpayOrder = {
        id: orderId,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${this.userId}_${Date.now()}`,
        status: 'created'
      }

      // Save order to database
      await supabase
        .from('billing')
        .upsert({
          user_id: this.userId,
          razorpay_order_id: orderId,
          plan: planId as PlanTier,
          status: 'pending'
        })

      return order
    } catch (error) {
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async verifyPayment(paymentId: string, orderId: string, _signature: string): Promise<boolean> {
    try {
      // In a real implementation, this would verify the payment signature
      // with Razorpay's webhook or API
      
      // For demo purposes, we'll simulate successful verification
      const isValid = true // This should be actual signature verification
      
      if (isValid) {
        // Update billing record
        await supabase
          .from('billing')
          .update({
            razorpay_payment_id: paymentId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          })
          .eq('user_id', this.userId)
          .eq('razorpay_order_id', orderId)

        // Update user plan
        const { data: billing } = await supabase
          .from('billing')
          .select('plan')
          .eq('user_id', this.userId)
          .single()

        if (billing) {
          await supabase
            .from('users')
            .update({ plan_tier: billing.plan })
            .eq('id', this.userId)
        }
      }

      return isValid
    } catch (error) {
      console.error('Payment verification failed:', error)
      return false
    }
  }

  async getCurrentSubscription(): Promise<Billing | null> {
    try {
      const { data, error } = await supabase
        .from('billing')
        .select('*')
        .eq('user_id', this.userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to get subscription:', error)
      return null
    }
  }

  async cancelSubscription(): Promise<boolean> {
    try {
      await supabase
        .from('billing')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('user_id', this.userId)

      // Downgrade to free plan
      await supabase
        .from('users')
        .update({ plan_tier: 'free' })
        .eq('id', this.userId)

      return true
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      return false
    }
  }

  async upgradePlan(planId: PlanTier): Promise<string> {
    try {
      const plan = SUBSCRIPTION_PLANS[planId]
      if (!plan) {
        throw new Error('Invalid plan')
      }

      if (plan.price === 0) {
        // Free plan - no payment required
        await supabase
          .from('users')
          .update({ plan_tier: planId })
          .eq('id', this.userId)

        await supabase
          .from('billing')
          .upsert({
            user_id: this.userId,
            plan: planId,
            status: 'active'
          })

        return 'success'
      }

      // Create order for paid plan
      const order = await this.createOrder(planId, plan.price)
      return order.id
    } catch (error) {
      throw new Error(`Failed to upgrade plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getUsageStats(): Promise<{ uploads: number; transactions: number; limits: { uploads: number; transactions: number } }> {
    try {
      const subscription = await this.getCurrentSubscription()
      const plan = subscription ? SUBSCRIPTION_PLANS[subscription.plan] : SUBSCRIPTION_PLANS.free

      // Get current month usage
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: uploads } = await supabase
        .from('uploads')
        .select('id')
        .eq('user_id', this.userId)
        .gte('created_at', startOfMonth.toISOString())

      const { data: transactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', this.userId)
        .gte('created_at', startOfMonth.toISOString())

      return {
        uploads: uploads?.length || 0,
        transactions: transactions?.length || 0,
        limits: plan.limits
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return {
        uploads: 0,
        transactions: 0,
        limits: SUBSCRIPTION_PLANS.free.limits
      }
    }
  }

  async checkUsageLimit(type: 'uploads' | 'transactions'): Promise<{ allowed: boolean; current: number; limit: number }> {
    try {
      const usage = await this.getUsageStats()
      const limit = usage.limits[type]
      const current = usage[type]

      return {
        allowed: limit === -1 || current < limit, // -1 means unlimited
        current,
        limit
      }
    } catch (error) {
      console.error('Failed to check usage limit:', error)
      return {
        allowed: false,
        current: 0,
        limit: 0
      }
    }
  }

  // Razorpay integration helpers
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  async openRazorpayCheckout(order: RazorpayOrder, planId: string): Promise<void> {
    const razorpayLoaded = await this.loadRazorpayScript()
    if (!razorpayLoaded) {
      throw new Error('Failed to load Razorpay')
    }

    const options = {
      key: this.razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: 'FinSight.AI',
      description: `Upgrade to ${SUBSCRIPTION_PLANS[planId as PlanTier]?.name}`,
      order_id: order.id,
      handler: async (response: any) => {
        try {
          const verified = await this.verifyPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          )

          if (verified) {
            // Payment successful
            window.location.reload() // Refresh to update UI
          } else {
            throw new Error('Payment verification failed')
          }
        } catch (error) {
          console.error('Payment processing error:', error)
          alert('Payment processing failed. Please try again.')
        }
      },
      prefill: {
        name: 'User Name', // Get from user profile
        email: 'user@example.com', // Get from user profile
      },
      theme: {
        color: '#8B5CF6'
      }
    }

    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  }
}
