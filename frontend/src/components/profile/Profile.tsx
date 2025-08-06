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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          </div>
          <p className="text-gray-700 text-lg font-medium tracking-wide">Loading Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Elegant Header with Shadow */}
      <div className="bg-white shadow-xl border-b border-gray-200 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-inner border border-gray-300">
                <User className="h-7 w-7 text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-light text-black tracking-wide">Account Profile</h1>
                <p className="text-gray-600 text-sm font-medium mt-1">Manage your personal information and settings</p>
              </div>
            </div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center space-x-3 px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="tracking-wide">Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Elegant Status Messages */}
        {error && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 shadow-lg rounded-r-xl p-6 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-red-200 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-700" />
                </div>
              </div>
              <div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-8 bg-gradient-to-r from-emerald-50 to-emerald-100 border-l-4 border-emerald-400 shadow-lg rounded-r-xl p-6 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-emerald-200 rounded-full">
                  <div className="h-5 w-5 bg-emerald-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-emerald-800 font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sophisticated Profile Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm">
          {!isEditing ? (
            // Elegant View Mode
            <div>
              <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-light text-black tracking-wide">Personal Information</h2>
                    <p className="text-gray-600 text-sm mt-1">Your account details and preferences</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium tracking-wide"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button 
                      onClick={openDeleteModal}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium tracking-wide"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[
                    { icon: User, label: 'First Name', value: user.firstName, key: 'firstName' },
                    { icon: User, label: 'Last Name', value: user.lastName, key: 'lastName' },
                    { icon: Mail, label: 'Email Address', value: user.email, key: 'email' },
                    { icon: Phone, label: 'Phone Number', value: user.phone || 'Not provided', key: 'phone' },
                    { icon: Shield, label: 'Account Role', value: user.role.replace('_', ' '), key: 'role' },
                    { icon: Hash, label: 'User Identifier', value: user.id, key: 'id' }
                  ].map(({ icon: Icon, label, value, key }) => (
                    <div key={key} className="group">
                      <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors duration-200">
                            <Icon className="h-4 w-4 text-gray-700" />
                          </div>
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-widest">
                            {label}
                          </label>
                        </div>
                        <div className={`text-lg font-medium tracking-wide ${
                          key === 'phone' && !user.phone 
                            ? 'text-gray-500 italic' 
                            : key === 'id' 
                            ? 'text-gray-700 font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg border' 
                            : key === 'role'
                            ? 'text-black'
                            : 'text-black'
                        }`}>
                          {key === 'role' ? (
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-gray-200 to-gray-300 text-black border border-gray-300">
                              {value.charAt(0).toUpperCase() + value.slice(1)}
                            </span>
                          ) : (
                            value
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Refined Edit Mode
            <form onSubmit={handleSubmit}>
              <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-light text-black tracking-wide">Edit Profile</h2>
                    <p className="text-gray-600 text-sm mt-1">Update your personal information</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      type="button" 
                      onClick={cancelEdit}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-sm font-medium tracking-wide"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium tracking-wide"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[
                    { name: 'firstName', label: 'First Name', icon: User, type: 'text', required: true },
                    { name: 'lastName', label: 'Last Name', icon: User, type: 'text', required: true },
                    { name: 'email', label: 'Email Address', icon: Mail, type: 'email', required: true },
                    { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', required: false },
                    { name: 'newPassword', label: 'New Password', icon: Key, type: 'password', required: false },
                    { name: 'confirmPassword', label: 'Confirm New Password', icon: Key, type: 'password', required: false }
                  ].map(({ name, label, icon: Icon, type, required }) => (
                    <div key={name} className="space-y-3">
                      <label htmlFor={name} className="flex items-center space-x-3 text-sm font-semibold text-gray-600 uppercase tracking-widest">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <Icon className="h-4 w-4 text-gray-700" />
                        </div>
                        <span>{label}</span>
                        {required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={type}
                        id={name}
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange}
                        required={required}
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 text-black bg-white placeholder-gray-400 shadow-sm hover:shadow-md font-medium"
                        placeholder={`Enter your ${label.toLowerCase()}${!required ? ' (optional)' : ''}`}
                      />
                    </div>
                  ))}

                  {/* Read-only fields */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 text-sm font-semibold text-gray-600 uppercase tracking-widest">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <Shield className="h-4 w-4 text-gray-700" />
                      </div>
                      <span>Account Role</span>
                    </label>
                    <input
                      type="text"
                      value={user.role.replace('_', ' ').toUpperCase()}
                      disabled
                      className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-100 text-gray-600 rounded-xl cursor-not-allowed font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 text-sm font-semibold text-gray-600 uppercase tracking-widest">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <Hash className="h-4 w-4 text-gray-700" />
                      </div>
                      <span>User Identifier</span>
                    </label>
                    <input
                      type="text"
                      value={user.id}
                      disabled
                      className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-100 text-gray-600 rounded-xl cursor-not-allowed font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Sophisticated Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fade-in border border-gray-200">
            <div className="text-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-light text-black tracking-wide">Confirm Changes</h3>
              <p className="text-gray-600 mt-2 leading-relaxed">
                Please verify your identity by entering your current password to proceed with these changes.
              </p>
            </div>
            
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <label htmlFor="confirmationPassword" className="block text-sm font-semibold text-gray-600 uppercase tracking-widest mb-3">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmationPassword"
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  className="w-full px-5 py-4 pr-14 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 text-black bg-white placeholder-gray-400 shadow-sm font-medium"
                  placeholder="Enter your current password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-200 p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                type="button"
                onClick={() => {
                  setShowPasswordModal(false)
                  setConfirmationPassword('')
                  setError('')
                }}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-sm font-medium tracking-wide"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handlePasswordConfirmation}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium tracking-wide flex items-center justify-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                <span>{loading ? 'Confirming...' : 'Confirm Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in border border-gray-200">
            <div className="text-center mb-8">
              <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-3xl font-light text-black tracking-wide">Delete Account</h3>
              <p className="text-gray-600 mt-2 leading-relaxed">
                This action is permanent and cannot be undone
              </p>
            </div>
            
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-gray-800 mb-4 font-medium">
                <strong>Warning:</strong> Deleting your account will permanently remove:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span>Profile information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span>Posts and comments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span>Activity history</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span>Uploaded files</span>
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span>All associated platform data</span>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label htmlFor="deleteConfirmation" className="block text-sm font-semibold text-gray-600 uppercase tracking-widest mb-3">
                  Type "DELETE MY ACCOUNT" to confirm:
                </label>
                <input
                  type="text"
                  id="deleteConfirmation"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-300 text-black bg-white placeholder-gray-400 shadow-sm font-medium"
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>

              <div>
                <label htmlFor="deletePassword" className="block text-sm font-semibold text-gray-600 uppercase tracking-widest mb-3">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-300 text-black bg-white placeholder-gray-400 shadow-sm font-medium"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-200 p-1"
                  >
                    {showDeletePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button 
                type="button"
                onClick={closeDeleteModal}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-sm font-medium tracking-wide"
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