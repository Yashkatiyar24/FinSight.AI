// Rules engine for transaction categorization

import type { Rule, Transaction } from '../supabase'

export interface RuleMatch {
  rule: Rule
  confidence: number
}

export interface CategoryResult {
  category: string
  gst_rate: number
  confidence: number
  matched_by: 'rule' | 'ml'
  rule_id?: number
}

export function applyRules(transaction: Transaction | any, rules: Rule[]): CategoryResult | null {
  // Only apply active rules
  const activeRules = rules.filter(rule => rule.active)
  
  for (const rule of activeRules) {
    if (testRule(transaction, rule)) {
      return {
        category: rule.target_category,
        gst_rate: rule.gst_rate,
        confidence: 1.0, // Rules have 100% confidence
        matched_by: 'rule',
        rule_id: rule.id
      }
    }
  }
  
  return null
}

export function testRule(transaction: Transaction | any, rule: Rule): boolean {
  const conditions = rule.conditions.trim()
  if (!conditions) return false
  
  // Parse condition format: "contains: keyword1|keyword2" or "regex: pattern"
  const lines = conditions.split('\n').map(line => line.trim()).filter(Boolean)
  
  for (const line of lines) {
    if (line.startsWith('contains:')) {
      const keywords = line.substring(9).trim()
      if (testContains(transaction, keywords)) {
        return true
      }
    } else if (line.startsWith('regex:')) {
      const pattern = line.substring(6).trim()
      if (testRegex(transaction, pattern)) {
        return true
      }
    }
    // For backward compatibility, treat plain text as contains
    else if (testContains(transaction, line)) {
      return true
    }
  }
  
  return false
}

function testContains(transaction: Transaction | any, keywords: string): boolean {
  const searchText = [
    transaction.description || '',
    transaction.merchant || ''
  ].join(' ').toLowerCase()
  
  // Handle pipe-separated keywords (OR logic)
  const keywordList = keywords.split('|').map(k => k.trim().toLowerCase())
  
  return keywordList.some(keyword => {
    if (!keyword) return false
    
    // Support simple wildcards
    if (keyword.includes('*')) {
      const regexPattern = keyword.replace(/\*/g, '.*')
      const regex = new RegExp(regexPattern, 'i')
      return regex.test(searchText)
    }
    
    return searchText.includes(keyword)
  })
}

function testRegex(transaction: Transaction | any, pattern: string): boolean {
  try {
    const regex = new RegExp(pattern, 'i')
    const searchText = [
      transaction.description || '',
      transaction.merchant || ''
    ].join(' ')
    
    return regex.test(searchText)
  } catch (error) {
    console.error('Invalid regex pattern:', pattern, error)
    return false
  }
}

export function validateRuleConditions(conditions: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!conditions.trim()) {
    errors.push('Conditions cannot be empty')
    return { valid: false, errors }
  }
  
  const lines = conditions.split('\n').map(line => line.trim()).filter(Boolean)
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    
    if (line.startsWith('regex:')) {
      const pattern = line.substring(6).trim()
      try {
        new RegExp(pattern, 'i')
      } catch (error) {
        errors.push(`Line ${lineNum}: Invalid regex pattern - ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else if (line.startsWith('contains:')) {
      const keywords = line.substring(9).trim()
      if (!keywords) {
        errors.push(`Line ${lineNum}: 'contains:' requires keywords`)
      }
    } else if (!line.includes(':')) {
      // Plain text is OK (treated as contains)
      if (!line) {
        errors.push(`Line ${lineNum}: Empty condition`)
      }
    } else {
      errors.push(`Line ${lineNum}: Unknown condition type. Use 'contains:' or 'regex:'`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

export function testRuleAgainstSample(rule: Rule, sampleText: string): { match: boolean; category?: string; gst_rate?: number } {
  const mockTransaction = {
    description: sampleText,
    merchant: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  }
  
  const matches = testRule(mockTransaction, rule)
  
  return {
    match: matches,
    category: matches ? rule.target_category : undefined,
    gst_rate: matches ? rule.gst_rate : undefined
  }
}
