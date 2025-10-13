import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Shield, ArrowRight, RefreshCw, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const EmailVerificationRequired = () => {
  const navigate = useNavigate()
  const { resendVerification } = useAuth()
  
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Get email from localStorage (set by the interceptor)
    const pendingEmail = localStorage.getItem('pendingVerificationEmail')
    if (pendingEmail) {
      setEmail(pendingEmail)
    } else {
      // If no email found, redirect to login
      navigate('/login')
    }
  }, [navigate])

  const handleResendVerification = async () => {
    setResending(true)
    setResendSuccess(false)
    setErrorMessage('')
    
    try {
      await resendVerification(email)
      setResendSuccess(true)
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  const handleGoToLogin = () => {
    localStorage.removeItem('pendingVerificationEmail')
    navigate('/login')
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

        {/* Verification Required Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          
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
                    We've sent a verification email to <strong>{email}</strong>. 
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

export default EmailVerificationRequired