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
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
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
            </div>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  )
}
