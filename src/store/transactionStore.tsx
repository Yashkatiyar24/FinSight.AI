import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ProcessedTransaction {
  id: string
  user_id: string
  tx_date: string
  description: string
  merchant: string
  amount: number
  is_income: boolean
  final_category: string
  ai_confidence: number
  is_recurring: boolean
  subcategory?: string
  source_upload_id?: string
  created_at: string
}

interface DashboardMetrics {
  total_revenue: number
  total_expenses: number
  net_profit: number
  total_transactions: number
  categories: Array<{
    category: string
    amount: number
    count: number
  }>
}

interface TransactionContextType {
  // State
  transactions: ProcessedTransaction[]
  metrics: DashboardMetrics | null
  isLoading: boolean
  lastUploadId: string | null

  // Actions
  addTransactions: (transactions: ProcessedTransaction[]) => void
  clearTransactions: () => void
  updateMetrics: () => void
  getTransactionsByCategory: (category: string) => ProcessedTransaction[]
  getRecentTransactions: (limit?: number) => ProcessedTransaction[]
  getTotalExpenses: () => number
  getTotalIncome: () => number
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

const calculateMetrics = (transactions: ProcessedTransaction[]): DashboardMetrics => {
  const expenses = transactions.filter(t => !t.is_income)
  const income = transactions.filter(t => t.is_income)
  
  const total_expenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const total_revenue = income.reduce((sum, t) => sum + t.amount, 0)
  
  // Calculate categories
  const categoryMap = new Map<string, { amount: number; count: number }>()
  
  expenses.forEach(transaction => {
    const category = transaction.final_category || 'Uncategorized'
    const existing = categoryMap.get(category) || { amount: 0, count: 0 }
    categoryMap.set(category, {
      amount: existing.amount + Math.abs(transaction.amount),
      count: existing.count + 1
    })
  })
  
  const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count
  })).sort((a, b) => b.amount - a.amount)

  return {
    total_revenue,
    total_expenses,
    net_profit: total_revenue - total_expenses,
    total_transactions: transactions.length,
    categories
  }
}

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
<<<<<<< HEAD
  const [isLoading, _setIsLoading] = useState(false)
=======
  const [isLoading, setIsLoading] = useState(false)
>>>>>>> b2959ab69516f91b71bffba9aa21bf00ee004093
  const [lastUploadId, setLastUploadId] = useState<string | null>(null)

  const addTransactions = (newTransactions: ProcessedTransaction[]) => {
    setTransactions(prev => {
      const updatedTransactions = [...prev, ...newTransactions]
      const newMetrics = calculateMetrics(updatedTransactions)
      setMetrics(newMetrics)
      setLastUploadId(newTransactions[0]?.source_upload_id || null)
      
      console.log('TransactionStore: Added', newTransactions.length, 'transactions')
      console.log('TransactionStore: Total transactions:', updatedTransactions.length)
      console.log('TransactionStore: Updated metrics:', newMetrics)
      
      return updatedTransactions
    })
  }

  const clearTransactions = () => {
    console.log('TransactionStore: Clearing all transactions')
    setTransactions([])
    setMetrics(null)
    setLastUploadId(null)
  }

  const updateMetrics = () => {
    const newMetrics = calculateMetrics(transactions)
    setMetrics(newMetrics)
  }

  const getTransactionsByCategory = (category: string) => {
    return transactions.filter(t => t.final_category === category)
  }

  const getRecentTransactions = (limit = 10) => {
    return transactions
      .sort((a, b) => new Date(b.tx_date).getTime() - new Date(a.tx_date).getTime())
      .slice(0, limit)
  }

  const getTotalExpenses = () => {
    return transactions
      .filter(t => !t.is_income)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.is_income)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const value: TransactionContextType = {
    transactions,
    metrics,
    isLoading,
    lastUploadId,
    addTransactions,
    clearTransactions,
    updateMetrics,
    getTransactionsByCategory,
    getRecentTransactions,
    getTotalExpenses,
    getTotalIncome
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

export const useTransactionStore = (): TransactionContextType => {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactionStore must be used within a TransactionProvider')
  }
  return context
}

// Export types for use in other components
export type { ProcessedTransaction, DashboardMetrics }
