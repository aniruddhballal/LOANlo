import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Check, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const { register } = useAuth()
  
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 6) strength += 1
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  
    if (error) setError('')
  }

  const handleSubmit = async () => {
    setError('')
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
  
    setLoading(true)
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      })
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    handleSubmit()
  }

  // Handle Enter key press on form inputs
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isPasswordMatch = formData.confirmPassword && formData.password === formData.confirmPassword
  const isPasswordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-50 rounded-full blur-3xl animate-pulse opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-100 rounded-full blur-3xl animate-pulse delay-1000 opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-50 rounded-full blur-3xl animate-pulse delay-500 opacity-20"></div>
      </div>
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-black mb-3 tracking-tight">LOANalo</h1>
          <p className="text-gray-700 text-lg font-medium">Loan Origination System</p>
        </div>
        
        {/* Register Card */}
        <div className="bg-white rounded-2xl border-2 border-black shadow-2xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-black mb-2">Create Account</h2>
              <p className="text-gray-600">Join us and start your loan journey</p>
            </div>
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-lg border-2 border-red-500 bg-red-50 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-red-800 font-medium text-sm">{error}</div>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-black mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none bg-white text-black placeholder-gray-500 transition-all duration-200"
                      placeholder="Aditya"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-black mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none bg-white text-black placeholder-gray-500 transition-all duration-200"
                      placeholder="Kumar"
                      required
                    />
                  </div>
                </div>
              </div>

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
                    onKeyPress={handleKeyPress}
                    className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none bg-white text-black placeholder-gray-500 transition-all duration-200"
                    placeholder="aditya.kumar@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-black mb-2">
                  Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none bg-white text-black placeholder-gray-500 transition-all duration-200"
                    placeholder="+91 98765 43210"
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
                    onKeyPress={handleKeyPress}
                    className="block w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none bg-white text-black placeholder-gray-500 transition-all duration-200"
                    placeholder="Create a strong password"
                    required
                    minLength={6}
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
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
                    <span className={`text-xs font-medium ${
                      passwordStrength >= 4 ? 'text-green-600' : 
                      passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {passwordStrength >= 4 ? 'Strong' : 
                       passwordStrength >= 2 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-black mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className={`block w-full pl-10 pr-16 py-3 border-2 rounded-lg focus:ring-0 focus:outline-none bg-white text-black placeholder-gray-500 transition-all duration-200 ${
                      isPasswordMatch 
                        ? 'border-green-500 focus:border-green-500' 
                        : isPasswordMismatch 
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                    {isPasswordMatch && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    {isPasswordMismatch && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <div
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="cursor-pointer focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-black transition-colors duration-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 hover:text-black transition-colors duration-200" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Password match status text */}
                {formData.confirmPassword && (
                  <div className="mt-1">
                    {isPasswordMatch ? (
                      <span className="text-xs font-medium text-green-600">Passwords match</span>
                    ) : (
                      <span className="text-xs font-medium text-red-600">Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                onClick={handleButtonClick}
                className="group relative w-full flex items-center justify-center py-3 px-4 border-2 border-black rounded-lg text-white bg-black font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden hover:shadow-lg"
                style={{ 
                  outline: 'none !important',
                  boxShadow: 'none !important',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.border = '2px solid black'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '2px solid black'
                }}
                onMouseOver={(e) => {
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
                      <span className="tracking-wide">Creating Account</span>
                      <div className="ml-2 flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="tracking-wide transition-all duration-300 group-hover:tracking-wider">Create Account</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:scale-110" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <a 
                  href="/login"
                  className="relative text-black font-semibold transition-all duration-300 focus:outline-none group no-underline"
                  style={{ color: 'black', textDecoration: 'none' }}
                >
                  Sign in here
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

export default Register