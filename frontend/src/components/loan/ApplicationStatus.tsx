import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './applicationStatus.module.css'

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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved': return styles.statusApproved
      case 'rejected': return styles.statusRejected
      case 'under_review': return styles.statusUnderReview
      default: return styles.statusPending
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
    return (
      <div className={styles.container}>
        <div className={styles.backgroundAnimation}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
          <div className={styles.blob3}></div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>Loading applications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>Application Status</h1>
      </div>
      
      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No loan applications found.</p>
          <Link to="/apply-loan" className={styles.emptyStateButton}>
            Apply for a Loan
          </Link>
        </div>
      ) : (
        <div>
          {/* Applications List */}
          <div className={styles.applicationsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All Applications</h2>
              <div className={styles.applicationCount}>
                {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
              </div>
            </div>
            
            <div className={styles.tableContainer}>
              <table className={styles.applicationsTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>Application ID</th>
                    <th className={styles.tableHeaderCell}>Loan Type</th>
                    <th className={styles.tableHeaderCell}>Amount</th>
                    <th className={styles.tableHeaderCell}>Status</th>
                    <th className={styles.tableHeaderCell}>Applied Date</th>
                    <th className={styles.tableHeaderCell}>Documents</th>
                    <th className={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <span className={styles.applicationId}>
                          {app._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.loanType}`}>
                        {app.loanType}
                      </td>
                      <td className={`${styles.tableCell} ${styles.amount}`}>
                        ₹{app.amount.toLocaleString()}
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                          {getStatusIcon(app.status)} {formatStatus(app.status)}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        {new Date(app.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.documentsStatus}>
                          {app.documentsUploaded ? (
                            <span className={styles.documentsComplete}>✓ Complete</span>
                          ) : (
                            <span className={styles.documentsPending}>✗ Pending</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => setSelectedApplication(app)}
                            className={styles.viewDetailsButton}
                          >
                            View Details
                          </button>
                          {!app.documentsUploaded && (
                            <Link to={`/upload-documents/${app._id}`} className={styles.uploadDocsButton}>
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

          {/* Details Modal */}
          {selectedApplication && (
            <div className={styles.detailsModal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Application Details</h3>
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className={styles.closeButton}
                >
                  ✕ Close
                </button>
              </div>
              
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Application ID:</div>
                  <div className={styles.detailValue}>
                    <span className={styles.applicationId}>
                      {selectedApplication._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Applicant:</div>
                  <div className={styles.detailValue}>{selectedApplication.applicantName}</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Loan Type:</div>
                  <div className={styles.detailValue}>{selectedApplication.loanType}</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Requested Amount:</div>
                  <div className={styles.detailValue}>₹{selectedApplication.amount.toLocaleString()}</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Current Status:</div>
                  <div className={styles.detailValue}>
                    <span className={`${styles.statusBadge} ${getStatusClass(selectedApplication.status)}`}>
                      {getStatusIcon(selectedApplication.status)} {formatStatus(selectedApplication.status)}
                    </span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Applied Date:</div>
                  <div className={styles.detailValue}>
                    {new Date(selectedApplication.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Approval Details */}
              {selectedApplication.status === 'approved' && selectedApplication.approvalDetails && (
                <div className={styles.approvalCard}>
                  <h4 className={styles.approvalTitle}>
                    ✓ Loan Approved!
                  </h4>
                  <div className={styles.approvalGrid}>
                    <div className={styles.approvalItem}>
                      <div className={styles.detailLabel}>Approved Amount:</div>
                      <div>₹{selectedApplication.approvalDetails.approvedAmount.toLocaleString()}</div>
                    </div>
                    <div className={styles.approvalItem}>
                      <div className={styles.detailLabel}>Interest Rate:</div>
                      <div>{selectedApplication.approvalDetails.interestRate}% per annum</div>
                    </div>
                    <div className={styles.approvalItem}>
                      <div className={styles.detailLabel}>Tenure:</div>
                      <div>{selectedApplication.approvalDetails.tenure} months</div>
                    </div>
                    <div className={styles.approvalItem}>
                      <div className={styles.detailLabel}>Monthly EMI:</div>
                      <div>₹{selectedApplication.approvalDetails.emi.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Details */}
              {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                <div className={styles.rejectionCard}>
                  <h4 className={styles.rejectionTitle}>
                    ✗ Application Rejected
                  </h4>
                  <p className={styles.rejectionReason}>
                    <strong>Reason:</strong> {selectedApplication.rejectionReason}
                  </p>
                </div>
              )}

              {/* Status History */}
              <div className={styles.historySection}>
                <h4 className={styles.historyTitle}>Status History</h4>
                <div className={styles.historyContainer}>
                  {selectedApplication.statusHistory && selectedApplication.statusHistory.length > 0 ? (
                    selectedApplication.statusHistory.map((history, index) => (
                      <div key={index} className={styles.historyItem}>
                        <div className={`${styles.historyStatus} ${getStatusClass(history.status)}`}>
                          {getStatusIcon(history.status)} {formatStatus(history.status)}
                        </div>
                        <div className={styles.historyTimestamp}>
                          {new Date(history.timestamp).toLocaleString('en-IN')}
                        </div>
                        {history.comment && (
                          <div className={styles.historyComment}>
                            "{history.comment}"
                          </div>
                        )}
                        {history.updatedBy && (
                          <div className={styles.historyUpdatedBy}>
                            Updated by: {history.updatedBy}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={styles.noHistory}>No status history available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className={styles.navigation}>
        <Link to="/dashboard" className={styles.navButton}>
          Back to Dashboard
        </Link>
        <Link to="/apply-loan" className={`${styles.navButton} ${styles.primaryNavButton}`}>
          Apply for New Loan
        </Link>
      </div>
    </div>
  )
}

export default ApplicationStatus