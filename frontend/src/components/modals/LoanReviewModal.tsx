import { useState, useEffect } from 'react'
import { X, FileText, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Upload } from 'lucide-react'

interface LoanApplication {
  _id: string
  userId: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
  applicantName: string
  kycId?: string
  loanType: 'personal' | 'home' | 'vehicle' | 'business' | 'education'
  amount: number
  purpose: string
  tenure: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
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
  createdAt: string
  updatedAt: string
}

interface LoanReviewModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  onApplicationUpdated: () => void
}

export default function LoanReviewModal({ isOpen, onClose, applicationId, onApplicationUpdated }: LoanReviewModalProps) {
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('details')
  const [comment, setComment] = useState('')
  const [approvalData, setApprovalData] = useState({
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
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/loans/details/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setApplication(data.application)
        // Pre-fill approval data with requested amounts
        setApprovalData({
          approvedAmount: data.application.amount,
          interestRate: 12, // Default rate
          tenure: data.application.tenure,
          emi: 0
        })
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to fetch application details')
    } finally {
      setLoading(false)
    }
  }

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
    setActionLoading(status)
    try {
      const token = localStorage.getItem('token')
      const payload = {
        status,
        comment,
        ...(status === 'approved' && { approvalDetails: approvalData }),
        ...(status === 'rejected' && { rejectionReason: comment })
      }
      
      const response = await fetch(`http://localhost:5000/api/loans/update-status/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchApplicationDetails() // Refresh data
        setComment('')
        onApplicationUpdated() // Notify parent to refresh
        // Show success message or close modal
        if (status !== 'under_review') {
          setTimeout(() => onClose(), 1500)
        }
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to update application status')
    } finally {
      setActionLoading('')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
      case 'under_review': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-amber-600 bg-amber-50 border-amber-200'
    }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50/50">
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
                <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                  {error}
                </div>
              </div>
            ) : application ? (
              <>
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50/30">
                  {[
                    { id: 'details', label: 'Application Details', icon: FileText },
                    { id: 'history', label: 'Status History', icon: Clock },
                    { id: 'actions', label: 'Actions', icon: MessageSquare }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold">
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
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-gray-900">{application.userId?.phone}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Role</label>
                            <p className="text-gray-900 capitalize">{application.userId?.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Loan Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 text-lg">Loan Information</h3>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Loan Type</label>
                            <p className="text-gray-900 font-medium">{getLoanTypeLabel(application.loanType)}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Amount Requested</label>
                            <p className="text-gray-900 font-semibold text-xl">{formatCurrency(application.amount)}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Tenure</label>
                            <p className="text-gray-900">{application.tenure} months</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Purpose</label>
                            <p className="text-gray-900">{application.purpose}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 text-lg">Application Status</h3>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Current Status</label>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                                {application.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Documents Uploaded</label>
                            <div className="flex items-center space-x-2 mt-1">
                              {application.documentsUploaded ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className={application.documentsUploaded ? 'text-emerald-600' : 'text-red-600'}>
                                {application.documentsUploaded ? 'Complete' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Applied On</label>
                            <p className="text-gray-900">{formatDate(application.createdAt)}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Last Updated</label>
                            <p className="text-gray-900">{formatDate(application.updatedAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Approval/Rejection Details */}
                      {application.status === 'approved' && application.approvalDetails && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                          <h3 className="font-semibold text-emerald-900 text-lg mb-4">Approval Details</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-sm font-medium text-emerald-700">Approved Amount</label>
                              <p className="text-emerald-900 font-semibold">{formatCurrency(application.approvalDetails.approvedAmount)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-700">Interest Rate</label>
                              <p className="text-emerald-900 font-semibold">{application.approvalDetails.interestRate}%</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-700">Tenure</label>
                              <p className="text-emerald-900 font-semibold">{application.approvalDetails.tenure} months</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-700">EMI</label>
                              <p className="text-emerald-900 font-semibold">{formatCurrency(application.approvalDetails.emi)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {application.status === 'rejected' && application.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                          <h3 className="font-semibold text-red-900 text-lg mb-2">Rejection Reason</h3>
                          <p className="text-red-800">{application.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 text-lg">Status Timeline</h3>
                      <div className="space-y-4">
                        {application.statusHistory.map((entry, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(entry.status).includes('emerald') ? 'bg-emerald-500' : getStatusColor(entry.status).includes('red') ? 'bg-red-500' : getStatusColor(entry.status).includes('blue') ? 'bg-blue-500' : 'bg-amber-500'}`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                                  {entry.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">{formatDate(entry.timestamp)}</span>
                              </div>
                              {entry.comment && (
                                <p className="text-gray-700 mt-2">{entry.comment}</p>
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

                  {activeTab === 'actions' && (
                    <div className="space-y-6">
                      <h3 className="font-semibold text-gray-900 text-lg">Review Actions</h3>
                      
                      {/* Comment Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Comment/Notes
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add your review comments, notes, or feedback..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Approval Details */}
                      {application.status !== 'approved' && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Approval Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Approved Amount (₹)
                              </label>
                              <input
                                type="number"
                                value={approvalData.approvedAmount}
                                onChange={(e) => setApprovalData(prev => ({ ...prev, approvedAmount: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Interest Rate (%)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={approvalData.interestRate}
                                onChange={(e) => setApprovalData(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tenure (months)
                              </label>
                              <input
                                type="number"
                                value={approvalData.tenure}
                                onChange={(e) => setApprovalData(prev => ({ ...prev, tenure: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Calculated EMI (₹)
                              </label>
                              <input
                                type="number"
                                value={approvalData.emi}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {actionLoading === 'under_review' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {actionLoading === 'approved' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {actionLoading === 'rejected' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span>Reject Application</span>
                          </button>
                        )}

                        <button
                          onClick={() => {/* Handle document request */}}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Request Documents</span>
                        </button>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800">{error}</p>
                        </div>
                      )}
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