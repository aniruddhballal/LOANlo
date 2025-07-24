import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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
      case 'approved': return 'green'
      case 'rejected': return 'red'
      case 'under_review': return 'orange'
      default: return 'blue'
    }
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        <nav>
          <Link to="/profile" style={{ marginRight: '1rem' }}>Profile</Link>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Quick Actions</h2>
        <div>
          <Link to="/apply-loan">
            <button>Apply for New Loan</button>
          </Link>
          <Link to="/application-status" style={{ marginLeft: '1rem' }}>
            <button>View All Applications</button>
          </Link>
        </div>
      </div>

      <div>
        <h2>Recent Applications</h2>
        
        {loading && <p>Loading applications...</p>}
        
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {!loading && applications.length === 0 && (
          <p>No loan applications found. <Link to="/apply-loan">Apply for your first loan</Link></p>
        )}

        {!loading && applications.length > 0 && (
          <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>{app._id.slice(-6)}</td>
                  <td>{app.loanType}</td>
                  <td>₹{app.amount.toLocaleString()}</td>
                  <td style={{ color: getStatusColor(app.status) }}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    {app.documentsUploaded ? (
                      <span style={{ color: 'green' }}>✓ Uploaded</span>
                    ) : (
                      <span style={{ color: 'red' }}>✗ Pending</span>
                    )}
                  </td>
                  <td>
                    {!app.documentsUploaded && (
                      <Link to={`/upload-documents/${app._id}`}>
                        <button>Upload Documents</button>
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
  )
}

export default Dashboard