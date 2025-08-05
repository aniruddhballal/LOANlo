import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-50 rounded-full blur-3xl animate-pulse opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-100 rounded-full blur-3xl animate-pulse delay-1000 opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-50 rounded-full blur-3xl animate-pulse delay-500 opacity-20"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-black mb-3 tracking-tight">LOANalo</h1>
          <p className="text-gray-700 text-lg font-medium">Loan Origination System</p>
        </div>
        
        {/* Login Card */}
        <div className="bg-white rounded-2xl border-2 border-black shadow-2xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-black mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-lg border-2 border-red-600 bg-red-50 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-red-800 font-medium text-sm">{error}</div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none bg-white text-black placeholder-gray-500 transition-all duration-200"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none bg-white text-black placeholder-gray-500 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-black transition-colors duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-black transition-colors duration-200" />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button - Removed onClick, kept type="submit" */}
              <button 
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center py-3 px-4 border-2 border-black rounded-lg text-white bg-black font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden hover:shadow-lg"
                style={{ 
                  outline: 'none !important',
                  boxShadow: 'none !important',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.outline = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.border = '2px solid black'
                }}
                onBlur={(e: React.FocusEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.border = '2px solid black'
                }}
                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.border = '2px solid black'
                }}
              >
                {/* Subtle slide effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
                
                {/* Button content */}
                <div className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      <span className="tracking-wide">Signing in</span>
                      <div className="ml-2 flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="tracking-wide transition-all duration-300 group-hover:tracking-wider">Sign In</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:scale-110" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <a 
                  href="/register"
                  className="relative text-black font-semibold transition-all duration-300 focus:outline-none group no-underline"
                  style={{ color: 'black', textDecoration: 'none' }}
                >
                  Create one here
                  <span className="absolute left-0 bottom-[-2px] w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login