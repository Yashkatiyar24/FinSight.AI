// Dashboard data service
import { supabase } from '../lib/supabase'
import type { DashboardMetrics, Transaction } from '../lib/types'

export class DashboardService {
  static async getDashboardMetrics(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DashboardMetrics> {
    try {
      // Use the database function for optimized metrics calculation
      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        user_uuid: userId,
        start_date: startDate || null,
        end_date: endDate || null
      })

      if (error) {
        console.error('Error fetching dashboard metrics:', error)
        return this.getEmptyMetrics()
      }

      return data || this.getEmptyMetrics()
    } catch (error) {
      console.error('Dashboard metrics fetch failed:', error)
      return this.getEmptyMetrics()
    }
  }

  static async getRecentTransactions(
    userId: string,
    limit: number = 10
  ): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('tx_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent transactions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Recent transactions fetch failed:', error)
      return []
    }
  }

  static async getTransactionsByCategory(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Array<{ category: string; amount: number; count: number }>> {
    try {
      let query = supabase
        .from('transactions')
        .select('final_category, amount')
        .eq('user_id', userId)
        .eq('is_income', false) // Only expenses for category breakdown

      if (startDate) {
        query = query.gte('tx_date', startDate)
      }

      if (endDate) {
        query = query.lte('tx_date', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching transactions by category:', error)
        return []
      }

      // Group by category
      const categoryMap = new Map<string, { amount: number; count: number }>()

      data?.forEach(tx => {
        const category = tx.final_category || 'Misc'
        const existing = categoryMap.get(category) || { amount: 0, count: 0 }
        
        categoryMap.set(category, {
          amount: existing.amount + Math.abs(tx.amount),
          count: existing.count + 1
        })
      })

      return Array.from(categoryMap.entries())
        .map(([category, stats]) => ({
          category,
          amount: stats.amount,
          count: stats.count
        }))
        .sort((a, b) => b.amount - a.amount)
    } catch (error) {
      console.error('Category transactions fetch failed:', error)
      return []
    }
  }

  static async getMonthlyTrends(
    userId: string,
    months: number = 6
  ): Promise<Array<{ month: string; income: number; expenses: number; net: number }>> {
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)
      
      const { data, error } = await supabase
        .from('transactions')
        .select('tx_date, amount, is_income')
        .eq('user_id', userId)
        .gte('tx_date', startDate.toISOString().split('T')[0])
        .order('tx_date', { ascending: true })

      if (error) {
        console.error('Error fetching monthly trends:', error)
        return []
      }

      // Group by month
      const monthlyMap = new Map<string, { income: number; expenses: number }>()

      data?.forEach(tx => {
        const monthKey = tx.tx_date.substring(0, 7) // YYYY-MM
        const existing = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
        
        if (tx.is_income) {
          existing.income += tx.amount
        } else {
          existing.expenses += Math.abs(tx.amount)
        }
        
        monthlyMap.set(monthKey, existing)
      })

      return Array.from(monthlyMap.entries())
        .map(([month, stats]) => ({
          month,
          income: stats.income,
          expenses: stats.expenses,
          net: stats.income - stats.expenses
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
    } catch (error) {
      console.error('Monthly trends fetch failed:', error)
      return []
    }
  }

  static async getUploadHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching upload history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Upload history fetch failed:', error)
      return []
    }
  }

  private static getEmptyMetrics(): DashboardMetrics {
    return {
      total_revenue: 0,
      total_expenses: 0,
      net_profit: 0,
      total_transactions: 0,
      total_gst: 0,
      categories: []
    }
  }
}

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}