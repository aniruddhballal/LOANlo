import { useState, useEffect } from 'react'
import { X, FileText, Clock, MessageSquare, File, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../../../api'
import type { LoanApplication, ApprovalData } from './types'
import { getRequiredDocuments } from '../../utils'
import ApplicationDetailsTab from './tabs/ApplicationDetailsTab'    // done
import DocumentsTab from './tabs/DocumentsTab'
import StatusHistoryTab from './tabs/StatusHistoryTab'              // done
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
      setActiveTab('details') // Reset to first tab when modal opens
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
        // If documents array doesn't exist, create it with standard requirements
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

  // In your parent component, update the function signature to make parameters optional:
  const handleStatusUpdate = async (
    status: 'approved' | 'rejected' | 'under_review',
    comment?: string,
    approvalData?: ApprovalData
  ) => {
    setActionLoading(status)
    try {
      const payload = {
        status,
        comment: comment || '',  // Provide default empty string
        ...(status === 'approved' && approvalData && { approvalDetails: approvalData }),
        ...(status === 'rejected' && { rejectionReason: comment || '' })
      }
      const { data } = await api.put(`/loans/underwriter/update-status/${applicationId}`, payload)
      if (data.success) {
        await fetchApplicationDetails()
        onApplicationUpdated()
        if (status !== 'under_review') {
          // Switch to details tab before closing modal
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
    // Refresh the application data after document changes
    await fetchApplicationDetails()
    // Also refresh the parent list
    onApplicationUpdated()
  }

  const handleRequestAdditionalDocuments = async () => {
    setActionLoading('pending')
    try {
      const payload = {
        status: 'pending',
        comment: comment || 'Additional documents requested',
        additionalDocumentsRequested: true,  // Set the new field to true
        documentsUploaded: false  // Add this line to set documentsUploaded to false
      }

      const { data } = await api.put(`/loans/underwriter/update-status/${applicationId}`, payload)
      if (data.success) {
        await fetchApplicationDetails()
        setComment('')
        setActiveTab('details') // Switch to application details tab
        
        // Show success message
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
        onApplicationUpdated() // Refresh the parent list
        onClose() // Close the modal
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      setError('Failed to delete application')
    }
  }

  // Check if application is ready for underwriter actions
  const canPerformActions = application?.status === 'under_review'
  // Only underwriters can see actions
  const canShowActionsTab = isUnderwriter && application?.status === 'under_review'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Loan Application Review
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {application ? `Application #${application._id.slice(-8).toUpperCase()}` : 'Loading...'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900" />
                <span className="ml-3 text-gray-600">Loading application details...</span>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
                  {error}
                </div>
              </div>
            ) : application ? (
              <>
                {/* Status Warning for Pending Applications - Only for Underwriters */}
                {application.status === 'pending' && isUnderwriter && !showSuccessMessage && showWarningMessage && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>Application Not Submitted:</strong> The applicant needs to submit the application before it can be reviewed.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowWarningMessage(false)}
                        className="text-yellow-400 hover:text-yellow-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {showSuccessMessage && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            <strong>Success!</strong> {successMessage}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSuccessMessage(false)}
                        className="text-green-400 hover:text-green-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                  {[
                    { id: 'details', label: 'Application Details', icon: FileText },
                    { id: 'documents', label: 'Document Status', icon: File },
                    { id: 'history', label: 'Status History', icon: Clock },
                    ...(canShowActionsTab ? [{ id: 'actions', label: 'Actions', icon: MessageSquare }] : [])
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
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
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Actions Not Available
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Underwriter actions are only available when the application status is "Under Review". 
                        The applicant must submit their application first.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}