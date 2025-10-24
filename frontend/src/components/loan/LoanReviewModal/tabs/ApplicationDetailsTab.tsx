import { CheckCircle, XCircle, Trash2, AlertTriangle, User } from 'lucide-react'
import { useState } from 'react'
import type { LoanApplication } from '../types'
import { formatCurrency, formatDate, getStatusColor, getLoanTypeLabel, getDocumentProgress } from '../../../utils'
import { useAuth } from '../../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface ApplicationDetailsTabProps {
  application: LoanApplication
  onDelete?: (applicationId: string) => Promise<void> | void
}

export default function ApplicationDetailsTab({ application, onDelete }: ApplicationDetailsTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const navigate = useNavigate()

  const documentProgress = getDocumentProgress(application.documents)
  const allRequiredDocsUploaded = documentProgress.percentage === 100

  const { user } = useAuth()

  const isOwner =
    user !== null &&
    application.userId !== undefined &&
    (typeof application.userId === 'string'
      ? user.id === application.userId
      : user.id === application.userId._id.toString());

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
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  const handleVisitProfile = () => {
    const userId = typeof application.userId === 'string' 
      ? application.userId 
      : application.userId?._id?.toString()
    
    if (userId) {
      navigate(`/applicant-profile/${userId}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && application.status !== "approved" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl max-w-md mx-4 border border-gray-200 shadow-2xl overflow-hidden"
            style={{ animation: 'scaleIn 0.3s ease-out' }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center ring-4 ring-red-50">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg tracking-tight">Delete Application</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Are you sure you want to delete this loan application?
              </p>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 bg-gradient-to-br from-gray-50/50 to-transparent flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 border border-red-600 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 shadow-sm hover:shadow-md"
              >
                {isDeleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isDeleting ? 'Deleting...' : 'Delete Application'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with gradient underline */}
      <div
        className="relative pb-3 flex items-center justify-between"
        style={{ animation: 'fadeInUp 0.5s ease-out' }}
      >
        <div>
          <h3 className="font-semibold text-gray-900 text-xl tracking-tight">
            Application Details
          </h3>
          <div 
            className="absolute bottom-0 left-0 w-41 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"
            style={{ animation: 'expandWidth 0.3s ease-out' }}
          ></div>
        </div>

        {onDelete && user && user.role === 'applicant' && isOwner && application.status !== 'approved' && (
          <button
            onClick={handleDeleteClick}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 hover:text-red-800 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 border border-gray-300 hover:border-red-300 shadow-sm hover:shadow group/btn"
          >
            <Trash2 className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
            Delete
          </button>
        )}
      </div>

      {/* Applicant Info Card */}
      <div 
        className="group relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 overflow-hidden"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold shadow-md ring-4 ring-gray-100 transition-all duration-300 group-hover:scale-105 group-hover:ring-gray-200">
                {application.userId?.firstName?.charAt(0)}{application.userId?.lastName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
                  {application.userId?.firstName} {application.userId?.lastName}
                </h3>
                <p className="text-gray-600 text-sm">{application.userId?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {user && user.role === 'underwriter' && (
                <button
                  onClick={handleVisitProfile}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow group/btn"
                >
                  <User className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
                  Visit Profile
                </button>
              )}

            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="group/item">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Phone</label>
              <p className="text-gray-900 font-medium transition-colors duration-200 group-hover/item:text-gray-700">{application.userId?.phone}</p>
            </div>
            <div className="group/item">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Role</label>
              <p className="text-gray-900 font-medium capitalize transition-colors duration-200 group-hover/item:text-gray-700">{application.userId?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Information */}
        <div 
          className="group relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg tracking-tight">Loan Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="group/item">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Loan Type</label>
                <p className="text-gray-900 font-medium transition-all duration-200">{getLoanTypeLabel(application.loanType)}</p>
              </div>
              
              <div className="group/item">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Amount Requested</label>
                <p className="text-gray-900 font-bold text-2xl tracking-tight transition-all duration-200">{formatCurrency(application.amount)}</p>
              </div>
              
              <div className="group/item">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Tenure</label>
                <p className="text-gray-900 font-medium transition-all duration-200">{application.tenure} months</p>
              </div>
              
              <div className="group/item">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Purpose</label>
                <p className="text-gray-900 font-medium transition-all duration-200">{application.purpose}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Status */}
        <div 
          className="group relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg tracking-tight">Application Status</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Current Status</label>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-300 hover:scale-105 ${getStatusColor(application.status)}`}>
                  {application.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Documents Status</label>
                <div className="flex items-center space-x-2">
                  {allRequiredDocsUploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-600 transition-transform duration-200 hover:scale-110" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 transition-transform duration-200 hover:scale-110" />
                  )}
                  <span className={`font-medium text-sm ${allRequiredDocsUploaded ? 'text-green-700' : 'text-red-700'}`}>
                    {documentProgress.uploaded}/{documentProgress.total} Required Documents
                  </span>
                </div>
                {application.documents && (
                  <div className="text-xs text-gray-600 mt-1.5 ml-6">
                    {application.documents.filter(doc => !doc.required && doc.uploaded).length}/
                    {application.documents.filter(doc => !doc.required).length} Optional Documents
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Applied On</label>
                <p className="text-gray-900 font-medium text-sm">{formatDate(application.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Last Updated</label>
                <p className="text-gray-900 font-medium text-sm">{formatDate(application.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Details */}
      {application.status === 'approved' && application.approvalDetails && (
        <div 
          className="group relative bg-white rounded-xl border-2 border-green-300 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-400 hover:-translate-y-0.5 overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <h3 className="font-semibold text-gray-900 text-lg mb-5 flex items-center tracking-tight">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 transition-transform duration-200 group-hover:scale-110" />
              Approval Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="group/item">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Approved Amount</label>
                <p className="text-gray-900 font-bold text-lg transition-all duration-200">{formatCurrency(application.approvalDetails.approvedAmount)}</p>
              </div>
              <div className="group/item">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Interest Rate</label>
                <p className="text-gray-900 font-bold text-lg transition-all duration-200">{application.approvalDetails.interestRate}%</p>
              </div>
              <div className="group/item">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Tenure</label>
                <p className="text-gray-900 font-bold text-lg transition-all duration-200">{application.approvalDetails.tenure} months</p>
              </div>
              <div className="group/item">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">EMI</label>
                <p className="text-gray-900 font-bold text-lg transition-all duration-200">{formatCurrency(application.approvalDetails.emi)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Details */}
      {application.status === 'rejected' && application.rejectionReason && (
        <div 
          className="group relative bg-white rounded-xl border-2 border-red-300 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-400 hover:-translate-y-0.5 overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center tracking-tight">
              <XCircle className="w-5 h-5 text-red-600 mr-2 transition-transform duration-200 group-hover:scale-110" />
              Rejection Reason
            </h3>
            <p className="text-gray-700 leading-relaxed border-l-2 border-red-200 pl-4 italic">{application.rejectionReason}</p>
          </div>
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}