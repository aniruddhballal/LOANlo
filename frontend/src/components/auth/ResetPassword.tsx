import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle, XCircle, Check, X } from 'lucide-react'
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
  const [passwordStrength, setPasswordStrength] = useState(0)

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

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 6) strength += 1
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setPasswordStrength(calculatePasswordStrength(value))
    if (error) setError('')
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 6) {
      setError('Password must contain at least 6 characters for security compliance.')
      return
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match. Please verify both entries.')
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

  const isPasswordMatch = confirmPassword && password === confirmPassword
  const isPasswordMismatch = confirmPassword && password !== confirmPassword

  // Loading state while verifying token
  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium tracking-wide">VERIFYING RESET LINK</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!tokenValid && !verifyingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-wide">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{error || 'This reset link is invalid or has expired.'}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 px-6 bg-gray-900 text-white rounded-2xl font-medium text-sm tracking-wider hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            RETURN TO LOGIN
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div 
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center"
          style={{ animation: 'scaleIn 0.5s ease-out' }}
        >
          <div 
            className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ animation: 'bounceIn 0.6s ease-out' }}
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-wide">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-2">Your password has been updated successfully.</p>
          <p className="text-gray-500 text-sm tracking-wide">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-2xl relative z-10">
          {/* Corporate Header */}
          <div 
            className="text-center mb-12"
            style={{ animation: 'fadeInDown 0.5s ease-out' }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-xl mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">
              LOAN<span className="font-semibold">LO</span>
            </h1>
            <div className="w-24 h-px bg-gray-300 mx-auto mb-4"></div>
            <p className="text-gray-600 text-base font-normal tracking-wide">
              Professional Loan Origination Platform
            </p>
          </div>

          {/* Reset Password Card */}
          <div 
            className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-10 py-8 border-b border-gray-100">
              <h2 className="text-2xl font-light text-gray-900 text-center tracking-wide">
                Password Reset
              </h2>
              <p className="text-gray-500 text-center mt-2 text-sm">
                Create a new secure password for your account
              </p>
            </div>

            <div className="px-10 py-8">
              {/* Error Alert */}
              {error && (
                <div 
                  className="mb-8 p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start space-x-3 transition-all duration-300"
                  style={{ animation: 'fadeInUp 0.3s ease-out' }}
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-red-700 text-sm font-medium">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Security Credentials Section */}
                <div className="space-y-6">
                  <div className="pb-2">
                    <h3 className="text-sm font-medium text-gray-700 tracking-widest">NEW SECURITY CREDENTIALS</h3>
                    <div className="mt-2 w-12 h-px bg-gray-300"></div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 tracking-wide">
                      NEW PASSWORD
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === 'password' ? 'text-gray-700' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        disabled={loading}
                        className="block w-full pl-12 pr-14 py-4 border border-gray-200 rounded-2xl 
                                focus:ring-0 focus:border-gray-400 focus:outline-none 
                                bg-white text-gray-900 placeholder-gray-400 
                                transition-all duration-200 font-medium text-sm tracking-wide
                                hover:border-gray-300 disabled:opacity-50"
                        placeholder="Create a secure password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none group"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-3 space-y-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                passwordStrength >= level 
                                  ? passwordStrength >= 4 
                                    ? 'bg-green-500' 
                                    : passwordStrength >= 2 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs font-medium tracking-wide ${
                          passwordStrength >= 4 ? 'text-green-600' : 
                          passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          STRENGTH: {passwordStrength >= 4 ? 'EXCELLENT' : 
                                  passwordStrength >= 2 ? 'MODERATE' : 'INSUFFICIENT'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 tracking-wide">
                      CONFIRM NEW PASSWORD
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === 'confirmPassword' ? 'text-gray-700' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField('')}
                        disabled={loading}
                        className={`block w-full pl-12 pr-16 py-4 border rounded-2xl 
                                  focus:ring-0 focus:outline-none bg-white text-gray-900 
                                  placeholder-gray-400 transition-all duration-200 
                                  font-medium text-sm tracking-wide hover:border-gray-300
                                  disabled:opacity-50 ${
                          isPasswordMatch 
                            ? 'border-green-300 focus:border-green-400' 
                            : isPasswordMismatch 
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-gray-200 focus:border-gray-400'
                        }`}
                        placeholder="Confirm your password"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
                        {isPasswordMatch && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {isPasswordMismatch && (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="cursor-pointer focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Password match status text */}
                    {confirmPassword && (
                      <div className="mt-2">
                        {isPasswordMatch ? (
                          <span className="text-xs font-medium text-green-600 tracking-wide">
                            PASSWORD VERIFICATION SUCCESSFUL
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-red-600 tracking-wide">
                            PASSWORD VERIFICATION FAILED
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={loading || !password || password.length < 6 || password !== confirmPassword}
                    className="relative w-full flex items-center justify-center py-4 px-6 
                            border border-gray-900 rounded-2xl text-white bg-gray-900 
                            font-medium text-sm tracking-wider transition-all duration-300 
                            disabled:opacity-50 disabled:cursor-not-allowed 
                            hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5
                            focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                            overflow-hidden"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                        <span>RESETTING PASSWORD</span>
                        <div className="ml-3 flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce opacity-60"></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75 opacity-80"></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    ) : (
                      'RESET PASSWORD'
                    )}
                  </button>
                </div>
              </form>

              {/* Back to Login */}
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm tracking-wide">
                  Remember your password?{' '}
                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/login')
                    }}
                    className="relative text-gray-900 font-medium transition-all duration-300 
                            focus:outline-none group hover:text-gray-700"
                  >
                    Access Your Account
                    <span className="absolute left-0 bottom-[-2px] w-0 h-px bg-gray-900 
                                  transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </p>
                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-400 tracking-wider">
                  <span>SECURE</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span>ENCRYPTED</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span>COMPLIANT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div 
            className="text-center mt-8 opacity-60"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
          >
            <p className="text-xs text-gray-400 tracking-widest font-light">
              ENTERPRISE GRADE SECURITY
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        .delay-75 {
          animation-delay: 75ms;
        }

        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </>
  )
}

export default ResetPassword