interface StatusBadgeProps {
  status: string
  showIcon?: boolean
}

export const StatusBadge = ({ status, showIcon = true }: StatusBadgeProps) => {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200'
      case 'under_review': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'rejected':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'under_review':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
          </svg>
        );
      case 'pending':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">?</text>
          </svg>
        );
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase()
  }

  return (
    <div className="flex items-center space-x-2">
      {showIcon && (
        <div className="w-4 h-4">
          {getStatusIcon(status)}
        </div>
      )}
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusClasses(status)}`}>
        {formatStatus(status)}
      </span>
    </div>
  )
}