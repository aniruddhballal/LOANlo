import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Check, X, Shield, CheckCircle } from 'lucide-react'
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
  const [focusedField, setFocusedField] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  
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
      setError('Password confirmation does not match. Please verify both entries.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters for security compliance.')
      return
    }
  
    setLoading(true)
    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      })
      
      // Show success message
      if (result.requiresVerification) {
        setRegistrationSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Account registration failed. Please try again.')
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

  // Success screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-2xl relative z-10">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-10 py-12 text-center border-b border-green-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">
                Registration Successful
              </h2>
              <p className="text-gray-600 text-base">
                Welcome to LOANLO, {formData.firstName}!
              </p>
            </div>
            
            <div className="px-10 py-10">
              <div className="mb-8 p-6 rounded-2xl border border-blue-200 bg-blue-50">
                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-medium text-blue-900 mb-2">
                      Verify Your Email Address
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed mb-3">
                      We've sent a verification email to:
                    </p>
                    <p className="text-blue-900 font-medium text-sm mb-4">
                      {formData.email}
                    </p>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      Please check your inbox and click the verification link to activate your account. 
                      The link will expire in 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-medium text-gray-700 tracking-widest">
                  WHAT'S NEXT?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Check your email inbox</p>
                      <p className="text-xs text-gray-600 mt-1">Look for an email from LOANLO</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Click the verification link</p>
                      <p className="text-xs text-gray-600 mt-1">This will activate your account</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Start your loan application</p>
                      <p className="text-xs text-gray-600 mt-1">Access all features once verified</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 mb-8">
                <p className="text-yellow-800 text-xs leading-relaxed">
                  <strong>Didn't receive the email?</strong> Check your spam folder or contact support for assistance.
                </p>
              </div>

              <div className="pt-4">
                <a
                  href="/login"
                  className="relative w-full flex items-center justify-center py-4 px-6 
                           border border-gray-900 rounded-2xl text-white bg-gray-900 
                           font-medium text-sm tracking-wider transition-all duration-300 
                           hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>LOGIN TO CONTINUE</span>
                  <ArrowRight className="ml-3 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 opacity-60">
            <p className="text-xs text-gray-400 tracking-widest font-light">
              ENTERPRISE GRADE SECURITY
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-3xl relative z-10">
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
        
        {/* Main Registration Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-10 py-8 border-b border-gray-100">
            <h2 className="text-2xl font-light text-gray-900 text-center tracking-wide">
              Account Registration
            </h2>
            <p className="text-gray-500 text-center mt-2 text-sm">
              Complete the form below to establish your professional account
            </p>
          </div>
          
          <div className="px-10 py-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-8 p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start space-x-3 transition-all duration-300">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-700 text-sm font-medium">{error}</div>
              </div>
            )}
            
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="pb-2">
                  <h3 className="text-sm font-medium text-gray-700 tracking-widest">PERSONAL INFORMATION</h3>
                  <div className="mt-2 w-12 h-px bg-gray-300"></div>
                </div>
                
                {/* Name Fields Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 tracking-wide">
                      FIRST NAME
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === 'firstName' ? 'text-gray-700' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField('')}
                        onKeyPress={handleKeyPress}
                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl 
                                 focus:ring-0 focus:border-gray-400 focus:outline-none 
                                 bg-white text-gray-900 placeholder-gray-400 
                                 transition-all duration-200 font-medium text-sm tracking-wide
                                 hover:border-gray-300"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 tracking-wide">
                      LAST NAME
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === 'lastName' ? 'text-gray-700' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField('')}
                        onKeyPress={handleKeyPress}
                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl 
                                 focus:ring-0 focus:border-gray-400 focus:outline-none 
                                 bg-white text-gray-900 placeholder-gray-400 
                                 transition-all duration-200 font-medium text-sm tracking-wide
                                 hover:border-gray-300"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="pb-2">
                  <h3 className="text-sm font-medium text-gray-700 tracking-widest">CONTACT INFORMATION</h3>
                  <div className="mt-2 w-12 h-px bg-gray-300"></div>
                </div>

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
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl 
                               focus:ring-0 focus:border-gray-400 focus:outline-none 
                               bg-white text-gray-900 placeholder-gray-400 
                               transition-all duration-200 font-medium text-sm tracking-wide
                               hover:border-gray-300"
                      placeholder="Enter your professional email address"
                      required
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 tracking-wide">
                    PHONE NUMBER <span className="text-gray-400 font-normal">(OPTIONAL)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'phone' ? 'text-gray-700' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField('')}
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl 
                               focus:ring-0 focus:border-gray-400 focus:outline-none 
                               bg-white text-gray-900 placeholder-gray-400 
                               transition-all duration-200 font-medium text-sm tracking-wide
                               hover:border-gray-300"
                      placeholder="Enter your contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Security Credentials Section */}
              <div className="space-y-6">
                <div className="pb-2">
                  <h3 className="text-sm font-medium text-gray-700 tracking-widest">SECURITY CREDENTIALS</h3>
                  <div className="mt-2 w-12 h-px bg-gray-300"></div>
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
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-12 pr-14 py-4 border border-gray-200 rounded-2xl 
                               focus:ring-0 focus:border-gray-400 focus:outline-none 
                               bg-white text-gray-900 placeholder-gray-400 
                               transition-all duration-200 font-medium text-sm tracking-wide
                               hover:border-gray-300"
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
                  {formData.password && (
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
                    CONFIRM PASSWORD
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
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField('')}
                      onKeyPress={handleKeyPress}
                      className={`block w-full pl-12 pr-16 py-4 border rounded-2xl 
                                 focus:ring-0 focus:outline-none bg-white text-gray-900 
                                 placeholder-gray-400 transition-all duration-200 
                                 font-medium text-sm tracking-wide hover:border-gray-300 ${
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
                  {formData.confirmPassword && (
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
                  disabled={loading}
                  onClick={handleButtonClick}
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
                      <span>PROCESSING REGISTRATION</span>
                      <div className="ml-3 flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce opacity-60"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75 opacity-80"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="transition-all duration-300">
                        ESTABLISH ACCOUNT
                      </span>
                      <ArrowRight className="ml-3 h-4 w-4 transition-all duration-300" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm tracking-wide">
                Already have an account?{' '}
                <a 
                  href="/login"
                  className="relative text-gray-900 font-medium transition-all duration-300 
                           focus:outline-none group hover:text-gray-700"
                  style={{ color: 'black', textDecoration: 'none' }}
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
        <div className="text-center mt-8 opacity-60">
          <p className="text-xs text-gray-400 tracking-widest font-light">
            ENTERPRISE GRADE SECURITY
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register