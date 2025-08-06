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
  const [hasKYC, setHasKYC] = useState<boolean | null>(null)

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
      // List all required KYC fields
      const requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
        'aadhaarNumber', 'panNumber', 'email', 'phone', 'address', 'city',
        'state', 'pincode', 'employmentType', 'companyName', 'designation',
        'workExperience', 'monthlyIncome'
      ]
      // Check if KYC exists and all required fields are non-empty
      const kyc = data.kyc
      const allFieldsFilled = kyc && requiredFields.every(field => kyc[field] && kyc[field].toString().trim() !== '')
      setHasKYC(!!kyc && allFieldsFilled)
    } catch (err) {
      console.error('Failed to check KYC status:', err)
      setHasKYC(false) // Default to false if there's an error
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
      case 'approved': return 'bg-white text-black border border-black'
      case 'rejected': return 'bg-black text-white border border-black'
      case 'under_review': return 'bg-gray-200 text-black border border-gray-400'
      default: return 'bg-gray-100 text-gray-700 border border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gray-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-gray-200 rounded-full opacity-20 animate-pulse delay-150"></div>
        <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-gray-150 rounded-full opacity-25 animate-pulse delay-300"></div>
      </div>

      {/* Header Section */}
      <header className="relative z-10 bg-white border-b border-black px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome, {user?.firstName} {user?.lastName}</p>
          </div>
          <nav className="flex items-center space-x-4">
            <Link 
              to="/profile" 
              className="px-4 py-2 text-black hover:bg-black hover:text-white border border-black transition-colors duration-200"
            >
              Profile
            </Link>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-200"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {/* Show Fill KYC only if hasKYC === false */}
            {hasKYC === false && (
              <div className="w-full">
                <h3 className="text-xl font-semibold text-black mb-4">Kindly Fill KYC to apply for a loan</h3>
                <Link 
                  to="/kyc" 
                  className="inline-block px-8 py-4 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-colors duration-200 font-semibold"
                >
                  Fill User KYC
                </Link>
              </div>
            )}
            {hasKYC === true && (
              <>
                <Link 
                  to="/kyc" 
                  className="px-8 py-4 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-colors duration-200 font-semibold"
                >
                  Apply for New Loan
                </Link>
                <Link 
                  to="/application-status" 
                  className="px-8 py-4 bg-white text-black hover:bg-black hover:text-white border-2 border-black transition-colors duration-200 font-semibold"
                >
                  View All Applications
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Applications Section */}
        {hasKYC === true && (
          <div className="bg-white border-2 border-black p-8">
            <h2 className="text-2xl font-bold text-black mb-6">Recent Applications</h2>
            
            {loading && <p className="text-gray-600 text-center py-8">Loading applications...</p>}
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 mb-6">
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {!loading && applications.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No loan applications found.</p>
                <Link 
                  to="/kyc" 
                  className="text-black hover:underline font-semibold"
                >
                  Apply for your first loan
                </Link>
              </div>
            )}

            {!loading && applications.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left py-4 px-4 font-bold text-black">Application ID</th>
                      <th className="text-left py-4 px-4 font-bold text-black">Loan Type</th>
                      <th className="text-left py-4 px-4 font-bold text-black">Amount</th>
                      <th className="text-left py-4 px-4 font-bold text-black">Status</th>
                      <th className="text-left py-4 px-4 font-bold text-black">Applied Date</th>
                      <th className="text-left py-4 px-4 font-bold text-black">Documents</th>
                      <th className="text-left py-4 px-4 font-bold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, index) => (
                      <tr 
                        key={app._id} 
                        className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 border">
                            {app._id.slice(-6)}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-black">
                          {app.loanType}
                        </td>
                        <td className="py-4 px-4 font-bold text-black">
                          ₹{app.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 text-sm font-semibold ${getStatusClass(app.status)}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          {app.documentsUploaded ? (
                            <span className="text-black font-semibold">✓ Uploaded</span>
                          ) : (
                            <span className="text-gray-500">✗ Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {!app.documentsUploaded && (
                            <Link 
                              to={`/upload-documents/${app._id}`} 
                              className="px-4 py-2 bg-white text-black border border-black hover:bg-black hover:text-white transition-colors duration-200 text-sm font-semibold"
                            >
                              Upload Documents
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard