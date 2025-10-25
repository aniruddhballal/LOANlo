import { formatApplicationId, formatDate, formatTime } from '../../utils'
import { StatusBadge } from './StatusBadge'
import { SortIcon } from './SortIcon'

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

interface RequestsTableProps {
  requests: RestorationRequest[]
  sortConfig: { key: string | null; direction: 'asc' | 'desc' }
  handleSort: (key: string) => void
  handleReviewClick: (request: RestorationRequest, action: 'approve' | 'reject' | 'delete') => void
}

export function RequestsTable({ requests, sortConfig, handleSort, handleReviewClick }: RequestsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50/50 border-b border-gray-200">
          <tr>
            <th 
              onClick={() => handleSort('reference')}
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Loan Application ID
                <SortIcon columnKey="reference" sortConfig={sortConfig} />
              </div>
            </th>
            <th 
              onClick={() => handleSort('applicant')}
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Applicant
                <SortIcon columnKey="applicant" sortConfig={sortConfig} />
              </div>
            </th>
            <th 
              onClick={() => handleSort('requestedBy')}
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Requested By
                <SortIcon columnKey="requestedBy" sortConfig={sortConfig} />
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Restoration Request Reason
            </th>
            <th 
              onClick={() => handleSort('status')}
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Status
                <SortIcon columnKey="status" sortConfig={sortConfig} />
              </div>
            </th>
            <th 
              onClick={() => handleSort('requested')}
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Requested On
                <SortIcon columnKey="requested" sortConfig={sortConfig} />
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((req) => (
            <tr key={req._id} className="hover:bg-gray-50/50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                {req.applicationId ? (
                  <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                    {formatApplicationId(req.applicationId._id)}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs italic">Deleted</span>
                )}
              </td>
              <td className="px-6 py-4">
                {req.applicationId?.userId ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {req.applicationId.userId.firstName?.charAt(0)}{req.applicationId.userId.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {req.applicationId.userId.firstName} {req.applicationId.userId.lastName}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm italic">N/A</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div className="text-gray-900 font-medium">
                    {req.requestedBy?.firstName} {req.requestedBy?.lastName}
                  </div>
                  <div className="text-gray-600 text-xs">Underwriter</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate" title={req.reason}>
                  {req.reason}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={req.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <div>{formatDate(req.createdAt)}</div>
                <div className="text-xs text-gray-500 font-light">
                  {formatTime(req.createdAt)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {req.status === 'pending' && req.applicationId ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewClick(req, 'approve')}
                      className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReviewClick(req, 'reject')}
                      className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReviewClick(req, 'delete')}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {req.applicationId ? 'Reviewed' : 'App Deleted'}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}