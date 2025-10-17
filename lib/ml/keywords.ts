// Curated keyword lists for ML categorization

export const KEYWORD_CATEGORIES = {
  'Technology': {
    keywords: [
      'aws', 'google cloud', 'azure', 'digitalocean', 'heroku', 'netlify', 'vercel',
      'github', 'gitlab', 'bitbucket', 'slack', 'zoom', 'microsoft', 'adobe', 'canva',
      'figma', 'notion', 'airtable', 'zapier', 'mailchimp', 'sendgrid', 'twilio',
      'stripe', 'paypal', 'razorpay', 'google workspace', 'office 365', 'dropbox',
      'software', 'saas', 'api', 'hosting', 'domain', 'ssl', 'cloudflare'
    ],
    patterns: [
      /\b(software|saas|api|cloud|hosting)\b/i,
      /\b(app|tech|digital|online)\s+(subscription|service|platform)\b/i
    ]
  },
  
  'Subscriptions': {
    keywords: [
      'netflix', 'spotify', 'apple music', 'youtube premium', 'amazon prime',
      'disney+', 'hotstar', 'zee5', 'voot', 'sonyliv', 'mx player', 'aha',
      'subscription', 'monthly', 'annual', 'recurring', 'auto-renewal'
    ],
    patterns: [
      /\b(subscription|monthly|annual)\b/i,
      /\b(netflix|spotify|prime|disney)\b/i
    ]
  },
  
  'Meals & Entertainment': {
    keywords: [
      'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza hut', 'kfc', 'mcdonalds',
      'burger king', 'subway', 'starbucks', 'cafe coffee day', 'barista',
      'restaurant', 'cafe', 'food', 'dining', 'meal', 'lunch', 'dinner',
      'bookmyshow', 'paytm movies', 'pvr', 'inox', 'movie', 'cinema', 'theatre'
    ],
    patterns: [
      /\b(restaurant|cafe|food|dining|meal)\b/i,
      /\b(movie|cinema|theatre|entertainment)\b/i,
      /\b(swiggy|zomato|uber\s*eats)\b/i
    ]
  },
  
  'Travel': {
    keywords: [
      'uber', 'ola', 'rapido', 'auto', 'taxi', 'cab', 'metro', 'bus', 'train',
      'irctc', 'makemytrip', 'cleartrip', 'goibibo', 'yatra', 'booking.com',
      'airbnb', 'oyo', 'hotel', 'flight', 'airline', 'indigo', 'spicejet',
      'air india', 'vistara', 'fuel', 'petrol', 'diesel', 'gas station'
    ],
    patterns: [
      /\b(uber|ola|taxi|cab|auto)\b/i,
      /\b(flight|airline|hotel|travel)\b/i,
      /\b(fuel|petrol|diesel|gas)\b/i
    ]
  },
  
  'Shopping': {
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'big basket', 'grofers',
      'paytm mall', 'snapdeal', 'jabong', 'koovs', 'limeroad', 'pepperfry',
      'urban ladder', 'firstcry', 'shopping', 'online purchase', 'e-commerce'
    ],
    patterns: [
      /\b(amazon|flipkart|myntra|shopping)\b/i,
      /\b(online\s*(purchase|shopping|store))\b/i
    ]
  },
  
  'Groceries': {
    keywords: [
      'grocery', 'supermarket', 'big bazaar', 'dmart', 'reliance fresh',
      'spencer', 'more', 'easyday', 'hypercity', 'star bazaar', 'big basket',
      'grofers', 'dunzo', 'vegetables', 'fruits', 'milk', 'bread'
    ],
    patterns: [
      /\b(grocery|supermarket|vegetables|fruits)\b/i,
      /\b(big\s*basket|grofers|dunzo)\b/i
    ]
  },
  
  'Utilities': {
    keywords: [
      'electricity', 'electric', 'power', 'water', 'gas', 'internet', 'broadband',
      'wifi', 'jio', 'airtel', 'vi', 'bsnl', 'act', 'hathway', 'den',
      'phone bill', 'mobile bill', 'recharge', 'utility', 'bill payment'
    ],
    patterns: [
      /\b(electricity|electric|power|water|gas)\b/i,
      /\b(internet|broadband|wifi|phone|mobile)\b/i,
      /\b(jio|airtel|vi|bsnl)\b/i
    ]
  },
  
  'Salary': {
    keywords: [
      'salary', 'wages', 'income', 'payroll', 'bonus', 'increment', 'allowance',
      'reimbursement', 'commission', 'freelance', 'consulting', 'payment received'
    ],
    patterns: [
      /\b(salary|wages|income|payroll)\b/i,
      /\b(payment\s*received|freelance|consulting)\b/i
    ]
  },
  
  'Fees': {
    keywords: [
      'bank charges', 'service charges', 'processing fee', 'convenience fee',
      'transaction fee', 'atm fee', 'annual fee', 'late fee', 'penalty',
      'gst', 'tax', 'tds', 'service tax', 'cess'
    ],
    patterns: [
      /\b(fee|charges|penalty|tax)\b/i,
      /\b(gst|tds|service\s*tax|cess)\b/i
    ]
  }
}

export const DEFAULT_GST_RATES = {
  'Technology': 18,
  'Subscriptions': 18,
  'Meals & Entertainment': 5, // Restaurant services
  'Travel': 5, // Transport services
  'Shopping': 18, // General goods
  'Groceries': 0, // Essential items
  'Utilities': 18,
  'Salary': 0, // Income, no GST
  'Fees': 18
}
