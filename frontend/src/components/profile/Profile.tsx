import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || ''
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
    setLoading(true)

    try {
      await updateUser(formData)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
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
      phone: user?.phone || ''
    })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Profile</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: 'green', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <div style={{ 
        border: '1px solid #ddd', 
        padding: '2rem', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        {!isEditing ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>Profile Information</h3>
              <button onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  First Name:
                </label>
                <div style={{ padding: '0.5rem', backgroundColor: 'white', border: '1px solid #ccc' }}>
                  {user.firstName}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Last Name:
                </label>
                <div style={{ padding: '0.5rem', backgroundColor: 'white', border: '1px solid #ccc' }}>
                  {user.lastName}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Email:
                </label>
                <div style={{ padding: '0.5rem', backgroundColor: 'white', border: '1px solid #ccc' }}>
                  {user.email}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Phone:
                </label>
                <div style={{ padding: '0.5rem', backgroundColor: 'white', border: '1px solid #ccc' }}>
                  {user.phone || 'Not provided'}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Role:
                </label>
                <div style={{ padding: '0.5rem', backgroundColor: 'white', border: '1px solid #ccc' }}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  User ID:
                </label>
                <div style={{ padding: '0.5rem', backgroundColor: 'white', border: '1px solid #ccc', fontSize: '0.9em' }}>
                  {user.id}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>Edit Profile</h3>
              <div>
                <button type="button" onClick={cancelEdit} style={{ marginRight: '1rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="firstName" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label htmlFor="lastName" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label htmlFor="email" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label htmlFor="phone" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Phone:
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Role:
                </label>
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: '#f0f0f0', 
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  color: '#666'
                }}>
                  {user.role.replace('_', ' ').toUpperCase()} (Cannot be changed)
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  User ID:
                </label>
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: '#f0f0f0', 
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  color: '#666'
                }}>
                  {user.id} (Cannot be changed)
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/dashboard">
          <button>Back to Dashboard</button>
        </Link>
      </div>
    </div>
  )
}

export default Profile