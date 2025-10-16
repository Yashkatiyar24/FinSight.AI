import { CreditCard, Calendar, Download, Check, Zap, Star, Crown } from "lucide-react"
import { useState } from "react"

const plans = [
  {
    id: 'starter',
    name: 'Starter',
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
    id: 'professional',
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
    id: 'enterprise',
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
      'Multi-user access',
      'SSO integration'
    ],
    icon: Crown,
    color: 'from-[#F59E0B] to-[#FBBF24]'
  }
]

const invoices = [
  {
    id: 'INV-2024-001',
    date: '2024-12-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Professional Plan'
  },
  {
    id: 'INV-2024-002',
    date: '2024-11-01', 
    amount: 29.00,
    status: 'paid',
    plan: 'Professional Plan'
  },
  {
    id: 'INV-2024-003',
    date: '2024-10-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Professional Plan'
  }
]

export default function Billing() {
  const [currentPlan] = useState('professional')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const getCurrentPlan = () => plans.find(plan => plan.id === currentPlan)
  const currentPlanData = getCurrentPlan()

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="mx-auto max-w-[1600px] p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
          <p className="mt-1 text-gray-400">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan */}
        <div className="neo-card mb-8">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Current Plan</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${currentPlanData?.color} rounded-lg flex items-center justify-center`}>
                  {currentPlanData?.icon && <currentPlanData.icon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{currentPlanData?.name} Plan</h3>
                  <p className="text-gray-400">${currentPlanData?.price}/month • Next billing: January 1, 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${currentPlanData?.price}</p>
                <p className="text-gray-400 text-sm">per month</p>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button className="px-6 py-2 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
                Manage Plan
              </button>
              <button className="px-6 py-2 border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Plans */}
          <div className="neo-card">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Available Plans</h2>
              
              {/* Billing Cycle Toggle */}
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    billingCycle === 'yearly' ? 'bg-[#2BD1FF]' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                  Yearly
                </span>
                {billingCycle === 'yearly' && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                    Save 20%
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {plans.map((plan) => {
                const Icon = plan.icon
                const isCurrentPlan = plan.id === currentPlan
                const price = billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price
                const period = billingCycle === 'yearly' ? 'year' : 'month'
                
                return (
                  <div 
                    key={plan.id} 
                    className={`relative border rounded-lg p-4 transition-colors ${
                      isCurrentPlan 
                        ? 'border-[#2BD1FF] bg-[#2BD1FF]/5' 
                        : 'border-slate-700 hover:border-slate-600'
                    } ${plan.popular ? 'ring-2 ring-[#2BD1FF]/50' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] text-white text-xs font-medium rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{plan.name}</h3>
                          <p className="text-gray-400 text-sm">{plan.description}</p>
                          <div className="mt-2 space-y-1">
                            {plan.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Check className="w-3 h-3 text-green-400" />
                                <span className="text-gray-300 text-xs">{feature}</span>
                              </div>
                            ))}
                            {plan.features.length > 3 && (
                              <p className="text-gray-400 text-xs">+{plan.features.length - 3} more features</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          ${price === 0 ? 'Free' : price}
                        </p>
                        {price > 0 && (
                          <p className="text-gray-400 text-sm">per {period}</p>
                        )}
                        
                        {isCurrentPlan ? (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                            Current Plan
                          </span>
                        ) : (
                          <button className="mt-2 px-4 py-1 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                            {plan.price > (currentPlanData?.price || 0) ? 'Upgrade' : 'Downgrade'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment Method & Billing History */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="neo-card">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">Payment Method</h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4 p-4 border border-slate-700 rounded-lg">
                  <div className="w-12 h-8 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] rounded flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">•••• •••• •••• 4242</p>
                    <p className="text-gray-400 text-sm">Expires 12/26</p>
                  </div>
                  <button className="px-4 py-2 text-[#2BD1FF] hover:text-[#2BD1FF]/80 hover:bg-slate-800 rounded-lg transition-colors">
                    Update
                  </button>
                </div>
                
                <button className="mt-4 w-full px-4 py-2 border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors">
                  Add Payment Method
                </button>
              </div>
            </div>

            {/* Billing History */}
            <div className="neo-card">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">Billing History</h2>
              </div>
              
              <div className="divide-y divide-slate-700">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{invoice.plan}</p>
                        <p className="text-gray-400 text-sm">{invoice.date} • {invoice.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">${invoice.amount.toFixed(2)}</p>
                        <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                          Paid
                        </span>
                      </div>
                      <button className="p-2 text-[#2BD1FF] hover:text-[#2BD1FF]/80 hover:bg-slate-800 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-slate-700">
                <button className="w-full px-4 py-2 text-[#2BD1FF] hover:text-[#2BD1FF]/80 hover:bg-slate-800 rounded-lg transition-colors text-center">
                  View All Invoices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
