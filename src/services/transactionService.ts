// Transaction management service
import { supabase } from '../lib/supabase'
import type { Transaction } from '../lib/types'

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  category?: string
  isIncome?: boolean
  minAmount?: number
  maxAmount?: number
  search?: string
}

export interface TransactionListResult {
  transactions: Transaction[]
  totalCount: number
  hasMore: boolean
}

export class TransactionService {
  static async getTransactions(
    userId: string,
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<TransactionListResult> {
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)

      // Apply filters
      if (filters.startDate) {
        query = query.gte('tx_date', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('tx_date', filters.endDate)
      }

      if (filters.category) {
        query = query.eq('final_category', filters.category)
      }

      if (filters.isIncome !== undefined) {
        query = query.eq('is_income', filters.isIncome)
      }

      if (filters.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount)
      }

      if (filters.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount)
      }

      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,merchant.ilike.%${filters.search}%`)
      }

      // Apply pagination
      const offset = (page - 1) * limit
      query = query
        .order('tx_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }

      return {
        transactions: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    } catch (error) {
      console.error('Transaction fetch failed:', error)
      throw error
    }
  }

  static async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Transaction update failed:', error)
      throw error
    }
  }

  static async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

      if (error) {
        throw new Error(`Failed to delete transaction: ${error.message}`)
      }
    } catch (error) {
      console.error('Transaction deletion failed:', error)
      throw error
    }
  }

  static async bulkUpdateCategory(
    userId: string,
    transactionIds: string[],
    category: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ final_category: category })
        .eq('user_id', userId)
        .in('id', transactionIds)

      if (error) {
        throw new Error(`Failed to bulk update transactions: ${error.message}`)
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
      throw error
    }
  }

  static async getCategories(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('final_category')
        .eq('user_id', userId)
        .not('final_category', 'is', null)

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`)
      }

      // Get unique categories
      const categories = [...new Set(data?.map(t => t.final_category).filter(Boolean))]
      return categories.sort()
    } catch (error) {
      console.error('Categories fetch failed:', error)
      return []
    }
  }

  static async getTransactionStats(userId: string): Promise<{
    totalTransactions: number
    totalIncome: number
    totalExpenses: number
    avgTransactionAmount: number
    categoryCounts: Record<string, number>
  }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, is_income, final_category')
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to fetch transaction stats: ${error.message}`)
      }

      const transactions = data || []
      const totalTransactions = transactions.length
      const totalIncome = transactions
        .filter(t => t.is_income)
        .reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions
        .filter(t => !t.is_income)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const avgTransactionAmount = totalTransactions > 0 
        ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / totalTransactions
        : 0

      // Category counts
      const categoryCounts: Record<string, number> = {}
      transactions.forEach(t => {
        const category = t.final_category || 'Misc'
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      })

      return {
        totalTransactions,
        totalIncome,
        totalExpenses,
        avgTransactionAmount,
        categoryCounts
      }
    } catch (error) {
      console.error('Transaction stats fetch failed:', error)
      return {
        totalTransactions: 0,
        totalIncome: 0,
        totalExpenses: 0,
        avgTransactionAmount: 0,
        categoryCounts: {}
      }
    }
  }
}