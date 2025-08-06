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
      case 'approved': return 'bg-black text-white'
      case 'rejected': return 'bg-gray-800 text-white'
      case 'under_review': return 'bg-gray-600 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-100/40 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black mb-1 tracking-tight">Dashboard</h1>
              <p className="text-lg text-gray-600">Welcome back, <span className="font-semibold text-black">{user?.firstName} {user?.lastName}</span></p>
            </div>
          </div>
          <nav className="flex items-center space-x-4">
            <Link 
              to="/profile" 
              className="px-6 py-3 text-black hover:bg-black hover:text-white bg-white/80 backdrop-blur-sm border border-gray-300 transition-all duration-200 rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              Profile
            </Link>
            <button 
              onClick={logout} 
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 border border-black transition-all duration-200 rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
  
        {/* KYC Status Card */}
        {hasKYC !== null && (
          <div className={`mb-8 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border transition-all duration-200 hover:shadow-3xl ${
            hasKYC 
              ? 'bg-black/90 text-white border-black/20' 
              : 'bg-white/80 text-black border-gray-300/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  hasKYC ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'
                }`}>
                  {hasKYC ? 'V' : 'K'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {hasKYC ? 'KYC Verified' : 'KYC Required'}
                  </h3>
                  <p className={`text-lg ${hasKYC ? 'text-gray-300' : 'text-gray-600'}`}>
                    {hasKYC ? 'You can now apply for loans and access all features.' : 'Complete your KYC to unlock loan applications.'}
                  </p>
                </div>
              </div>
              {!hasKYC && (
                <Link 
                  to="/kyc" 
                  className="px-8 py-4 bg-black text-white hover:bg-gray-800 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Complete KYC
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-8 tracking-tight">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasKYC === true && (
              <>
                <Link 
                  to="/kyc" 
                  className="group bg-black/90 backdrop-blur-xl text-white p-6 rounded-xl shadow-lg hover:shadow-xl border border-black/20 transition-all duration-200"
                >
                  <h3 className="text-lg font-semibold mb-2 text-white">Apply for New Loan</h3>
                  <p className="text-gray-300">
                    Start a new loan application with competitive rates
                  </p>
                </Link>
                <Link 
                  to="/application-status" 
                  className="group bg-white/80 backdrop-blur-xl text-black p-6 rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200"
                >
                  <h3 className="text-lg font-semibold mb-2 text-black">View All Applications</h3>
                  <p className="text-gray-600">
                    Track the status of all your loan applications
                  </p>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Applications Section */}
        {hasKYC === true && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
            <h2 className="text-3xl font-bold text-black mb-8 tracking-tight">
              Recent Applications
            </h2>
            
            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                <span className="ml-4 text-black text-lg font-medium">Loading applications...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-gray-100/80 backdrop-blur-sm border border-gray-300 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-black font-semibold">{error}</span>
                </div>
              </div>
            )}

            {!loading && applications.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4 font-medium">No loan applications found.</p>
                <Link 
                  to="/kyc" 
                  className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all duration-200"
                >
                  Apply for your first loan
                </Link>
              </div>
            )}

            {!loading && applications.length > 0 && (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div 
                    key={app._id} 
                    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 p-6 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-6 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                          {app.status === 'approved' ? 'A' : app.status === 'rejected' ? 'R' : app.status === 'under_review' ? 'U' : 'P'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-bold text-black text-lg">{app.loanType}</h3>
                            <span className={`px-4 py-2 text-sm font-bold rounded-lg ${getStatusClass(app.status)}`}>
                              {app.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 text-gray-600">
                            <span className="font-bold text-2xl text-black">{formatCurrency(app.amount)}</span>
                            <span className="text-sm bg-gray-100 px-3 py-1 rounded font-mono text-black">
                              ID: {app._id.slice(-8)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(app.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          {app.documentsUploaded ? (
                            <div className="flex items-center text-black font-semibold">
                              <span className="mr-2">Documents Uploaded</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-600 font-semibold">
                              <span className="mr-2">Documents Pending</span>
                            </div>
                          )}
                        </div>
                        
                        {!app.documentsUploaded && (
                          <Link 
                            to={`/upload-documents/${app._id}`} 
                            className="px-6 py-3 bg-black text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all duration-200"
                          >
                            Upload Documents
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard