import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ApplicantDashboard from './components/dashboard/ApplicantDashboard'
import UnderwriterDashboard from './components/dashboard/UnderwriterDashboard'
import SystemAdminDashboard from './components/dashboard/SystemAdminDashboard'
import LoanApplication from './components/loan/LoanApplication'
import DocumentUpload from './components/loan/DocumentUpload'
import ApplicationStatus from './components/loan/ApplicationStatus'
import { AuthProvider, useAuth } from './context/AuthContext'
import KYC from './components/KYC/KYC'
import RoleProtectedRoute from './components/auth/RoleProtectedRoute'
import AccessDenied from './components/auth/AccessDenied'

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

// Root Redirector — handles `/`
const RootRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return <Navigate to={`/dashboard/${user.role}`} />
}

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Root path */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Public */}
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
            <RoleProtectedRoute allowedRoles={['applicant']}>
              <ApplicantDashboard />
            </RoleProtectedRoute>
          } />

          <Route path="/dashboard/underwriter" element={
            <RoleProtectedRoute allowedRoles={['underwriter']}>
              <UnderwriterDashboard />
            </RoleProtectedRoute>
          } />

          <Route path="/dashboard/system_admin" element={
            <RoleProtectedRoute allowedRoles={['system_admin']}>
              <SystemAdminDashboard />
            </RoleProtectedRoute>
          } />

          <Route path="/access-denied" element={
            <AccessDenied />
          } />
          
          <Route path="/loan-application" element={
            <RoleProtectedRoute allowedRoles={['applicant']}>
              <LoanApplication />
            </RoleProtectedRoute>
          } />
          <Route path="/kyc" element={
            <RoleProtectedRoute allowedRoles={['applicant']}>
              <KYC />
            </RoleProtectedRoute>
          } />
          <Route path="/upload-documents" element={
            <RoleProtectedRoute allowedRoles={['applicant']}>
              <DocumentUpload />
            </RoleProtectedRoute>
          } />
          <Route path="/application-status" element={
            <RoleProtectedRoute allowedRoles={['applicant']}>
              <ApplicationStatus />
            </RoleProtectedRoute>
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