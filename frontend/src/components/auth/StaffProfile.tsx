import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PersonalDetailsSkeleton } from '../ui/SkeletonComponents'
import api from '../../api'
import { getGreeting } from '../utils'
import { formatDate } from '../utils'

const StaffProfile = () => {
  const { userId } = useParams<{ userId: string }>()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      // If userId exists in URL, fetch that user, otherwise fetch own profile
      const endpoint = userId ? `/profile/${userId}` : '/profile/me'
      const { data } = await api.get(endpoint)
      setUserData(data.user)
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )

  const InfoField = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div>
      <p className="text-sm font-light text-gray-600 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
  )

  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'applicant': 'Applicant',
      'underwriter': 'Underwriter',
      'system_admin': 'System Admin'
    }
    return roleMap[role] || role
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 opacity-60"></div>
      
      <div className="relative z-10">
        {/* Dashboard Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-lg tracking-wider shadow-lg">
                    {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-light text-gray-900 mb-1 tracking-tight">
                    Staff Profile
                  </h1>
                  <p className="text-base text-gray-600 font-light">
                    {userId ? (
                      <>
                        Viewing profile of
                        <span className="font-medium text-gray-900 ml-1">
                          {userData?.firstName} {userData?.lastName}
                        </span>
                      </>
                    ) : (
                      <>
                        Good {getGreeting()},
                        <span className="font-medium text-gray-900 ml-1">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="ml-2 text-gray-500">• View your staff information</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(-1)}
                  className="relative px-5 py-2.5 text-sm font-medium text-gray-900 bg-white backdrop-blur-md border border-gray-300 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 group"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Back</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          {loading ? (
            <PersonalDetailsSkeleton />
          ) : userData ? (
            <>
              {/* Account Status */}
              <div className="mb-8 rounded-xl p-6 shadow-sm border transition-all duration-300 bg-white text-gray-900 border-green-200 shadow-green-100">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="1.5"/>
                      <path d="M9 12l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">
                      Account Status: {userData.isEmailVerified ? 'Verified' : 'Unverified'}
                    </h2>
                    <p className="text-sm font-light text-gray-600">
                      {userData.isEmailVerified 
                        ? 'Account is fully verified and active'
                        : 'Email verification pending'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Staff Information */}
              <InfoSection title="Basic Information">
                <InfoField label="First Name" value={userData.firstName} />
                <InfoField label="Last Name" value={userData.lastName} />
                <InfoField label="Email" value={userData.email} />
                <InfoField label="Phone Number" value={userData.phone} />
                <InfoField label="Role" value={getRoleDisplay(userData.role)} />
                <InfoField 
                  label="Email Verified" 
                  value={userData.isEmailVerified ? 'Yes' : 'No'} 
                />
              </InfoSection>

              {/* Account Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="User ID" value={userData._id} />
                  <InfoField label="Account Created" value={formatDate(userData.createdAt)} />
                  <InfoField label="Last Updated" value={formatDate(userData.updatedAt)} />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h3>
              <p className="text-gray-600 text-sm font-light mb-6">
                We couldn't retrieve the profile information. Please try again later.
              </p>
              <button
                onClick={fetchUserData}
                className="relative px-5 py-2.5 text-sm font-medium text-white bg-black backdrop-blur-md border border-white/20 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-500 group"
              >
                <span className="relative z-10">Retry</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffProfile