import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingState } from '../loan/LoanApplication/ui/StatusMessages'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<'applicant' | 'underwriter' | 'system_admin'>
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <LoadingState 
        title="Authenticating" 
        message="Please wait while we log you in..." 
      />
    )
  }

  // not logged in
  if (!user) return <Navigate to="/login" />

  // logged in but wrong role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} /> 
  }

  // allowed
  return <>{children}</>
}

export default RoleProtectedRoute