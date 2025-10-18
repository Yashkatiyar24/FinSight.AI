import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from '../context/SupabaseAuthContext'
import { ApiService } from '../services/api'
import type { Rule } from '../lib/types'

export default function Rules() {
  const { user } = useAuth()
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewRule, setShowNewRule] = useState(false)

  useEffect(() => {
    const fetchRules = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const apiService = new ApiService(user.id)
        const data = await apiService.getRules()
        setRules(data)
      } catch (error) {
        console.error('Error fetching rules:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRules()
  }, [user])

  const toggleRule = async (id: string) => {
    if (!user) return

    try {
      const rule = rules.find(r => r.id === id)
      if (!rule) return

      const apiService = new ApiService(user.id)
      await apiService.updateRule(id, { enabled: !rule.enabled })
      
      setRules(rules.map(rule => 
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      ))
    } catch (error) {
      console.error('Error toggling rule:', error)
    }
  }

  const deleteRule = async (id: string) => {
    if (!user) return

    try {
      const apiService = new ApiService(user.id)
      await apiService.deleteRule(id)
      setRules(rules.filter(rule => rule.id !== id))
    } catch (error) {
      console.error('Error deleting rule:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading rules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Rules Engine</h1>
            <p className="text-gray-400">
              Automatically categorize transactions with custom rules
            </p>
          </div>
          <button
            onClick={() => setShowNewRule(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Rule
          </button>
        </div>

        {/* Rules Grid */}
        {rules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Rules Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first rule to automatically categorize transactions
            </p>
            <button
              onClick={() => setShowNewRule(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create First Rule
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-6 h-6 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Conditions</p>
                    <p className="text-sm text-white bg-slate-800 px-3 py-2 rounded-lg">
                      {rule.conditions || 'No conditions defined'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Actions</p>
                    <p className="text-sm text-white bg-slate-800 px-3 py-2 rounded-lg">
                      {rule.actions || 'No actions defined'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-400">
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {rule.match_count || 0} matches
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Rule Modal */}
        {showNewRule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-6">Create New Rule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rule Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Software Subscriptions"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Conditions</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="e.g., Contains 'subscription' OR 'SaaS'"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Actions</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="e.g., Category: Technology, Tax: 18% GST"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowNewRule(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowNewRule(false)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}