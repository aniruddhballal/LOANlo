import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ApplicantDashboard from './components/dashboard/ApplicantDashboard'
import UnderwriterDashboard from './components/dashboard/UnderwriterDashboard'
import SystemAdminDashboard from './components/dashboard/SystemAdminDashboard'
import LoanApplication from './components/loan/LoanApplication'
import DocumentUpload from './components/loan/DocumentUpload'
import ApplicationStatus from './components/loan/ApplicationStatus'
import Profile from './components/profile/Profile'
import { AuthProvider, useAuth } from './context/AuthContext'
import KYC from './components/loan/KYC'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return user ? <>{children}</> : <Navigate to="/login" />
}

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <>{children}</>
  }

  // user.role comes from MongoDB via backend -> AuthContext
  return <Navigate to={`/dashboard/${user.role}`} />
}

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard/applicant" element={
            <ProtectedRoute>
              <ApplicantDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/underwriter" element={
            <ProtectedRoute>
              <UnderwriterDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/system_admin" element={
            <ProtectedRoute>
              <SystemAdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/loan-application" element={
            <ProtectedRoute>
              <LoanApplication />
            </ProtectedRoute>
          } />
          <Route path="/kyc" element={
            <ProtectedRoute>
              <KYC />
            </ProtectedRoute>
          } />
          <Route path="/upload-documents/:applicationId" element={
            <ProtectedRoute>
              <DocumentUpload />
            </ProtectedRoute>
          } />
          <Route path="/application-status" element={
            <ProtectedRoute>
              <ApplicationStatus />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App