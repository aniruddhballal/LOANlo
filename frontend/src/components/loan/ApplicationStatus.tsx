import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import api from '../../api'
import LoanReviewModal from '../modals/LoanReviewModal'

interface LoanApplication {
  _id: string
  applicantName: string
  loanType: string
  amount: number
  purpose: string
  tenure: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  createdAt: string
  documentsUploaded: boolean
  statusHistory: Array<{
    status: string
    timestamp: string
    comment?: string
    updatedBy?: string
  }>
  rejectionReason?: string
  approvalDetails?: {
    approvedAmount: number
    interestRate: number
    tenure: number
    emi: number
  }
}

const ApplicationStatus = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean, 
    application: LoanApplication | null,
    confirmText?: string
  }>({
    show: false,
    application: null
  });

  useEffect(() => {
    fetchApplications()
  }, [])

  const role = localStorage.getItem("role") // or from Redux/auth context

  let dashboardPath = "/dashboard/applicant"; // default
  if (role === "underwriter") {
    dashboardPath = "/dashboard/underwriter";
  } else if (role === "system_admin") {
    dashboardPath = "/dashboard/system_admin";
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

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-900 border-green-200 shadow-sm'
      case 'rejected': return 'bg-red-50 text-red-900 border-red-200 shadow-sm'
      case 'under_review': return 'bg-blue-50 text-blue-900 border-blue-200 shadow-sm'
      default: return 'bg-amber-50 text-amber-900 border-amber-200 shadow-sm'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
      case 'rejected': return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
      case 'under_review': return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      )
      case 'pending': return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
      default: return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      await api.delete(`/loans/${applicationId}`)
      setApplications(applications.filter(app => app._id !== applicationId))
      setSelectedApplication(null)
      setDeleteConfirmation({ show: false, application: null, confirmText: '' })
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete application')
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Elegant animated background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 border border-gray-100 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 -right-32 w-64 h-64 border border-gray-200 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-24 left-1/4 w-48 h-48 border border-gray-150 rounded-full opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-2/3 right-1/4 w-32 h-32 border border-gray-100 rounded-full opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto border-4 border-gray-200 rounded-full animate-spin border-t-gray-900"></div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-gray-100 rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-light text-gray-900 tracking-wide">Loading Applications</h2>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
        
        {/* Error State with professional styling */}
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

        {/* Refined Empty State */}
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
            {/* Executive Summary */}
            <div className="mb-10">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-medium text-gray-900">Application Overview</h2>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-light text-gray-900">{applications.length}</div>
                        <div className="text-sm text-gray-600 font-medium">
                          {applications.length === 1 ? 'Application' : 'Applications'}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Executive Table */}
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-8 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Reference</th>
                          <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Loan Type</th>
                          <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Principal Amount</th>
                          <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Status</th>
                          <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Submitted</th>
                          <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Documentation</th>
                          <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {applications.map((app) => (
                          <tr key={app._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                                <span className="font-mono text-xs font-medium text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md tracking-wider">
                                  #{app._id.slice(-8).toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{app.loanType}</div>
                              <div className="text-xs text-gray-500 mt-1">{app.tenure} months tenure</div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="text-lg font-light text-gray-900">₹{app.amount.toLocaleString('en-IN')}</div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div
                                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusClasses(app.status)}`}
                              >
                                {getStatusIcon(app.status)}
                                <span>{formatStatus(app.status)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(app.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              {app.documentsUploaded ? (
                                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Complete
                                </div>
                              ) : (
                                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Pending
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <button 
                                  onClick={() => {
                                    setSelectedApplication(app)
                                  }}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Review
                                </button>
                                {!app.documentsUploaded && (
                                  <Link 
                                    to="/upload-documents" 
                                    state={{ applicationId: app._id }}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Upload
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <LoanReviewModal
            isOpen={!!selectedApplication}
            onClose={() => setSelectedApplication(null)}
            applicationId={selectedApplication?._id || ''}
            onApplicationUpdated={() => {
              // Add your refresh logic here, like refetching applications
              setSelectedApplication(null)
            }}
            showActions={false}
            />

          {/* Executive Delete Confirmation Modal */}
          {deleteConfirmation.show && deleteConfirmation.application && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300 ease-out"
              style={{
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-200 transform transition-all duration-300 ease-out"
                style={{
                  animation: 'slideInUp 0.3s ease-out'
                }}
              >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-gray-900">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 mt-1">This action requires your confirmation</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDeleteConfirmation({show: false, application: null, confirmText: ''})}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div className="space-y-6">
                    {/* Warning Message */}
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-red-800 font-medium">Permanent Action</h4>
                          <p className="text-red-700 text-sm mt-1">This operation cannot be undone. All associated data will be permanently removed.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Application Details */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Application to be Deleted</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Reference:</span>
                          <span className="font-mono text-sm font-medium text-gray-900 bg-white px-3 py-1 rounded border">
                            #{deleteConfirmation.application._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Loan Type:</span>
                          <span className="text-sm font-medium text-gray-900">{deleteConfirmation.application.loanType}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="text-sm font-medium text-gray-900">₹{deleteConfirmation.application.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusClasses(deleteConfirmation.application.status)}`}>
                            {getStatusIcon(deleteConfirmation.application.status)}
                            {formatStatus(deleteConfirmation.application.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Confirmation Text */}
                    <div className="text-center py-4">
                      <p className="text-gray-700 font-medium">Are you absolutely sure you want to proceed?</p>
                      <p className="text-sm text-gray-600 mt-1">Type <strong>DELETE</strong> below to confirm this action</p>
                      
                      <input
                        type="text"
                        placeholder="Type DELETE to confirm"
                        className="mt-4 w-full px-4 py-3 border border-gray-300 rounded-lg text-center font-mono text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 placeholder-gray-400"
                        onChange={(e) => setDeleteConfirmation({...deleteConfirmation, confirmText: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setDeleteConfirmation({show: false, application: null, confirmText: ''})}
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => handleDeleteApplication(deleteConfirmation.application!._id)}
                    disabled={deleteConfirmation.confirmText !== 'DELETE'}
                    className={`inline-flex items-center px-8 py-3 font-medium rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      deleteConfirmation.confirmText === 'DELETE'
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:shadow-md'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Permanently Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>
        )}

        {/* Executive Navigation */}
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

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default ApplicationStatus