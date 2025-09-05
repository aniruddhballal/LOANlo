import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<'applicant' | 'underwriter' | 'system_admin'>
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

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