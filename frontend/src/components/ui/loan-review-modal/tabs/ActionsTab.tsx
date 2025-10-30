import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react'

import type { LoanApplication, ApprovalData } from '../types'
import { getDocumentProgress, getProgressBarColor } from '../../../utils'

interface ActionsTabProps {
  application: LoanApplication
  onStatusUpdate: (status: 'approved' | 'rejected' | 'under_review', comment?: string, approvalData?: ApprovalData) => Promise<void>
  onRequestAdditionalDocuments: () => void
  error?: string | null
  actionLoading: string
}

export default function ActionsTab({ application, onStatusUpdate, onRequestAdditionalDocuments, error, actionLoading }: ActionsTabProps) {
  const [comment, setComment] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
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
    await onStatusUpdate(status, comment, approvalData)
    if (status !== 'under_review') {
      setComment('')
    }
  }

  const documentProgress = getDocumentProgress(application.documents)
  const allRequiredDocsUploaded = documentProgress.percentage === 100

  if (!allRequiredDocsUploaded) {
    return (
      <div className="space-y-6">
        {/* Header with gradient underline */}
        <div className="relative pb-3" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          <h3 className="font-semibold text-gray-900 text-xl tracking-tight">Review Actions</h3>
          <div className="absolute bottom-0 left-0 w-24 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>
        </div>
        
        <div className="text-center py-12" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                <Upload className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Documents Required</h4>
              <p className="text-gray-600 mb-6">
                The applicant must upload all required documents before this application can be reviewed.
              </p>
            </div>

            {/* Progress Bar */}
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

            <div className="text-sm text-gray-500 bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg p-4 border border-gray-200 shadow-sm backdrop-blur-sm">
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
        
        <style>{`
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
        `}</style>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient underline */}
      <div className="relative pb-3" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
        <h3 className="font-semibold text-gray-900 text-xl tracking-tight">Review Actions</h3>
        <div className="absolute bottom-0 left-0 w-24 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>
      </div>
      
      {/* Comment Section */}
      <div className="group" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
        <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
          Add Comment/Notes
        </label>
        <div className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={() => setFocusedField('comment')}
            onBlur={() => setFocusedField(null)}
            placeholder="Add your review comments, notes, or feedback..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black transition-all duration-300 shadow-sm hover:shadow-md bg-white"
          />
          {focusedField === 'comment' && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
          )}
        </div>
      </div>

      {/* Approval Details */}
      {application.status !== 'approved' && (
        <div 
          className="relative bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden backdrop-blur-sm"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <h4 className="font-semibold text-gray-900 mb-4 uppercase tracking-wide text-sm">Approval Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group/field">
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide text-xs">
                  Approved Amount (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={approvalData.approvedAmount}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, approvedAmount: parseInt(e.target.value) || 0 }))}
                    onFocus={() => setFocusedField('amount')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium transition-all duration-300 shadow-sm hover:shadow bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {focusedField === 'amount' && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                  )}
                </div>
              </div>
              <div className="group/field">
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide text-xs">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={approvalData.interestRate}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    onFocus={() => setFocusedField('interest')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium transition-all duration-300 shadow-sm hover:shadow bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {focusedField === 'interest' && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                  )}
                </div>
              </div>
              <div className="group/field">
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide text-xs">
                  Tenure (months)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={approvalData.tenure}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, tenure: parseInt(e.target.value) || 0 }))}
                    onFocus={() => setFocusedField('tenure')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium transition-all duration-300 shadow-sm hover:shadow bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {focusedField === 'tenure' && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide text-xs">
                  Calculated EMI (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={approvalData.emi}
                    readOnly
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 cursor-not-allowed text-black font-medium focus:outline-none shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div 
        className="flex flex-wrap gap-3"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
      >
        {application.status !== 'under_review' && (
          <button
            onClick={() => handleStatusUpdate('under_review')}
            disabled={actionLoading !== ''}
            className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-blue-50 to-blue-50/50 text-blue-800 border border-blue-300 rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium overflow-hidden hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-2">
              {actionLoading === 'under_review' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-800 border-t-transparent" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>Mark Under Review</span>
            </div>
          </button>
        )}

        {application.status !== 'approved' && (
          <button
            onClick={() => handleStatusUpdate('approved')}
            disabled={actionLoading !== '' || !comment.trim()}
            className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-green-50 to-green-50/50 text-green-800 border border-green-300 rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium overflow-hidden hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-2">
              {actionLoading === 'approved' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-800 border-t-transparent" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Approve Application</span>
            </div>
          </button>
        )}

        {application.status !== 'rejected' && (
          <button
            onClick={() => handleStatusUpdate('rejected')}
            disabled={actionLoading !== '' || !comment.trim()}
            className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-red-50 to-red-50/50 text-red-800 border border-red-300 rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium overflow-hidden hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-2">
              {actionLoading === 'rejected' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-800 border-t-transparent" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>Reject Application</span>
            </div>
          </button>
        )}

        <button
          onClick={onRequestAdditionalDocuments}
          disabled={actionLoading === 'pending'}
          className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-gray-50 to-gray-50/50 text-gray-800 border border-gray-300 rounded-lg hover:shadow-md transition-all duration-300 font-medium overflow-hidden hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Request Additional Documents</span>
          </div>
        </button>
      </div>

      {error && (
        <div 
          className="p-4 bg-gradient-to-br from-red-50 to-red-50/50 border border-red-200 rounded-xl shadow-sm backdrop-blur-sm"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
        >
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
      
      <style>{`
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
      `}</style>
    </div>
  )
}