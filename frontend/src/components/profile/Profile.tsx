import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './profile.module.css'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
const [formData, setFormData] = useState({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  email: user?.email || '',
  phone: user?.phone || '',
  // Add these new fields:
  newPassword: '',
  confirmPassword: ''
})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmationPassword, setConfirmationPassword] = useState('')
const [showPasswordModal, setShowPasswordModal] = useState(false)

useEffect(() => {
  if (user) {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      // Add these:
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

const handleSubmit = async (e: React.FormEvent) => {
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
  } catch (err: any) {
    setError(err.message || 'Failed to update profile')
  } finally {
    setLoading(false)
  }
}

const cancelEdit = () => {
  setFormData({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // Add these:
    newPassword: '',
    confirmPassword: ''
  })
  setIsEditing(false)
  setError('')
  setSuccess('')
}

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundAnimation}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
          <div className={styles.blob3}></div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>Profile</h1>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className={styles.successContainer}>
          <span className={styles.successText}>{success}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className={styles.profileCard}>
        {!isEditing ? (
          // View Mode
          <div>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Profile Information</h3>
              <button 
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                Edit Profile
              </button>
            </div>

            <div className={styles.profileGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>First Name</label>
                <div className={styles.fieldValue}>
                  {user.firstName}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Last Name</label>
                <div className={styles.fieldValue}>
                  {user.lastName}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email</label>
                <div className={styles.fieldValue}>
                  {user.email}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone</label>
                <div className={`${styles.fieldValue} ${!user.phone ? styles.fieldValueEmpty : ''}`}>
                  {user.phone || 'Not provided'}
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Role</label>
                <div className={`${styles.fieldValue} ${styles.fieldValueReadonly} ${styles.fieldValueRole}`}>
                  {user.role.replace('_', ' ')}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>User ID</label>
                <div className={`${styles.fieldValue} ${styles.fieldValueReadonly} ${styles.fieldValueId}`}>
                  {user.id}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit}>
            <div className={styles.cardHeader}>
              <h3 className={`${styles.cardTitle} ${styles.editModeTitle}`}>Edit Profile</h3>
              <div className={styles.headerActions}>
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={styles.saveButton}
                >
                  {loading && <span className={styles.spinner}></span>}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className={styles.profileGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="firstName" className={styles.fieldLabel}>
                  First Name
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder="Enter your first name"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="lastName" className={styles.fieldLabel}>
                  Last Name
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="email" className={styles.fieldLabel}>
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="phone" className={styles.fieldLabel}>
                  Phone
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

<div className={styles.fieldGroup}>
                <label htmlFor="newPassword" className={styles.fieldLabel}>
                  New Password
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Enter new password (leave blank to keep current)"
                  />
                </div>
                <div className={styles.passwordHint}>
                  Leave blank if you don't want to change password
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="confirmPassword" className={styles.fieldLabel}>
                  Confirm New Password
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Role</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    value={user.role.replace('_', ' ').toUpperCase()}
                    disabled
                    className={`${styles.formInput} ${styles.readonlyInput}`}
                  />
                  <div className={styles.readonlyHint}>Cannot be changed</div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>User ID</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    value={user.id}
                    disabled
                    className={`${styles.formInput} ${styles.readonlyInput} ${styles.fieldValueId}`}
                  />
                  <div className={styles.readonlyHint}>Cannot be changed</div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <Link to="/dashboard" className={styles.backButton}>
          Back to Dashboard
        </Link>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirm Changes</h3>
            <p className={styles.modalText}>
              Please enter your current password to confirm these changes:
            </p>
            
            {error && (
              <div className={styles.errorContainer}>
                <span className={styles.errorText}>{error}</span>
              </div>
            )}
            
            <div className={styles.modalInputGroup}>
              <label htmlFor="confirmationPassword" className={styles.fieldLabel}>
                Current Password
              </label>
              <input
                type="password"
                id="confirmationPassword"
                value={confirmationPassword}
                onChange={(e) => setConfirmationPassword(e.target.value)}
                className={styles.formInput}
                placeholder="Enter your current password"
                autoFocus
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                type="button"
                onClick={() => {
                  setShowPasswordModal(false)
                  setConfirmationPassword('')
                  setError('')
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handlePasswordConfirmation}
                disabled={loading}
                className={styles.confirmButton}
              >
                {loading && <span className={styles.spinner}></span>}
                {loading ? 'Confirming...' : 'Confirm Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile