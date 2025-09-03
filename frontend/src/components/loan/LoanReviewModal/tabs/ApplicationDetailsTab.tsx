import { CheckCircle, XCircle } from 'lucide-react'
import type { LoanApplication } from '../types'
import { formatCurrency, formatDate, getStatusColor, getLoanTypeLabel, getDocumentProgress } from '../utils'

interface ApplicationDetailsTabProps {
  application: LoanApplication
}

export default function ApplicationDetailsTab({ application }: ApplicationDetailsTabProps) {
  const documentProgress = getDocumentProgress(application.documents)
  const allRequiredDocsUploaded = documentProgress.percentage === 100

  return (
    <div className="space-y-6">
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