import { formatApplicationId, formatDate } from '../utils'
import { StatusBadge } from './StatusBadge'

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

interface RequestsMobileViewProps {
  requests: RestorationRequest[]
  handleReviewClick: (request: RestorationRequest, action: 'approve' | 'reject' | 'delete') => void
}

export function RequestsMobileView({ requests, handleReviewClick }: RequestsMobileViewProps) {
  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div 
          key={req._id} 
          className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            {req.applicationId ? (
              <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                {formatApplicationId(req.applicationId._id)}
              </span>
            ) : (
              <span className="text-gray-400 text-xs italic">Application Deleted</span>
            )}
            <StatusBadge status={req.status} />
          </div>
          <div className="space-y-3 mb-4">
            <div>
              <span className="text-sm text-gray-600 font-light">Applicant</span>
              <div className="font-semibold text-gray-900">
                {req.applicationId?.userId ? 
                  `${req.applicationId.userId.firstName} ${req.applicationId.userId.lastName}` : 
                  'N/A'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 font-light">Requested By</span>
              <div className="font-semibold text-gray-900">
                {req.requestedBy?.firstName} {req.requestedBy?.lastName}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 font-light">Reason</span>
              <div className="text-sm text-gray-900">{req.reason}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600 font-light">Requested</span>
              <div className="text-sm text-gray-900">{formatDate(req.createdAt)}</div>
            </div>
          </div>
          {req.status === 'pending' && req.applicationId && (
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleReviewClick(req, 'approve')}
                className="w-full px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
              >
                Approve Restoration
              </button>
              <button
                onClick={() => handleReviewClick(req, 'reject')}
                className="w-full px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleReviewClick(req, 'delete')}
                className="w-full px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200"
              >
                Permanently Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}