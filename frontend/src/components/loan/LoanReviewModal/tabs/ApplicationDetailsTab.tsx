import { CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { LoanApplication } from '../types'
import { formatCurrency, formatDate, getStatusColor, getLoanTypeLabel, getDocumentProgress } from '../utils'

interface ApplicationDetailsTabProps {
  application: LoanApplication
  onDelete?: (applicationId: string) => Promise<void> | void
}

export default function ApplicationDetailsTab({ application, onDelete }: ApplicationDetailsTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const documentProgress = getDocumentProgress(application.documents)
  const allRequiredDocsUploaded = documentProgress.percentage === 100

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(application._id.toString())
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete application:', error)
      // You might want to show an error message here
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-gray-900 text-lg">Delete Application</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this loan application for <strong>{application.applicantName}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Button */}
      {onDelete && (
        <div className="flex justify-end">
          <button
            onClick={handleDeleteClick}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Application
          </button>
        </div>
      )}

      {/* Applicant Info */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-semibold">
            {application.userId?.firstName?.charAt(0)}{application.userId?.lastName?.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {application.applicantName}
            </h3>
            <p className="text-gray-600">{application.userId?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone</label>
            <p className="text-gray-900 font-medium mt-1">{application.userId?.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Role</label>
            <p className="text-gray-900 font-medium mt-1 capitalize">{application.userId?.role}</p>
          </div>
        </div>
      </div>

      {/* Loan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Loan Information</h3>
          
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Loan Type</label>
            <p className="text-gray-900 font-medium mt-1">{getLoanTypeLabel(application.loanType)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Amount Requested</label>
            <p className="text-gray-900 font-bold text-xl mt-1">{formatCurrency(application.amount)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tenure</label>
            <p className="text-gray-900 font-medium mt-1">{application.tenure} months</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Purpose</label>
            <p className="text-gray-900 font-medium mt-1">{application.purpose}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Application Status</h3>
          
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Status</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Documents Status</label>
            <div className="flex items-center space-x-2 mt-1">
              {allRequiredDocsUploaded ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-medium ${allRequiredDocsUploaded ? 'text-green-700' : 'text-red-700'}`}>
                {documentProgress.uploaded}/{documentProgress.total} Required Documents
              </span>
            </div>
            {/* Optional documents count */}
            {application.documents && (
              <div className="text-sm text-gray-600 mt-1">
                {application.documents.filter(doc => !doc.required && doc.uploaded).length}/
                {application.documents.filter(doc => !doc.required).length} Optional Documents
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Applied On</label>
            <p className="text-gray-900 font-medium mt-1">{formatDate(application.createdAt)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
            <p className="text-gray-900 font-medium mt-1">{formatDate(application.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Approval/Rejection Details */}
      {application.status === 'approved' && application.approvalDetails && (
        <div className="bg-white border-2 border-green-400 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Approval Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Approved Amount</label>
              <p className="text-black font-bold text-lg mt-1">{formatCurrency(application.approvalDetails.approvedAmount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Interest Rate</label>
              <p className="text-black font-bold text-lg mt-1">{application.approvalDetails.interestRate}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tenure</label>
              <p className="text-black font-bold text-lg mt-1">{application.approvalDetails.tenure} months</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">EMI</label>
              <p className="text-black font-bold text-lg mt-1">{formatCurrency(application.approvalDetails.emi)}</p>
            </div>
          </div>
        </div>
      )}

      {application.status === 'rejected' && application.rejectionReason && (
        <div className="bg-white border-2 border-red-400 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            Rejection Reason
          </h3>
          <p className="text-gray-700 font-medium">{application.rejectionReason}</p>
        </div>
      )}
    </div>
  )
}