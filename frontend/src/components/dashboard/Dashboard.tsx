import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './dashboard.module.css'

interface LoanApplication {
  _id: string
  loanType: string
  amount: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  createdAt: string
  documentsUploaded: boolean
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasKYC, setHasKYC] = useState<boolean | null>(null) // <-- Add this

  useEffect(() => {
    fetchApplications()
    checkKYCStatus()
  }, [])

  // Check if user has KYC
  const checkKYCStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/kyc/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setHasKYC(!!data.kyc) // true if KYC exists, false otherwise
    } catch (err) {
      setHasKYC(false)
    }
  }

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

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>

      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Dashboard</h1>
          <p className={styles.welcomeText}>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        <nav className={styles.navigation}>
          <Link to="/profile" className={styles.navLink}>Profile</Link>
          <button onClick={logout} className={styles.logoutButton}>Logout</button>
        </nav>
      </header>

      {/* Quick Actions Section */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionButtons}>
          {/* Show Fill KYC only if hasKYC === false */}
          {hasKYC === false && (
            <>
            <h2 className={styles.sectionSubTitle}>Kindly Fill KYC to apply for a loan</h2>

            <Link to="/kyc" className={styles.actionButton}>
              Fill User KYC
            </Link>
            </>
            
          )}
          {hasKYC === true && (
            <>
              <Link to="/kyc" className={`${styles.actionButton} ${styles.primaryAction}`}>
                Apply for New Loan
              </Link>
              <Link to="/application-status" className={styles.actionButton}>
                View All Applications
              </Link>
            </> 
          )}
        </div>
      </div>

      {/* Applications Section */}
      {hasKYC === true && (
        <div className={styles.applicationsSection}>
          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}>Recent Applications</h2>
            
            {loading && <p className={styles.loadingText}>Loading applications...</p>}
            
            {error && (
              <div className={styles.errorContainer}>
                <span className={styles.errorText}>{error}</span>
              </div>
            )}

            {!loading && applications.length === 0 && (
              <div className={styles.emptyState}>
                No loan applications found.{' '}
                <Link to="/kyc" className={styles.emptyStateLink}>
                  Apply for your first loan
                </Link>
              </div>
            )}

            {!loading && applications.length > 0 && (
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
                          {app._id.slice(-6)}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.loanType}`}>
                        {app.loanType}
                      </td>
                      <td className={`${styles.tableCell} ${styles.amount}`}>
                        ₹{app.amount.toLocaleString()}
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.status} ${getStatusClass(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.documentsStatus}>
                          {app.documentsUploaded ? (
                            <span className={styles.documentsUploaded}>✓ Uploaded</span>
                          ) : (
                            <span className={styles.documentsPending}>✗ Pending</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        {!app.documentsUploaded && (
                          <Link to={`/upload-documents/${app._id}`} className={styles.uploadButton}>
                            Upload Documents
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard