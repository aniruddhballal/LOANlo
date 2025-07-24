import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface LoanApplication {
  _id: string
  applicantName: string
  loanType: string
  amount: number
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#28a745'
      case 'rejected': return '#dc3545'
      case 'under_review': return '#ffc107'
      case 'pending': return '#007bff'
      default: return '#6c757d'
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

  if (loading) {
    return <div>Loading applications...</div>
  }

  return (
    <div>
      <h2>Application Status</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div>
          <p>No loan applications found.</p>
          <Link to="/apply-loan">
            <button>Apply for a Loan</button>
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h3>All Applications ({applications.length})</h3>
            
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px' }}>Application ID</th>
                  <th style={{ padding: '12px' }}>Loan Type</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Applied Date</th>
                  <th style={{ padding: '12px' }}>Documents</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td style={{ padding: '12px' }}>{app._id.slice(-8).toUpperCase()}</td>
                    <td style={{ padding: '12px' }}>{app.loanType}</td>
                    <td style={{ padding: '12px' }}>₹{app.amount.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        color: getStatusColor(app.status),
                        fontWeight: 'bold'
                      }}>
                        {getStatusIcon(app.status)} {formatStatus(app.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {new Date(app.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {app.documentsUploaded ? (
                        <span style={{ color: 'green' }}>✓ Complete</span>
                      ) : (
                        <span style={{ color: 'red' }}>✗ Pending</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => setSelectedApplication(app)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        View Details
                      </button>
                      {!app.documentsUploaded && (
                        <Link to={`/upload-documents/${app._id}`}>
                          <button>Upload Docs</button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedApplication && (
            <div style={{ 
              border: '2px solid #007bff', 
              padding: '1.5rem', 
              marginTop: '2rem',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Application Details</h3>
                <button onClick={() => setSelectedApplication(null)}>✕ Close</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <strong>Application ID:</strong> {selectedApplication._id.slice(-8).toUpperCase()}
                </div>
                <div>
                  <strong>Applicant:</strong> {selectedApplication.applicantName}
                </div>
                <div>
                  <strong>Loan Type:</strong> {selectedApplication.loanType}
                </div>
                <div>
                  <strong>Requested Amount:</strong> ₹{selectedApplication.amount.toLocaleString()}
                </div>
                <div>
                  <strong>Current Status:</strong> 
                  <span style={{ 
                    color: getStatusColor(selectedApplication.status),
                    fontWeight: 'bold',
                    marginLeft: '0.5rem'
                  }}>
                    {getStatusIcon(selectedApplication.status)} {formatStatus(selectedApplication.status)}
                  </span>
                </div>
                <div>
                  <strong>Applied Date:</strong> {new Date(selectedApplication.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>

              {selectedApplication.status === 'approved' && selectedApplication.approvalDetails && (
                <div style={{ 
                  backgroundColor: '#d4edda', 
                  border: '1px solid #c3e6cb', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  borderRadius: '4px'
                }}>
                  <h4 style={{ color: '#155724', margin: '0 0 1rem 0' }}>✓ Loan Approved!</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div><strong>Approved Amount:</strong> ₹{selectedApplication.approvalDetails.approvedAmount.toLocaleString()}</div>
                    <div><strong>Interest Rate:</strong> {selectedApplication.approvalDetails.interestRate}% per annum</div>
                    <div><strong>Tenure:</strong> {selectedApplication.approvalDetails.tenure} months</div>
                    <div><strong>Monthly EMI:</strong> ₹{selectedApplication.approvalDetails.emi.toLocaleString()}</div>
                  </div>
                </div>
              )}

              {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                <div style={{ 
                  backgroundColor: '#f8d7da', 
                  border: '1px solid #f5c6cb', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  borderRadius: '4px'
                }}>
                  <h4 style={{ color: '#721c24', margin: '0 0 0.5rem 0' }}>✗ Application Rejected</h4>
                  <p style={{ color: '#721c24', margin: 0 }}><strong>Reason:</strong> {selectedApplication.rejectionReason}</p>
                </div>
              )}

              <div>
                <h4>Status History</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {selectedApplication.statusHistory && selectedApplication.statusHistory.length > 0 ? (
                    selectedApplication.statusHistory.map((history, index) => (
                      <div key={index} style={{ 
                        borderLeft: '3px solid #007bff', 
                        paddingLeft: '1rem', 
                        marginBottom: '1rem',
                        paddingBottom: '0.5rem'
                      }}>
                        <div style={{ fontWeight: 'bold', color: getStatusColor(history.status) }}>
                          {getStatusIcon(history.status)} {formatStatus(history.status)}
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          {new Date(history.timestamp).toLocaleString('en-IN')}
                        </div>
                        {history.comment && (
                          <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
                            "{history.comment}"
                          </div>
                        )}
                        {history.updatedBy && (
                          <div style={{ fontSize: '0.8em', color: '#999' }}>
                            Updated by: {history.updatedBy}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No status history available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/dashboard">
          <button>Back to Dashboard</button>
        </Link>
        <Link to="/apply-loan" style={{ marginLeft: '1rem' }}>
          <button>Apply for New Loan</button>
        </Link>
      </div>
    </div>
  )
}

export default ApplicationStatus