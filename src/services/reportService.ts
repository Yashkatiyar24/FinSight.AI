// Report generation service for FinSight.AI
import { supabase } from '../lib/supabase'
import type { Transaction, Report } from '../lib/types'

export interface ReportData {
  transactions: Transaction[]
  summary: {
    total_revenue: number
    total_expenses: number
    net_profit: number
    total_gst: number
    categories: Array<{
      category: string
      amount: number
      count: number
      gst_amount: number
    }>
  }
  period: {
    start: string
    end: string
  }
}

export interface ReportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includeGSTBreakdown: boolean
  includeCategoryBreakdown: boolean
}

export class ReportService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async generateExpenseReport(
    startDate: string, 
    endDate: string, 
    _options: ReportOptions = { format: 'pdf', includeCharts: true, includeGSTBreakdown: true, includeCategoryBreakdown: true }
  ): Promise<ReportData> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', this.userId)
      .gte('tx_date', startDate)
      .lte('tx_date', endDate)
      .eq('is_income', false)
      .order('tx_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`)
    }

    return this.processReportData(transactions || [], startDate, endDate)
  }

  async generateTaxReport(
    startDate: string, 
    endDate: string, 
    _options: ReportOptions = { format: 'pdf', includeCharts: true, includeGSTBreakdown: true, includeCategoryBreakdown: true }
  ): Promise<ReportData> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', this.userId)
      .gte('tx_date', startDate)
      .lte('tx_date', endDate)
      .order('tx_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`)
    }

    return this.processReportData(transactions || [], startDate, endDate)
  }

  async generateProfitLossReport(
    startDate: string, 
    endDate: string, 
    _options: ReportOptions = { format: 'pdf', includeCharts: true, includeGSTBreakdown: true, includeCategoryBreakdown: true }
  ): Promise<ReportData> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', this.userId)
      .gte('tx_date', startDate)
      .lte('tx_date', endDate)
      .order('tx_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`)
    }

    return this.processReportData(transactions || [], startDate, endDate)
  }

  private processReportData(transactions: Transaction[], startDate: string, endDate: string): ReportData {
    const total_revenue = transactions
      .filter(t => t.is_income)
      .reduce((sum, t) => sum + t.amount, 0)

    const total_expenses = transactions
      .filter(t => !t.is_income)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const total_gst = transactions
      .reduce((sum, t) => sum + (t.gst_amount || 0), 0)

    const net_profit = total_revenue - total_expenses

    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number; gst_amount: number }>()
    
    transactions.forEach(transaction => {
      const category = transaction.final_category || 'Uncategorized'
      const existing = categoryMap.get(category) || { amount: 0, count: 0, gst_amount: 0 }
      
      categoryMap.set(category, {
        amount: existing.amount + Math.abs(transaction.amount),
        count: existing.count + 1,
        gst_amount: existing.gst_amount + (transaction.gst_amount || 0)
      })
    })

    const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data
    })).sort((a, b) => b.amount - a.amount)

    return {
      transactions,
      summary: {
        total_revenue,
        total_expenses,
        net_profit,
        total_gst,
        categories
      },
      period: {
        start: startDate,
        end: endDate
      }
    }
  }

  async exportToCSV(reportData: ReportData, _filename: string): Promise<string> {
    const headers = [
      'Date',
      'Description',
      'Merchant',
      'Amount',
      'Category',
      'GST Rate',
      'GST Amount',
      'Type'
    ]

    const rows = reportData.transactions.map(t => [
      t.tx_date,
      t.description,
      t.merchant || '',
      t.amount.toString(),
      t.final_category || 'Uncategorized',
      (t.gst_rate || 0).toString(),
      (t.gst_amount || 0).toString(),
      t.is_income ? 'Income' : 'Expense'
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = _filename
    a.click()
    
    URL.revokeObjectURL(url)
    
    return url
  }

  async exportToExcel(reportData: ReportData, _filename: string): Promise<string> {
    // For Excel export, we'll use a simple CSV format that Excel can open
    // In a production app, you'd use a library like xlsx or exceljs
    return this.exportToCSV(reportData, _filename.replace('.xlsx', '.csv'))
  }

  async exportToPDF(reportData: ReportData, _filename: string): Promise<string> {
    // For PDF export, we'll create a simple HTML report that can be printed
    // In a production app, you'd use a library like jsPDF or puppeteer
    const htmlContent = this.generateHTMLReport(reportData)
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    // Open in new window for printing
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
    
    return url
  }

  private generateHTMLReport(reportData: ReportData): string {
    const { summary, period, transactions } = reportData
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report - ${period.start} to ${period.end}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
          .summary-card h3 { margin: 0 0 10px 0; color: #333; }
          .summary-card .value { font-size: 24px; font-weight: bold; }
          .categories { margin-bottom: 30px; }
          .category-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
          .transactions { margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Financial Report</h1>
          <p>Period: ${period.start} to ${period.end}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Revenue</h3>
            <div class="value" style="color: green;">₹${summary.total_revenue.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <h3>Total Expenses</h3>
            <div class="value" style="color: red;">₹${summary.total_expenses.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <h3>Net Profit</h3>
            <div class="value" style="color: ${summary.net_profit >= 0 ? 'green' : 'red'};">₹${summary.net_profit.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <h3>Total GST</h3>
            <div class="value">₹${summary.total_gst.toLocaleString()}</div>
          </div>
        </div>
        
        <div class="categories">
          <h2>Expenses by Category</h2>
          ${summary.categories.map(cat => `
            <div class="category-item">
              <span>${cat.category}</span>
              <span>₹${cat.amount.toLocaleString()} (${cat.count} transactions)</span>
            </div>
          `).join('')}
        </div>
        
        <div class="transactions">
          <h2>Transaction Details</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
                <th>GST</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr>
                  <td>${t.tx_date}</td>
                  <td>${t.description}</td>
                  <td style="color: ${t.is_income ? 'green' : 'red'};">${t.is_income ? '+' : '-'}₹${Math.abs(t.amount).toLocaleString()}</td>
                  <td>${t.final_category || 'Uncategorized'}</td>
                  <td>₹${(t.gst_amount || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `
  }

  async saveReport(
    type: 'expense' | 'tax' | 'pnl',
    startDate: string,
    endDate: string,
    reportData: ReportData
  ): Promise<Report> {
    const reportId = crypto.randomUUID()
    
    const { data, error } = await supabase
      .from('reports')
      .insert({
        id: reportId,
        user_id: this.userId,
        name: `${type.toUpperCase()} Report - ${startDate} to ${endDate}`,
        type,
        period_start: startDate,
        period_end: endDate,
        metrics: reportData.summary,
        parameters: { startDate, endDate }
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save report: ${error.message}`)
    }

    return data
  }

  async getReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`)
    }

    return data || []
  }
}
