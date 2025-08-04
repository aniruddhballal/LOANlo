import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  })
  if (error) setError('')
}

const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  setTimeout(() => {
    if (formData.email && formData.password) {
      console.log('Login successful:', formData)
      setLoading(false)
    } else {
      setError('Please fill in all fields')
      setLoading(false)
    }
  }, 1500)
}

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-100 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-100 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-50 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">LOANalo</h1>
          <p className="text-gray-800 text-sm font-medium">Loan Origination System</p>
        </div>
        
        <div className="rounded-lg border-2 border-gray-300 bg-white shadow-2xl">
          <div className="flex flex-col space-y-1.5 p-6 text-center">
            <h3 className="text-2xl font-bold text-black">Welcome Back</h3>
            <p className="text-sm text-gray-800">Sign in to your account</p>
          </div>
          
          <div className="p-6 pt-0 space-y-6">
            {error && (
              <div className="relative w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-sm">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 text-black mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-black font-medium">{error}</div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-black leading-none">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex h-12 w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-black placeholder:text-gray-600 focus:border-gray-500 focus:outline-none transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-black leading-none">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex h-12 w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 pl-10 pr-12 text-sm text-black placeholder:text-gray-600 focus:border-gray-500 focus:outline-none transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-700 hover:text-black rounded-md inline-flex items-center justify-center transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none w-full h-12 bg-black hover:bg-gray-800 text-white active:scale-[0.98] disabled:opacity-70 border-2 border-black"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && (
                    <ArrowRight className="w-4 h-4 transition-transform duration-200" />
                  )}
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  )}
                </span>
              </button>
            </div>

            <div className="text-center pt-6 border-t-2 border-gray-300">
  <p className="text-gray-800 text-sm">
    Don't have an account?{' '}
    <Link 
      to="/register"
      className="text-gray-700 font-semibold hover:text-black hover:underline transition-all duration-200"
    >
      Create one here
    </Link>
  </p>
</div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login