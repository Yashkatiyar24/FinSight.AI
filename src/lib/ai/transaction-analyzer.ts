/**
 * AI-powered transaction analysis and categorization
 */

// OpenAI integration for smart categorization
interface OpenAIResponse {
  category: string
  confidence: number
  subcategory?: string
  merchant_type?: string
  is_recurring?: boolean
}

// Enhanced transaction categories with AI confidence scoring
export const TRANSACTION_CATEGORIES = {
  'Food & Dining': {
    subcategories: ['Restaurants', 'Fast Food', 'Coffee Shops', 'Groceries', 'Delivery'],
    keywords: ['restaurant', 'food', 'coffee', 'pizza', 'uber eats', 'doordash', 'grocery', 'market']
  },
  'Shopping': {
    subcategories: ['Online', 'Retail', 'Clothing', 'Electronics', 'Home & Garden'],
    keywords: ['amazon', 'walmart', 'target', 'store', 'shop', 'retail', 'purchase']
  },
  'Transportation': {
    subcategories: ['Gas', 'Public Transit', 'Parking', 'Rideshare', 'Car Maintenance'],
    keywords: ['gas', 'fuel', 'uber', 'lyft', 'parking', 'metro', 'transit', 'car', 'auto']
  },
  'Entertainment': {
    subcategories: ['Movies', 'Streaming', 'Games', 'Sports', 'Music'],
    keywords: ['netflix', 'spotify', 'movie', 'game', 'entertainment', 'subscription']
  },
  'Bills & Utilities': {
    subcategories: ['Internet', 'Phone', 'Electric', 'Water', 'Insurance'],
    keywords: ['bill', 'utility', 'electric', 'water', 'internet', 'phone', 'insurance']
  },
  'Healthcare': {
    subcategories: ['Doctor', 'Pharmacy', 'Dental', 'Hospital', 'Insurance'],
    keywords: ['doctor', 'medical', 'pharmacy', 'hospital', 'health', 'dental']
  },
  'Income': {
    subcategories: ['Salary', 'Freelance', 'Investment', 'Refund', 'Other'],
    keywords: ['salary', 'payroll', 'deposit', 'income', 'refund', 'dividend']
  },
  'Transfer': {
    subcategories: ['Bank Transfer', 'Credit Card Payment', 'Investment', 'Savings'],
    keywords: ['transfer', 'payment', 'deposit', 'withdrawal']
  }
} as const

export type TransactionCategory = keyof typeof TRANSACTION_CATEGORIES

// ML-powered transaction categorization
export class TransactionAnalyzer {
  private static instance: TransactionAnalyzer
  private openaiApiKey: string | null = null

  private constructor() {
    // Try to get OpenAI API key from environment or localStorage
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || 
                       localStorage.getItem('finsight_openai_key') ||
                       null
  }

  static getInstance(): TransactionAnalyzer {
    if (!TransactionAnalyzer.instance) {
      TransactionAnalyzer.instance = new TransactionAnalyzer()
    }
    return TransactionAnalyzer.instance
  }

  setApiKey(apiKey: string) {
    this.openaiApiKey = apiKey
    localStorage.setItem('finsight_openai_key', apiKey)
  }

