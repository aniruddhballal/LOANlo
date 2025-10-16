import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../dashboards/shared/DashboardLayout'
import { PersonalDetailsSkeleton } from '../ui/SkeletonComponents'
import api from '../../api'

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

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

  return (
    <DashboardLayout 
      title="My Profile"
      welcomeTitle="Your Profile"
      welcomeSubtitle="View and manage your personal information"
    >
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
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Edit Profile
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="User ID" value={userData._id} />
              <InfoField label="Role" value={userData.role} />
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
            We couldn't retrieve your profile information. Please try again later.
          </p>
          <button
            onClick={fetchUserData}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Retry
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Profile