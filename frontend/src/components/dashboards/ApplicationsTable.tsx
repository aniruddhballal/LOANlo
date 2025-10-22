import { ArrowUpDown, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import type { LoanApplication, SortConfig } from './types'
import { StatusBadge } from './shared/StatusBadge'
import { formatCurrency, formatDate, formatTime, formatApplicationId } from './utils/formatters'

interface ApplicationsTableProps {
  applications: LoanApplication[]
  showDeleted: boolean
  pendingRestorationRequests: Set<string>
  sortConfig: SortConfig
  handleSort: (key: string) => void
  handleReviewClick: (id: string) => void
  handleRequestRestoration: (id: string) => void
}

const SortIcon = ({ columnKey, sortConfig }: { columnKey: string; sortConfig: SortConfig }) => {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />
  }
  return sortConfig.direction === 'asc' 
    ? <ChevronUp className="w-4 h-4 text-gray-900" />
    : <ChevronDown className="w-4 h-4 text-gray-900" />
}

export function ApplicationsTable({
  applications,
  showDeleted,
  pendingRestorationRequests,
  sortConfig,
  handleSort,
  handleReviewClick,
  handleRequestRestoration
}: ApplicationsTableProps) {
  return (
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th 
                  onClick={() => handleSort('reference')}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Reference
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th 
                  onClick={() => handleSort('amount')}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Amount
                    <SortIcon columnKey="amount" sortConfig={sortConfig} />
                  </div>
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
                  onClick={() => handleSort('submitted')}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Submitted
                    <SortIcon columnKey="submitted" sortConfig={sortConfig} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {showDeleted ? 'Restoration Status' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                      {formatApplicationId(app._id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {app.userId?.firstName} {app.userId?.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">{app.userId?.email}</div>
                      <div className="text-gray-600 font-light">{app.userId?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900 text-lg">
                      {formatCurrency(app.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>{formatDate(app.createdAt)}</div>
                    <div className="text-xs text-gray-500 font-light">
                      {formatTime(app.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {showDeleted ? (
                      pendingRestorationRequests.has(app._id) ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-700">
                            Awaiting Admin Review
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestRestoration(app._id)}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Request Admin
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleReviewClick(app._id)}
                        className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {applications.map((app) => (
          <div 
            key={app._id} 
            className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {app.userId?.firstName} {app.userId?.lastName}
                  </div>
                  <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                    {formatApplicationId(app._id)}
                  </span>
                </div>
              </div>
              <StatusBadge status={app.status} />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-light">Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(app.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-light">Email</span>
                <span className="text-sm text-gray-900">{app.userId?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-light">Phone</span>
                <span className="text-sm text-gray-900">{app.userId?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-light">Submitted</span>
                <span className="text-sm text-gray-900">{formatDate(app.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
              {showDeleted ? (
                pendingRestorationRequests.has(app._id) ? (
                  <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">
                      Awaiting Admin Review
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRequestRestoration(app._id)}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                  >
                    Request Admin
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleReviewClick(app._id)}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200"
                >
                  Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}