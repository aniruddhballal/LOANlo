import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Mail, Shield, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const EmailVerification = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyEmail, resendVerification, user, logout } = useAuth()
  
  const token = searchParams.get('token')
  const hasToken = !!token
  
  // States
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired' | 'awaiting'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  
  const hasVerified = useRef(false)

  // Effect for token-based verification
  useEffect(() => {
    if (!hasToken) {
      // No token = user is waiting for verification
      setStatus('awaiting')
      
      // Redirect if no user or already verified
      if (!user) {
        navigate('/login')
        return
      }
      if (user.isEmailVerified) {
        navigate(`/dashboard/${user.role}`)
        return
      }
      return
    }

    // Has token = perform verification
    if (hasVerified.current) return

    const performVerification = async () => {
      hasVerified.current = true
      
      try {
        await verifyEmail(token)
        setStatus('success')
        
        // After successful verification, backend returns token and verifyEmail stores it
        // User state is also updated, so we can now redirect to dashboard
        setTimeout(() => {
          // Check if we now have a token (means auto-login was successful)
          const authToken = localStorage.getItem('token')
          if (authToken) {
            // Token exists, redirect to root which will figure out the correct dashboard
            navigate('/')
          } else {
            navigate('/login', { 
              state: { 
                message: 'Email verified successfully! Please log in to continue.',
                verified: true 
              } 
            })
          }
        }, 3000)
      } catch (error: any) {
        console.error('Verification error:', error)
        
        if (error.response?.data?.message) {
          const message = error.response.data.message
          
          if (message.toLowerCase().includes('already verified')) {
            setStatus('success')
            setTimeout(() => {
              const authToken = localStorage.getItem('token')
              if (authToken) {
                // Token exists, redirect to root which will figure out the correct dashboard
                navigate('/')
              } else {
                navigate('/login', { 
                  state: { 
                    message: 'Email verified successfully! Please log in to continue.',
                    verified: true 
                  } 
                })
              }
            }, 3000)
            return
          }
          
          setErrorMessage(message)
          
          if (message.toLowerCase().includes('expired')) {
            setStatus('expired')
          } else {
            setStatus('error')
          }
        } else {
          setStatus('error')
          setErrorMessage('Verification failed. Please try again.')
        }
      }
    }

    performVerification()
  }, [token, hasToken, user?.isEmailVerified])

  const handleResendVerification = async () => {
    setResending(true)
    setResendSuccess(false)
    setErrorMessage('')
    
    try {
      await resendVerification()
      setResendSuccess(true)
      if (status === 'awaiting') {
        // Don't override the message for awaiting state
      } else {
        setErrorMessage('A new verification email has been sent to your inbox.')
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  const handleGoToLogin = () => {
    if (status === 'awaiting') {
      logout() // Clear user state when going back from awaiting page
    }
    navigate('/login')
  }

  const handleGoToDashboard = () => {
    if (user) {
      navigate(`/dashboard/${user.role}`)
    }
  }

  // Show nothing while checking states
  if (status === 'awaiting' && !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
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

        {/* Verification Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* Verifying State */}
          {status === 'verifying' && hasToken && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-10 py-12 text-center border-b border-blue-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">
                  Verifying Your Email
                </h2>
                <p className="text-gray-600 text-base">
                  Please wait while we verify your email address...
                </p>
              </div>
              
              <div className="px-10 py-10 text-center">
                <div className="inline-flex items-center space-x-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium tracking-wide">PROCESSING VERIFICATION</span>
                </div>
              </div>
            </>
          )}

          {/* Awaiting Verification State (No Token) */}
          {status === 'awaiting' && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-10 py-12 text-center border-b border-blue-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6">
                  <Mail className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">
                  Email Verification Required
                </h2>
                <p className="text-gray-600 text-base">
                  Please verify your email to access your account
                </p>
              </div>
              
              <div className="px-10 py-10">
                <div className="mb-8 p-6 rounded-2xl border border-blue-200 bg-blue-50">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        Verification Email Sent
                      </h3>
                      <p className="text-blue-700 text-sm leading-relaxed mb-3">
                        We've sent a verification email to <strong>{user?.email}</strong>. 
                        Please check your inbox and click the verification link to activate your account.
                      </p>
                      {resendSuccess && (
                        <div className="p-3 rounded-lg bg-green-100 border border-green-200 mt-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <p className="text-green-800 text-xs font-medium">
                              New verification email sent! Please check your inbox.
                            </p>
                          </div>
                        </div>
                      )}
                      {errorMessage && (
                        <div className="p-3 rounded-lg bg-red-100 border border-red-200 mt-3">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <p className="text-red-800 text-xs font-medium">
                              {errorMessage}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-sm font-medium text-gray-700 tracking-widest">
                    WHAT TO DO NEXT
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Check your email inbox</p>
                        <p className="text-xs text-gray-600 mt-1">Look for an email from LOANLO</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Click the verification link</p>
                        <p className="text-xs text-gray-600 mt-1">This will activate your account</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Log in to your account</p>
                        <p className="text-xs text-gray-600 mt-1">After verification, you can access all features</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleResendVerification}
                    disabled={resending || resendSuccess}
                    className="relative w-full flex items-center justify-center py-4 px-6 
                             border border-gray-900 rounded-2xl text-white bg-gray-900 
                             font-medium text-sm tracking-wider transition-all duration-300 
                             hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                        <span>SENDING EMAIL...</span>
                      </>
                    ) : resendSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-3" />
                        <span>EMAIL SENT</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-3" />
                        <span>RESEND VERIFICATION EMAIL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGoToLogin}
                    className="relative w-full flex items-center justify-center py-4 px-6 
                             border border-gray-300 rounded-2xl text-gray-900 bg-white 
                             font-medium text-sm tracking-wider transition-all duration-300 
                             hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span>BACK TO LOGIN</span>
                    <ArrowRight className="ml-3 h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 p-4 rounded-xl border border-yellow-200 bg-yellow-50">
                  <p className="text-yellow-800 text-xs leading-relaxed">
                    <strong>Can't find the email?</strong> Check your spam or junk folder. 
                    If you still don't see it, try resending the verification email.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-10 py-12 text-center border-b border-green-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">
                  Email Verified Successfully
                </h2>
                <p className="text-gray-600 text-base">
                  Your account has been activated!
                </p>
              </div>
              
              <div className="px-10 py-10">
                <div className="mb-8 p-6 rounded-2xl border border-green-200 bg-green-50">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-green-900 mb-2">
                        Account Activated
                      </h3>
                      <p className="text-green-700 text-sm leading-relaxed">
                        Your email has been verified and your account is now fully active. 
                        You can now access all features of the LOANLO platform.
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
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Complete your profile</p>
                        <p className="text-xs text-gray-600 mt-1">Add additional information to get started</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Explore loan options</p>
                        <p className="text-xs text-gray-600 mt-1">Browse available loan products</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Submit your application</p>
                        <p className="text-xs text-gray-600 mt-1">Start your loan application process</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleGoToDashboard}
                    className="relative w-full flex items-center justify-center py-4 px-6 
                             border border-gray-900 rounded-2xl text-white bg-gray-900 
                             font-medium text-sm tracking-wider transition-all duration-300 
                             hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span>GO TO DASHBOARD</span>
                    <ArrowRight className="ml-3 h-4 w-4" />
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-4">
                  You will be automatically redirected in a few seconds...
                </p>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="bg-gradient-to-r from-red-50 to-rose-50 px-10 py-12 text-center border-b border-red-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-6">
                  <XCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">
                  Verification Failed
                </h2>
                <p className="text-gray-600 text-base">
                  We couldn't verify your email address
                </p>
              </div>
              
              <div className="px-10 py-10">
                <div className="mb-8 p-6 rounded-2xl border border-red-200 bg-red-50">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-red-900 mb-2">
                        Verification Error
                      </h3>
                      <p className="text-red-700 text-sm leading-relaxed">
                        {errorMessage || 'The verification link is invalid or has already been used.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGoToLogin}
                    className="relative w-full flex items-center justify-center py-4 px-6 
                             border border-gray-900 rounded-2xl text-white bg-gray-900 
                             font-medium text-sm tracking-wider transition-all duration-300 
                             hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span>GO TO LOGIN</span>
                    <ArrowRight className="ml-3 h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <>
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-10 py-12 text-center border-b border-yellow-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-6">
                  <Mail className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">
                  Link Expired
                </h2>
                <p className="text-gray-600 text-base">
                  Your verification link has expired
                </p>
              </div>
              
              <div className="px-10 py-10">
                <div className="mb-8 p-6 rounded-2xl border border-yellow-200 bg-yellow-50">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-900 mb-2">
                        Verification Link Expired
                      </h3>
                      <p className="text-yellow-700 text-sm leading-relaxed mb-4">
                        {errorMessage || 'Your verification link has expired for security reasons. Please request a new verification email.'}
                      </p>
                      {resendSuccess && (
                        <div className="p-3 rounded-lg bg-green-100 border border-green-200">
                          <p className="text-green-800 text-xs font-medium">
                            ✓ New verification email sent! Please check your inbox.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {user && !user.isEmailVerified && (
                    <button
                      onClick={handleResendVerification}
                      disabled={resending || resendSuccess}
                      className="relative w-full flex items-center justify-center py-4 px-6 
                               border border-gray-900 rounded-2xl text-white bg-gray-900 
                               font-medium text-sm tracking-wider transition-all duration-300 
                               hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                          <span>SENDING EMAIL...</span>
                        </>
                      ) : resendSuccess ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-3" />
                          <span>EMAIL SENT</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-3" />
                          <span>RESEND VERIFICATION EMAIL</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleGoToLogin}
                    className="relative w-full flex items-center justify-center py-4 px-6 
                             border border-gray-300 rounded-2xl text-gray-900 bg-white 
                             font-medium text-sm tracking-wider transition-all duration-300 
                             hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span>GO TO LOGIN</span>
                    <ArrowRight className="ml-3 h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50">
                  <p className="text-blue-800 text-xs leading-relaxed">
                    <strong>Need Help?</strong> If you continue to have issues, please contact our support team.
                  </p>
                </div>
              </div>
            </>
          )}

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

export default EmailVerification