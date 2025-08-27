import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle } from 'lucide-react'

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
  const { user, logout } = useAuth()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [justLoggedIn, setJustLoggedIn] = useState(false)

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

  // Check for login success and handle overlay timing
  useEffect(() => {
    const loginSuccess = sessionStorage.getItem('loginSuccess')
    if (loginSuccess === 'true') {
      setJustLoggedIn(true)
      
      // Hide overlay after animation completes (1.2s animation + 0.3s buffer)
      setTimeout(() => {
        setJustLoggedIn(false)
        sessionStorage.removeItem('loginSuccess')
      }, 1500)
    }
  }, [])

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
                  Successfully authenticated to Underwriter Panel
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
                    Underwriter Dashboard
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
                  className="relative px-5 py-2.5 text-sm font-medium text-gray-800 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 group"
                >
                  <span className="relative z-10">Account Settings</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </Link>
                <button 
                  onClick={logout} 
                  className="relative px-5 py-2.5 text-sm font-medium text-white bg-black backdrop-blur-md border border-white/20 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-500 group"
                >
                  <span className="relative z-10">Sign Out</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`max-w-7xl mx-auto px-6 lg:px-8 py-8 transition-all duration-1000 delay-300 ${
          justLoggedIn ? 'animate-in slide-in-from-bottom-8 fade-in' : ''
        }`}>
          {/* Applications Overview */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-1">
                    Loan Applications
                  </h2>
                  <p className="text-sm text-gray-600 font-light">
                    Review and process submitted loan applications
                  </p>
                </div>
                {/* Application Count */}
                <div className="text-sm font-medium text-gray-700">
                  {loading 
                    ? "Loading..." 
                    : `${applications.length} ${applications.length === 1 ? "Application" : "Applications"}`}
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
                  <p className="text-gray-600 mb-8 font-light">There are currently no loan applications to review.</p>
                </div>
              )}

              {!loading && applications.length > 0 && (
                <div className="overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Reference
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Applicant
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Submitted
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {applications.map((app) => (
                            <tr key={app._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                                  #{app._id.slice(-8).toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                    {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {app.userId?.firstName} {app.userId?.lastName}
                                    </div>
                                    <div className="text-sm text-gray-600 font-light">
                                      {app.userId?.role}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <div className="text-gray-900 font-medium">{app.userId?.email}</div>
                                  <div className="text-gray-600 font-light">{app.userId?.phone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-semibold text-gray-900 text-lg">
                                  {formatCurrency(app.amount)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4">
                                    {getStatusIcon(app.status)}
                                  </div>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusClasses(app.status)}`}>
                                    {formatStatus(app.status)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div>
                                  {new Date(app.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs text-gray-500 font-light">
                                  {new Date(app.createdAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md">
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {applications.map((app) => (
                      <div 
                        key={app._id} 
                        className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {app.userId?.firstName} {app.userId?.lastName}
                              </div>
                              <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                                #{app._id.slice(-8).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4">
                              {getStatusIcon(app.status)}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusClasses(app.status)}`}>
                              {formatStatus(app.status)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-light">Amount</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(app.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-light">Email</span>
                            <span className="text-sm text-gray-900">{app.userId?.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-light">Phone</span>
                            <span className="text-sm text-gray-900">{app.userId?.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-light">Submitted</span>
                            <span className="text-sm text-gray-900">
                              {new Date(app.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                          <button className="flex-1 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200">
                            Review
                          </button>
                          <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
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