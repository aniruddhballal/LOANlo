import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from './shared/DashboardLayout'
import { ErrorAlert } from './shared/ErrorAlert'
import { EmptyState } from './shared/EmptyState'
import { StatusBadge } from './shared/StatusBadge'
import { formatCurrency, formatDate, formatApplicationId } from './utils/formatters'
import api from '../../api'
import React from 'react'

interface SkeletonBaseProps {
  className?: string;
  children?: React.ReactNode;
}

const SkeletonBase: React.FC<SkeletonBaseProps> = ({ className = "", children }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

const SkeletonBox = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded-lg ${className}`} />
);

const SkeletonText = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded-md h-4 ${className}`} />
);

const SkeletonCircle = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded-full ${className}`} />
);

const PersonalDetailsSkeleton = () => (
  <SkeletonBase>
    <div className="mb-8 rounded-xl p-6 shadow-sm border bg-white border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <SkeletonCircle className="w-12 h-12" />
          <div>
            <SkeletonText className="w-48 mb-2" />
            <SkeletonText className="w-64 h-3" />
          </div>
        </div>
        <SkeletonBox className="w-32 h-12 rounded-lg" />
      </div>
    </div>
  </SkeletonBase>
);

const ServiceActionsSkeleton = () => (
  <SkeletonBase>
    <section className="mb-10">
      <div className="mb-6">
        <SkeletonText className="w-48 h-8 mb-2" />
        <SkeletonBox className="w-16 h-0.5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start space-x-4">
              <SkeletonBox className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <SkeletonText className="w-40 h-5 mb-2" />
                <SkeletonText className="w-full h-3 mb-1" />
                <SkeletonText className="w-3/4 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </SkeletonBase>
);

const ApplicationCardSkeleton = () => (
  <div className="border border-gray-200 rounded-xl p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6 flex-1 min-w-0">
        <SkeletonCircle className="w-10 h-10" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4 mb-3">
            <SkeletonText className="w-32 h-5" />
            <SkeletonBox className="w-20 h-6 rounded-full" />
          </div>
          
          <div className="flex items-center space-x-6">
            <SkeletonText className="w-24 h-4" />
            <SkeletonText className="w-28 h-4" />
            <SkeletonText className="w-32 h-4" />
          </div>
        </div>
      </div>
      
      <SkeletonBox className="w-48 h-12 rounded-xl" />
    </div>
  </div>
);

interface LoanApplication {
  _id: string
  loanType: string
  amount: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  createdAt: string
  documentsUploaded: boolean
}

const ApplicantDashboard = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasPersonalDetails, setHasPersonalDetails] = useState<boolean | null>(null)

  useEffect(() => {
    fetchApplications()
    checkPersonalDetailsStatus()
  }, [])

  const checkPersonalDetailsStatus = async () => {
    try {
      const { data } = await api.get('/profile/me')
      const requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
        'aadhaarNumber', 'panNumber', 'email', 'phone', 'address', 'city',
        'state', 'pincode', 'employmentType', 'companyName', 'designation',
        'workExperience', 'monthlyIncome'
      ]
      const user = data.user
      const allFieldsFilled = user && requiredFields.every(field => user[field] && user[field].toString().trim() !== '')
      setHasPersonalDetails(!!user && allFieldsFilled)
    } catch (err) {
      console.error('Failed to check User Details status:', err)
      setHasPersonalDetails(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/loans/my-applications')
      setApplications(data.applications)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications')
    } finally {
      setLoading(false)
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

  return (
    <DashboardLayout 
      title="Applicant Dashboard"
      welcomeTitle="Welcome Back!"
      welcomeSubtitle="Successfully authenticated to LoanLo Platform"
    >
      {/* Personal Details Section */}
      {hasPersonalDetails === null ? (
        <PersonalDetailsSkeleton />
      ) : (
        <div className={`mb-8 rounded-xl p-6 shadow-sm border transition-all duration-300 ${
          hasPersonalDetails 
            ? 'bg-gradient-to-r from-gray-900 to-black text-white border-gray-300 shadow-md' 
            : 'bg-white text-gray-900 border-amber-200 shadow-amber-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                hasPersonalDetails ? 'bg-white/10 backdrop-blur' : 'bg-amber-100'
              }`}>
                {hasPersonalDetails ? (
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
                  {hasPersonalDetails ? 'Personal Details Complete' : 'Personal Details Required'}
                </h2>
                <p className={`text-sm font-light ${hasPersonalDetails ? 'text-gray-200' : 'text-gray-600'}`}>
                  {hasPersonalDetails 
                     ? 'Your personal details are complete and your profile is ready for loan applications.'
                     : 'Please complete your personal details to continue with loan applications.'}
                </p>
              </div>
            </div>
            {!hasPersonalDetails && (
              <Link 
                to="/personal-details" 
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Complete Profile
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Service Actions */}
      {loading && hasPersonalDetails === null ? (
        <ServiceActionsSkeleton />
      ) : hasPersonalDetails === true && (
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
              to="/personal-details" 
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
                    View/Update Personal Details
                  </h3>
                  <p className="text-gray-600 text-sm font-light leading-relaxed">
                    Review your saved personal details and update them anytime to keep your profile accurate.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Applications Overview */}
      {hasPersonalDetails === true && (
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
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <ApplicationCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
            
            {error && <ErrorAlert message={error} />}

            {!loading && applications.length === 0 && (
              <EmptyState 
                title="No Applications Found"
                description="You haven't submitted any loan applications yet. Start your financial journey today."
                action={
                  <Link 
                    to="/loan-application" 
                    className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Submit First Application
                  </Link>
                }
              />
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
                            <StatusBadge status={app.status} showIcon={false} />
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span className="font-light">Amount:</span>
                              <span className="font-semibold text-gray-900 text-lg">{formatCurrency(app.amount)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-light">Reference:</span>
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                {formatApplicationId(app._id)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-light">Submitted:</span>
                              <span className="font-medium">{formatDate(app.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center">
                        {app.documentsUploaded ? (
                          <div className="inline-flex items-center px-5 py-3 rounded-xl text-sm font-semibold bg-white text-emerald-700 border-2 border-emerald-200 shadow-sm">
                            <div className="w-5 h-5 mr-3 bg-emerald-100 rounded-full flex items-center justify-center">
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                              </svg>
                            </div>
                            Documentation Verified
                          </div>
                        ) : (
                          <Link
                            to="/upload-documents"
                            state={{ applicationId: app._id }}
                            className="inline-flex items-center px-5 py-3 rounded-xl text-sm font-semibold bg-white text-amber-700 border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 shadow-sm hover:shadow-lg group"
                          >
                            <div className="w-5 h-5 mr-3 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200">
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                              </svg>
                            </div>
                            Upload Required Documents
                            <svg width="14" height="14" className="ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                            </svg>
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
            </>
          )}
          </div>
        </section>
      )}

      {/* Call to Action */}
      {hasPersonalDetails === true && (
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
    </DashboardLayout>
  )
}

export default ApplicantDashboard