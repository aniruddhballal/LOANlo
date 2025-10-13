import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingState } from '../ui/StatusMessages'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<'applicant' | 'underwriter' | 'system_admin'>
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading until AuthProvider finishes
  if (loading) {
    return (
      <LoadingState 
        title="Authenticating" 
        message="Please wait while we log you in..." 
      />
    );
  }

  // User exists but email not verified
  if (user && !user.isEmailVerified && window.location.pathname !== '/email-verification-required') {
    return <Navigate to="/email-verification-required" />;
  }

  // User exists but role not allowed
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} /> 
  }

  // Not logged in
  if (!user) return <Navigate to="/login" />;

  // Everything okay
  return <>{children}</>;
}

export default RoleProtectedRoute