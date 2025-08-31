import type { LoanApplication } from './types'
import { formatDate, getStatusColor } from './utils'

interface StatusHistoryTabProps {
  application: LoanApplication
}

export default function StatusHistoryTab({ application }: StatusHistoryTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Status Timeline</h3>
      <div className="space-y-4">
        {application.statusHistory.map((entry, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className={`w-3 h-3 rounded-full mt-2 ${entry.status === 'approved' ? 'bg-green-500' : entry.status === 'rejected' ? 'bg-red-500' : entry.status === 'under_review' ? 'bg-blue-500' : 'bg-amber-500'}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                  {entry.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-gray-500 font-medium">{formatDate(entry.timestamp)}</span>
              </div>
              {entry.comment && (
                <p className="text-gray-700 mt-2 font-medium">{entry.comment}</p>
              )}
              {entry.updatedBy && (
                <p className="text-sm text-gray-500 mt-1">Updated by: {entry.updatedBy}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}