// Demo data generator for FinSight.AI testing
import { supabase } from '../lib/supabase'
import type { Transaction, Rule } from '../lib/types'

export interface DemoDataOptions {
  transactionCount: number
  dateRange: {
    start: string
    end: string
  }
  includeIncome: boolean
  categories: string[]
}

export class DemoDataGenerator {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async generateDemoTransactions(options: Partial<DemoDataOptions> = {}): Promise<Transaction[]> {
    const defaultOptions: DemoDataOptions = {
      transactionCount: 50,
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
        end: new Date().toISOString().split('T')[0]
      },
      includeIncome: true,
      categories: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Health & Medical',
        'Travel',
        'Business',
        'Utilities',
        'Subscriptions',
        'Technology'
      ]
    }

    const config = { ...defaultOptions, ...options }
    const transactions: Transaction[] = []

    // Generate income transactions
    if (config.includeIncome) {
      const incomeCount = Math.floor(config.transactionCount * 0.2) // 20% income
      for (let i = 0; i < incomeCount; i++) {
        transactions.push(this.generateIncomeTransaction(config.dateRange))
      }
    }

    // Generate expense transactions
    const expenseCount = config.transactionCount - transactions.length
    for (let i = 0; i < expenseCount; i++) {
      transactions.push(this.generateExpenseTransaction(config.dateRange, config.categories))
    }

    // Shuffle transactions
    return this.shuffleArray(transactions)
  }

  private generateIncomeTransaction(dateRange: { start: string; end: string }): Transaction {
    const incomeSources = [
      'Salary Deposit',
      'Freelance Payment',
      'Consulting Fee',
      'Project Payment',
      'Commission',
      'Bonus',
      'Refund',
      'Investment Return'
    ]

    const merchants = [
      'ACME Corp',
      'Freelance Client',
      'Consulting Firm',
      'Project Client',
      'Investment Bank',
      'Company Inc',
      'Client ABC',
      'Business Partner'
    ]

    const source = this.randomChoice(incomeSources)
    const merchant = this.randomChoice(merchants)
    const amount = this.randomAmount(1000, 50000, true) // Income: 1k to 50k
    const date = this.randomDate(dateRange.start, dateRange.end)

    return {
      id: crypto.randomUUID(),
      user_id: this.userId,
      tx_date: date,
      description: source,
      merchant,
      amount,
      gst_rate: 0, // Income typically has no GST
      gst_amount: 0,
      gstin: null,
      category: 'Income',
      final_category: 'Income',
      ml_confidence: 0.95,
      ml_predicted_category: 'Income',
      source_upload_id: 'demo-data',
      rule_applied_id: null,
      is_income: true,
      notes: 'Generated demo data',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  private generateExpenseTransaction(
    dateRange: { start: string; end: string },
    categories: string[]
  ): Transaction {
    const category = this.randomChoice(categories)
    const { description, merchant, amount, gstRate } = this.generateExpenseForCategory(category)
    const date = this.randomDate(dateRange.start, dateRange.end)
    const gstAmount = (amount * gstRate) / 100

    return {
      id: crypto.randomUUID(),
      user_id: this.userId,
      tx_date: date,
      description,
      merchant,
      amount: -Math.abs(amount), // Expenses are negative
      gst_rate: gstRate,
      gst_amount: gstAmount,
      gstin: null,
      category,
      final_category: category,
      ml_confidence: this.randomConfidence(),
      ml_predicted_category: category,
      source_upload_id: 'demo-data',
      rule_applied_id: null,
      is_income: false,
      notes: 'Generated demo data',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  private generateExpenseForCategory(category: string): {
    description: string
    merchant: string
    amount: number
    gstRate: number
  } {
    const categoryData = {
      'Food & Dining': {
        descriptions: ['Restaurant Bill', 'Coffee Shop', 'Lunch Meeting', 'Dinner Out', 'Food Delivery'],
        merchants: ['Starbucks', 'McDonald\'s', 'Pizza Hut', 'Swiggy', 'Zomato', 'Local Restaurant'],
        amountRange: [50, 2000],
        gstRate: 5
      },
      'Transportation': {
        descriptions: ['Uber Ride', 'Ola Cab', 'Metro Card', 'Fuel', 'Parking', 'Taxi'],
        merchants: ['Uber', 'Ola', 'Metro', 'Petrol Pump', 'Parking Lot'],
        amountRange: [20, 500],
        gstRate: 5
      },
      'Shopping': {
        descriptions: ['Online Purchase', 'Clothing', 'Electronics', 'Books', 'Grocery'],
        merchants: ['Amazon', 'Flipkart', 'Myntra', 'Big Bazaar', 'DMart'],
        amountRange: [100, 10000],
        gstRate: 18
      },
      'Entertainment': {
        descriptions: ['Movie Ticket', 'Netflix', 'Spotify', 'Gaming', 'Theater'],
        merchants: ['Netflix', 'Spotify', 'PVR', 'BookMyShow', 'Steam'],
        amountRange: [50, 2000],
        gstRate: 18
      },
      'Health & Medical': {
        descriptions: ['Doctor Visit', 'Medicine', 'Health Checkup', 'Pharmacy'],
        merchants: ['Apollo', 'Fortis', 'Local Pharmacy', 'Health Center'],
        amountRange: [200, 5000],
        gstRate: 0
      },
      'Travel': {
        descriptions: ['Flight Ticket', 'Hotel Booking', 'Train Ticket', 'Travel Package'],
        merchants: ['MakeMyTrip', 'IRCTC', 'Air India', 'Indigo', 'OYO'],
        amountRange: [1000, 50000],
        gstRate: 5
      },
      'Business': {
        descriptions: ['Office Supplies', 'Software License', 'Marketing', 'Consulting'],
        merchants: ['Microsoft', 'Adobe', 'Google', 'Office Depot', 'Consulting Firm'],
        amountRange: [500, 20000],
        gstRate: 18
      },
      'Utilities': {
        descriptions: ['Electricity Bill', 'Internet Bill', 'Phone Bill', 'Water Bill'],
        merchants: ['BSES', 'Airtel', 'Jio', 'Water Board', 'Electric Company'],
        amountRange: [200, 3000],
        gstRate: 18
      },
      'Subscriptions': {
        descriptions: ['Software Subscription', 'Cloud Service', 'Newsletter', 'Membership'],
        merchants: ['Adobe', 'Microsoft', 'AWS', 'Google Cloud', 'Newsletter'],
        amountRange: [100, 5000],
        gstRate: 18
      },
      'Technology': {
        descriptions: ['Software Purchase', 'Hardware', 'Cloud Service', 'API Usage'],
        merchants: ['Microsoft', 'Apple', 'AWS', 'Google', 'Tech Store'],
        amountRange: [500, 15000],
        gstRate: 18
      }
    }

    const data = categoryData[category as keyof typeof categoryData] || categoryData['Shopping']
    const description = this.randomChoice(data.descriptions)
    const merchant = this.randomChoice(data.merchants)
    const amount = this.randomAmount(data.amountRange[0], data.amountRange[1], false)

    return {
      description,
      merchant,
      amount,
      gstRate: data.gstRate
    }
  }

  async generateDemoRules(): Promise<Rule[]> {
    const rules: Rule[] = [
      {
        id: crypto.randomUUID(),
        user_id: this.userId,
        name: 'Software Subscriptions',
        description: 'Automatically categorize software and SaaS subscriptions',
        enabled: true,
        priority: 1,
        conditions: {
          type: 'contains',
          keywords: ['subscription', 'saas', 'software', 'license', 'monthly', 'annual']
        },
        actions: {
          category: 'Technology',
          gst_rate: 18
        },
        match_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: this.userId,
        name: 'Food & Dining',
        description: 'Categorize food and dining expenses',
        enabled: true,
        priority: 2,
        conditions: {
          type: 'contains',
          keywords: ['restaurant', 'cafe', 'food', 'dining', 'meal', 'coffee', 'lunch', 'dinner']
        },
        actions: {
          category: 'Food & Dining',
          gst_rate: 5
        },
        match_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: this.userId,
        name: 'Transportation',
        description: 'Categorize transportation expenses',
        enabled: true,
        priority: 3,
        conditions: {
          type: 'contains',
          keywords: ['uber', 'ola', 'taxi', 'cab', 'metro', 'fuel', 'petrol', 'diesel']
        },
        actions: {
          category: 'Transportation',
          gst_rate: 5
        },
        match_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    return rules
  }

  async insertDemoData(transactions: Transaction[], rules: Rule[]): Promise<void> {
    try {
      // Insert transactions
      if (transactions.length > 0) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(transactions)

        if (transactionError) {
          throw new Error(`Failed to insert transactions: ${transactionError.message}`)
        }
      }

      // Insert rules
      if (rules.length > 0) {
        const { error: ruleError } = await supabase
          .from('rules')
          .insert(rules)

        if (ruleError) {
          throw new Error(`Failed to insert rules: ${ruleError.message}`)
        }
      }

      console.log(`Successfully inserted ${transactions.length} transactions and ${rules.length} rules`)
    } catch (error) {
      console.error('Failed to insert demo data:', error)
      throw error
    }
  }

  async clearDemoData(): Promise<void> {
    try {
      // Delete demo transactions
      const { error: transactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', this.userId)
        .eq('source_upload_id', 'demo-data')

      if (transactionError) {
        throw new Error(`Failed to delete demo transactions: ${transactionError.message}`)
      }

      // Delete demo rules
      const { error: ruleError } = await supabase
        .from('rules')
        .delete()
        .eq('user_id', this.userId)

      if (ruleError) {
        throw new Error(`Failed to delete demo rules: ${ruleError.message}`)
      }

      console.log('Successfully cleared demo data')
    } catch (error) {
      console.error('Failed to clear demo data:', error)
      throw error
    }
  }

  // Utility methods
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  private randomAmount(min: number, max: number, isIncome: boolean): number {
    const amount = Math.floor(Math.random() * (max - min + 1)) + min
    return isIncome ? amount : -amount
  }

  private randomDate(start: string, end: string): string {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    return new Date(randomTime).toISOString().split('T')[0]
  }

  private randomConfidence(): number {
    return Math.round((Math.random() * 0.4 + 0.6) * 100) / 100 // 0.6 to 1.0
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

}

// Convenience function to generate and insert demo data
export const generateAndInsertDemoData = async (
  userId: string,
  options?: Partial<DemoDataOptions>
): Promise<{ transactions: Transaction[]; rules: Rule[] }> => {
  const generator = new DemoDataGenerator(userId)
  
  const [transactions, rules] = await Promise.all([
    generator.generateDemoTransactions(options),
    generator.generateDemoRules()
  ])
  
  await generator.insertDemoData(transactions, rules)
  
  return { transactions, rules }
}
