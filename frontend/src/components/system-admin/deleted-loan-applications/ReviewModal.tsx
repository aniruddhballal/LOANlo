import { formatApplicationId, formatCurrency } from '../../utils'

interface User {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
}

interface LoanApplication {
  _id: string
  amount: number
  status: string
  createdAt: string
  deletedAt?: string
  userId: User
}

interface RestorationRequest {
  _id: string
  applicationId: LoanApplication
  requestedBy: User
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: User
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
}

interface ReviewModalProps {
  isOpen: boolean
  selectedRequest: RestorationRequest | null
  actionType: 'approve' | 'reject' | 'delete' | null
  reviewNotes: string
  setReviewNotes: (notes: string) => void
  confirmText: string
  setConfirmText: (text: string) => void
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export function ReviewModal({
  isOpen,
  selectedRequest,
  actionType,
  reviewNotes,
  setReviewNotes,
  confirmText,
  setConfirmText,
  error,
  onClose,
  onConfirm
}: ReviewModalProps) {
  if (!isOpen || !selectedRequest) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {actionType === 'approve' && 'Approve Restoration Request'}
          {actionType === 'reject' && 'Reject Restoration Request'}
          {actionType === 'delete' && 'Permanently Delete Application'}
        </h3>

        {/* Application Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Application ID:</span>
              <div className="font-mono font-semibold text-gray-900">
                {formatApplicationId(selectedRequest.applicationId._id)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <div className="font-semibold text-gray-900">
                {formatCurrency(selectedRequest.applicationId.amount)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Applicant:</span>
              <div className="font-semibold text-gray-900">
                {selectedRequest.applicationId?.userId?.firstName} {selectedRequest.applicationId?.userId?.lastName}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Requested By:</span>
              <div className="font-semibold text-gray-900">
                {selectedRequest.requestedBy?.firstName} {selectedRequest.requestedBy?.lastName}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-600 text-sm">Restoration Reason:</span>
            <div className="text-gray-900 mt-1">{selectedRequest.reason}</div>
          </div>
        </div>

        {/* Action-specific content */}
        {actionType === 'approve' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-gray-900 resize-none"
              rows={3}
            />
          </div>
        )}

        {actionType === 'reject' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Explain why this restoration request is being rejected..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none text-gray-900 resize-none"
              rows={3}
              autoFocus
            />
          </div>
        )}

        {actionType === 'delete' && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action is irreversible!</p>
              <p className="text-red-700 text-sm">
                This will permanently delete the loan application and all associated data. 
                This action cannot be undone.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                autoFocus
              />
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={
              (actionType === 'reject' && reviewNotes.trim().length === 0) ||
              (actionType === 'delete' && confirmText !== 'DELETE')
            }
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              actionType === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : actionType === 'reject'
                ? reviewNotes.trim().length > 0
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-300 cursor-not-allowed'
                : confirmText === 'DELETE'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {actionType === 'approve' && 'Confirm Approval'}
            {actionType === 'reject' && 'Confirm Rejection'}
            {actionType === 'delete' && 'Permanently Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}