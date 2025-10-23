import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ProfileSkeleton } from '../ui/SkeletonComponents'
import api from '../../api'
import { getGreeting } from '../utils'
import { formatDate, formatCurrency } from '../utils'

const Profile = () => {
  const { userId } = useParams<{ userId: string }>()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      const endpoint = userId ? `/profile/${userId}` : '/profile/me'
      const { data } = await api.get(endpoint)
      setUserData(data.user)
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await api.delete('/profile/me')
      localStorage.removeItem('token')
      navigate('/account-deleted')
    } catch (err) {
      console.error('Failed to delete account:', err)
      alert('Failed to delete account. Please try again.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const handleViewHistory = () => {
    const targetUserId = userId || user?.id
    if (targetUserId) {
      navigate(`/profile/history/${targetUserId}`)
    }
  }

  const InfoSection = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
    <div 
      className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 overflow-hidden mb-6"
      style={{ animation: `fadeInUp 0.5s ease-out ${delay}s both` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="relative pb-3 mb-4">
          <h3 className="font-semibold text-gray-900 text-lg tracking-tight">{title}</h3>
          <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      </div>
    </div>
  )

  const InfoField = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="group/field">
      <p className="text-sm font-medium text-gray-500 mb-1.5 tracking-wide">{label}</p>
      <p className="text-base text-gray-900 font-medium transition-colors duration-200 group-hover/field:text-gray-700">{value || 'N/A'}</p>
    </div>
  )

  const DeleteConfirmationModal = () => (
    <div 
      className="fixed inset-0 backdrop-blur-sm z-[9999] overflow-y-auto"
      style={{ position: 'fixed' }}
      onClick={() => setShowDeleteModal(false)}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Delete Account?
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            This action cannot be undone. All your data, including loan applications and personal information, will be permanently deleted.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
              className="group relative flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Cancel</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="group relative flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 border border-red-700 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">{deleteLoading ? 'Deleting...' : 'Delete Account'}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 opacity-60"></div>
      
      <div className="relative z-10">
        {/* Dashboard Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm" style={{ animation: 'fadeInDown 0.5s ease-out' }}>
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-lg tracking-wider shadow-lg transition-transform duration-300 hover:scale-105">
                    {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 mb-1 tracking-tight">
                    {userId ? 'User Profile' : 'My Profile'}
                  </h1>
                  <p className="text-base text-gray-600">
                    {userId ? (
                      <>
                        Viewing profile of
                        <span className="font-semibold text-gray-900 ml-1">
                          {userData?.firstName} {userData?.lastName}
                        </span>
                      </>
                    ) : (
                      <>
                        Good {getGreeting()},
                        <span className="font-semibold text-gray-900 ml-1">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="ml-2 text-gray-500">• View and manage your personal information</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {userId ? (
                  <>
                    <button
                      onClick={handleViewHistory}
                      className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-400 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>View History</span>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    </button>
                    <button
                      onClick={() => navigate(-1)}
                      className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-400 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600 transition-transform duration-300 group-hover:-translate-x-1">
                          <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Back</span>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleViewHistory}
                      className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-400 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>View History</span>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    </button>
                    <button
                      onClick={() => navigate(-1)}
                      className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-400 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600 transition-transform duration-300 group-hover:-translate-x-1">
                          <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Back</span>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    </button>
                    <button
                      onClick={logout}
                      className="group relative px-5 py-2.5 text-sm font-medium text-white bg-gray-900 border border-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-gray-800 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10">Sign Out</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          {loading ? (
            <ProfileSkeleton />
          ) : userData ? (
            <>
              {/* Account Status */}
              <div 
                className="group mb-8 rounded-xl p-6 shadow-sm border transition-all duration-300 bg-white border-green-200 hover:shadow-md hover:border-green-300 hover:-translate-y-0.5 overflow-hidden"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 transition-transform duration-300 group-hover:scale-105">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="1.5"/>
                        <path d="M9 12l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        Account Status: {userData.isEmailVerified ? 'Verified' : 'Unverified'}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {userData.isEmailVerified 
                          ? 'Account is fully verified and active'
                          : 'Email verification pending'
                        }
                      </p>
                    </div>
                  </div>
                  {!userId && (
                    <Link
                      to="/personal-details"
                      className="group/edit relative px-5 py-2.5 text-sm font-medium text-white bg-gray-900 border border-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-gray-800 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10">Edit Profile</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/edit:opacity-100 translate-x-[-100%] group-hover/edit:translate-x-[100%] transition-transform duration-700"></span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <InfoSection title="Personal Information" delay={0.2}>
                <InfoField label="First Name" value={userData.firstName} />
                <InfoField label="Last Name" value={userData.lastName} />
                <InfoField label="Date of Birth" value={formatDate(userData.dateOfBirth)} />
                <InfoField label="Gender" value={userData.gender} />
                <InfoField label="Marital Status" value={userData.maritalStatus} />
              </InfoSection>

              {/* Identity Documents */}
              <InfoSection title="Identity Documents" delay={0.3}>
                <InfoField label="Aadhaar Number" value={userData.aadhaarNumber ? `XXXX XXXX ${userData.aadhaarNumber.slice(-4)}` : 'N/A'} />
                <InfoField label="PAN Number" value={userData.panNumber} />
              </InfoSection>

              {/* Contact Information */}
              <InfoSection title="Contact Information" delay={0.4}>
                <InfoField label="Email" value={userData.email} />
                <InfoField label="Phone Number" value={userData.phone} />
                <div className="md:col-span-2">
                  <InfoField 
                    label="Address" 
                    value={`${userData.address || ''}, ${userData.city || ''}, ${userData.state || ''} - ${userData.pincode || ''}`} 
                  />
                </div>
              </InfoSection>

              {/* Employment Details */}
              <InfoSection title="Employment Details" delay={0.5}>
                <InfoField label="Employment Type" value={userData.employmentType} />
                <InfoField label="Company Name" value={userData.companyName} />
                <InfoField label="Designation" value={userData.designation} />
                <InfoField label="Work Experience" value={userData.workExperience ? `${userData.workExperience} years` : 'N/A'} />
                <InfoField label="Monthly Income" value={formatCurrency(userData.monthlyIncome)} />
              </InfoSection>

              {/* Account Information */}
              <div 
                className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 overflow-hidden"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.6s both' }}
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="relative pb-3 mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg tracking-tight">Account Information</h3>
                    <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <InfoField label="User ID" value={userData._id} />
                    <InfoField label="Role" value={userData.role} />
                    <InfoField label="Account Created" value={formatDate(userData.createdAt)} />
                    <InfoField label="Last Updated" value={formatDate(userData.updatedAt)} />
                  </div>
                  
                  {!userId && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900 mb-1">Delete Account</h4>
                          <p className="text-sm text-gray-600">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="group/delete relative px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-red-700 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-red-700 hover:-translate-y-0.5"
                        >
                          <span className="relative z-10">Delete Account</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/delete:opacity-100 translate-x-[-100%] group-hover/delete:translate-x-[100%] transition-transform duration-700"></span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h3>
              <p className="text-gray-600 text-sm mb-6">
                We couldn't retrieve your profile information. Please try again later.
              </p>
              <button
                onClick={fetchUserData}
                className="group relative px-5 py-2.5 text-sm font-medium text-white bg-gray-900 border border-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-gray-800 hover:-translate-y-0.5"
              >
                <span className="relative z-10">Retry</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default Profile