import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { useState } from "react"

interface Rule {
  id: string
  name: string
  enabled: boolean
  conditions: string
  actions: string
  matched: number
}

const sampleRules: Rule[] = [
  {
    id: "1",
    name: "Software Subscriptions",
    enabled: true,
    conditions: "Contains 'subscription' OR 'SaaS' OR 'software'",
    actions: "Category: Technology, Tax: 10% GST",
    matched: 24
  },
  {
    id: "2", 
    name: "Business Meals",
    enabled: true,
    conditions: "Contains 'restaurant' OR 'cafe' OR 'meal'",
    actions: "Category: Meals & Entertainment, Tax: 10% GST",
    matched: 18
  },
  {
    id: "3",
    name: "Travel Expenses",
    enabled: false,
    conditions: "Contains 'flight' OR 'hotel' OR 'travel'",
    actions: "Category: Travel, Tax: 0% GST",
    matched: 12
  }
]

export default function Rules() {
  const [rules, setRules] = useState<Rule[]>(sampleRules)
  const [showNewRule, setShowNewRule] = useState(false)

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="mx-auto max-w-[1600px] p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Categorization Rules</h1>
            <p className="mt-1 text-gray-400">Create and manage AI categorization rules for your transactions</p>
          </div>
          <button 
            onClick={() => setShowNewRule(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="neo-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Rules</p>
                <p className="text-2xl font-bold text-white">
                  {rules.filter(r => r.enabled).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] rounded-lg flex items-center justify-center">
                <ToggleRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="neo-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Matches</p>
                <p className="text-2xl font-bold text-white">
                  {rules.reduce((sum, rule) => sum + rule.matched, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-lg flex items-center justify-center">
                <Edit2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="neo-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Accuracy Rate</p>
                <p className="text-2xl font-bold text-white">94.2%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="neo-card">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Categorization Rules</h2>
          </div>
          
          <div className="divide-y divide-slate-700">
            {rules.map((rule) => (
              <div key={rule.id} className="p-6 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-medium text-white">{rule.name}</h3>
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className="flex items-center"
                      >
                        {rule.enabled ? (
                          <ToggleRight className="w-6 h-6 text-[#2BD1FF]" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-500" />
                        )}
                      </button>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.enabled 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-[#7A5CFF]/20 text-[#7A5CFF] rounded-full text-xs font-medium">
                        {rule.matched} matches
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Conditions:</p>
                        <p className="text-gray-300 bg-slate-800 p-2 rounded font-mono text-xs">
                          {rule.conditions}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Actions:</p>
                        <p className="text-gray-300 bg-slate-800 p-2 rounded font-mono text-xs">
                          {rule.actions}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button className="p-2 text-[#2BD1FF] hover:text-[#2BD1FF]/80 hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Rule Modal (placeholder) */}
        {showNewRule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="neo-card max-w-2xl w-full p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Rule</h2>
              <p className="text-gray-400 mb-4">
                Feature coming soon! Rules will allow you to automatically categorize transactions based on custom conditions.
              </p>
              <button 
                onClick={() => setShowNewRule(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
