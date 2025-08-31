import { useState, useEffect } from 'react'
import { X, FileText, Clock, MessageSquare, File } from 'lucide-react'
import api from '../../../api'
import type { LoanApplication, ApprovalData } from './types'
import { getRequiredDocuments } from './utils'
import ApplicationDetailsTab from './tabs/ApplicationDetailsTab'
import DocumentsTab from './tabs/DocumentsTab'
import StatusHistoryTab from './tabs/StatusHistoryTab'
import ActionsTab from './tabs/ActionsTab'

interface LoanReviewModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  onApplicationUpdated: () => void
  showActions?: boolean
}

export default function LoanReviewModal({ 
  isOpen, 
  onClose, 
  applicationId, 
  onApplicationUpdated, 
  showActions = true 
}: LoanReviewModalProps) {
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('details')
  const [comment, setComment] = useState('')
  const [approvalData, setApprovalData] = useState<ApprovalData>({
    approvedAmount: 0,
    interestRate: 0,
    tenure: 0,
    emi: 0
  })
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    if (isOpen && applicationId) {
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
        setApprovalData({
          approvedAmount: data.application.amount,
          interestRate: 12,
          tenure: data.application.tenure,
          emi: 0
        })
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      setError('Failed to fetch application details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'under_review') => {
    setActionLoading(status)
    try {
      const payload = {
        status,
        comment,
        ...(status === 'approved' && { approvalDetails: approvalData }),
        ...(status === 'rejected' && { rejectionReason: comment })
      }

      const { data } = await api.put(`/loans/update-status/${applicationId}`, payload)
      if (data.success) {
        await fetchApplicationDetails()
        setComment('')
        onApplicationUpdated()
        if (status !== 'under_review') {
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
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                  {[
                    { id: 'details', label: 'Application Details', icon: FileText },
                    { id: 'documents', label: 'Document Status', icon: File },
                    { id: 'history', label: 'Status History', icon: Clock },
                    ...(showActions ? [{ id: 'actions', label: 'Actions', icon: MessageSquare }] : [])
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
                    <ApplicationDetailsTab application={application} />
                  )}

                  {activeTab === 'documents' && (
                    <DocumentsTab application={application} />
                  )}

                  {activeTab === 'history' && (
                    <StatusHistoryTab application={application} />
                  )}

                  {activeTab === 'actions' && (
                    <ActionsTab 
                      application={application}
                      onStatusUpdate={handleStatusUpdate}
                      error={error}
                      actionLoading={actionLoading}
                    />
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