  // Rule-based categorization (fallback when AI is not available)
  categorizeWithRules(description: string, merchant: string, amount: number): {
    category: TransactionCategory
    confidence: number
    subcategory?: string
  } {
    const text = `${description || ''} ${merchant || ''}`.toLowerCase()
    
    let bestMatch: TransactionCategory = 'Shopping'
    let bestScore = 0
    let matchedSubcategory: string | undefined

    // Check for income patterns
    if (amount > 0 && (
      text.includes('deposit') || 
      text.includes('payroll') || 
      text.includes('salary') ||
      text.includes('income') ||
      amount > 1000
    )) {
      return { category: 'Income', confidence: 0.8, subcategory: 'Salary' }
    }

    // Check each category
    for (const [category, config] of Object.entries(TRANSACTION_CATEGORIES)) {
      let score = 0
      let subcategory: string | undefined

      // Check keywords
      for (const keyword of config.keywords) {
        if (text.includes(keyword)) {
          score += 0.2
        }
      }

      // Check subcategories
      for (const sub of config.subcategories) {
        if (text.includes(sub.toLowerCase())) {
          score += 0.3
          subcategory = sub
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = category as TransactionCategory
        matchedSubcategory = subcategory
      }
    }

    return {
      category: bestMatch,
      confidence: Math.min(bestScore, 0.9),
      subcategory: matchedSubcategory
    }
  }

  // AI-powered categorization using OpenAI
  async categorizeWithAI(description: string, merchant: string, amount: number): Promise<{
    category: TransactionCategory
    confidence: number
    subcategory?: string
    is_recurring?: boolean
  }> {
    // Always fallback to rule-based for now to prevent errors
    const result = this.categorizeWithRules(description, merchant, amount)
    return { ...result, is_recurring: false }

    /* Commented out OpenAI integration for stability
    if (!this.openaiApiKey) {
      // Fallback to rule-based categorization
      const result = this.categorizeWithRules(description, merchant, amount)
      return { ...result, is_recurring: false }
    }

    try {
      const prompt = `
Analyze this financial transaction and categorize it:

Description: ${description}
Merchant: ${merchant}
Amount: $${Math.abs(amount)}
Type: ${amount >= 0 ? 'Income' : 'Expense'}

Available categories: ${Object.keys(TRANSACTION_CATEGORIES).join(', ')}

Return a JSON response with:
- category: one of the available categories
- confidence: 0-1 confidence score
- subcategory: specific subcategory if applicable
- is_recurring: boolean indicating if this appears to be a recurring transaction

Consider context clues like merchant names, transaction descriptions, and amount patterns.
`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a financial transaction categorization expert. Respond only with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 150
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = JSON.parse(data.choices[0].message.content) as OpenAIResponse

      return {
        category: aiResponse.category as TransactionCategory,
        confidence: aiResponse.confidence,
        subcategory: aiResponse.subcategory,
        is_recurring: aiResponse.is_recurring || false
      }

    } catch (error) {
      console.error('AI categorization failed, falling back to rules:', error)
      const result = this.categorizeWithRules(description, merchant, amount)
      return { ...result, is_recurring: false }
    }
    */
  }

  // Batch process multiple transactions
  async categorizeTransactions(transactions: Array<{
    description: string
    merchant: string
    amount: number
  }>): Promise<Array<{
    category: TransactionCategory
    confidence: number
    subcategory?: string
    is_recurring?: boolean
  }>> {
    const results = []

    for (const transaction of transactions) {
      try {
        const result = await this.categorizeWithAI(
          transaction.description,
          transaction.merchant,
          transaction.amount
        )
        results.push(result)
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Error categorizing transaction:', error)
        // Fallback to rule-based
        const fallback = this.categorizeWithRules(
          transaction.description,
          transaction.merchant,
          transaction.amount
        )
        results.push({ ...fallback, is_recurring: false })
      }
    }

    return results
  }

  // Detect spending patterns and insights
  analyzeSpendingPatterns(transactions: Array<{
    amount: number
    category: string
    date: string
  }>): {
    topCategories: Array<{ category: string; total: number; percentage: number }>
    monthlyTrend: Array<{ month: string; total: number }>
    insights: string[]
  } {
    // Group by category
    const categoryTotals = transactions.reduce((acc, tx) => {
      if (tx.amount < 0) { // Only expenses
        acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount)
      }
      return acc
    }, {} as Record<string, number>)

    const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)

    const topCategories = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
        percentage: (total / totalSpending) * 100
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Monthly trend (simplified)
    const monthlyTotals = transactions.reduce((acc, tx) => {
      if (tx.amount < 0) {
        const month = tx.date.substring(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + Math.abs(tx.amount)
      }
      return acc
    }, {} as Record<string, number>)

    const monthlyTrend = Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Generate insights
    const insights = []
    if (topCategories.length > 0) {
      insights.push(`Your top spending category is ${topCategories[0].category} (${topCategories[0].percentage.toFixed(1)}%)`)
    }
    if (topCategories[0]?.percentage > 40) {
      insights.push(`Consider reviewing your ${topCategories[0].category} expenses - they make up a large portion of your spending`)
    }

    return { topCategories, monthlyTrend, insights }
  }
}

export default TransactionAnalyzer.getInstance()
