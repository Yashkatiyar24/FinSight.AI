# 🚀 FinSight.AI - Intelligent Financial Management SaaS

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.4.20-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
</div>

<div align="center">
  <h3>🧠 AI-Powered Financial Management Platform</h3>
  <p>Complete SaaS solution with real-time analytics, smart transaction categorization, and intelligent file processing</p>
</div>

---

## ✨ Features

### 🔐 **Authentication & Security**
- **Supabase Authentication** - Secure email/password and OAuth integration
- **Row Level Security (RLS)** - Database-level security policies
- **Protected Routes** - Client-side route protection
- **Demo Access** - Instant demo with `demo@finsight.ai` / `demo123456`

### 📊 **Real-Time Dashboard**
- **Live Financial Metrics** - Income, expenses, trends, and analytics
- **Interactive Charts** - Beautiful visualizations with Recharts
- **Transaction Overview** - Recent transactions with smart filtering
- **Responsive Design** - Perfect on desktop and mobile

### 🧠 **AI-Powered Categorization**
- **OpenAI Integration** - GPT-3.5-turbo for intelligent categorization
- **Rule-Based Fallback** - Robust system when AI is unavailable
- **Confidence Scoring** - AI confidence levels for each categorization
- **8 Smart Categories** - Food & Dining, Shopping, Transportation, etc.

### 📁 **Advanced File Processing**
- **Drag & Drop Upload** - Modern file upload with progress tracking
- **Multi-Format Support** - CSV, Excel (.xlsx/.xls), PDF (planned)
- **Smart Column Detection** - Automatic field mapping for various formats
- **Real-Time Processing** - Live progress updates with error handling

### 💳 **Transaction Management**
- **CRUD Operations** - Complete transaction lifecycle management
- **Smart Search** - Advanced filtering by category, amount, date
- **Bulk Operations** - Import thousands of transactions efficiently
- **Export Capabilities** - Download data in multiple formats

### 🏗️ **Production-Ready Architecture**
- **TypeScript** - Full type safety across the entire application
- **Component Library** - Reusable UI components with shadcn/ui
- **Error Boundaries** - Graceful error handling and recovery
- **Performance Optimized** - Code splitting and lazy loading

---

## 🚀 Quick Start

### 1️⃣ **Clone Repository**
```bash
git clone https://github.com/Yashkatiyar24/FinSight.AI.git
cd FinSight.AI
```

### 2️⃣ **Install Dependencies**
```bash
npm install
```

### 3️⃣ **Environment Setup**
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_key (optional)
```

### 4️⃣ **Database Setup**
Run the SQL schema in your Supabase dashboard:
```bash
# Upload supabase-schema.sql to your Supabase SQL editor
```

### 5️⃣ **Start Development**
```bash
npm run dev
```

### 6️⃣ **Demo Access**
- **URL**: `http://localhost:3000/auth/login`
- **Demo Login**: `demo@finsight.ai` / `demo123456`
- **Features**: Full access to all features with sample data

---

## 📁 Project Structure

```
FinSight.AI/
├── 📁 src/
│   ├── 📁 components/          # Reusable UI components
│   │   ├── AIConfig.tsx        # AI configuration modal
│   │   ├── ErrorBoundary.tsx   # Error handling wrapper
│   │   └── Navigation.tsx      # Main navigation
│   ├── 📁 pages/              # Application pages
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Upload.tsx         # File upload & processing
│   │   ├── Transactions.tsx   # Transaction management
│   │   └── Profile.tsx        # User profile
│   ├── 📁 lib/                # Core utilities
│   │   ├── 📁 ai/             # AI/ML services
│   │   │   ├── transaction-analyzer.ts  # Smart categorization
│   │   │   └── file-parser.ts           # File processing
│   │   ├── database.ts        # Database service layer
│   │   ├── supabase.ts       # Supabase configuration
│   │   └── types.ts          # TypeScript definitions
│   └── 📁 context/           # React contexts
│       └── SupabaseAuthContext.tsx
├── 📄 supabase-schema.sql     # Complete database schema
├── 📄 package.json           # Dependencies & scripts
└── 📄 README.md             # This file
```

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.6.3** - Type safety and developer experience
- **Vite 5.4.20** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Beautiful animations and transitions

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - Built-in authorization and data protection
- **Edge Functions** - Serverless functions for complex operations

### **AI & ML**
- **OpenAI GPT-3.5-turbo** - Advanced transaction categorization
- **Rule-Based Engine** - Fallback categorization system
- **File Processing** - Intelligent CSV/Excel parsing

### **Development**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing and optimization
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

---

## 🧠 AI Features Deep Dive

### **Smart Transaction Categorization**
```typescript
// Example: Starbucks purchase → "Food & Dining" (Coffee Shops)
// Confidence: 0.95, Recurring: false
```

### **Supported Categories**
1. **Food & Dining** - Restaurants, Fast Food, Coffee Shops, Groceries
2. **Shopping** - Online, Retail, Clothing, Electronics
3. **Transportation** - Gas, Public Transit, Parking, Rideshare
4. **Entertainment** - Movies, Streaming, Games, Sports
5. **Bills & Utilities** - Internet, Phone, Electric, Water
6. **Healthcare** - Doctor, Pharmacy, Dental, Hospital
7. **Income** - Salary, Freelance, Investment, Refund
8. **Transfer** - Bank Transfer, Credit Card Payment, Investment

### **AI Configuration**
- Easy OpenAI API key setup through UI
- Automatic fallback to rule-based system
- Confidence scoring for all categorizations
- Batch processing for large datasets

---

## 📊 Database Schema

### **Core Tables**
- `users` - User profiles and settings
- `transactions` - Financial transactions with AI insights
- `uploads` - File upload tracking and metadata
- `rules` - Custom categorization rules
- `reports` - Generated financial reports
- `billing` - Subscription and usage tracking

### **Security Features**
- Row Level Security (RLS) on all tables
- User-based data isolation
- Secure API endpoints
- Audit logging

---

## 🧪 Testing & Demo

### **Demo Features**
- **Instant Access** - No signup required
- **Sample Data** - Pre-loaded transactions for testing
- **Full Functionality** - All features available
- **AI Categorization** - Live demo of smart categorization

### **Test File Upload**
Upload sample CSV with this format:
```csv
Date,Description,Amount,Merchant
2024-01-15,Coffee shop purchase,-4.95,Starbucks
2024-01-16,Grocery shopping,-87.32,Whole Foods Market
2024-01-17,Gas station,-45.20,Shell
```

---

## 🚀 Deployment

### **Frontend Deployment**
```bash
npm run build
# Deploy 'dist' folder to Vercel, Netlify, or any static host
```

### **Environment Variables**
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### **Database Setup**
1. Create Supabase project
2. Run `supabase-schema.sql`
3. Configure RLS policies
4. Set up authentication providers

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Demo**: Coming Soon
- **Documentation**: This README
- **Issues**: [GitHub Issues](https://github.com/Yashkatiyar24/FinSight.AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Yashkatiyar24/FinSight.AI/discussions)

---

<div align="center">
  <h3>🌟 Star this repository if you find it useful!</h3>
  <p>Built with ❤️ by the FinSight.AI Team</p>
</div>
