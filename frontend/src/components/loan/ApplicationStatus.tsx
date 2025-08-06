import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

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

const ApplicationStatus = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/loans/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications)
      } else {
        setError(data.message || 'Failed to fetch applications')
      }
    } catch (err) {
      setError('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✓'
      case 'rejected': return '✗'
      case 'under_review': return '👁'
      case 'pending': return '⏳'
      default: return '?'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase()
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/loans/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setApplications(applications.filter(app => app._id !== applicationId));
        setSelectedApplication(null);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete application');
      }
    } catch (err) {
      alert('Failed to delete application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gray-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gray-300 rounded-full opacity-30 animate-pulse delay-200"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gray-100 rounded-full opacity-25 animate-pulse delay-500"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
            <div className="text-xl font-medium text-gray-700">Loading applications...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">Application Status</h1>
          <div className="h-1 w-24 bg-black"></div>
        </div>
        
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600 font-medium">No loan applications found.</p>
          </div>
        ) : (
          <div>
            {/* Applications List */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-black">All Applications</h2>
                <div className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
                  {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Application ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loan Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Documents</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold text-black bg-gray-100 px-2 py-1 rounded">
                              {app._id.slice(-8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {app.loanType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                            ₹{app.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(app.status)}`}>
                              {getStatusIcon(app.status)} <span className="ml-1">{formatStatus(app.status)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(app.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {app.documentsUploaded ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setSelectedApplication(app)}
                                className="px-3 py-1 text-sm font-medium text-black border border-black rounded hover:bg-black hover:text-white transition-colors"
                              >
                                View Details
                              </button>
                              {!app.documentsUploaded && (
                                <Link 
                                  to={`/upload-documents/${app._id}`} 
                                  className="px-3 py-1 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 transition-colors"
                                >
                                  Upload Docs
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Details Modal */}
            {selectedApplication && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-black">Application Details</h3>
                    <button 
                      onClick={() => setSelectedApplication(null)}
                      className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-600">Application ID</div>
                        <div className="font-mono text-sm font-semibold text-black bg-gray-100 px-2 py-1 rounded inline-block">
                          {selectedApplication._id.slice(-8).toUpperCase()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-600">Applicant</div>
                        <div className="text-black font-medium">{selectedApplication.applicantName}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-600">Loan Type</div>
                        <div className="text-black font-medium">{selectedApplication.loanType}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-600">Requested Amount</div>
                        <div className="text-black font-semibold">₹{selectedApplication.amount.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-600">Purpose</div>
                        <div className="text-black font-medium">{selectedApplication.purpose}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-600">Tenure</div>
                        <div className="text-black font-medium">{selectedApplication.tenure} months</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-600">Current Status</div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(selectedApplication.status)}`}>
                          {getStatusIcon(selectedApplication.status)} <span className="ml-1">{formatStatus(selectedApplication.status)}</span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-600">Applied Date</div>
                        <div className="text-black font-medium">
                          {new Date(selectedApplication.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Approval Details */}
                    {selectedApplication.status === 'approved' && selectedApplication.approvalDetails && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-lg font-semibold text-green-800 mb-3">
                          ✓ Loan Approved!
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-green-700">Approved Amount</div>
                            <div className="text-green-800 font-semibold">₹{selectedApplication.approvalDetails.approvedAmount.toLocaleString()}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-green-700">Interest Rate</div>
                            <div className="text-green-800 font-semibold">{selectedApplication.approvalDetails.interestRate}% per annum</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-green-700">Tenure</div>
                            <div className="text-green-800 font-semibold">{selectedApplication.approvalDetails.tenure} months</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-green-700">Monthly EMI</div>
                            <div className="text-green-800 font-semibold">₹{selectedApplication.approvalDetails.emi.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rejection Details */}
                    {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="text-lg font-semibold text-red-800 mb-2">
                          ✗ Application Rejected
                        </h4>
                        <p className="text-red-700">
                          <strong>Reason:</strong> {selectedApplication.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Status History */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-black mb-3">Status History</h4>
                      <div className="space-y-3">
                        {selectedApplication.statusHistory && selectedApplication.statusHistory.length > 0 ? (
                          selectedApplication.statusHistory.map((history, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(history.status)}`}>
                                  {getStatusIcon(history.status)} <span className="ml-1">{formatStatus(history.status)}</span>
                                </span>
                                <div className="text-sm text-gray-600">
                                  {new Date(history.timestamp).toLocaleString('en-IN')}
                                </div>
                              </div>
                              {history.comment && (
                                <div className="text-sm text-gray-700 italic mb-1">
                                  "{history.comment}"
                                </div>
                              )}
                              {history.updatedBy && (
                                <div className="text-xs text-gray-500">
                                  Updated by: {history.updatedBy}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No status history available</p>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                        onClick={() => handleDeleteApplication(selectedApplication._id)}
                      >
                        🗑 Delete Application
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link 
            to="/dashboard" 
            className="px-6 py-3 border border-black text-black rounded hover:bg-black hover:text-white transition-colors font-medium"
          >
            Back to Dashboard
          </Link>
          <Link 
            to="/kyc" 
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
          >
            Apply for New Loan
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ApplicationStatus