import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  Upload, 
  FileText, 
  Settings,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { TransactionService } from '../lib/database'
import { useAuth } from '../context/SupabaseAuthContext'
import { useTransactionStore } from '../store/transactionStore'
import type { Transaction, DashboardMetrics } from '../lib/types'

interface MetricCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ReactNode
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="neo-card p-6 hover:scale-[1.02] transition-transform duration-200"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      </div>
      <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span className="text-sm font-medium">{change}</span>
      </div>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
  </motion.div>
)

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { transactions, metrics, getRecentTransactions } = useTransactionStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug logging
  console.log('Dashboard - User state:', user)
  console.log('Dashboard - User ID:', user?.id)

  useEffect(() => {
    console.log('Dashboard useEffect - User changed:', user)
    if (!user) {
      console.log('Dashboard - No user, skipping data fetch')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        console.log('Dashboard - Starting data fetch for user:', user.id)
        setLoading(true)
        setError(null)

        // For demo user, use mock data instead of Supabase
        if (user.id === 'demo-user-id') {
          console.log('Dashboard - Using mock data for demo user')
          const mockMetrics: DashboardMetrics = {
            total_revenue: 75000,
            total_expenses: 45000,
            net_profit: 30000,
            total_transactions: 156,
            total_gst: 8100,
            categories: [
              { category: 'Food & Dining', amount: 12000, count: 45 },
              { category: 'Transportation', amount: 8500, count: 32 },
              { category: 'Shopping', amount: 15000, count: 28 },
              { category: 'Entertainment', amount: 6500, count: 18 }
            ]
          }
          
          const mockTransactions: Transaction[] = [
            {
              id: '1',
              user_id: user.id,
              tx_date: '2024-10-15',
              description: 'Swiggy Food Order',
              merchant: 'Swiggy',
              amount: 450,
              is_income: false,
              final_category: 'Food & Dining',
              gst_amount: 81,
              created_at: '2024-10-15T10:30:00Z',
              updated_at: '2024-10-15T10:30:00Z'
            } as Transaction,
            {
              id: '2',
              user_id: user.id,
              tx_date: '2024-10-14',
              description: 'Salary Credit',
              merchant: 'Company ABC',
              amount: 75000,
              is_income: true,
              final_category: 'Income',
              gst_amount: 0,
              created_at: '2024-10-14T09:00:00Z',
              updated_at: '2024-10-14T09:00:00Z'
            } as Transaction,
            {
              id: '3',
              user_id: user.id,
              tx_date: '2024-10-13',
              description: 'Amazon Purchase',
              merchant: 'Amazon',
              amount: 2340,
              is_income: false,
              final_category: 'Shopping',
              gst_amount: 421,
              created_at: '2024-10-13T14:20:00Z',
              updated_at: '2024-10-13T14:20:00Z'
            } as Transaction
          ]
          
          setMetrics(mockMetrics)
          setRecentTransactions(mockTransactions)
          console.log('Dashboard - Mock data loaded successfully')
        } else {
          // Real Supabase data for actual users
          console.log('Dashboard - Fetching real Supabase data')
          const metricsData = await TransactionService.getDashboardMetrics(user.id)
          setMetrics(metricsData)

          const transactionsData = await TransactionService.getRecentTransactions(user.id, 5)
          setRecentTransactions(transactionsData)
          console.log('Dashboard - Real data loaded successfully')
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-500'
    
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-orange-500',
      'Transportation': 'bg-blue-500',
      'Shopping': 'bg-pink-500',
      'Entertainment': 'bg-purple-500',
      'Health & Medical': 'bg-red-500',
      'Travel': 'bg-green-500',
      'Education': 'bg-indigo-500',
      'Business': 'bg-yellow-500',
      'Investment': 'bg-emerald-500',
      'Transfer': 'bg-cyan-500',
      'Bills & Utilities': 'bg-amber-500',
      'Insurance': 'bg-rose-500',
      'Taxes': 'bg-violet-500',
      'Other': 'bg-gray-500'
    }
    
    return colors[category] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="neo-card p-6 h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 neo-card p-6 h-96"></div>
          <div className="neo-card p-6 h-96"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="neo-card p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics?.total_revenue || 0)}
          change="+12.5%"
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5 text-green-400" />}
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(metrics?.total_expenses || 0)}
          change="-8.2%"
          isPositive={false}
          icon={<TrendingDown className="w-5 h-5 text-red-400" />}
        />
        <MetricCard
          title="Net Profit"
          value={formatCurrency(metrics?.net_profit || 0)}
          change="+23.1%"
          isPositive={true}
          icon={<DollarSign className="w-5 h-5 text-blue-400" />}
        />
        <MetricCard
          title="Transactions"
          value={(metrics?.total_transactions || 0).toLocaleString()}
          change="+5.4%"
          isPositive={true}
          icon={<Receipt className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 neo-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-2">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-8 rounded-full ${getCategoryColor(transaction.final_category)}`}></div>
                    <div>
                      <p className="font-medium text-white">{transaction.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-400">{formatDate(transaction.tx_date)}</p>
                        {transaction.final_category && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                              {transaction.final_category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.is_income ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.is_income ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    {transaction.gst_amount && (
                      <p className="text-xs text-gray-500">GST: {formatCurrency(transaction.gst_amount)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions Panel */}
          <div className="neo-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-400/50 transition-colors group"
              >
                <Upload className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <p className="font-medium text-white group-hover:text-purple-300">Upload Files</p>
                  <p className="text-sm text-gray-400">Import transactions</p>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-400/50 transition-colors group"
              >
                <FileText className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <p className="font-medium text-white group-hover:text-green-300">Generate Report</p>
                  <p className="text-sm text-gray-400">Export your data</p>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 hover:border-amber-400/50 transition-colors group"
              >
                <Settings className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <p className="font-medium text-white group-hover:text-amber-300">Manage Rules</p>
                  <p className="text-sm text-gray-400">Auto-categorization</p>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="neo-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Upcoming</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white">GST Filing</p>
                  <p className="text-sm text-gray-400">Due in 5 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="font-medium text-white">Monthly Report</p>
                  <p className="text-sm text-gray-400">Due in 12 days</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
