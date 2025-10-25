import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import api from '../../api'
import LoanReviewModal from '../loan/LoanReviewModal'
import { useAuth } from '../../context/AuthContext'
import { ApplicationStatusSkeleton } from '../ui/SkeletonComponents'

import { formatCurrency, formatDate, formatApplicationId } from '../utils'

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

  const [highlightedAppId, setHighlightedAppId] = useState<string | null>(null)
  const [animatingDocs, setAnimatingDocs] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    const state = location.state as { updatedApplicationId?: string } | null
    
    if (state?.updatedApplicationId && applications.length > 0) {
      setHighlightedAppId(state.updatedApplicationId)
      setAnimatingDocs(state.updatedApplicationId)
      
      setTimeout(() => {
        const element = document.getElementById(`app-${state.updatedApplicationId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      
      setTimeout(() => {
        setHighlightedAppId(null)
        setAnimatingDocs(null)
      }, 2500)
      
      window.history.replaceState({}, document.title)
    }
  }, [location.state, applications])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'APPROVED'
      case 'rejected': return 'REJECTED'
      case 'under_review': return 'UNDER REVIEW'
      default: return 'PENDING'
    }
  }

  if (loading) {
    return <ApplicationStatusSkeleton />
  }

  const styles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    @keyframes pulseGlow {
      0%, 100% {
        opacity: 0.5;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
    }

    @keyframes docPulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.02);
      }
    }

    .shimmer-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
      transform: translateX(-100%);
    }

    .group:hover .shimmer-line {
      animation: shimmer 1.5s ease-in-out;
    }

    .highlight-card {
      animation: pulseGlow 1.5s ease-out;
      background: linear-gradient(135deg, rgba(236, 253, 245, 0.4) 0%, rgba(209, 250, 229, 0.3) 100%);
      border-color: rgb(52, 211, 153);
    }

    .doc-pulse {
      animation: docPulse 0.5s ease-out;
    }
  `

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <style>{styles}</style>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Executive Header */}
        <div 
          className="mb-12"
          style={{ animation: 'fadeInUp 0.5s ease-out 0s both' }}
        >
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
          <div 
            className="mb-8 bg-white border border-red-200 rounded-xl p-5 shadow-sm"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {applications.length === 0 ? (
          <div 
            className="text-center py-24"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200 shadow-sm">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Applications Yet</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Start your journey by submitting your first loan application
              </p>
              <Link 
                to="/loan-application" 
                className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                New Application
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
        <div>
        {/* Applications Section with Card Layout */}
            <section 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
            >
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
                  {applications.map((app, index) => (
                <div
                  key={app._id}
                  id={`app-${app._id}`}
                  className={`group relative bg-white rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 overflow-hidden ${
                    highlightedAppId === app._id
                      ? 'highlight-card'
                      : 'border-gray-200'
                  }`}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${(index + 1) * 0.1}s both`
                  }}
                >
                  {/* Shimmer effect on hover */}
                  <div className="shimmer-line"></div>
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 p-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-xl tracking-tight">{app.loanType}</h3>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-300 hover:scale-105 ${getStatusColor(app.status)}`}>
                            {getStatusLabel(app.status)}
                          </span>
                        </div>
                        
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <span className="text-gray-500 text-xs">Amount</span>
                            <div className="font-semibold text-gray-900 text-lg">{formatCurrency(app.amount)}</div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-500 text-xs">Tenure</span>
                            <div className="font-medium text-gray-700">{app.tenure} months</div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-500 text-xs">Reference ID</span>
                            <div className="font-mono text-xs text-gray-800">
                                {formatApplicationId(app._id)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-500 text-xs">Submitted</span>
                            <div className="font-medium text-gray-700">{formatDate(app.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-4"></div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between">
                      <div className={animatingDocs === app._id ? 'doc-pulse' : ''}>
                        {app.documentsUploaded ? (
                          <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            Documentation Complete
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            Documents Pending
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSelectedApplication(app)}
                          className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5"
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
                            className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                            </svg>
                            Upload Documents
                          </Link>
                        )}
                      </div>
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

        {/* Navigation - Animated */}
        <div 
          className="mt-12 flex justify-between items-center"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
        >
          <Link 
            to={dashboardPath}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <Link 
            to="/loan-application" 
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            New Application
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ApplicationStatus