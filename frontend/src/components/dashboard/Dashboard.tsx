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
      case 'approved':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
            <path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'rejected':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        );
      case 'under_review':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" stroke="#3b82f6" strokeWidth="2"/>
            <circle cx="12" cy="12" r="1.5" fill="#3b82f6"/>
          </svg>
        );
      case 'pending':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="2"/>
            <path d="M12 7v5l3 3" stroke="#f59e42" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2"/>
            <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#6b7280">?</text>
          </svg>
        );
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase()
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black mb-1 tracking-tight">Dashboard</h1>
              <p className="text-lg text-gray-600">Welcome back, <span className="font-semibold text-black">{user?.firstName} {user?.lastName}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link 
              to="/profile" 
              className="px-4 py-2 text-sm font-medium text-black border border-black rounded hover:bg-black hover:text-white transition-colors"
            >
              Profile
            </Link>
            <button 
              onClick={logout} 
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* KYC Status Card */}
        {hasKYC !== null && (
          <div className={`mb-8 rounded-lg p-6 shadow-sm border ${
            hasKYC 
              ? 'bg-black text-white border-gray-200' 
              : 'bg-white text-black border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white">
                  {hasKYC ? (
                    // Professional Tick SVG
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M6 12.5L10.5 17L18 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    // Professional Exclamation SVG
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                      <rect x="11" y="7" width="2" height="7" rx="1" fill="white"/>
                      <rect x="11" y="16" width="2" height="2" rx="1" fill="white"/>
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {hasKYC ? 'KYC Verified' : 'KYC Required'}
                  </h3>
                  <p className={`text-sm ${hasKYC ? 'text-gray-300' : 'text-gray-600'}`}>
                    {hasKYC ? 'You can now apply for loans and access all features.' : 'Complete your KYC to unlock loan applications.'}
                  </p>
                </div>
              </div>
              {!hasKYC && (
                <Link 
                  to="/kyc" 
                  className="px-6 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                >
                  Complete KYC
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        {hasKYC === true && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/kyc" 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2 text-black">Apply for New Loan</h3>
                <p className="text-gray-600 text-sm">
                  Start a new loan application with competitive rates
                </p>
              </Link>
              <Link 
                to="/application-status" 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2 text-black">View All Applications</h3>
                <p className="text-gray-600 text-sm">
                  Track the status of all your loan applications
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* Applications Section */}
        {hasKYC === true && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-black">Recent Applications</h2>
                <div className="px-3 py-1 bg-black text-white rounded-full text-sm font-medium">
                  {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black"></div>
                  <span className="ml-3 text-black font-medium">Loading applications...</span>
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              )}

              {!loading && applications.length === 0 && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No loan applications found.</p>
                  <Link 
                    to="/kyc" 
                    className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
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
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {getStatusIcon(app.status)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-black">{app.loanType}</h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(app.status)}`}>
                                {formatStatus(app.status)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="font-semibold text-lg text-black">{formatCurrency(app.amount)}</span>
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                ID: {app._id.slice(-8)}
                              </span>
                              <span>
                                {new Date(app.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            {app.documentsUploaded ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ Pending
                              </span>
                            )}
                          </div>
                          
                          {!app.documentsUploaded && (
                            <Link 
                              to={`/upload-documents/${app._id}`} 
                              className="px-3 py-1 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 transition-colors"
                            >
                              Upload Documents
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {applications.length > 3 && (
                    <div className="text-center pt-4 border-t border-gray-200">
                      <Link 
                        to="/application-status" 
                        className="text-black font-medium hover:underline"
                      >
                        View All Applications →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          {hasKYC === true && (
            <Link 
              to="/application-status" 
              className="px-6 py-3 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
            >
              View All Applications
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard