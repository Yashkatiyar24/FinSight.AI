import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, FileText, CreditCard, Calendar, ArrowUpDown } from "lucide-react"
import { useTransactionStore } from '../store/transactionStore'

const Transactions: React.FC = () => {
  const { transactions } = useTransactionStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortField, setSortField] = useState<'tx_date' | 'amount' | 'description'>('tx_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Get unique categories for filter
  const categories = Array.from(new Set(transactions.map(t => t.final_category))).filter(Boolean)

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || transaction.final_category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1
      switch (sortField) {
        case 'tx_date':
          return multiplier * (new Date(a.tx_date).getTime() - new Date(b.tx_date).getTime())
        case 'amount':
          return multiplier * (Math.abs(a.amount) - Math.abs(b.amount))
        case 'description':
          return multiplier * a.description.localeCompare(b.description)
        default:
          return 0
      }
    })

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Description', 'Merchant', 'Category', 'Amount', 'Type'],
      ...filteredTransactions.map(t => [
        t.tx_date,
        t.description,
        t.merchant,
        t.final_category,
        t.amount.toString(),
        t.is_income ? 'Income' : 'Expense'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="mx-auto max-w-[1600px] p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="mt-1 text-gray-400">
            Manage and review your {transactions.length} categorized transactions
          </p>
        </motion.div>

        {/* No transactions state */}
        {transactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-card p-8 text-center"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
            <p className="text-gray-400 mb-6">
              Upload your CSV file to see your transactions here with beautiful categorization.
            </p>
            <a
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <FileText className="w-4 h-4" />
              Upload Transactions
            </a>
          </motion.div>
        )}

        {/* Filters and Search */}
        {transactions.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="neo-card p-6 mb-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button 
                  onClick={exportTransactions}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </motion.div>

            {/* Transactions Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neo-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th 
                        className="text-left py-4 px-6 text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('tx_date')}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('description')}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Description
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Merchant</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Category</th>
                      <th 
                        className="text-right py-4 px-6 text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center gap-2 justify-end">
                          <CreditCard className="w-4 h-4" />
                          Amount
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 text-gray-400 font-medium">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index % 10) }}
                        className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-6 text-gray-300">
                          {formatDate(transaction.tx_date)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-white font-medium">{transaction.description}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {transaction.merchant}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {transaction.final_category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`font-semibold ${
                            transaction.is_income ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.is_income ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-full bg-slate-700 rounded-full h-2 max-w-[60px]">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                style={{ width: `${(transaction.ai_confidence || 0) * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs text-gray-400">
                              {Math.round((transaction.ai_confidence || 0) * 100)}%
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Results summary */}
              <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/50">
                <p className="text-sm text-gray-400">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedCategory && ` in ${selectedCategory}`}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default Transactions
