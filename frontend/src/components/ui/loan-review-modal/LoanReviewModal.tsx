import { useState, useEffect } from 'react'
import { X, FileText, Clock, MessageSquare, FileUp, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../../../api'
import type { LoanApplication, ApprovalData } from './types'
import { getRequiredDocuments } from '../../utils'
import ApplicationDetailsTab from './tabs/ApplicationDetailsTab'
import DocumentsTab from './tabs/DocumentsTab'
import StatusHistoryTab from './tabs/StatusHistoryTab'
import ActionsTab from './tabs/ActionsTab'
import { useAuth } from '../../../context/AuthContext'

interface LoanReviewModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  onApplicationUpdated: () => void
}

export default function LoanReviewModal({ 
  isOpen, 
  onClose, 
  applicationId, 
  onApplicationUpdated, 
}: LoanReviewModalProps) {

  const { user } = useAuth()
  const isUnderwriter = user?.role === 'underwriter'

  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('details')
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showWarningMessage, setShowWarningMessage] = useState(true)

  useEffect(() => {
    if (isOpen && applicationId) {
      setActiveTab('details')
      setShowSuccessMessage(false)
      setShowWarningMessage(true)
      fetchApplicationDetails()
    }
  }, [isOpen, applicationId])

  const fetchApplicationDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/loans/details/${applicationId}`)
      if (data.success) {
        if (!data.application.documents) {
          data.application.documents = getRequiredDocuments()
        }
        setApplication(data.application)
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      setError('Failed to fetch application details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (
    status: 'approved' | 'rejected' | 'under_review',
    comment?: string,
    approvalData?: ApprovalData
  ) => {
    setActionLoading(status)
    try {
      const payload = {
        status,
        comment: comment || '',
        ...(status === 'approved' && approvalData && { approvalDetails: approvalData }),
        ...(status === 'rejected' && { rejectionReason: comment || '' })
      }
      const { data } = await api.put(`/loans/underwriter/update-status/${applicationId}`, payload)
      if (data.success) {
        await fetchApplicationDetails()
        onApplicationUpdated()
        if (status !== 'under_review') {
          setActiveTab('details')
          setTimeout(() => onClose(), 1500)
        }
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      setError('Failed to update application status')
    } finally {
      setActionLoading('')
    }
  }

  const handleDocumentUpdate = async () => {
    await fetchApplicationDetails()
    onApplicationUpdated()
  }

  const handleRequestAdditionalDocuments = async () => {
    setActionLoading('pending')
    try {
      const payload = {
        status: 'pending',
        comment: comment || 'Additional documents requested',
        additionalDocumentsRequested: true,
        documentsUploaded: false
      }

      const { data } = await api.put(`/loans/underwriter/update-status/${applicationId}`, payload)
      if (data.success) {
        await fetchApplicationDetails()
        setComment('')
        setActiveTab('details')
        
        setSuccessMessage('Additional documents have been requested successfully. The applicant has been notified.')
        setShowSuccessMessage(true)
        
        onApplicationUpdated()
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      setError('Failed to request additional documents')
    } finally {
      setActionLoading('')
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      const { data } = await api.delete(`/loans/${applicationId}`)
      if (data.success) {
        onApplicationUpdated()
        onClose()
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      setError('Failed to delete application')
    }
  }

  const canPerformActions = application?.status === 'under_review'
  const canShowActionsTab = isUnderwriter && application?.status === 'under_review'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with animation */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ 
          animation: 'fadeIn 0.3s ease-out',
          willChange: 'opacity'
        }}
      />
      
      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 relative"
          style={{ 
            animation: 'slideUpScale 0.4s ease-out',
            willChange: 'transform, opacity'
          }}
        >
          {/* Subtle gradient overlay at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600"></div>

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Loan Application Review
              </h2>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {application ? `Application #${application._id.toUpperCase()}` : 'Loading...'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="relative z-10 p-2 rounded-full transition-all duration-300 transform hover:rotate-90 hover:scale-110 hover:bg-gray-200/80 group"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-300" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
                <span className="ml-3 text-gray-600 font-medium">Loading application details...</span>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center p-6" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="text-red-700 bg-gradient-to-br from-red-50 to-red-50/50 border border-red-200 rounded-xl p-6 shadow-sm max-w-md">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              </div>
            ) : application ? (
              <>
                {/* Status Warning for Pending Applications */}
                {application.status === 'pending' && isUnderwriter && !showSuccessMessage && showWarningMessage && (
                  <div 
                    className="bg-gradient-to-r from-yellow-50 to-amber-50/50 border-l-4 border-yellow-400 p-4 backdrop-blur-sm"
                    style={{ animation: 'slideDown 0.4s ease-out' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-yellow-800">
                            <strong className="font-semibold">Application Not Submitted:</strong> The applicant needs to submit the application before it can be reviewed.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowWarningMessage(false)}
                        className="text-yellow-500 hover:text-yellow-600 transition-colors p-1 hover:bg-yellow-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {showSuccessMessage && (
                  <div 
                    className="bg-gradient-to-r from-green-50 to-emerald-50/50 border-l-4 border-green-400 p-4 backdrop-blur-sm"
                    style={{ animation: 'slideDown 0.4s ease-out' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-green-800">
                            <strong className="font-semibold">Success!</strong> {successMessage}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSuccessMessage(false)}
                        className="text-green-500 hover:text-green-600 transition-colors p-1 hover:bg-green-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm">
                  {[
                    { id: 'details', label: 'Application Details', icon: FileText },
                    { id: 'documents', label: 'Document Upload Status', icon: FileUp },
                    { id: 'history', label: 'Status History', icon: Clock },
                    ...(canShowActionsTab ? [{ id: 'actions', label: 'Actions', icon: MessageSquare }] : [])
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative flex items-center px-6 py-4 font-medium text-sm transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'text-gray-900 justify-center'
                            : 'text-gray-600 hover:text-gray-900 space-x-2'
                        }`}
                      >
                        {/* Active indicator - gradient underline */}
                        {activeTab === tab.id && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                          />
                        )}
                    
                        {/* Hover background */}
                        <div className={`absolute inset-0 transition-opacity duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-br from-gray-100/80 to-transparent opacity-100'
                            : 'bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100'
                        }`} />
                    
                        <Icon className={`w-4 h-4 relative z-10 transition-all duration-300 ${
                          activeTab === tab.id 
                            ? 'scale-110' 
                            : 'group-hover:scale-105 group-hover:rotate-12'
                        }`} />
                        {activeTab !== tab.id && (
                          <span className="relative z-10 transition-all duration-300 group-hover:tracking-wide">
                            {tab.label}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/30 to-white">
                  <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                    {activeTab === 'details' && (
                      <ApplicationDetailsTab 
                        application={application} 
                        onDelete={handleDeleteApplication} 
                      />
                    )}

                    {activeTab === 'documents' && (
                      <DocumentsTab 
                        application={application} 
                        onDocumentUpdate={handleDocumentUpdate}
                        isApplicant={!isUnderwriter}
                      />
                    )}

                    {activeTab === 'history' && (
                      <StatusHistoryTab application={application} />
                    )}

                    {activeTab === 'actions' && canShowActionsTab && (
                      <ActionsTab 
                        application={application}
                        onStatusUpdate={handleStatusUpdate}
                        onRequestAdditionalDocuments={handleRequestAdditionalDocuments}
                        error={error}
                        actionLoading={actionLoading}
                      />
                    )}

                    {/* Show message when actions tab is selected but not available */}
                    {activeTab === 'actions' && !canPerformActions && (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full mb-4 shadow-sm">
                          <AlertCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Actions Not Available
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                          Underwriter actions are only available when the application status is "Under Review". 
                          The applicant must submit their application first.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
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

        @keyframes slideUpScale {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        @keyframes expandWidth {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}