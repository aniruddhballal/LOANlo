import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PersonalDetailsSkeleton } from '../ui/SkeletonComponents'
import api from '../../api'

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data } = await api.get('/profile/me')
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
      navigate('/')
    } catch (err) {
      console.error('Failed to delete account:', err)
      alert('Failed to delete account. Please try again.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning'
    if (hour < 17) return 'Afternoon'
    return 'Evening'
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
              className="relative flex-1 px-4 py-3 text-sm font-medium text-gray-900 bg-white backdrop-blur-md border border-gray-300 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="relative z-10">Cancel</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="relative flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 backdrop-blur-md border border-white/20 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="relative z-10">{deleteLoading ? 'Deleting...' : 'Delete Account'}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
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
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
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
                    My Profile
                  </h1>
                  <p className="text-base text-gray-600 font-light">
                    Good {getGreeting()},
                    <span className="font-medium text-gray-900 ml-1">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="ml-2 text-gray-500">• View and manage your personal information</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="relative px-5 py-2.5 text-sm font-medium text-gray-900 bg-white backdrop-blur-md border border-gray-300 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 group"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Profile</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
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
        <main className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          {loading ? (
            <PersonalDetailsSkeleton />
          ) : userData ? (
            <>
              {/* Account Status */}
              <div className="mb-8 rounded-xl p-6 shadow-sm border transition-all duration-300 bg-white text-gray-900 border-green-200 shadow-green-100">
                <div className="flex items-center justify-between">
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
                          ? 'Your account is fully verified and active'
                          : 'Please verify your email to unlock all features'
                        }
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/personal-details"
                    className="relative px-5 py-2.5 text-sm font-medium text-white bg-black backdrop-blur-md border border-white/20 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-500 group"
                  >
                    <span className="relative z-10">Edit Profile</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  </Link>
                </div>
              </div>

              {/* Personal Information */}
              <InfoSection title="Personal Information">
                <InfoField label="First Name" value={userData.firstName} />
                <InfoField label="Last Name" value={userData.lastName} />
                <InfoField label="Date of Birth" value={formatDate(userData.dateOfBirth)} />
                <InfoField label="Gender" value={userData.gender} />
                <InfoField label="Marital Status" value={userData.maritalStatus} />
              </InfoSection>

              {/* Identity Documents */}
              <InfoSection title="Identity Documents">
                <InfoField label="Aadhaar Number" value={userData.aadhaarNumber ? `XXXX XXXX ${userData.aadhaarNumber.slice(-4)}` : 'N/A'} />
                <InfoField label="PAN Number" value={userData.panNumber} />
              </InfoSection>

              {/* Contact Information */}
              <InfoSection title="Contact Information">
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
              <InfoSection title="Employment Details">
                <InfoField label="Employment Type" value={userData.employmentType} />
                <InfoField label="Company Name" value={userData.companyName} />
                <InfoField label="Designation" value={userData.designation} />
                <InfoField label="Work Experience" value={userData.workExperience ? `${userData.workExperience} years` : 'N/A'} />
                <InfoField label="Monthly Income" value={formatCurrency(userData.monthlyIncome)} />
              </InfoSection>

              {/* Account Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <InfoField label="User ID" value={userData._id} />
                  <InfoField label="Role" value={userData.role} />
                  <InfoField label="Account Created" value={formatDate(userData.createdAt)} />
                  <InfoField label="Last Updated" value={formatDate(userData.updatedAt)} />
                </div>
                
                {/* Danger Zone */}
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
                      className="relative px-5 py-2.5 text-sm font-medium text-white bg-red-600 backdrop-blur-md border border-white/20 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-red-700 group"
                    >
                      <span className="relative z-10">Delete Account</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    </button>
                  </div>
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
                We couldn't retrieve your profile information. Please try again later.
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  )
}

export default Profile