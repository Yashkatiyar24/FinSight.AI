// Rules engine for transaction categorization

export interface RuleMatch {
  rule: any
  confidence: number
}

export interface CategoryResult {
  category: string
  gst_rate: number
  confidence: number
  matched_by: 'rule' | 'ml'
  rule_id?: string
}

export function applyRules(transaction: any, rules: any[]): CategoryResult | null {
  // Only apply enabled rules, sorted by priority
  const activeRules = rules
    .filter(rule => rule.enabled)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
  
  for (const rule of activeRules) {
    if (testRule(transaction, rule)) {
      // Extract category and GST rate from rule actions
      const actions = rule.actions || {}
      
      return {
        category: actions.category || 'Misc',
        gst_rate: actions.gst_rate || 0,
        confidence: 1.0, // Rules have 100% confidence
        matched_by: 'rule',
        rule_id: rule.id
      }
    }
  }
  
  return null
}

export function testRule(transaction: any, rule: any): boolean {
  if (!rule.conditions) return false
  
  const conditions = rule.conditions
  
  // Handle both old string format and new JSON format
  if (typeof conditions === 'string') {
    return testLegacyConditions(transaction, conditions)
  }
  
  // New JSON format
  if (conditions.type === 'contains') {
    return testContains(transaction, conditions.keywords?.join('|') || '')
  }
  
  if (conditions.type === 'regex') {
    return testRegex(transaction, conditions.pattern || '')
  }
  
  if (conditions.type === 'and') {
    return conditions.conditions?.every((cond: any) => testRule(transaction, { conditions: cond })) || false
  }
  
  if (conditions.type === 'or') {
    return conditions.conditions?.some((cond: any) => testRule(transaction, { conditions: cond })) || false
  }
  
  return false
}

function testLegacyConditions(transaction: any, conditions: string): boolean {
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

function testContains(transaction: any, keywords: string): boolean {
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

function testRegex(transaction: any, pattern: string): boolean {
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

export function testRuleAgainstSample(rule: any, sampleText: string): { match: boolean; category?: string; gst_rate?: number } {
  const mockTransaction = {
    description: sampleText,
    merchant: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  }
  
  const matches = testRule(mockTransaction, rule)
  const actions = rule.actions || {}
  
  return {
    match: matches,
    category: matches ? actions.category : undefined,
    gst_rate: matches ? actions.gst_rate : undefined
  }
}
