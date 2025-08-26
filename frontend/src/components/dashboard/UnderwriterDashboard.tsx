import { useEffect, useState } from 'react'

interface LoanApplication {
  _id: string
  amount: number
  status: string
  createdAt: string
  userId: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
}

export default function UnderwriterDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch('http://localhost:5000/api/loans/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setApplications(data.applications)
        } else {
          setError('Failed to fetch loan applications')
        }
      })
      .catch(() => setError('Server error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading loan applications...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      <h1>Underwriter Dashboard</h1>
      <table border={1} cellPadding={8} style={{ marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app._id}>
              <td>{app._id}</td>
              <td>{app.userId?.firstName} {app.userId?.lastName}</td>
              <td>{app.userId?.email}</td>
              <td>{app.userId?.phone}</td>
              <td>{app.amount}</td>
              <td>{app.status}</td>
              <td>{new Date(app.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}