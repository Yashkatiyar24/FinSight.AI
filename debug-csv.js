// Simple test script to debug CSV parsing
const testCSVContent = `Date,Description,Amount,Merchant,Category
2024-01-15,"Coffee Purchase",-4.50,"Starbucks","Food & Dining"
2024-01-16,"Salary Deposit",3000.00,"ABC Company","Income"
2024-01-17,"Gas Station",-45.00,"Shell","Transportation"
2024-01-18,"Grocery Shopping",-87.32,"Walmart","Groceries"
2024-01-19,"Netflix Subscription",-15.99,"Netflix","Entertainment"`

console.log('Test CSV Content:')
console.log(testCSVContent)
console.log('\nLines:')
const lines = testCSVContent.split('\n').filter(line => line.trim())
lines.forEach((line, i) => {
  console.log(`${i}: ${line}`)
})

console.log('\nHeaders:')
const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
console.log(headers)

console.log('\nFirst data row:')
const firstRow = lines[1]
console.log(firstRow)
console.log('Split:', firstRow.split(','))
