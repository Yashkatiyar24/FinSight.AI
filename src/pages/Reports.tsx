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
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
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
            </div>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  )
}