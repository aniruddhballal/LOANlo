import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Trash2, AlertTriangle, User, Mail, Phone, Key, Shield, Hash, Edit3, Save, X, ArrowLeft } from 'lucide-react'

const Profile = () => {
  const { user, updateUser, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmationPassword, setConfirmationPassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate new password if provided
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.newPassword) {
        setError('New password is required')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        return
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long')
        return
      }
    }

    // Show password confirmation modal
    setShowPasswordModal(true)
  }

  const handlePasswordConfirmation = async () => {
    if (!confirmationPassword) {
      setError('Please enter your current password to confirm changes')
      return
    }

    setLoading(true)
    setShowPasswordModal(false)

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        currentPassword: confirmationPassword,
        ...(formData.newPassword && { newPassword: formData.newPassword })
      }

      await updateUser(updateData)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      setConfirmationPassword('')
      setFormData({
        ...formData,
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      let msg = 'Failed to update profile';
      if (err && typeof err === 'object' && 'message' in err) {
        msg = (err as { message?: string }).message || msg;
      } else if (typeof err === 'string') {
        msg = err;
      }
      setError(msg);
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion')
      return
    }

    if (deleteConfirmationText.toLowerCase() !== 'delete my account') {
      setError('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }

    setDeleteLoading(true)
    setError('')

    try {
      await deleteAccount(deletePassword)
      navigate('/')
    } catch (err) {
      let msg = 'Failed to delete account';
      if (err && typeof err === 'object' && 'message' in err) {
        msg = (err as { message?: string }).message || msg;
      } else if (typeof err === 'string') {
        msg = err;
      }
      setError(msg);
      setDeleteLoading(false);
    }
  }

  const cancelEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      newPassword: '',
      confirmPassword: ''
    })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true)
    setDeleteConfirmationText('')
    setDeletePassword('')
    setError('')
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeleteConfirmationText('')
    setDeletePassword('')
    setError('')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-3xl font-bold text-black">Profile</h1>
            </div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg animate-fade-in">
            <span>{success}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
          {!isEditing ? (
            // View Mode
            <div>
              <div className="px-6 py-4 bg-gray-100 border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-black">Profile Information</h3>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button 
                      onClick={openDeleteModal}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>First Name</span>
                    </label>
                    <div className="text-black text-lg font-medium">
                      {user.firstName}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Last Name</span>
                    </label>
                    <div className="text-black text-lg font-medium">
                      {user.lastName}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </label>
                    <div className="text-black text-lg font-medium">
                      {user.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </label>
                    <div className={`text-lg font-medium ${!user.phone ? 'text-gray-500 italic' : 'text-black'}`}>
                      {user.phone || 'Not provided'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Role</span>
                    </label>
                    <div className="text-black text-lg font-medium">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-black">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>User ID</span>
                    </label>
                    <div className="text-gray-700 text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg">
                      {user.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 bg-gray-100 border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-black">Edit Profile</h3>
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button" 
                      onClick={cancelEdit}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>First Name</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black bg-white placeholder-gray-500"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Last Name</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black bg-white placeholder-gray-500"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black bg-white placeholder-gray-500"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black bg-white placeholder-gray-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>New Password</span>
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black bg-white placeholder-gray-500"
                      placeholder="Enter new password (leave blank to keep current)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>Confirm New Password</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black bg-white placeholder-gray-500"
                      placeholder="Re-enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Role</span>
                    </label>
                    <input
                      type="text"
                      value={user.role.replace('_', ' ').toUpperCase()}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>User ID</span>
                    </label>
                    <input
                      type="text"
                      value={user.id}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in border border-gray-300">
            <h3 className="text-xl font-semibold text-black mb-4">Confirm Changes</h3>
            <p className="text-gray-700 mb-6">
              Please enter your current password to confirm these changes:
            </p>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="confirmationPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmationPassword"
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black bg-white placeholder-gray-500"
                  placeholder="Enter your current password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={() => {
                  setShowPasswordModal(false)
                  setConfirmationPassword('')
                  setError('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handlePasswordConfirmation}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{loading ? 'Confirming...' : 'Confirm Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in border border-gray-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-black">Delete Account</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                <strong>This action cannot be undone.</strong> This will permanently delete your account and remove all associated data including:
              </p>
              <ul className="text-gray-700 space-y-1 ml-4">
                <li>• Your profile information</li>
                <li>• All your posts and comments</li>
                <li>• Your activity history</li>
                <li>• Any uploaded files or documents</li>
                <li>• All related data across the platform</li>
              </ul>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE MY ACCOUNT" to confirm:
              </label>
              <input
                type="text"
                id="deleteConfirmation"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200 text-black bg-white placeholder-gray-500"
                placeholder="DELETE MY ACCOUNT"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200 text-black bg-white placeholder-gray-500"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-200"
                >
                  {showDeletePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg transition-colors duration-200"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmationText.toLowerCase() !== 'delete my account' || !deletePassword}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {deleteLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{deleteLoading ? 'Deleting...' : 'Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Profile