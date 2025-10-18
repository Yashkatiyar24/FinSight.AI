<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { Download, FileText, TrendingUp, Receipt, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/SupabaseAuthContext'
import { ReportService } from '../services/reportService'
import type { Report } from '../lib/types'

export default function Reports() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const reportService = new ReportService(user.id)
        const data = await reportService.getReports()
        setReports(data)
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [user])

  const generateReport = async (type: 'expense' | 'tax' | 'pnl', format: 'pdf' | 'excel' | 'csv') => {
    if (!user) return

    try {
      setGenerating(`${type}-${format}`)
      const reportService = new ReportService(user.id)
      
      let reportData
      switch (type) {
        case 'expense':
          reportData = await reportService.generateExpenseReport(selectedPeriod.start, selectedPeriod.end)
          break
        case 'tax':
          reportData = await reportService.generateTaxReport(selectedPeriod.start, selectedPeriod.end)
          break
        case 'pnl':
          reportData = await reportService.generateProfitLossReport(selectedPeriod.start, selectedPeriod.end)
          break
      }

      // Save report to database
      await reportService.saveReport(type, selectedPeriod.start, selectedPeriod.end, reportData)

      // Export report
      const filename = `${type}-report-${selectedPeriod.start}-to-${selectedPeriod.end}.${format}`
      switch (format) {
        case 'csv':
          await reportService.exportToCSV(reportData, filename)
          break
        case 'excel':
          await reportService.exportToExcel(reportData, filename)
          break
        case 'pdf':
          await reportService.exportToPDF(reportData, filename)
          break
      }

      // Refresh reports list
      const updatedReports = await reportService.getReports()
      setReports(updatedReports)

    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(null)
    }
  }

  const reportTypes = [
    {
      id: 'expense',
      name: 'Expense Report',
      description: 'Detailed breakdown of all expenses',
      icon: Receipt,
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'tax',
      name: 'Tax Report',
      description: 'GST and tax-related transactions',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'pnl',
      name: 'Profit & Loss',
      description: 'Income vs expenses analysis',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const exportFormats = [
    { id: 'pdf', name: 'PDF', icon: FileText },
    { id: 'excel', name: 'Excel', icon: BarChart3 },
    { id: 'csv', name: 'CSV', icon: Download }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400">Loading reports...</p>
        </div>
      </div>
    )
=======
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, FileText } from "lucide-react"
import { useState } from "react"

const reportTypes = [
  {
    id: 'expense',
    name: 'Expense Report',
    description: 'Detailed breakdown of expenses by category and time period',
    icon: PieChart,
    format: ['PDF', 'Excel', 'CSV']
  },
  {
    id: 'tax',
    name: 'Tax Report',
    description: 'GST/Tax calculations and deductible expenses summary',
    icon: FileText,
    format: ['PDF', 'Excel']
  },
  {
    id: 'profit-loss',
    name: 'Profit & Loss',
    description: 'Revenue vs expenses analysis for specified period',
    icon: TrendingUp,
    format: ['PDF', 'Excel']
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    description: 'Monthly cash flow analysis and projections',
    icon: BarChart3,
    format: ['PDF', 'Excel', 'CSV']
  }
]

const recentReports = [
  {
    id: '1',
    name: 'Monthly Expense Report - December 2024',
    type: 'Expense Report',
    generated: '2024-12-15',
    size: '2.4 MB',
    format: 'PDF'
  },
  {
    id: '2',
    name: 'Q4 Tax Summary 2024',
    type: 'Tax Report',
    generated: '2024-12-10',
    size: '1.8 MB',
    format: 'Excel'
  },
  {
    id: '3',
    name: 'Profit & Loss - November 2024',
    type: 'Profit & Loss',
    generated: '2024-12-05',
    size: '1.2 MB',
    format: 'PDF'
  }
]

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId)
    // Simulate report generation
    setTimeout(() => {
      alert(`Report generated successfully! Check your downloads folder.`)
      setSelectedReport(null)
    }, 2000)
