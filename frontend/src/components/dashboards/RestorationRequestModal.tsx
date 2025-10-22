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
      // Auto-close after 2.5 seconds
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {isSuccess ? (
          // Success View
          <div className="px-8 py-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          // Form View
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 resize-none transition-shadow placeholder:text-gray-400"
                  rows={5}
                  maxLength={500}
                  autoFocus
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs font-medium ${
                    reason.length < 10 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {reason.length < 10 ? `Minimum 10 characters required` : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    {reason.length}/500
                  </p>
                </div>
              </div>

              {error && reason.length > 0 && reason.length < 10 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
                className="flex-1 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={reason.trim().length < 10 || isSubmitting}
                className={`flex-1 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all ${
                  reason.trim().length >= 10 && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}