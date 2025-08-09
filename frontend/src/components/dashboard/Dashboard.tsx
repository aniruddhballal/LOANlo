import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle } from 'lucide-react'

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
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  useEffect(() => {
    fetchApplications()
    checkKYCStatus()
  }, [])

  // Check for login success and handle overlay timing
  useEffect(() => {
    const loginSuccess = sessionStorage.getItem('loginSuccess')
    if (loginSuccess === 'true') {
      setJustLoggedIn(true)
      
      {/* Hide overlay after animation completes (1.2s animation + 0.3s buffer) */}
      setTimeout(() => {
        setJustLoggedIn(false)
        sessionStorage.removeItem('loginSuccess')
      }, 1500)
    }
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
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200'
      case 'under_review': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'rejected':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'under_review':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
          </svg>
        );
      case 'pending':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">?</text>
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
    <div className="min-h-screen bg-slate-50">
      {/* Welcome Animation Overlay - Tailwind Based */}
      {justLoggedIn && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20 backdrop-blur-sm
                       animate-in fade-in duration-500
                       after:animate-in after:fade-out after:duration-1000 after:delay-2000
                       data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:duration-500 data-[state=closed]:delay-2500">
          
          {/* Success Card */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-green-200/50 max-w-md w-full
                           animate-in zoom-in duration-700 delay-300
                           animate-out zoom-out duration-500 delay-2000">
              
              {/* Success Icon */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mx-auto mb-4 
                               flex items-center justify-center relative overflow-hidden
                               animate-in zoom-in duration-500 delay-500
                               animate-bounce">
                  <CheckCircle className="w-10 h-10 text-green-600 z-10" />
                  {/* Sparkle effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 
                                 animate-pulse duration-1000"></div>
                </div>
                
                <h2 className="text-2xl font-bold text-green-900 mb-2
                              animate-in slide-in-from-bottom-4 duration-500 delay-700">
                  Welcome Back!
                </h2>
                
                <p className="text-green-700/80 text-sm
                              animate-in slide-in-from-bottom-4 duration-500 delay-900">
                  Successfully authenticated to LoanLo Platform
                </p>
              </div>

              {/* Progress Indicators */}
              <div className="flex justify-center space-x-2 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-1 bg-green-100 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full
                               animate-[width_1.2s_ease-in-out] w-0 
                               [animation-fill-mode:forwards]
                               [animation-name:progress-bar]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 opacity-60"></div>
      
      <div className={`relative z-10 transition-all duration-1000 ease-out ${
        justLoggedIn ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100 blur-0'
      }`}>
        {/* Header Section */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-lg tracking-wider shadow-lg">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-light text-gray-900 mb-1 tracking-tight">
                    Client Dashboard
                  </h1>
                  <p className="text-base text-gray-600 font-light">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, 
                    <span className="font-medium text-gray-900 ml-1">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link 
                  to="/profile" 
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Account Settings
                </Link>
                <button 
                  onClick={logout} 
                  className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`max-w-7xl mx-auto px-6 lg:px-8 py-8 transition-all duration-1000 delay-300 ${
          justLoggedIn ? 'animate-in slide-in-from-bottom-8 fade-in' : ''
        }`}>

            {/* KYC Status Section */}
            {hasKYC !== null && (
              <div className={`mb-8 rounded-xl p-6 shadow-sm border transition-all duration-300 ${
                hasKYC 
                  ? 'bg-gradient-to-r from-gray-900 to-black text-white border-gray-300 shadow-md' 
                  : 'bg-white text-gray-900 border-amber-200 shadow-amber-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hasKYC ? 'bg-white/10 backdrop-blur' : 'bg-amber-100'
                    }`}>
                      {hasKYC ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M6 12.5L10.5 17L18 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="1.5"/>
                          <rect x="11" y="7" width="2" height="7" rx="1" fill="#D97706"/>
                          <rect x="11" y="16" width="2" height="2" rx="1" fill="#D97706"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-1">
                        {hasKYC ? 'Identity Verification Complete' : 'Identity Verification Required'}
                      </h2>
                      <p className={`text-sm font-light ${hasKYC ? 'text-gray-200' : 'text-gray-600'}`}>
                        {hasKYC 
                          ? 'Your account is fully verified and ready for all banking services.' 
                          : 'Complete your identity verification to access loan application services.'}
                      </p>
                    </div>
                  </div>
                  {!hasKYC && (
                    <Link 
                      to="/kyc" 
                      className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Begin Verification
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Service Actions */}
            {hasKYC === true && (
              <section className="mb-10">
                <div className="mb-6">
                  <h2 className="text-2xl font-light text-gray-900 mb-2">Available Services</h2>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-gray-900 to-gray-600"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Link 
                    to="/loan-application" 
                    className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                          New Loan Application
                        </h3>
                        <p className="text-gray-600 text-sm font-light leading-relaxed">
                          Submit a new loan application with competitive interest rates and flexible terms tailored to your requirements.
                        </p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/application-status" 
                    className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                          Application Portfolio
                        </h3>
                        <p className="text-gray-600 text-sm font-light leading-relaxed">
                          Monitor and track the comprehensive status of all your submitted loan applications in one centralized location.
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link 
                    to="/kyc" 
                    className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 7l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 21H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                          View/Update Current KYC
                        </h3>
                        <p className="text-gray-600 text-sm font-light leading-relaxed">
                          Review your current KYC information and make updates to keep your verification details current and accurate.
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </section>
            )}

            {/* Applications Overview */}
            {hasKYC === true && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-light text-gray-900 mb-1">Recent Applications</h2>
                      <p className="text-sm text-gray-600 font-light">Overview of your latest loan applications</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-700">
                          {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
                        </span>
                      </div>
                    </div>
                  </div>
                </header>
                
                <div className="p-8">
                  {loading && (
                    <div className="flex justify-center items-center py-16">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-200"></div>
                      </div>
                      <span className="ml-4 text-gray-700 font-medium">Loading applications...</span>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <svg width="20" height="20" className="text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  {!loading && applications.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                      <p className="text-gray-600 mb-8 font-light">You haven't submitted any loan applications yet. Start your financial journey today.</p>
                      <Link 
                        to="/kyc" 
                        className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Submit First Application
                      </Link>
                    </div>
                  )}

                  {!loading && applications.length > 0 && (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div 
                          key={app._id} 
                          className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                  {getStatusIcon(app.status)}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-4 mb-3">
                                  <h3 className="font-semibold text-gray-900 text-lg">{app.loanType}</h3>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusClasses(app.status)}`}>
                                    {formatStatus(app.status)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-6 text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-light">Amount:</span>
                                    <span className="font-semibold text-gray-900 text-lg">{formatCurrency(app.amount)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-light">Reference:</span>
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                      #{app._id.slice(-8).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-light">Submitted:</span>
                                    <span className="font-medium">
                                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 flex-shrink-0">
                              <div className="text-sm">
                                {app.documentsUploaded ? (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <svg width="14" height="14" className="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                    </svg>
                                    Documentation Complete
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    <svg width="14" height="14" className="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Documentation Pending
                                  </span>
                                )}
                              </div>
                              
                              {!app.documentsUploaded && (
                                <Link 
                                  to={`/upload-documents/${app._id}`} 
                                  className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  Upload Documents
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {applications.length > 3 && (
                        <div className="text-center pt-6 border-t border-gray-200 mt-8">
                          <Link 
                            to="/application-status" 
                            className="inline-flex items-center text-gray-700 font-medium hover:text-gray-900 transition-colors group"
                          >
                            View Complete Application Portfolio
                            <svg width="16" height="16" className="ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Call to Action */}
            {hasKYC === true && (
              <div className="mt-12 text-center">
                <Link 
                  to="/application-status" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-medium hover:from-black hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Access Complete Portfolio
                  <svg width="20" height="20" className="ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </Link>
              </div>
            )}
        </main>
      </div>

      {/* Progress bar animation styles */}
      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}

export default Dashboard