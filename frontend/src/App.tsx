import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ApplicantDashboard from './components/dashboards/ApplicantDashboard'
import UnderwriterDashboard from './components/dashboards/UnderwriterDashboard'
import SystemAdminDashboard from './components/dashboards/SystemAdminDashboard'
import LoanApplication from './components/loan/LoanApplication/LoanApplication'
import DocumentUpload from './components/loan/DocumentUpload'
import ApplicationStatus from './components/loan/ApplicationStatus'
import { AuthProvider, useAuth } from './context/AuthContext'
import PersonalDetails from './components/loan/PersonalDetails/PersonalDetails'
import RoleProtectedRoute from './components/auth/RoleProtectedRoute'
import AccessDenied from './components/auth/AccessDenied'
import { LoadingState } from './components/ui/StatusMessages'
import EmailVerification from './components/auth/EmailVerification'
import ApplicantProfile from './components/auth/ApplicantProfile'
import StaffProfile from './components/auth/StaffProfile'
import ProfileHistory from './components/auth/ProfileHistory'

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading)
    return (
      <LoadingState 
        title="Checking Authentication"
        message="Please wait while we confirm your session..."
      />
    )

  if (!user) return <>{children}</>
  if (user && user.isEmailVerified) {  // Only redirect if VERIFIED
    return <Navigate to={`/dashboard/${user.role}`} />
  }
  return <>{children}</>  // Let unverified users stay on login/register
}

const RootRedirect = () => {
  const { user, loading } = useAuth()

  if (loading)
    return (
      <LoadingState 
        title="Redirecting You"
        message="Please wait while we confirm your session..."
      />
    )

  if (!user) return <Navigate to="/login" />
  return <Navigate to={`/dashboard/${user.role}`} />
}


function AppContent() {
  return (
    <div className="app">
      <Routes>
        {/* Root path */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Public Routes */}
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
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/email-verification-required" element={<EmailVerification />} />
        
        {/* Applicant Profile Routes */}
        <Route path="/applicant-profile" element={
          <RoleProtectedRoute allowedRoles={['applicant']}>
            <ApplicantProfile />
          </RoleProtectedRoute>
        } />
        <Route path="/applicant-profile/:userId" element={
          <RoleProtectedRoute allowedRoles={['underwriter', 'system_admin']}>
            <ApplicantProfile />
          </RoleProtectedRoute>
        } />
        
        {/* Staff Profile Routes (for underwriters and system_admins) */}
        <Route path="/staff-profile" element={
          <RoleProtectedRoute allowedRoles={['underwriter', 'system_admin']}>
            <StaffProfile />
          </RoleProtectedRoute>
        } />
        <Route path="/staff-profile/:userId" element={
          <RoleProtectedRoute allowedRoles={['underwriter', 'system_admin']}>
            <StaffProfile />
          </RoleProtectedRoute>
        } />
        
        {/* Profile History Routes */}
        <Route path="/profile/history/:userId" element={
          <RoleProtectedRoute allowedRoles={['underwriter', 'applicant', 'system_admin']}>
            <ProfileHistory />
          </RoleProtectedRoute>
        } />

        {/* Dashboard Routes */}
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
        
        {/* Loan Application Routes */}
        <Route path="/loan-application" element={
          <RoleProtectedRoute allowedRoles={['applicant']}>
            <LoanApplication />
          </RoleProtectedRoute>
        } />
        <Route path="/personal-details" element={
          <RoleProtectedRoute allowedRoles={['applicant']}>
            <PersonalDetails  />
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
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App