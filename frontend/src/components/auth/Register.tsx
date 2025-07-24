import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Check } from 'lucide-react'
import styles from './Register.module.css'

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
  const [focusedField, setFocusedField] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
 
  const { register } = useAuth()
  
  const calculatePasswordStrength = (password: string) => {
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const isPasswordMatch = formData.confirmPassword && formData.password === formData.confirmPassword

  return (
    <div className={styles.container}>
      {/* Animated background elements */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>
      
      {/* Main container */}
      <div className={styles.mainCard}>
        {/* Logo/Header */}
        <div className={styles.header}>
          <h1 className={styles.logo}>LOANalo</h1>
          <p className={styles.subtitle}>Loan Origination System</p>
        </div>
        
        {/* Glass card */}
        <div className={styles.glassCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.description}>Join us and start your loan journey</p>
          </div>
          
          {/* Error display */}
          {error && (
            <div className={styles.errorContainer}>
              <AlertCircle className={styles.errorIcon} />
              <span className={styles.errorText}>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Name Fields Row */}
            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.label}>First Name</label>
                <div className={`${styles.inputWrapper} ${focusedField === 'firstName' ? styles.focused : ''}`}>
                  <User className={styles.inputIcon} />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField('')}
                    className={styles.input}
                    placeholder="John"
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.label}>Last Name</label>
                <div className={`${styles.inputWrapper} ${focusedField === 'lastName' ? styles.focused : ''}`}>
                  <User className={styles.inputIcon} />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField('')}
                    className={styles.input}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={`${styles.inputWrapper} ${focusedField === 'email' ? styles.focused : ''}`}>
                <Mail className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={styles.input}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Phone Number <span className={styles.optional}>(Optional)</span></label>
              <div className={`${styles.inputWrapper} ${focusedField === 'phone' ? styles.focused : ''}`}>
                <Phone className={styles.inputIcon} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  className={styles.input}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={`${styles.inputWrapper} ${focusedField === 'password' ? styles.focused : ''}`}>
                <Lock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={styles.input}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBars}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`${styles.strengthBar} ${
                          passwordStrength >= level ? styles.active : ''
                        } ${
                          passwordStrength >= 4 ? styles.strong : 
                          passwordStrength >= 2 ? styles.medium : styles.weak
                        }`}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthText}>
                    {passwordStrength >= 4 ? 'Strong' : 
                     passwordStrength >= 2 ? 'Medium' : 'Weak'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <div className={`${styles.inputWrapper} ${focusedField === 'confirmPassword' ? styles.focused : ''} ${isPasswordMatch ? styles.success : ''}`}>
                <Lock className={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  className={styles.input}
                  placeholder="Confirm your password"
                  required
                />
                <div className={styles.passwordActions}>
                  {isPasswordMatch && <Check className={styles.successIcon} size={18} />}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.passwordToggle}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
            >
              <span className={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </span>
              {!loading && <ArrowRight className={styles.buttonIcon} />}
              {loading && <div className={styles.spinner}></div>}
            </button>
          </form>

          {/* Login Link */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.link}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register