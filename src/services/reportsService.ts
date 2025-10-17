// Reports generation and export service
import { supabase } from '../lib/supabase'
import type { Report, Transaction } from '../lib/types'

export interface ReportData {
  transactions: Transaction[]
  summary: {
    total_income: number
    total_expenses: number
    net_profit: number
    total_gst: number
    transaction_count: number
    category_breakdown: Array<{
      category: string
      amount: number
      count: number
      percentage: number
    }>
  }
  period: {
    start_date: string
    end_date: string
  }
}

export interface CreateReportRequest {
  name: string
  type: 'expense' | 'tax' | 'pnl'
  period_start: string
  period_end: string
  parameters?: any
}

export class ReportsService {
  static async generateReport(
    userId: string,
    type: 'expense' | 'tax' | 'pnl',
    startDate: string,
    endDate: string
  ): Promise<ReportData> {
    try {
      // Fetch transactions for the period
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('tx_date', startDate)
        .lte('tx_date', endDate)
        .order('tx_date', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }

      const txData = transactions || []

      // Calculate summary metrics
      const total_income = txData
        .filter(tx => tx.is_income)
        .reduce((sum, tx) => sum + tx.amount, 0)

      const total_expenses = txData
        .filter(tx => !tx.is_income)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

      const net_profit = total_income - total_expenses

      const total_gst = txData
        .reduce((sum, tx) => sum + (tx.gst_amount || 0), 0)

      // Category breakdown (expenses only for most reports)
      const categoryMap = new Map<string, { amount: number; count: number }>()
      
      const expenseTransactions = type === 'pnl' ? txData : txData.filter(tx => !tx.is_income)
      
      expenseTransactions.forEach(tx => {
        const category = tx.final_category || 'Misc'
        const existing = categoryMap.get(category) || { amount: 0, count: 0 }
        
        categoryMap.set(category, {
          amount: existing.amount + (type === 'pnl' && tx.is_income ? tx.amount : Math.abs(tx.amount)),
          count: existing.count + 1
        })
      })

      const totalCategoryAmount = Array.from(categoryMap.values())
        .reduce((sum, cat) => sum + cat.amount, 0)

      const category_breakdown = Array.from(categoryMap.entries())
        .map(([category, stats]) => ({
          category,
          amount: stats.amount,
          count: stats.count,
          percentage: totalCategoryAmount > 0 ? (stats.amount / totalCategoryAmount) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)

      return {
        transactions: txData,
        summary: {
          total_income,
          total_expenses,
          net_profit,
          total_gst,
          transaction_count: txData.length,
          category_breakdown
        },
        period: {
          start_date: startDate,
          end_date: endDate
        }
      }
    } catch (error) {
      console.error('Report generation failed:', error)
      throw error
    }
  }

  static async saveReport(
    userId: string,
    reportRequest: CreateReportRequest
  ): Promise<Report> {
    try {
      // Generate the report data
      const reportData = await this.generateReport(
        userId,
        reportRequest.type,
        reportRequest.period_start,
        reportRequest.period_end
      )

      // Save report metadata to database
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          user_id: userId,
          name: reportRequest.name,
          type: reportRequest.type,
          period_start: reportRequest.period_start,
          period_end: reportRequest.period_end,
          metrics: reportData.summary,
          parameters: reportRequest.parameters
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save report: ${error.message}`)
      }

      return report
    } catch (error) {
      console.error('Report save failed:', error)
      throw error
    }
  }

  static async getReports(userId: string): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Reports fetch failed:', error)
      throw error
    }
  }

  static async deleteReport(reportId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) {
        throw new Error(`Failed to delete report: ${error.message}`)
      }
    } catch (error) {
      console.error('Report deletion failed:', error)
      throw error
    }
  }

  static exportToCSV(reportData: ReportData, reportType: string): string {
    const { transactions, summary, period } = reportData

    let csv = `${reportType.toUpperCase()} REPORT\n`
    csv += `Period: ${period.start_date} to ${period.end_date}\n`
    csv += `Generated: ${new Date().toISOString()}\n\n`

    // Summary section
    csv += `SUMMARY\n`
    csv += `Total Income,${summary.total_income}\n`
    csv += `Total Expenses,${summary.total_expenses}\n`
    csv += `Net Profit,${summary.net_profit}\n`
    csv += `Total GST,${summary.total_gst}\n`
    csv += `Transaction Count,${summary.transaction_count}\n\n`

    // Category breakdown
    csv += `CATEGORY BREAKDOWN\n`
    csv += `Category,Amount,Count,Percentage\n`
    summary.category_breakdown.forEach(cat => {
      csv += `${cat.category},${cat.amount},${cat.count},${cat.percentage.toFixed(2)}%\n`
    })
    csv += `\n`

    // Transactions
    csv += `TRANSACTIONS\n`
    csv += `Date,Description,Merchant,Category,Amount,GST Rate,GST Amount,Income\n`
    transactions.forEach(tx => {
      csv += `${tx.tx_date},"${tx.description}","${tx.merchant || ''}","${tx.final_category || 'Misc'}",${tx.amount},${tx.gst_rate || 0},${tx.gst_amount || 0},${tx.is_income}\n`
    })

    return csv
  }

  static exportToJSON(reportData: ReportData, reportType: string): string {
    return JSON.stringify({
      report_type: reportType,
      generated_at: new Date().toISOString(),
      ...reportData
    }, null, 2)
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  static generateFilename(reportType: string, startDate: string, endDate: string, format: string): string {
    const start = startDate.replace(/-/g, '')
    const end = endDate.replace(/-/g, '')
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    
    return `finsight-${reportType}-${start}-${end}-${timestamp}.${format}`
  }

  // Predefined report templates
  static async generateExpenseReport(userId: string, startDate: string, endDate: string): Promise<ReportData> {
    const reportData = await this.generateReport(userId, 'expense', startDate, endDate)
    
    // Filter to expenses only
    reportData.transactions = reportData.transactions.filter(tx => !tx.is_income)
    
    return reportData
  }

  static async generateTaxReport(userId: string, startDate: string, endDate: string): Promise<ReportData> {
    const reportData = await this.generateReport(userId, 'tax', startDate, endDate)
    
    // Focus on GST calculations
    reportData.transactions = reportData.transactions.filter(tx => (tx.gst_amount || 0) > 0)
    
    return reportData
  }

  static async generateProfitLossReport(userId: string, startDate: string, endDate: string): Promise<ReportData> {
    return this.generateReport(userId, 'pnl', startDate, endDate)
  }
}