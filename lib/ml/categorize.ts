// Keyword-based categorization with confidence scoring

import { KEYWORD_CATEGORIES, DEFAULT_GST_RATES } from './keywords'
import type { CategoryResult } from '../rules/engine'

export function categorizeTransaction(description: string, merchant?: string): CategoryResult | null {
  const searchText = [description, merchant || ''].join(' ').toLowerCase()
  
  let bestMatch: { category: string; confidence: number } | null = null
  
  // Check each category
  for (const [category, config] of Object.entries(KEYWORD_CATEGORIES)) {
    const confidence = calculateCategoryConfidence(searchText, config)
    
    if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { category, confidence }
    }
  }
  
  if (bestMatch && bestMatch.confidence >= 0.3) { // Minimum confidence threshold
    const gstRate = DEFAULT_GST_RATES[bestMatch.category as keyof typeof DEFAULT_GST_RATES] || 0
    
    return {
      category: bestMatch.category,
      gst_rate: gstRate,
      confidence: bestMatch.confidence,
      matched_by: 'ml'
    }
  }
  
  // Fallback to 'Misc' category
  return {
    category: 'Misc',
    gst_rate: 0,
    confidence: 0.1,
    matched_by: 'ml'
  }
}

function calculateCategoryConfidence(
  searchText: string, 
  config: { keywords: string[]; patterns: RegExp[] }
): number {
  let score = 0
  let maxScore = 0
  
  // Check keywords
  for (const keyword of config.keywords) {
    maxScore += 1
    
    if (searchText.includes(keyword.toLowerCase())) {
      // Exact keyword match
      score += 1
      
      // Bonus for standalone word match
      const wordRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i')
      if (wordRegex.test(searchText)) {
        score += 0.5
      }
    }
  }
  
  // Check regex patterns
  for (const pattern of config.patterns) {
    maxScore += 1
    
    if (pattern.test(searchText)) {
      score += 1
    }
  }
  
  return maxScore > 0 ? Math.min(score / maxScore, 1.0) : 0
}

export function suggestCategory(description: string, merchant?: string): string[] {
  const searchText = [description, merchant || ''].join(' ').toLowerCase()
  
  const categoryScores = Object.entries(KEYWORD_CATEGORIES).map(([category, config]) => ({
    category,
    confidence: calculateCategoryConfidence(searchText, config)
  }))
  
  return categoryScores
    .filter(item => item.confidence > 0.1)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map(item => item.category)
}

export function explainCategorization(
  description: string, 
  merchant?: string
): { category: string; reasons: string[]; confidence: number } {
  const searchText = [description, merchant || ''].join(' ').toLowerCase()
  const result = categorizeTransaction(description, merchant)
  
  if (!result) {
    return {
      category: 'Misc',
      reasons: ['No matching patterns found'],
      confidence: 0.1
    }
  }
  
  const config = KEYWORD_CATEGORIES[result.category as keyof typeof KEYWORD_CATEGORIES]
  const reasons: string[] = []
  
  if (config) {
    // Find matching keywords
    const matchingKeywords = config.keywords.filter(keyword =>
      searchText.includes(keyword.toLowerCase())
    )
    
    if (matchingKeywords.length > 0) {
      reasons.push(`Keywords: ${matchingKeywords.slice(0, 3).join(', ')}`)
    }
    
    // Find matching patterns
    const matchingPatterns = config.patterns.filter(pattern =>
      pattern.test(searchText)
    )
    
    if (matchingPatterns.length > 0) {
      reasons.push(`Pattern matches: ${matchingPatterns.length}`)
    }
  }
  
  if (reasons.length === 0) {
    reasons.push('Default categorization')
  }
  
  return {
    category: result.category,
    reasons,
    confidence: result.confidence
  }
}
