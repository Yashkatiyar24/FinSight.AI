// Test the exact CSV format provided by user
import fs from 'fs'

const testCSVContent = `Date,Description,Amount,Merchant
2024-01-15,Coffee shop purchase,-4.95,Starbucks
2024-01-16,Grocery shopping,-87.32,Whole Foods Market
2024-01-17,Gas station,-45.2,Shell
2024-01-18,Salary deposit,3500.0,ACME Corp
2024-01-19,Restaurant dinner,-65.43,The Italian Place
2024-01-20,Online shopping,-129.99,Amazon
2024-01-21,Movie tickets,-24.5,AMC Theaters
2024-01-22,Electric bill,-98.76,PG&E
2024-01-23,Pharmacy,-15.67,CVS Pharmacy
2024-01-24,Uber ride,-18.45,Uber
2024-01-25,Subscription,-9.99,Netflix
2024-01-26,Freelance payment,850.0,Client ABC`

console.log('User CSV Content:')
console.log(testCSVContent)
console.log('\nLines:')
const lines = testCSVContent.split('\n').filter(line => line.trim())
lines.forEach((line, i) => {
  console.log(`${i}: ${line}`)
})

console.log('\nHeaders:')
const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
console.log(headers)

console.log('\nColumn mappings test:')
const COLUMN_MAPPINGS = {
  date: ['date', 'transaction date', 'post date', 'posted date', 'tx date', 'transaction_date'],
  description: ['description', 'transaction description', 'desc', 'memo', 'details', 'payee'],
  merchant: ['merchant', 'vendor', 'payee', 'business', 'company'],
  amount: ['amount', 'transaction amount', 'debit', 'credit', 'value', 'sum'],
}

const mapping = {}
for (const [field, patterns] of Object.entries(COLUMN_MAPPINGS)) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i] || ''
    if (patterns.some(pattern => header.includes(pattern))) {
      mapping[field] = i
      break
    }
  }
}

console.log('Detected mapping:', mapping)

console.log('\nFirst data row parsing:')
const firstDataRow = lines[1]
console.log('Raw:', firstDataRow)
const rowData = firstDataRow.split(',').map(cell => cell.trim().replace(/"/g, ''))
console.log('Parsed:', rowData)

console.log('\nExtracted transaction:')
const transaction = {
  date: rowData[mapping.date],
  description: rowData[mapping.description],
  amount: parseFloat(rowData[mapping.amount]),
  merchant: rowData[mapping.merchant]
}
console.log(transaction)
