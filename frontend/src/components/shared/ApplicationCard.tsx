// components/shared/ApplicationCard.tsx
import { StatusBadge } from './StatusBadge'
import { formatCurrency, formatDate, formatApplicationId } from '../../utils/formatters'

interface BaseApplication {
  _id: string
  amount: number
  status: string
  createdAt: string
}

interface UnderwriterApplication extends BaseApplication {
  userId: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
}

interface ApplicantApplication extends BaseApplication {
  loanType: string
  documentsUploaded: boolean
}

interface ApplicationCardProps {
  application: UnderwriterApplication | ApplicantApplication
  onAction?: (id: string) => void
  actionLabel?: string
  isUnderwriter?: boolean
}

export const ApplicationCard = ({ 
  application, 
  onAction, 
  actionLabel = "Review",
  isUnderwriter = false 
}: ApplicationCardProps) => {
  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {isUnderwriter && 'userId' in application
              ? `${application.userId.firstName?.charAt(0)}${application.userId.lastName?.charAt(0)}`
              : 'A'}
          </div>
          <div>
            {isUnderwriter && 'userId' in application ? (
              <div className="font-semibold text-gray-900">
                {application.userId.firstName} {application.userId.lastName}
              </div>
            ) : (
              'loanType' in application && (
                <div className="font-semibold text-gray-900">{application.loanType}</div>
              )
            )}
            <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
              {formatApplicationId(application._id)}
            </span>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 font-light">Amount</span>
          <span className="font-semibold text-gray-900">{formatCurrency(application.amount)}</span>
        </div>
        {isUnderwriter && 'userId' in application && (
          <>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 font-light">Email</span>
              <span className="text-sm text-gray-900">{application.userId.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 font-light">Phone</span>
              <span className="text-sm text-gray-900">{application.userId.phone}</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 font-light">Submitted</span>
          <span className="text-sm text-gray-900">{formatDate(application.createdAt)}</span>
        </div>
      </div>

      {onAction && (
        <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
          <button 
            onClick={() => onAction(application._id)}
            className="flex-1 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}