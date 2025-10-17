// Utility functions for hashing, numbers, and dates

import { createHash } from 'crypto'
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns'

// Generate dedupe hash for transactions
export function generateDedupeHash(userId: string, date: string, description: string, amount: number): string {
  const content = `${userId}|${date}|${description}|${amount}`
  return createHash('sha1').update(content).digest('hex')
}

// Format currency for Indian locale
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Format large numbers with K, M suffixes
export function formatNumber(num: number): string {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toLocaleString()
  }
}

// Parse amount from string with error handling
export function parseAmount(value: string | number): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value
  }
  
  if (!value || typeof value !== 'string') {
    return 0
  }
  
  // Remove currency symbols and commas
  const cleaned = value.trim().replace(/[₹$€£,\s]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

// Validate and format date
export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  } catch {
    return 'Invalid Date'
  }
}

// Get date range for current month
export function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date()
  const from = startOfMonth(now)
  const to = endOfMonth(now)
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  }
}

// Get date range for last N months
export function getLastMonthsRange(months: number): { from: string; to: string } {
  const now = new Date()
  const from = startOfMonth(subMonths(now, months - 1))
  const to = endOfMonth(now)
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  }
}

// Validate date string
export function isValidDate(dateStr: string): boolean {
  try {
    const date = parseISO(dateStr)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Chunk array into smaller arrays
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Calculate percentage change
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
