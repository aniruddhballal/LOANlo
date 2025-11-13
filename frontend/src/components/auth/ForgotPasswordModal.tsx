import { useState } from 'react'
import { Mail, AlertCircle, CheckCircle, X } from 'lucide-react'
import api from '../../api'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/forgot-password', { email })
      setResetEmailSent(true)
      setTimeout(handleClose, 3000)
    } catch (err: unknown) {
      let errorMsg = "Failed to send reset email"

      // Check if err has a response property
      if (err && typeof err === "object" && "response" in err) {
        const resp = (err as any).response
        errorMsg = resp?.data?.message || resp?.statusText || errorMsg
      } else if (err instanceof Error) {
        errorMsg = err.message
      }

      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }


  const handleClose = () => {
    setEmail('')
    setError('')
    setResetEmailSent(false)
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden"
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        {resetEmailSent ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Email Sent!
            </h3>
            <p className="text-gray-600 text-sm">
              Check your email for password reset instructions
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100 relative">
              <button
                onClick={handleClose}
                disabled={loading}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-light text-gray-900 tracking-wide">
                Reset Password
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Enter your email to receive reset instructions
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div 
                  className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 flex items-start space-x-2"
                  style={{ animation: 'fadeInUp 0.3s ease-out' }}
                >
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-red-700 text-xs">{error}</div>
                </div>
              )}
              
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-medium text-gray-700 tracking-wide">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    disabled={loading}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl
                             focus:ring-0 focus:outline-none focus:border-gray-400 hover:border-gray-300
                             text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your email address"
                    required
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl
                           text-gray-700 font-medium text-sm hover:bg-gray-50
                           transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1 py-3 px-4 bg-gray-900 border border-gray-900 rounded-xl
                           text-white font-medium text-sm hover:bg-gray-800 hover:shadow-lg
                           transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default ForgotPasswordModal