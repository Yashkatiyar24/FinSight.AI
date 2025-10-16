"use client"

import Navigation from "@/components/Navigation"
import { Search, Download, FileText, CreditCard, Trash2 } from "lucide-react"

const transactions = [
  { date: "10/15", description: "Software Subscription", confidence: 95, gst: "10%", category: "Technology", amount: "$99.00" },
  { date: "10/14", description: "Dinner with Client", confidence: 92, gst: "5%", category: "Meals & Entertainment", amount: "$85.50" },
  { date: "10/12", description: "Uber Ride", confidence: 98, gst: "10%", category: "Transportation", amount: "$24.75" },
  { date: "10/10", description: "Office Supplies", confidence: 88, gst: "10%", category: "Business Expenses", amount: "$156.20" },
  { date: "10/08", description: "Marketing Campaign", confidence: 94, gst: "0%", category: "Advertising", amount: "$450.00" },
]

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Navigation />
      
      <div className="mx-auto max-w-[1600px] p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
        </div>
        
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button className="rounded-lg border-2 border-[#2BD1FF] bg-[#2BD1FF]/10 px-4 py-2 text-sm font-medium text-[#2BD1FF]">
            October 2025
          </button>
          <button className="rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-2 text-sm font-medium text-gray-300">
            Batch ▼
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-2 text-sm font-medium text-gray-300">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            Low-confidence
          </button>
          <div className="ml-auto flex items-center gap-3 rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className="neo-card p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(43,209,255,0.1)]">
                  <th className="pb-4 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="pb-4 text-left text-sm font-medium text-gray-400">Description</th>
                  <th className="pb-4 text-left text-sm font-medium text-gray-400">GST Rate</th>
                  <th className="pb-4 text-left text-sm font-medium text-gray-400">Final Category</th>
                  <th className="pb-4 text-right text-sm font-medium text-gray-400">Amount</th>
                  <th className="pb-4 text-center text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="border-b border-[rgba(43,209,255,0.05)] transition-all hover:bg-[#141925]/30">
                    <td className="py-4 text-sm text-gray-300">{txn.date}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{txn.description}</span>
                        <span className="rounded-full bg-[#2BD1FF]/20 px-2 py-0.5 text-xs text-[#2BD1FF]">
                          {txn.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-white">{txn.gst}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-[#7A5CFF]/20 px-3 py-1 text-xs font-medium text-[#7A5CFF]">
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm font-semibold text-white">{txn.amount}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="rounded p-1.5 transition-all hover:bg-[#2BD1FF]/20">
                          <CreditCard className="h-4 w-4 text-gray-400 hover:text-[#2BD1FF]" />
                        </button>
                        <button className="rounded p-1.5 transition-all hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-400">Showing 5 of 127 transactions</p>
            <div className="flex gap-3">
              <button className="neo-button rounded-lg border border-[rgba(43,209,255,0.2)] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#141925]">
                <Download className="mr-2 inline h-4 w-4" />
                Download CSV
              </button>
              <button className="neo-button rounded-lg bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(43,209,255,0.4)]">
                <FileText className="mr-2 inline h-4 w-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}