>>>>>>> b2959ab69516f91b71bffba9aa21bf00ee004093
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
<<<<<<< HEAD
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Financial Reports</h1>
          <p className="text-gray-400">
            Generate and download comprehensive financial reports
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Report Period</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Start Date</label>
              <input
                type="date"
                value={selectedPeriod.start}
                onChange={(e) => setSelectedPeriod(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">End Date</label>
              <input
                type="date"
                value={selectedPeriod.end}
                onChange={(e) => setSelectedPeriod(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
=======
      <div className="mx-auto max-w-[1600px] p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
          <p className="mt-1 text-gray-400">Generate comprehensive financial reports and analytics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="neo-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">$45,230</p>
                <p className="text-green-400 text-xs flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% vs last month
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="neo-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-white">$28,940</p>
                <p className="text-red-400 text-xs flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.2% vs last month
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#EF4444] to-[#F87171] rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="neo-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Net Profit</p>
                <p className="text-2xl font-bold text-white">$16,290</p>
                <p className="text-green-400 text-xs flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18.3% vs last month
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="neo-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tax Liability</p>
                <p className="text-2xl font-bold text-white">$4,520</p>
                <p className="text-gray-400 text-xs flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  Due Jan 31, 2025
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
>>>>>>> b2959ab69516f91b71bffba9aa21bf00ee004093
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Report Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((reportType) => {
            const Icon = reportType.icon
            return (
              <div
                key={reportType.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${reportType.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{reportType.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{reportType.description}</p>
                
                <div className="space-y-2">
                  {exportFormats.map((format) => {
                    const FormatIcon = format.icon
                    const isGenerating = generating === `${reportType.id}-${format.id}`
                    
                    return (
                      <button
                        key={format.id}
                        onClick={() => generateReport(reportType.id as any, format.id as any)}
                        disabled={isGenerating}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isGenerating
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <FormatIcon className="w-4 h-4" />
                            {format.name}
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Reports */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
          
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No reports generated yet</p>
              <p className="text-sm text-gray-500 mt-1">Generate your first report above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{report.name}</h4>
                      <p className="text-sm text-gray-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-purple-400 hover:text-purple-300 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
=======
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generate Reports */}
          <div className="neo-card">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Generate New Report</h2>
              <p className="text-gray-400 text-sm mt-1">Create custom financial reports</p>
            </div>
            
            <div className="p-6">
              {/* Period Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Report Period</label>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2BD1FF]"
                >
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="this-quarter">This Quarter</option>
                  <option value="last-quarter">Last Quarter</option>
                  <option value="this-year">This Year</option>
                  <option value="last-year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Report Types */}
              <div className="space-y-4">
                {reportTypes.map((report) => {
                  const Icon = report.icon
                  return (
                    <div key={report.id} className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{report.name}</h3>
                            <p className="text-gray-400 text-sm mt-1">{report.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {report.format.map((format) => (
                                <span key={format} className="px-2 py-1 bg-slate-800 text-gray-300 text-xs rounded">
                                  {format}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={selectedReport === report.id}
                          className="px-4 py-2 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center space-x-2"
                        >
                          {selectedReport === report.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Generate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="neo-card">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Recent Reports</h2>
              <p className="text-gray-400 text-sm mt-1">Download previously generated reports</p>
            </div>
            
            <div className="divide-y divide-slate-700">
              {recentReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{report.name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.generated}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                        <span className="px-2 py-1 bg-slate-800 text-gray-300 text-xs rounded">
                          {report.format}
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-[#2BD1FF] hover:text-[#2BD1FF]/80 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-slate-700">
              <button className="w-full px-4 py-2 text-[#2BD1FF] hover:text-[#2BD1FF]/80 hover:bg-slate-800 rounded-lg transition-colors text-center">
                View All Reports
              </button>
            </div>
          </div>
>>>>>>> b2959ab69516f91b71bffba9aa21bf00ee004093
        </div>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> b2959ab69516f91b71bffba9aa21bf00ee004093
