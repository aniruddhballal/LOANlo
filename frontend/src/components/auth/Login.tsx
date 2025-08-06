import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

     try {
      await login(formData.email, formData.password)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6 relative">
      {/* Sophisticated background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0,0,0,0.02) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(0,0,0,0.02) 0%, transparent 50%)`
             }}>
        </div>
        <div className="absolute top-20 right-20 w-96 h-96 border border-gray-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 border border-gray-300 rounded-full opacity-15"></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Corporate Header */}
        <div className="text-center mb-12">
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
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-10 py-8 border-b border-gray-100">
            <h2 className="text-2xl font-light text-gray-900 text-center tracking-wide">
              Account Authentication
            </h2>
            <p className="text-gray-500 text-center mt-2 text-sm">
              Please provide your credentials to access the system
            </p>
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 tracking-wide">
                  EMAIL ADDRESS
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors duration-200 ${
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
                    className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl 
                             focus:ring-0 focus:border-gray-400 focus:outline-none 
                             bg-white text-gray-900 placeholder-gray-400 
                             transition-all duration-200 font-medium text-sm tracking-wide
                             hover:border-gray-300"
                    placeholder="Enter your corporate email address"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 tracking-wide">
                  PASSWORD
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
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    className="block w-full pl-12 pr-14 py-4 border border-gray-200 rounded-2xl 
                             focus:ring-0 focus:border-gray-400 focus:outline-none 
                             bg-white text-gray-900 placeholder-gray-400 
                             transition-all duration-200 font-medium text-sm tracking-wide
                             hover:border-gray-300"
                    placeholder="Enter your secure password"
                    required
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="relative w-full flex items-center justify-center py-4 px-6 
                           border border-gray-900 rounded-2xl text-white bg-gray-900 
                           font-medium text-sm tracking-wider transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5
                           focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                           overflow-hidden"
                  style={{ 
                    outline: 'none !important',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {loading ? (
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
                  Request Account Access
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
        <div className="text-center mt-8 opacity-60">
          <p className="text-xs text-gray-400 tracking-widest font-light">
            ENTERPRISE GRADE SECURITY
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login