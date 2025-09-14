import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Shield, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import CaptchaModal from './CaptchaModal' // Import the CAPTCHA component
import axios from "axios"

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)
  
  // CAPTCHA states
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<{email: string, password: string} | null>(null)

  const { login, completeLogin, user } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Show CAPTCHA modal before proceeding with login
    setPendingFormData({ email: formData.email, password: formData.password })
    setShowCaptcha(true)
  }

  const handleCaptchaSuccess = async () => {
    setCaptchaVerified(true)
    setShowCaptcha(false)
    
    if (!pendingFormData) return
    
    setLoading(true)

    try {
      // Login without setting user state immediately
      await login(pendingFormData.email, pendingFormData.password)
      
      // Show success animation
      setLoginSuccess(true)
      
      setTimeout(() => {
        completeLogin()
        // Note: Removed sessionStorage usage as per artifact restrictions
        
        // Redirect based on role
        if (user?.role) {
          navigate(`/dashboard/${user.role}`)
        } else {
          navigate('/dashboard/applicant') // fallback
        }
      }, 1000) // Match your animation duration
    } catch (err: unknown) {
      let errorMsg = "Login failed"

      if (axios.isAxiosError(err)) {
        // Axios error type guard
        errorMsg = err.response?.data?.message || err.message
      } else if (err instanceof Error) {
        // Regular JS error
        errorMsg = err.message
      }

      setError(errorMsg)
      setLoading(false)
      setLoginSuccess(false)
    }
    
    setPendingFormData(null)
  }

  const handleCaptchaFail = () => {
    setCaptchaVerified(false)
    setShowCaptcha(false)
    setPendingFormData(null)
    setError('CAPTCHA verification failed. Please try again.')
  }

  const handleCaptchaClose = () => {
    setShowCaptcha(false)
    setPendingFormData(null)
    setCaptchaVerified(false)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Success Animation Overlay */}
        {loginSuccess && (
          <div className="fixed inset-0 bg-green-500/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-green-200 animate-in zoom-in duration-500 delay-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">Authentication Successful!</h3>
                <p className="text-green-700 text-sm">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-lg relative z-10">
          {/* Corporate Header */}
          <div className={`text-center mb-12 transition-all duration-700 ${loginSuccess ? 'opacity-50 scale-95' : ''}`}>
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
         
          {/* Main Authentication Card */}
          <div className={`bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-700 ${
            loginSuccess ? 'opacity-50 scale-95 border-green-300 shadow-green-100' : ''
          }`}>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-10 py-8 border-b border-gray-100">
              <h2 className="text-2xl font-light text-gray-900 text-center tracking-wide">
                Account Authentication
              </h2>
              <p className="text-gray-500 text-center mt-2 text-sm">
                Please provide your credentials to access the system
              </p>
              {/* CAPTCHA indicator */}
              {captchaVerified && (
                <div className="mt-3 flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Security verification completed</span>
                </div>
              )}
            </div>
           
            <div className="px-10 py-8">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start space-x-3 transition-all duration-300">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-red-700 text-sm font-medium">{error}</div>
                </div>
              )}
             
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className={`block text-sm font-medium tracking-wide transition-colors duration-300 ${
                    loginSuccess ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    EMAIL ADDRESS
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 transition-colors duration-300 ${
                        loginSuccess ? 'text-green-600' :
                        focusedField === 'email' ? 'text-gray-700' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      disabled={loading}
                      className={`block w-full pl-12 pr-4 py-4 border rounded-2xl
                               focus:ring-0 focus:outline-none
                               font-medium text-sm tracking-wide
                               transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               ${loginSuccess ? 
                                 'border-green-300 bg-green-50 text-green-900 placeholder-green-600' :
                                 'border-gray-200 focus:border-gray-400 hover:border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                               }`}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className={`block text-sm font-medium tracking-wide transition-colors duration-300 ${
                    loginSuccess ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    PASSWORD
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors duration-300 ${
                        loginSuccess ? 'text-green-600' :
                        focusedField === 'password' ? 'text-gray-700' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      disabled={loading}
                      className={`block w-full pl-12 pr-14 py-4 border rounded-2xl
                               focus:ring-0 focus:outline-none
                               font-medium text-sm tracking-wide
                               transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               ${loginSuccess ? 
                                 'border-green-300 bg-green-50 text-green-900 placeholder-green-600' :
                                 'border-gray-200 focus:border-gray-400 hover:border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                               }`}
                      placeholder="Enter your password"
                      required
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className={`h-5 w-5 transition-colors duration-200 ${
                          loginSuccess ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-600'
                        }`} />
                      ) : (
                        <Eye className={`h-5 w-5 transition-colors duration-200 ${
                          loginSuccess ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-600'
                        }`} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || loginSuccess}
                    className={`relative w-full flex items-center justify-center py-4 px-6
                             border rounded-2xl text-white font-medium text-sm tracking-wider
                             transition-all duration-300 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-offset-2
                             ${loginSuccess ?
                               'bg-green-600 border-green-600 focus:ring-green-300 shadow-lg transform scale-105' :
                               loading ?
                                 'bg-gray-800 border-gray-800 opacity-90' :
                                 'bg-gray-900 border-gray-900 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 focus:ring-gray-300'
                             }
                             disabled:opacity-75 disabled:hover:transform-none 
                             disabled:hover:shadow-none disabled:hover:bg-gray-900`}
                  >
                    {loginSuccess ? (
                      <div className="flex items-center justify-center animate-in fade-in zoom-in duration-500">
                        <CheckCircle className="w-5 h-5 mr-3" />
                        <span>AUTHENTICATED</span>
                      </div>
                    ) : loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                        <span>AUTHENTICATING</span>
                        <div className="ml-3 flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce opacity-60"></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75 opacity-80"></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="transition-all duration-300">
                          AUTHENTICATE
                        </span>
                        <ArrowRight className="ml-3 h-4 w-4 transition-all duration-300" />
                      </div>
                    )}
                  </button>
                </div>
              </form>

              {/* Sign Up Link */}
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm tracking-wide">
                  New to the platform?{' '}
                  <a
                    href="/register"
                    className="relative text-gray-900 font-medium transition-all duration-300
                             focus:outline-none group hover:text-gray-700"
                    style={{ color: 'black', textDecoration: 'none' }}
                  >
                    Create Your Account
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
          <div className={`text-center mt-8 opacity-60 transition-all duration-700 ${loginSuccess ? 'opacity-30' : ''}`}>
            <p className="text-xs text-gray-400 tracking-widest font-light">
              ENTERPRISE GRADE SECURITY
            </p>
          </div>
        </div>
      </div>

      {/* CAPTCHA Modal */}
      <CaptchaModal
        isOpen={showCaptcha}
        onClose={handleCaptchaClose}
        onSuccess={handleCaptchaSuccess}
        onFail={handleCaptchaFail}
        title="Security Verification"
        description="Please solve this simple math problem to verify you're human"
      />
    </>
  )
}

export default Login