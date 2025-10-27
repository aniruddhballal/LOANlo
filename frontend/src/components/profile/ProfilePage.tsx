import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import ApplicantProfile from './ApplicantProfile'
import DeleteAccountConfirmationModal from '../ui/DeleteAccountConfirmationModal'
import api from '../../api'

const ProfilePage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()

  // Wrap in useCallback to keep function reference stable
  const handleDeleteAccountModal = useCallback(() => {
    setShowDeleteModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowDeleteModal(false)
  }, [])

  const handleDeleteAccount = useCallback(async () => {
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
  }, [navigate])

  return (
    <>
      <ApplicantProfile onDeleteAccount={handleDeleteAccountModal} />
      
      {/* Render modal via portal to prevent Profile re-renders */}
      {showDeleteModal && createPortal(
        <DeleteAccountConfirmationModal 
          show={showDeleteModal}
          onClose={handleCloseModal}
          onConfirm={handleDeleteAccount}
          loading={deleteLoading}
        />,
        document.body
      )}
    </>
  )
}

export default ProfilePage