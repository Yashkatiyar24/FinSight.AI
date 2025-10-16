"use client"

import Navigation from "@/components/Navigation"
import { Plus, Edit2, Trash2, Zap } from "lucide-react"
import { useState } from "react"

const existingRules = [
  { id: 1, condition: "Description contains 'Subscription'", actions: "Category: Technology, GST: 10%", enabled: true },
  { id: 2, condition: "Amount > $500", actions: "Category: Business Expenses, Flag for review", enabled: true },
  { id: 3, condition: "Description contains 'Uber' OR 'Taxi'", actions: "Category: Transportation, GST: 10%", enabled: false },
  { id: 4, condition: "Description contains 'Restaurant' OR 'Cafe'", actions: "Category: Meals & Entertainment, GST: 5%", enabled: true },
]

export default function RulesPage() {
  const [showNewRule, setShowNewRule] = useState(false)

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Navigation />
      
      <div className="mx-auto max-w-[1400px] p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Automation Rules</h1>
            <p className="mt-1 text-gray-400">Create smart rules to auto-categorize transactions</p>
          </div>
          <button
            onClick={() => setShowNewRule(!showNewRule)}
            className="neo-button flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(43,209,255,0.4)]"
          >
            <Plus className="h-4 w-4" />
            New Rule
          </button>
        </div>
        
        {/* New Rule Panel */}
        {showNewRule && (
          <div className="neo-card mb-8 p-6">
            <div className="mb-6 flex items-center gap-3">
              <Zap className="h-6 w-6 text-[#FFD700]" />
              <h2 className="text-xl font-semibold text-white">Create New Rule</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">When</label>
                <div className="flex gap-4">
                  <select className="flex-1 rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white">
                    <option>Description</option>
                    <option>Amount</option>
                    <option>Date</option>
                  </select>
                  <select className="flex-1 rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white">
                    <option>contains</option>
                    <option>equals</option>
                    <option>greater than</option>
                    <option>less than</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter value..."
                    className="flex-1 rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">Then</label>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <select className="flex-1 rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white">
                      <option>Set Category</option>
                      <option>Set GST Rate</option>
                      <option>Add Tag</option>
                      <option>Flag for review</option>
                    </select>
                    <select className="flex-1 rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white">
                      <option>Technology</option>
                      <option>Business Expenses</option>
                      <option>Transportation</option>
                      <option>Meals & Entertainment</option>
                    </select>
                  </div>
                  
                  <button className="text-sm text-[#2BD1FF] hover:underline">+ Add another action</button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewRule(false)}
                  className="rounded-lg border border-[rgba(43,209,255,0.2)] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#141925]"
                >
                  Cancel
                </button>
                <button className="neo-button rounded-lg bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(43,209,255,0.4)]">
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Existing Rules */}
        <div className="neo-card p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">Active Rules</h2>
          <div className="space-y-4">
            {existingRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-lg border border-[rgba(43,209,255,0.1)] bg-[#141925]/50 p-4 transition-all hover:border-[rgba(43,209,255,0.3)]"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        className="peer sr-only"
                        readOnly
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2BD1FF] peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      If <span className="text-[#2BD1FF]">{rule.condition}</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Then: <span className="text-[#7A5CFF]">{rule.actions}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded p-2 transition-all hover:bg-[#2BD1FF]/20">
                    <Edit2 className="h-4 w-4 text-gray-400 hover:text-[#2BD1FF]" />
                  </button>
                  <button className="rounded p-2 transition-all hover:bg-red-500/20">
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}