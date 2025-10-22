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

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (reason.trim().length < 10) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(reason)
      setReason('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Request Restoration
        </h3>
        <p className="text-gray-600 mb-4">
          Submit a restoration request for this deleted loan application. A system administrator will review and approve or reject your request.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Restoration <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this application should be restored (minimum 10 characters)..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 resize-none"
            rows={4}
            autoFocus
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            {reason.length}/500 characters
          </p>
        </div>
        {error && reason.length > 0 && reason.length < 10 && (
          <p className="text-sm text-red-600 mb-4">
            Reason must be at least 10 characters long
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={reason.trim().length < 10 || isSubmitting}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              reason.trim().length >= 10 && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  )
}