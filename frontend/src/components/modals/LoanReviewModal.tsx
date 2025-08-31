import { useState, useEffect } from 'react'
import { X, FileText, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Upload, File } from 'lucide-react'
import api from '../../api'

interface DocumentRequirement {
  name: string
  type: string
  required: boolean
  uploaded: boolean
  description: string
  uploadedAt?: string
}

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
  documents?: DocumentRequirement[] // Enhanced document tracking
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
  showActions?: boolean
}

export default function LoanReviewModal({ isOpen, onClose, applicationId, onApplicationUpdated, showActions = true }: LoanReviewModalProps) {
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

  // Standard document requirements for all loan applications
  const getRequiredDocuments = (): DocumentRequirement[] => {
    return [
      {
        name: 'Aadhaar Card',
        type: 'aadhaar',
        required: true,
        uploaded: false,
        description: 'Government issued identity proof with 12-digit unique number'
      },
      {
        name: 'PAN Card',
        type: 'pan',
        required: true,
        uploaded: false,
        description: 'Permanent Account Number card for tax identification'
      },
      {
        name: 'Salary Slips (Last 3 months)',
        type: 'salary_slips',
        required: true,
        uploaded: false,
        description: 'Recent salary certificates showing current income'
      },
      {
        name: 'Bank Statements (Last 6 months)',
        type: 'bank_statements',
        required: true,
        uploaded: false,
        description: 'Bank account statements for financial verification'
      },
      {
        name: 'Employment Certificate',
        type: 'employment_certificate',
        required: true,
        uploaded: false,
        description: 'Letter from employer confirming current employment status'
      },
      {
        name: 'Photo',
        type: 'photo',
        required: true,
        uploaded: false,
        description: 'Recent passport-size photograph for identification'
      },
      {
        name: 'Address Proof',
        type: 'address_proof',
        required: false,
        uploaded: false,
        description: 'Utility bill or rent agreement showing current address'
      },
      {
        name: 'Income Tax Returns',
        type: 'itr',
        required: false,
        uploaded: false,
        description: 'IT returns for additional income verification'
      }
    ]
  }

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

  const getDocumentProgress = () => {
    if (!application?.documents) return { uploaded: 0, total: 0, percentage: 0 }
    
    const requiredDocs = application.documents.filter(doc => doc.required)
    const uploadedDocs = requiredDocs.filter(doc => doc.uploaded)
    
    return {
      uploaded: uploadedDocs.length,
      total: requiredDocs.length,
      percentage: requiredDocs.length > 0 ? (uploadedDocs.length / requiredDocs.length) * 100 : 0
    }
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage < 30) return 'bg-gradient-to-r from-red-500 to-red-600'
    if (percentage < 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    if (percentage < 100) return 'bg-gradient-to-r from-yellow-500 to-green-500'
    return 'bg-gradient-to-r from-green-500 to-green-600'
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
      case 'approved': return 'text-green-800 bg-green-100 border-green-400'
      case 'rejected': return 'text-red-800 bg-red-100 border-red-400'
      case 'under_review': return 'text-blue-800 bg-blue-100 border-blue-400'
      default: return 'text-amber-800 bg-amber-100 border-amber-400'
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

  const documentProgress = getDocumentProgress()
  const allRequiredDocsUploaded = documentProgress.percentage === 100

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
                  )}

                  {activeTab === 'documents' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-lg">Document Requirements</h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600">
                            {documentProgress.uploaded} of {documentProgress.total} completed
                          </span>
                          <div className="text-lg font-bold text-gray-900">
                            {Math.round(documentProgress.percentage)}%
                          </div>
                        </div>
                      </div>

                      {/* Document Progress Summary */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Required Documents</h4>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(documentProgress.percentage)}`}
                                  style={{ width: `${documentProgress.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {documentProgress.uploaded}/{documentProgress.total}
                              </span>
                            </div>
                          </div>
                          {application.documents && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Optional Documents</h4>
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  const optionalTotal = application.documents.filter(doc => !doc.required).length
                                  const optionalUploaded = application.documents.filter(doc => !doc.required && doc.uploaded).length
                                  const optionalProgress = optionalTotal > 0 ? (optionalUploaded / optionalTotal) * 100 : 0
                                  return (
                                    <>
                                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(optionalProgress)}`}
                                          style={{ width: `${optionalProgress}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-medium text-gray-900">
                                        {optionalUploaded}/{optionalTotal}
                                      </span>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document List */}
                      <div className="space-y-3">
                        {application.documents?.map((doc) => (
                          <div key={doc.type} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            doc.uploaded 
                              ? 'bg-green-50 border-green-200 hover:border-green-300' 
                              : doc.required 
                                ? 'bg-red-50 border-red-200 hover:border-red-300'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {doc.uploaded ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className={`w-5 h-5 ${doc.required ? 'text-red-600' : 'text-gray-400'}`} />
                                )}
                                <div>
                                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                  <p className="text-sm text-gray-600">{doc.description}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {doc.required ? 'Required' : 'Optional'} • {doc.uploaded ? 'Uploaded' : 'Pending'}
                                  </p>
                                </div>
                              </div>
                              {doc.uploaded && doc.uploadedAt && (
                                <span className="text-sm text-gray-500">
                                  {formatDate(doc.uploadedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {!allRequiredDocsUploaded && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-amber-800">Documents Pending</h4>
                              <p className="text-sm text-amber-700 mt-1">
                                The applicant needs to upload {documentProgress.total - documentProgress.uploaded} more required document(s) 
                                before the application can be reviewed and processed.
                              </p>
                            </div>
                          </div>
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

                  {activeTab === 'actions' && (
                    <div className="space-y-6">
                      <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Review Actions</h3>
                      
                      {!allRequiredDocsUploaded ? (
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
                      ) : (
                        <>
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
                        </>
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