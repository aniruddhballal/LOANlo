import { useEffect, useState } from 'react'
import { DashboardLayout } from './shared/DashboardLayout'
import { UnderwriterTableSkeleton } from './shared/SkeletonComponents'
import { ErrorAlert } from './shared/ErrorAlert'
import { EmptyState } from './shared/EmptyState'
import { StatusBadge } from './shared/StatusBadge'
import { formatCurrency, formatDate, formatTime, formatApplicationId } from './utils/formatters'
import LoanReviewModal from '../loan/LoanReviewModal'
import api from '../../api'

interface LoanApplication {
  _id: string
  amount: number
  status: string
  createdAt: string
  userId: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
}

export default function UnderwriterDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/loans/all')
      if (data.success) {
        setApplications(data.applications)
      } else {
        setError('Failed to fetch loan applications')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedApplicationId(null)
  }

  const refreshApplications = async () => {
    try {
      const { data } = await api.get('/loans/all')
      if (data.success) {
        setApplications(data.applications)
      }
    } catch {
      setError('Server error')
    }
  }

  return (
    <DashboardLayout 
      title="Underwriter Dashboard"
      welcomeTitle="Welcome Back!"
      welcomeSubtitle="Successfully authenticated to Underwriter Panel"
    >
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-1">
                Loan Applications
              </h2>
              <p className="text-sm text-gray-600 font-light">
                Review and process submitted loan applications
              </p>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {loading 
                ? <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                : `${applications.length} ${applications.length === 1 ? "Application" : "Applications"}`}
            </div>
          </div>
        </header>
        
        <div className="p-8">
        {loading ? (
          <UnderwriterTableSkeleton rows={5} />
        ) : (
          <>
          
          {error && <ErrorAlert message={error} />}

          {!loading && applications.length === 0 && (
            <EmptyState 
              title="No Applications Found"
              description="There are currently no loan applications to review."
            />
          )}

          {!loading && applications.length > 0 && (
            <div className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
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
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {app.userId?.firstName} {app.userId?.lastName}
                                </div>
                                <div className="text-sm text-gray-600 font-light">
                                  {app.userId?.role}
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
                            <button 
                              onClick={() => handleReviewClick(app._id)}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Review
                            </button>
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
                      <button 
                        onClick={() => handleReviewClick(app._id)}
                        className="flex-1 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </>
          )}
        </div>
      </section>

      {modalOpen && selectedApplicationId && (
        <LoanReviewModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          applicationId={selectedApplicationId}
          onApplicationUpdated={refreshApplications}
          showActions={true}
          isUnderwriter={true}
        />
      )}
    </DashboardLayout>
  )
}