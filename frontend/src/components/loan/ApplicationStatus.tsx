import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import api from '../../api'
import LoanReviewModal from './LoanReviewModal'
import { useAuth } from '../../context/AuthContext'
import { ApplicationStatusSkeleton } from '../ui/SkeletonComponents'

interface LoanApplication {
  _id: string
  loanType: string
  amount: number
  tenure: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  createdAt: string
  documentsUploaded: boolean
}

const ApplicationStatus = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const { user } = useAuth()

  let dashboardPath = "/dashboard/applicant"
  if (user?.role === "underwriter") {
    dashboardPath = "/dashboard/underwriter"
  } else if (user?.role === "system_admin") {
    dashboardPath = "/dashboard/system_admin"
  }

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/loans/my-applications')
      setApplications(data.applications)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationUpdated = () => {
    fetchApplications()
  }

  const handleSubmitForReview = async (applicationId: string) => {
    try {
      await api.patch(`/loans/${applicationId}/submit-for-review`)
      setApplications(applications.map(app => 
        app._id === applicationId 
          ? { ...app, status: 'under_review' as const }
          : app
      ))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit for review')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return (
        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
      case 'rejected': return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
      case 'under_review': return (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      )
      default: return (
        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
    
    switch (status) {
      case 'approved':
        return (
          <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Approved</span>
          </span>
        )
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Rejected</span>
          </span>
        )
      case 'under_review':
        return (
          <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>Under Review</span>
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Pending</span>
          </span>
        )
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatApplicationId = (id: string) => {
    return `#${id.slice(-8).toUpperCase()}`
  }

  if (loading) {
    return <ApplicationStatusSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `linear-gradient(30deg, transparent 40%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.02) 60%, transparent 60%),
                           linear-gradient(150deg, transparent 40%, rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.01) 60%, transparent 60%)`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Executive Header */}
        <div className="mb-12">
          <div className="border-l-4 border-gray-900 pl-6">
            <h1 className="text-4xl font-extralight text-gray-900 mb-3 tracking-tight">
              Loan Application 
              <span className="font-light text-gray-600 ml-3">Portfolio</span>
            </h1>
            <p className="text-gray-600 text-lg font-light">
              Comprehensive overview of your financial applications and their current status
            </p>
          </div>
        </div>
        
        {/* Error State */}
        {error && (
          <div className="mb-8 border-l-4 border-red-400 bg-red-50 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">System Alert</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {applications.length === 0 ? (
          <div className="text-center py-24">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-4">No Applications Found</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You haven't submitted any loan applications yet. Start your financial journey by applying for a loan that meets your needs.
              </p>
              <Link 
                to="/loan-application" 
                className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Begin Application Process
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Applications Section with Card Layout */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-1">All Applications</h2>
                    <p className="text-sm text-gray-600 font-light">Complete portfolio of your loan applications</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-700">
                        {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
                      </span>
                    </div>
                  </div>
                </div>
              </header>

              <div className="p-8">
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div 
                      key={app._id} 
                      className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200 group"
                    >
                      {/* Main Content Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-6 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              {getStatusIcon(app.status)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className="font-semibold text-gray-900 text-lg">{app.loanType}</h3>
                              {getStatusBadge(app.status)}
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <span className="font-light">Amount:</span>
                                <span className="font-semibold text-gray-900 text-lg">{formatCurrency(app.amount)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-light">Tenure:</span>
                                <span className="font-medium">{app.tenure} months</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-light">Reference:</span>
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                  {formatApplicationId(app._id)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-light">Submitted:</span>
                                <span className="font-medium">{formatDate(app.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          {app.documentsUploaded ? (
                            <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-white text-emerald-700 border-2 border-emerald-200 shadow-sm">
                              <div className="w-4 h-4 mr-2 bg-emerald-100 rounded-full flex items-center justify-center">
                                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                                </svg>
                              </div>
                              Documentation Complete
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-white text-amber-700 border-2 border-amber-200 shadow-sm">
                              <div className="w-4 h-4 mr-2 bg-amber-100 rounded-full flex items-center justify-center">
                                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                              </div>
                              Documents Pending
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => setSelectedApplication(app)}
                            className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Review Details
                          </button>

                          {!app.documentsUploaded ? (
                            <Link
                              to="/upload-documents"
                              state={{ applicationId: app._id }}
                              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-amber-700 border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 shadow-sm hover:shadow-md group"
                            >
                              <div className="w-4 h-4 mr-2 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200">
                                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                              </div>
                              Upload Documents
                              <svg width="12" height="12" className="ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                              </svg>
                            </Link>
                          ) : app.status === 'pending' ? (
                            <button
                              onClick={() => handleSubmitForReview(app._id)}
                              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Submit for Review
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <LoanReviewModal
              isOpen={!!selectedApplication}
              onClose={() => setSelectedApplication(null)}
              applicationId={selectedApplication?._id || ''}
              onApplicationUpdated={handleApplicationUpdated}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-between items-center">
          <Link 
            to={dashboardPath}
            className="inline-flex items-center px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Dashboard
          </Link>

          <div className="flex items-center space-x-4">
            <Link 
              to="/loan-application" 
              className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Submit New Application
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationStatus