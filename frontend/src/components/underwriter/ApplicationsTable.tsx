import { ArrowUpDown, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import type { LoanApplication, SortConfig } from '../types'
import { StatusBadge } from '../dashboards/shared/StatusBadge'
import { formatCurrency, formatDate, formatTime, formatApplicationId } from '../utils'

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
    return <ArrowUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
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
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(234, 179, 8, 0); }
        }
        
        .shimmer-button {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transform: translateX(-100%);
          transition: transform 0.6s;
        }
        
        .shimmer-button:hover::before {
          animation: shimmer 0.7s ease-in-out;
        }
        
        .table-row-animate {
          animation: fadeIn 0.3s ease-out backwards;
        }
        
        .avatar-glow {
          box-shadow: 0 0 0 0 rgba(17, 24, 39, 0.1);
          transition: box-shadow 0.3s ease;
        }
        
        .avatar-glow:hover {
          box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.1);
        }
        
        .pending-pulse {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>
      
      <div className="overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <tr>
                  <th 
                    onClick={() => handleSort('reference')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      LOAN APPLICATION ID
                      <SortIcon columnKey="reference" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('applicant')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      Applicant Name
                      <SortIcon columnKey="applicant" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Loan Type
                  </th>
                  <th 
                    onClick={() => handleSort('amount')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      Amount Requested
                      <SortIcon columnKey="amount" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      Status of Loan
                      <SortIcon columnKey="status" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('submitted')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      Initiated
                      <SortIcon columnKey="submitted" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app, index) => (
                  <tr 
                    key={app._id} 
                    className="hover:bg-gray-50/70 transition-all duration-200 group table-row-animate"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-gray-900 px-3 py-1.5 text-xs font-normal">
                        {formatApplicationId(app._id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md avatar-glow">
                          {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-gray-950 transition-colors">
                            {app.userId?.firstName} {app.userId?.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {app.loanType?.name.toUpperCase() || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 text-lg group-hover:text-gray-950 transition-colors">
                        {formatCurrency(app.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="font-medium">{formatDate(app.createdAt)}</div>
                      <div className="text-xs text-gray-500 font-light">
                        {formatTime(app.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {showDeleted ? (
                        pendingRestorationRequests.has(app._id) ? (
                          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg pending-pulse">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs font-semibold text-yellow-700">
                              Awaiting Review
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequestRestoration(app._id)}
                            className="shimmer-button px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
                          >
                            Request Admin
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleReviewClick(app._id)}
                          className="shimmer-button px-4 py-2 text-xs font-semibold bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
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
          {applications.map((app, index) => (
            <div 
              key={app._id} 
              className="border border-gray-200 rounded-2xl p-6 hover:bg-gray-50/70 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group table-row-animate"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md avatar-glow">
                    {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      {app.userId?.firstName} {app.userId?.lastName}
                    </div>
                    <span className="font-mono text-gray-900 px-2.5 py-1 text-xs font-normal">
                      {formatApplicationId(app._id)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Amount</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(app.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Email</span>
                  <span className="text-sm text-gray-900 font-medium">{app.userId?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Phone</span>
                  <span className="text-sm text-gray-900 font-medium">{app.userId?.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Submitted</span>
                  <span className="text-sm text-gray-900 font-medium">{formatDate(app.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-5 border-t border-gray-100">
                {showDeleted ? (
                  pendingRestorationRequests.has(app._id) ? (
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl pending-pulse">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-700">
                        Awaiting Review
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestRestoration(app._id)}
                      className="shimmer-button flex-1 px-5 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      Request Admin
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleReviewClick(app._id)}
                    className="shimmer-button flex-1 px-5 py-3 text-sm font-semibold bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}