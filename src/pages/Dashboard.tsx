import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  Upload, 
  FileText, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  XCircle
} from 'lucide-react'
import { useAuth } from '../context/SupabaseAuthContext'
import { useTransactionStore } from '../store/transactionStore'
import { ApiService } from '../services/api'
import type { DashboardMetrics, Transaction } from '../lib/types'

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
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  // Debug logging
  console.log('Dashboard - User state:', user)
  console.log('Dashboard - Transactions in store:', transactions.length)
  console.log('Dashboard - Metrics from store:', metrics)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const apiService = new ApiService(user.id)
        
        // Fetch dashboard metrics
        const metrics = await apiService.getDashboardMetrics()
        setDashboardMetrics(metrics)
        
        // Fetch recent transactions
        const transactions = await apiService.getTransactions(10, 0)
        setRecentTransactions(transactions)
        
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // Get recent transactions from store as fallback
  const storeRecentTransactions = getRecentTransactions(5)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Error loading dashboard</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Use API data or fallback to store data
  const displayMetrics = dashboardMetrics || metrics || {
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    total_transactions: transactions.length,
    categories: []
  }

  const displayTransactions = recentTransactions.length > 0 ? recentTransactions : storeRecentTransactions

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financial Dashboard</h1>
          <p className="text-gray-400">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Show upload prompt if no transactions */}
      {transactions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card p-8 text-center"
        >
          <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Get Started</h3>
          <p className="text-gray-400 mb-6">
            Upload your CSV file to see your financial dashboard with beautiful charts and insights.
          </p>
          <a
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Transactions
          </a>
        </motion.div>
      )}

      {/* Metrics Cards */}
      {transactions.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Income"
              value={formatCurrency(displayMetrics.total_revenue)}
              change="+12.5%"
              isPositive={true}
              icon={<DollarSign className="w-5 h-5 text-green-400" />}
            />
            <MetricCard
              title="Total Expenses"
              value={formatCurrency(displayMetrics.total_expenses)}
              change="-3.2%"
              isPositive={false}
              icon={<TrendingDown className="w-5 h-5 text-red-400" />}
            />
            <MetricCard
              title="Net Profit"
              value={formatCurrency(displayMetrics.net_profit)}
              change="+8.1%"
              isPositive={displayMetrics.net_profit > 0}
              icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            />
            <MetricCard
              title="Transactions"
              value={displayMetrics.total_transactions.toString()}
              change="+15"
              isPositive={true}
              icon={<Receipt className="w-5 h-5 text-blue-400" />}
            />
          </div>

          {/* Categories Overview */}
          {displayMetrics.categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neo-card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Spending by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMetrics.categories.slice(0, 6).map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{category.category}</p>
                      <p className="text-gray-400 text-sm">{category.count} transactions</p>
                    </div>
                    <p className="text-purple-400 font-semibold">{formatCurrency(category.amount)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="neo-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
              <a
                href="/transactions"
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
              >
                View all →
              </a>
            </div>
            
            {displayTransactions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{transaction.merchant}</span>
                          <span>•</span>
                          <span>{transaction.final_category}</span>
                          <span>•</span>
                          <span>{new Date(transaction.tx_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.is_income ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.is_income ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      {(transaction as any).ml_confidence && (
                        <p className="text-xs text-gray-400">
                          {Math.round((transaction as any).ml_confidence * 100)}% confidence
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Dashboard
