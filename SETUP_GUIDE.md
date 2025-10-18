# FinSight.AI - Complete Setup Guide

## 🚀 Project Overview

FinSight.AI is a fully functional AI-powered financial insights SaaS for freelancers and startups. The application provides:

- **File Upload & Processing**: CSV, XLSX, PDF transaction files
- **AI Categorization**: Automatic transaction categorization using ML/NLP
- **Rules Engine**: Custom categorization rules
- **Dashboard**: Real-time financial analytics
- **Reports**: Generate expense, tax, and P&L reports
- **Billing**: Razorpay integration for subscriptions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Framer Motion + Lucide React
- **Backend**: Supabase (Database + Auth + Storage)
- **File Processing**: Papa Parse (CSV), XLSX, PDF-Parse
- **Payments**: Razorpay
- **State Management**: Zustand
- **Notifications**: Sonner

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** (free tier available)
3. **Razorpay Account** (for payments)
4. **Git**

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd finsight-ai
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional: Error Tracking
SENTRY_DSN=your_sentry_dsn
```

### 3. Supabase Setup

#### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

#### 3.2 Database Schema

Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor:

```sql
-- Copy and paste the entire content of supabase-schema.sql
-- This creates all necessary tables, indexes, and RLS policies
```

#### 3.3 Storage Buckets

Create the following storage buckets in Supabase Dashboard → Storage:

1. **uploads** (private)
   - Policies: Users can upload/read their own files
2. **reports** (private)
   - Policies: Users can read their own reports

#### 3.4 Authentication Setup

1. Go to Authentication → Settings
2. Enable Email authentication
3. Configure Google OAuth (optional):
   - Add your domain to allowed origins
   - Configure Google OAuth credentials

### 4. Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Get your API keys from Dashboard → API Keys
3. Add your domain to allowed origins
4. Configure webhook endpoints (optional)

### 5. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build
npm run preview
```

## 🎯 Features Implementation

### ✅ Completed Features

1. **File Upload System**
   - Drag & drop interface
   - Support for CSV, XLSX, PDF files
   - File type detection and validation
   - Progress tracking

2. **Data Processing Pipeline**
   - CSV parsing with Papa Parse
   - Excel parsing with XLSX library
   - PDF parsing with PDF-Parse
   - Column mapping and normalization
   - Data validation and error handling

3. **AI Categorization**
   - Keyword-based ML categorization
   - Confidence scoring
   - Fallback categorization
   - Category suggestions

4. **Rules Engine**
   - Custom categorization rules
   - Contains and regex matching
   - Rule priority system
   - Real-time rule testing

5. **Dashboard**
   - Real-time metrics from Supabase
   - Transaction overview
   - Category breakdown
   - Recent transactions

6. **Reports Generation**
   - Expense reports
   - Tax reports
   - Profit & Loss reports
   - Multiple export formats (PDF, Excel, CSV)

7. **Billing Integration**
   - Razorpay payment processing
   - Subscription management
   - Usage tracking
   - Plan upgrades/downgrades

8. **Error Handling**
   - Comprehensive error tracking
   - User-friendly error messages
   - Toast notifications
   - Error logging

### 🔄 Data Flow

```
File Upload → File Detection → Parsing → Normalization → 
Categorization (Rules + ML) → Database Storage → Dashboard Display
```

## 📊 Database Schema

### Core Tables

- **users**: User profiles and settings
- **uploads**: File upload tracking
- **transactions**: Financial transactions
- **rules**: Categorization rules
- **reports**: Generated reports
- **billing**: Subscription and payment info

### Key Features

- Row Level Security (RLS) for data isolation
- Automatic timestamps and updates
- Comprehensive indexing for performance
- Audit logging for compliance

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports React applications:
- Netlify
- AWS Amplify
- Railway
- Render

## 🧪 Testing

### Demo Data

Use the demo data generator to test the application:

```typescript
import { generateAndInsertDemoData } from './src/services/demoDataGenerator'

// Generate demo data for testing
await generateAndInsertDemoData('user-id', {
  transactionCount: 100,
  includeIncome: true
})
```

### Test Files

Sample files are included in the repository:
- `demo-transactions.csv`
- `test-transactions.csv`
- `user-transactions.csv`

## 🔧 Configuration

### File Size Limits

Default limits (configurable):
- Max file size: 10MB
- Max transactions per upload: 10,000

### Plan Limits

- **Free**: 3 uploads/month, 5,000 transactions
- **Pro**: 50 uploads/month, 100,000 transactions
- **Business**: Unlimited

## 🐛 Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size limits
   - Verify file format support
   - Check Supabase storage configuration

2. **Authentication Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure proper CORS configuration

3. **Payment Issues**
   - Verify Razorpay keys
   - Check webhook configuration
   - Ensure proper error handling

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📈 Performance Optimization

### Database
- Proper indexing on frequently queried columns
- RLS policies for security
- Connection pooling

### Frontend
- Code splitting with React.lazy
- Image optimization
- Caching strategies

### File Processing
- Streaming for large files
- Background processing
- Progress tracking

## 🔒 Security

### Data Protection
- Row Level Security (RLS)
- Input validation and sanitization
- File type verification
- Secure file storage

### Authentication
- Supabase Auth with JWT
- Session management
- Password policies

## 📝 API Documentation

### Core Services

- **ApiService**: Main API operations
- **ReportService**: Report generation
- **BillingService**: Payment processing
- **ErrorHandler**: Error management
- **DemoDataGenerator**: Testing utilities

### Key Methods

```typescript
// File operations
apiService.uploadFile(file)
apiService.processFile(fileId)

// Data operations
apiService.getTransactions()
apiService.getDashboardMetrics()

// Reports
reportService.generateExpenseReport()
reportService.exportToPDF()

// Billing
billingService.upgradePlan()
billingService.getCurrentSubscription()
```

## 🎉 Success!

Your FinSight.AI application is now fully functional with:

- ✅ Complete file upload and processing pipeline
- ✅ AI-powered transaction categorization
- ✅ Real-time dashboard with analytics
- ✅ Comprehensive reporting system
- ✅ Integrated payment processing
- ✅ Production-ready error handling
- ✅ Scalable database architecture

The application is ready for production use and can handle real user data with proper security and performance optimizations.
