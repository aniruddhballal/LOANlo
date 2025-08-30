import { useState } from 'react'
import { X, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

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

interface ApplicationReviewModalProps {
  application: LoanApplication | null
  isOpen: boolean
  onClose: () => void
}

const ApplicationReviewModal = ({ application, isOpen, onClose }: ApplicationReviewModalProps) => {
  const [activeTab, setActiveTab] = useState('details')

  if (!isOpen || !application) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-800 bg-green-100 border-green-400'
      case 'rejected': return 'text-red-800 bg-red-100 border-red-400'
      case 'under_review': return 'text-blue-800 bg-blue-100 border-blue-400'
      default: return 'text-amber-800 bg-amber-100 border-amber-400'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLoanTypeLabel = (type: string) => {
    const types = {
      personal: 'Personal Loan',
      home: 'Home Loan',
      vehicle: 'Vehicle Loan',
      business: 'Business Loan',
      education: 'Education Loan'
    }
    return types[type as keyof typeof types] || type
  }

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
                Application Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Application #{application._id.slice(-8).toUpperCase()}
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
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              {[
                { id: 'details', label: 'Application Details', icon: FileText },
                { id: 'history', label: 'Status History', icon: Clock }
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
                <div className="space-y-6">
                  {/* Applicant Info */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-semibold">
                        {application.applicantName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {application.applicantName}
                        </h3>
                        <p className="text-gray-600">Loan Applicant</p>
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
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Documents Uploaded</label>
                        <div className="flex items-center space-x-2 mt-1">
                          {application.documentsUploaded ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`font-medium ${application.documentsUploaded ? 'text-green-700' : 'text-red-700'}`}>
                            {application.documentsUploaded ? 'Complete' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Applied On</label>
                        <p className="text-gray-900 font-medium mt-1">{formatDate(application.createdAt)}</p>
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
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Status Timeline</h3>
                  <div className="space-y-4">
                    {application.statusHistory.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className={`w-3 h-3 rounded-full mt-2 ${entry.status === 'approved' ? 'bg-green-500' : entry.status === 'rejected' ? 'bg-red-500' : entry.status === 'under_review' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                              {entry.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">{formatDate(entry.timestamp)}</span>
                          </div>
                          {entry.comment && (
                            <p className="text-gray-700 mt-2 font-medium">{entry.comment}</p>
                          )}
                          {entry.updatedBy && (
                            <p className="text-sm text-gray-500 mt-1">Updated by: {entry.updatedBy}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationReviewModal