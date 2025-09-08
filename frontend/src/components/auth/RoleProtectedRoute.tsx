import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<'applicant' | 'underwriter' | 'system_admin'>
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <span className="text-gray-600 font-light text-lg">Authenticating...</span>
        </div>
      </div>
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