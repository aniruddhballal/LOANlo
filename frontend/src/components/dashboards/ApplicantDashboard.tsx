import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from './shared/DashboardLayout'
import { PersonalDetailsSkeleton, ServiceActionsSkeleton } from '../ui/SkeletonComponents'
import api from '../../api'

const ApplicantDashboard = () => {
  const [loading] = useState(true)
  const [hasPersonalDetails, setHasPersonalDetails] = useState<boolean | null>(null)
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null)

  useEffect(() => {
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
      setIsEmailVerified(user?.isEmailVerified ?? false)
    } catch (err) {
      console.error('Failed to check User Details status:', err)
      setHasPersonalDetails(false)
      setIsEmailVerified(false)
    }
  }

  return (
    <DashboardLayout 
      title="Applicant Dashboard"
      welcomeTitle="Welcome Back!"
      welcomeSubtitle="Successfully authenticated to LoanLo Platform"
    >
      {/* Email Verification Section */}
      {isEmailVerified === null ? (
        <PersonalDetailsSkeleton />
      ) : !isEmailVerified ? (
        <div className="mb-8 rounded-xl p-6 shadow-sm border transition-all duration-300 bg-white text-gray-900 border-red-200 shadow-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="17" cy="17" r="4" fill="#DC2626"/>
                  <path d="M17 15v2M17 19h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Email Verification Required
                </h2>
                <p className="text-sm font-light text-gray-600">
                  Please check your email inbox for a verification link to activate your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Personal Details Section - Only show if email is verified */}
      {isEmailVerified === true && (
        hasPersonalDetails === null ? (
          <PersonalDetailsSkeleton />
        ) : !hasPersonalDetails ? (
          <div className="mb-8 rounded-xl p-6 shadow-sm border transition-all duration-300 bg-white text-gray-900 border-amber-200 shadow-amber-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="1.5"/>
                    <rect x="11" y="7" width="2" height="7" rx="1" fill="#D97706"/>
                    <rect x="11" y="16" width="2" height="2" rx="1" fill="#D97706"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Personal Details Required
                  </h2>
                  <p className="text-sm font-light text-gray-600">
                    Please complete your personal details to continue with loan applications.
                  </p>
                </div>
              </div>
              <Link
                to="/personal-details"
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        ) : null
      )}

      {/* Service Actions */}
      {loading && hasPersonalDetails === null ? (
        <ServiceActionsSkeleton />
      ) : isEmailVerified === true && hasPersonalDetails === true && (
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
    </DashboardLayout>
  )
}

export default ApplicantDashboard