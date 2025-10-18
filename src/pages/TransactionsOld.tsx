import { Search, Download, FileText, CreditCard, Trash2 } from "lucide-react"

const transactions = [
  { date: "10/15", description: "Software Subscription", confidence: 95, gst: "10%", category: "Technology", amount: "$99.00" },
  { date: "10/14", description: "Dinner with Client", confidence: 92, gst: "5%", category: "Meals & Entertainment", amount: "$85.50" },
  { date: "10/12", description: "Uber Ride", confidence: 98, gst: "10%", category: "Transportation", amount: "$24.75" },
  { date: "10/10", description: "Office Supplies", confidence: 88, gst: "10%", category: "Business Expenses", amount: "$156.20" },
  { date: "10/08", description: "Marketing Campaign", confidence: 94, gst: "0%", category: "Advertising", amount: "$450.00" },
]

export default function Transactions() {
  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="mx-auto max-w-[1600px] p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="mt-1 text-gray-400">Manage and review your categorized transactions</p>
        </div>

        {/* Filters and Search */}
        <div className="neo-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2BD1FF] focus:border-transparent"
                />
              </div>
            </div>
            <select className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2BD1FF]">
              <option>All Categories</option>
              <option>Technology</option>
              <option>Meals & Entertainment</option>
              <option>Transportation</option>
              <option>Business Expenses</option>
            </select>
            <select className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2BD1FF]">
              <option>All Time</option>
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
            </select>
            <button className="px-6 py-3 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="neo-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    AI Confidence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    GST
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-[#2BD1FF] mr-3" />
                        <span className="text-white font-medium">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#7A5CFF]/20 text-[#7A5CFF]">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-slate-700 rounded-full h-2 mr-3">
                          <div 
                            className="bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] h-2 rounded-full" 
                            style={{ width: `${transaction.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-300">{transaction.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.gst}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-[#2BD1FF] hover:text-[#2BD1FF]/80 transition-colors">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing 1 to 5 of 127 transactions
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors">
              Previous
            </button>
            <button className="px-3 py-2 bg-[#2BD1FF] text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors">
              2
            </button>
            <button className="px-3 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors">
              3
            </button>
            <button className="px-3 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
