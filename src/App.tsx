import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Context
import AuthProvider from './context/SupabaseAuthContext'
import { TransactionProvider } from './store/transactionStore'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'
import { FinSightAuthComponent } from './components/FinSightAuthComponent'

// Auth Pages
import AuthCallback from './pages/auth/AuthCallback'
import VerifyEmail from './pages/auth/VerifyEmail'

// Main Pages
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Transactions from './pages/Transactions'
import Rules from './pages/Rules'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Billing from './pages/Billing'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Layout wrapper for authenticated pages
function AppLayout({ children }: { children: React.ReactNode }) {
  console.log('AppLayout rendering children')
  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TransactionProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth/login" element={<FinSightAuthComponent />} />
            <Route path="/auth/signup" element={<FinSightAuthComponent />} />
            <Route path="/auth" element={<FinSightAuthComponent />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            
            {/* Protected Routes */}
                        <Route path="/dashboard" element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            } />
            
            <Route path="/upload" element={
              <AppLayout>
                <Upload />
              </AppLayout>
            } />
            
            <Route path="/transactions" element={
              <AppLayout>
                <Transactions />
              </AppLayout>
            } />
            
            <Route path="/rules" element={
              <ProtectedRoute>
                <AppLayout>
                  <Rules />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/billing" element={
              <ProtectedRoute>
                <AppLayout>
                  <Billing />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TransactionProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App