import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react'
import type { LoanApplication, ApprovalData } from './types'
import { getDocumentProgress, getProgressBarColor } from './utils'

interface ActionsTabProps {
  application: LoanApplication
  onStatusUpdate: (status: 'approved' | 'rejected' | 'under_review') => Promise<void>
  error?: string | null
  actionLoading: string
}

export default function ActionsTab({ application, onStatusUpdate, error, actionLoading }: ActionsTabProps) {
  const [comment, setComment] = useState('')
  const [approvalData, setApprovalData] = useState<ApprovalData>({
    approvedAmount: 0,
    interestRate: 12,
    tenure: 0,
    emi: 0
  })

  useEffect(() => {
    setApprovalData({
      approvedAmount: application.amount,
      interestRate: 12,
      tenure: application.tenure,
      emi: 0
    })
  }, [application])

  const calculateEMI = () => {
    const { approvedAmount, interestRate, tenure } = approvalData
    if (approvedAmount > 0 && interestRate > 0 && tenure > 0) {
      const monthlyRate = interestRate / (12 * 100)
      const emi = (approvedAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                  (Math.pow(1 + monthlyRate, tenure) - 1)
      setApprovalData(prev => ({ ...prev, emi: Math.round(emi) }))
    }
  }

  useEffect(() => {
    calculateEMI()
  }, [approvalData.approvedAmount, approvalData.interestRate, approvalData.tenure])

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'under_review') => {
    await onStatusUpdate(status)
    if (status !== 'under_review') {
      setComment('')
    }
  }

  const documentProgress = getDocumentProgress(application.documents)
  const allRequiredDocsUploaded = documentProgress.percentage === 100

  if (!allRequiredDocsUploaded) {
    return (
      <div className="space-y-6">
        <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Review Actions</h3>
        
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Documents Required</h4>
              <p className="text-gray-600 mb-6">
                The applicant must upload all required documents before this application can be reviewed.
              </p>
            </div>

            {/* Corporate Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Document Progress</span>
                <span className="text-sm font-bold text-gray-900">
                  {documentProgress.uploaded}/{documentProgress.total} ({Math.round(documentProgress.percentage)}%)
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${getProgressBarColor(documentProgress.percentage)} relative`}
                  style={{ width: `${documentProgress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-medium mb-2">Required documents:</p>
              <ul className="text-left space-y-1">
                {application.documents?.filter(doc => doc.required && !doc.uploaded).map(doc => (
                  <li key={doc.type} className="flex items-center space-x-2">
                    <XCircle className="w-3 h-3 text-red-500" />
                    <span>{doc.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Review Actions</h3>
      
      {/* Comment Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
          Add Comment/Notes
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your review comments, notes, or feedback..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 resize-none text-black"
        />
      </div>

      {/* Approval Details */}
      {application.status !== 'approved' && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 uppercase tracking-wide">Approval Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                Approved Amount (₹)
              </label>
              <input
                type="number"
                value={approvalData.approvedAmount}
                onChange={(e) => setApprovalData(prev => ({ ...prev, approvedAmount: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-black font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={approvalData.interestRate}
                onChange={(e) => setApprovalData(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-black font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                Tenure (months)
              </label>
              <input
                type="number"
                value={approvalData.tenure}
                onChange={(e) => setApprovalData(prev => ({ ...prev, tenure: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-black font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                Calculated EMI (₹)
              </label>
              <input
                type="number"
                value={approvalData.emi}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-black font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {application.status !== 'under_review' && (
          <button
            onClick={() => handleStatusUpdate('under_review')}
            disabled={actionLoading !== ''}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-50 text-blue-800 border-2 border-blue-400 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {actionLoading === 'under_review' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-800 border-t-transparent" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>Mark Under Review</span>
          </button>
        )}

        {application.status !== 'approved' && (
          <button
            onClick={() => handleStatusUpdate('approved')}
            disabled={actionLoading !== '' || !comment.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-green-50 text-green-800 border-2 border-green-400 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {actionLoading === 'approved' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-800 border-t-transparent" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>Approve Application</span>
          </button>
        )}

        {application.status !== 'rejected' && (
          <button
            onClick={() => handleStatusUpdate('rejected')}
            disabled={actionLoading !== '' || !comment.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-800 border-2 border-red-400 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {actionLoading === 'rejected' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-800 border-t-transparent" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>Reject Application</span>
          </button>
        )}

        <button
          onClick={() => {/* Handle document request */}}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-50 text-gray-800 border-2 border-gray-400 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
        >
          <Upload className="w-4 h-4" />
          <span>Request Additional Documents</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}