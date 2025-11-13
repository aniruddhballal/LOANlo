import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import api from '../../api'

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifyingToken, setVerifyingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState('')

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-reset-token/${token}`)
        if (response.data.valid) {
          setTokenValid(true)
        } else {
          setError('Invalid or expired reset link')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired reset link')
      } finally {
        setVerifyingToken(false)
      }
    }

    if (token) {
      verifyToken()
    } else {
      setError('No reset token provided')
      setVerifyingToken(false)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password')
      setLoading(false)
    }
  }

  // Loading state while verifying token
  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-2">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-2">Your password has been updated.</p>
          <p className="text-gray-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-xl mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">
            LOAN<span className="font-semibold">LO</span>
          </h1>
          <div className="w-24 h-px bg-gray-300 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base font-normal tracking-wide">
            Reset Your Password
          </p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-10 py-8 border-b border-gray-100">
            <h2 className="text-2xl font-light text-gray-900 text-center tracking-wide">
              Create New Password
            </h2>
            <p className="text-gray-500 text-center mt-2 text-sm">
              Enter a strong password for your account
            </p>
          </div>

          <div className="px-10 py-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-700 text-sm font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 tracking-wide">
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-gray-700' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    disabled={loading}
                    className="block w-full pl-12 pr-14 py-4 border border-gray-200 rounded-2xl
                             focus:ring-0 focus:outline-none focus:border-gray-400 hover:border-gray-300
                             text-sm disabled:opacity-50"
                    placeholder="Enter new password"
                    required
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 tracking-wide">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-300 ${
                      focusedField === 'confirmPassword' ? 'text-gray-700' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                    disabled={loading}
                    className="block w-full pl-12 pr-14 py-4 border border-gray-200 rounded-2xl
                             focus:ring-0 focus:outline-none focus:border-gray-400 hover:border-gray-300
                             text-sm disabled:opacity-50"
                    placeholder="Confirm new password"
                    required
                  />
                  <div
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium">Password must:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>
                    Be at least 8 characters long
                  </li>
                  <li className={password === confirmPassword && password ? 'text-green-600' : ''}>
                    Match in both fields
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gray-900 border border-gray-900 rounded-2xl
                         text-white font-medium text-sm tracking-wider
                         hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    RESETTING PASSWORD...
                  </>
                ) : (
                  'RESET PASSWORD'
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                Remember your password?{' '}
                <a
                  href="/login"
                  className="text-gray-900 font-medium hover:text-gray-700 transition-colors"
                >
                  Back to Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword