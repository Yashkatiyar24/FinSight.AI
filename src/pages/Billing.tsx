import { CreditCard, Download, Check, Zap, Star, Crown, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from '../context/SupabaseAuthContext'
import { BillingService, SUBSCRIPTION_PLANS } from '../services/billingService'
import type { Billing, PlanTier } from '../lib/types'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Perfect for personal use',
    features: [
      'Up to 100 transactions/month',
      'Basic categorization',
      'PDF export',
      'Email support'
    ],
    icon: Zap,
    color: 'from-gray-600 to-gray-700'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29,
    period: 'month',
    description: 'Great for small businesses',
    features: [
      'Up to 1,000 transactions/month',
      'AI-powered categorization',
      'Advanced reports',
      'Priority support',
      'Custom rules',
      'API access'
    ],
    icon: Star,
    color: 'from-[#2BD1FF] to-[#7A5CFF]',
    popular: true
  },
  {
    id: 'business',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For large organizations',
    features: [
      'Unlimited transactions',
      'Advanced AI features',
      'White-label reports',
      'Dedicated support',
      'Custom integrations',
      'Team management'
    ],
    icon: Crown,
    color: 'from-[#FF6B6B] to-[#FF8E53]'
  }
]

export default function Billing() {
  const { user } = useAuth()
  const [currentSubscription, setCurrentSubscription] = useState<Billing | null>(null)
  const [usageStats, setUsageStats] = useState<{ uploads: number; transactions: number; limits: { uploads: number; transactions: number } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const billingService = new BillingService(user.id)
        
        const [subscription, usage] = await Promise.all([
          billingService.getCurrentSubscription(),
          billingService.getUsageStats()
        ])
        
        setCurrentSubscription(subscription)
        setUsageStats(usage)
      } catch (error) {
        console.error('Error fetching billing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBillingData()
  }, [user])

  const handleUpgrade = async (planId: PlanTier) => {
    if (!user) return

    try {
      setUpgrading(planId)
      const billingService = new BillingService(user.id)
      
      if (SUBSCRIPTION_PLANS[planId].price === 0) {
        // Free plan - no payment required
        await billingService.upgradePlan(planId)
        window.location.reload()
      } else {
        // Paid plan - create order and open Razorpay
        const orderId = await billingService.upgradePlan(planId)
        const order = {
          id: orderId,
          amount: SUBSCRIPTION_PLANS[planId].price * 100,
          currency: 'INR',
          receipt: `receipt_${user.id}_${Date.now()}`,
          status: 'created'
        }
        
        await billingService.openRazorpayCheckout(order, planId)
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert('Upgrade failed. Please try again.')
    } finally {
      setUpgrading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!user || !currentSubscription) return

    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      try {
        const billingService = new BillingService(user.id)
        await billingService.cancelSubscription()
        window.location.reload()
      } catch (error) {
        console.error('Cancel subscription failed:', error)
        alert('Failed to cancel subscription. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading billing information...</p>
        </div>
      </div>
    )
  }

  const currentPlan = currentSubscription?.plan || 'free'
  const currentPlanData = SUBSCRIPTION_PLANS[currentPlan]

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400">
            Select the perfect plan for your financial management needs
          </p>
        </div>

        {/* Current Plan Status */}
        {currentSubscription && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 mb-12 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Current Plan: {currentPlanData.name}
                </h3>
                <p className="text-gray-400">
                  Status: <span className="text-green-400 capitalize">{currentSubscription.status}</span>
                </p>
                {usageStats && (
                  <p className="text-sm text-gray-400 mt-1">
                    Usage: {usageStats.transactions} / {usageStats.limits.transactions} transactions this month
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  ${currentPlanData.price}
                  <span className="text-sm text-gray-400">/month</span>
                </p>
                {currentSubscription.status === 'active' && currentPlan !== 'free' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan
            const Icon = plan.icon
            
            return (
              <div
                key={plan.id}
                className={`relative bg-slate-900 rounded-2xl p-8 border-2 transition-all duration-300 ${
                  plan.popular
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
                    : 'border-slate-700 hover:border-slate-600'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Current
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id as PlanTier)}
                  disabled={isCurrentPlan || upgrading === plan.id}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    isCurrentPlan
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {upgrading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Usage Statistics */}
        {usageStats && (
          <div className="bg-slate-900 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Usage Statistics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Transactions</h4>
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {usageStats.transactions}
                </div>
                <div className="text-sm text-gray-400">
                  of {usageStats.limits.transactions} limit
                </div>
                <div className="mt-4 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((usageStats.transactions / usageStats.limits.transactions) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">File Uploads</h4>
                  <Download className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {usageStats.uploads}
                </div>
                <div className="text-sm text-gray-400">
                  of {usageStats.limits.uploads} limit
                </div>
                <div className="mt-4 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((usageStats.uploads / usageStats.limits.uploads) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}