// Rules management service
import { supabase } from '../lib/supabase'
import { applyRules, testRuleAgainstSample } from '../../lib/rules/engine'
import type { Rule } from '../lib/types'
import { TRANSACTION_CATEGORIES } from '../../lib/ml/keywords'

export interface CreateRuleData {
  name: string
  description?: string
  conditions: any
  actions: any
  priority?: number
  enabled?: boolean
}

export interface RuleTestResult {
  match: boolean
  category?: string
  gst_rate?: number
  sample_matches: Array<{
    text: string
    matches: boolean
  }>
}

export class RulesService {
  static async getRules(userId: string): Promise<Rule[]> {
    try {
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch rules: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Rules fetch failed:', error)
      throw error
    }
  }

  static async createRule(userId: string, ruleData: CreateRuleData): Promise<Rule> {
    try {
      const { data, error } = await supabase
        .from('rules')
        .insert({
          user_id: userId,
          name: ruleData.name,
          description: ruleData.description,
          conditions: ruleData.conditions,
          actions: ruleData.actions,
          priority: ruleData.priority || 0,
          enabled: ruleData.enabled !== false
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create rule: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Rule creation failed:', error)
      throw error
    }
  }

  static async updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule> {
    try {
      const { data, error } = await supabase
        .from('rules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update rule: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Rule update failed:', error)
      throw error
    }
  }

  static async deleteRule(ruleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId)

      if (error) {
        throw new Error(`Failed to delete rule: ${error.message}`)
      }
    } catch (error) {
      console.error('Rule deletion failed:', error)
      throw error
    }
  }

  static async testRule(rule: Rule, sampleTexts: string[]): Promise<RuleTestResult> {
    try {
      const sample_matches = sampleTexts.map(text => {
        const result = testRuleAgainstSample(rule, text)
        return {
          text,
          matches: result.match
        }
      })

      const hasMatches = sample_matches.some(m => m.matches)
      const actions = rule.actions || {}

      return {
        match: hasMatches,
        category: hasMatches ? actions.category : undefined,
        gst_rate: hasMatches ? actions.gst_rate : undefined,
        sample_matches
      }
    } catch (error) {
      console.error('Rule test failed:', error)
      return {
        match: false,
        sample_matches: sampleTexts.map(text => ({ text, matches: false }))
      }
    }
  }

  static async applyRulesToTransactions(userId: string, ruleIds?: string[]): Promise<{
    updated: number
    errors: string[]
  }> {
    try {
      // Get rules to apply
      let rulesQuery = supabase
        .from('rules')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true)

      if (ruleIds && ruleIds.length > 0) {
        rulesQuery = rulesQuery.in('id', ruleIds)
      }

      const { data: rules, error: rulesError } = await rulesQuery

      if (rulesError) {
        throw new Error(`Failed to fetch rules: ${rulesError.message}`)
      }

      if (!rules || rules.length === 0) {
        return { updated: 0, errors: ['No rules found to apply'] }
      }

      // Get transactions to process (uncategorized or all)
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('id, description, merchant, final_category')
        .eq('user_id', userId)

      if (txError) {
        throw new Error(`Failed to fetch transactions: ${txError.message}`)
      }

      if (!transactions || transactions.length === 0) {
        return { updated: 0, errors: ['No transactions found'] }
      }

      // Apply rules to transactions
      const updates: Array<{ id: string; final_category: string; gst_rate: number; rule_applied_id: string }> = []
      const errors: string[] = []

      for (const transaction of transactions) {
        try {
          const result = applyRules(transaction, rules)
          
          if (result && result.category !== transaction.final_category) {
            updates.push({
              id: transaction.id,
              final_category: result.category,
              gst_rate: result.gst_rate,
              rule_applied_id: result.rule_id || ''
            })
          }
        } catch (error) {
          errors.push(`Transaction ${transaction.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Apply updates in batches
      let updatedCount = 0
      const batchSize = 100

      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        
        for (const update of batch) {
          const { error } = await supabase
            .from('transactions')
            .update({
              final_category: update.final_category,
              gst_rate: update.gst_rate,
              rule_applied_id: update.rule_applied_id
            })
            .eq('id', update.id)

          if (error) {
            errors.push(`Failed to update transaction ${update.id}: ${error.message}`)
          } else {
            updatedCount++
          }
        }
      }

      // Update rule match counts
      for (const rule of rules) {
        const matchCount = updates.filter(u => u.rule_applied_id === rule.id).length
        if (matchCount > 0) {
          await supabase
            .from('rules')
            .update({ match_count: (rule.match_count || 0) + matchCount })
            .eq('id', rule.id)
        }
      }

      return { updated: updatedCount, errors }
    } catch (error) {
      console.error('Rule application failed:', error)
      return { 
        updated: 0, 
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      }
    }
  }

  static createContainsRule(
    name: string,
    keywords: string[],
    category: string,
    gstRate: number = 0,
    description?: string
  ): CreateRuleData {
    return {
      name,
      description,
      conditions: {
        type: 'contains',
        keywords
      },
      actions: {
        category,
        gst_rate: gstRate
      }
    }
  }

  static createRegexRule(
    name: string,
    pattern: string,
    category: string,
    gstRate: number = 0,
    description?: string
  ): CreateRuleData {
    return {
      name,
      description,
      conditions: {
        type: 'regex',
        pattern
      },
      actions: {
        category,
        gst_rate: gstRate
      }
    }
  }

  static getAvailableCategories(): string[] {
    return [...TRANSACTION_CATEGORIES]
  }

  static getDefaultGSTRate(category: string): number {
    const gstRates: Record<string, number> = {
      'Technology': 18,
      'Subscriptions': 18,
      'Meals & Entertainment': 5,
      'Travel': 5,
      'Shopping': 18,
      'Groceries': 0,
      'Utilities': 18,
      'Salary': 0,
      'Fees': 18,
      'Health & Medical': 12,
      'Education': 0,
      'Misc': 0
    }

    return gstRates[category] || 0
  }
}