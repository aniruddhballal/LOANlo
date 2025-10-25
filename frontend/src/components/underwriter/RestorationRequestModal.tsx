import { useState } from 'react'

interface RestorationRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
  error: string | null
}

export function RestorationRequestModal({
  isOpen,
  onClose,
  onSubmit,
  error
}: RestorationRequestModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  if (!isOpen) return null

  const handleSubmit = async () => {
    if (reason.trim().length < 10) return
   
    setIsSubmitting(true)
    try {
      await onSubmit(reason)
      setIsSuccess(true)
      setReason('')
      setTimeout(() => {
        handleClose()
      }, 2500)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setIsSuccess(false)
    onClose()
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes checkmark {
          0% { 
            opacity: 0;
            stroke-dasharray: 0, 100;
          }
          50% {
            opacity: 1;
          }
          100% { 
            opacity: 1;
            stroke-dasharray: 100, 0;
          }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes counter-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-checkmark {
          animation: checkmark 0.6s ease-out forwards;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .counter-pop {
          animation: counter-pop 0.2s ease-out;
        }
        
        .focus-glow:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1),
                      0 0 20px rgba(59, 130, 246, 0.1);
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp">
          {isSuccess ? (
            <div className="px-8 py-12 text-center animate-scaleIn">
              <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative animate-bounce-subtle">
                <div className="absolute inset-0 rounded-full bg-green-400/30 animate-pulse-ring"></div>
                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
                <svg className="w-10 h-10 text-green-600 relative z-10 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
                Request Submitted
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                Your restoration request has been submitted successfully and is pending administrator review.
              </p>
            </div>
          ) : (
            <>
              <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
                  Request Application Restoration
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Submit a restoration request for this deleted loan application. A system administrator will review your request and take appropriate action.
                </p>
              </div>

              <div className="px-8 py-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Justification for Restoration
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a detailed explanation for why this application should be restored. Include any relevant business context or justification..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-glow outline-none text-gray-900 resize-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-400"
                    rows={5}
                    maxLength={500}
                    autoFocus
                    disabled={isSubmitting}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs font-medium transition-all duration-200 ${
                      reason.length < 10 ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {reason.length < 10 ? `Minimum 10 characters required` : '✓ Minimum length requirement met'}
                    </p>
                    <p className="text-xs text-gray-400 counter-pop" key={reason.length}>
                      {reason.length}/500
                    </p>
                  </div>
                </div>

                {error && reason.length > 0 && reason.length < 10 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slideUp">
                    <p className="text-sm text-red-700 font-medium">
                      {error}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="relative flex-1 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                >
                  <span className="relative z-10">Cancel</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={reason.trim().length < 10 || isSubmitting}
                  className={`relative flex-1 px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 group ${
                    reason.trim().length >= 10 && !isSubmitting
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gray-300 cursor-not-allowed hover:cursor-[not-allowed]'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">Submit Request</span>
                      {reason.trim().length >= 10 && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}