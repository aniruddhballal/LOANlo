import { useState } from 'react'
import { formatDate } from '../../utils'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  isDeleted: boolean
  deletedAt?: string
  createdAt: string
  employmentType?: string
  companyName?: string
  monthlyIncome?: number
  city?: string
  state?: string
}

interface UserActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  user: User | null
  actionType: 'restore' | 'delete' | null
  error: string | null
}

export function UserActionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user, 
  actionType,
  error: externalError 
}: UserActionModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (!isOpen || !user || !actionType) return null

  const handleConfirm = async () => {
    if (actionType === 'delete' && confirmText !== 'DELETE') {
      setLocalError('Please type DELETE to confirm')
      return
    }

    setIsSubmitting(true)
    setLocalError(null)
    
    try {
      await onConfirm()
      // Reset state on success
      setConfirmText('')
    } catch (err) {
      // Error will be handled by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setLocalError(null)
    onClose()
  }

  const displayError = externalError || localError

  const RoleBadge = ({ role }: { role: string }) => {
    const styles = {
      applicant: 'bg-blue-100 text-blue-800 border-blue-200',
      underwriter: 'bg-purple-100 text-purple-800 border-purple-200',
      system_admin: 'bg-gray-900 text-white border-gray-900'
    }[role] || 'bg-gray-100 text-gray-800 border-gray-200'

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-all duration-300 hover:scale-105 ${styles}`}>
        {role === 'system_admin' ? 'System Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

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

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .shimmer-button {
          position: relative;
          overflow: hidden;
        }

        .shimmer-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transform: translateX(-100%);
        }

        .shimmer-button:hover::before {
          animation: shimmer 0.7s ease-in-out;
        }
      `}</style>

      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border-2 border-gray-200"
          style={{ animation: 'fadeInUp 0.3s ease-out' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {actionType === 'restore' && 'Restore User Account'}
              {actionType === 'delete' && 'Permanently Delete User'}
            </h3>
          </div>

          {/* User Details */}
          <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50/50 rounded-xl p-6 mb-6 border-2 border-gray-200 overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <RoleBadge role={user.role} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-bold">Email:</span>
                  <div className="text-gray-900 font-medium">{user.email}</div>
                </div>
                <div>
                  <span className="text-gray-600 font-bold">Phone:</span>
                  <div className="text-gray-900 font-medium">{user.phone || 'N/A'}</div>
                </div>
                {user.companyName && (
                  <div>
                    <span className="text-gray-600 font-bold">Company:</span>
                    <div className="text-gray-900 font-medium">{user.companyName}</div>
                  </div>
                )}
                {user.city && user.state && (
                  <div>
                    <span className="text-gray-600 font-bold">Location:</span>
                    <div className="text-gray-900 font-medium">{user.city}, {user.state}</div>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 font-bold">Account Created:</span>
                  <div className="text-gray-900 font-medium">{formatDate(user.createdAt)}</div>
                </div>
                <div>
                  <span className="text-gray-600 font-bold">Deleted On:</span>
                  <div className="text-gray-900 font-medium">
                    {user.deletedAt ? formatDate(user.deletedAt) : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action-specific content */}
          {actionType === 'restore' && (
            <div className="relative bg-gradient-to-br from-green-50 via-white to-green-50/50 border-2 border-green-200 rounded-xl p-5 mb-6 shadow-sm overflow-hidden group">
              <div className="relative z-10">
                <p className="text-green-800 font-bold mb-2 flex items-center gap-2 text-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Restore Account
                </p>
                <p className="text-green-700 text-sm leading-relaxed font-medium">
                  This will restore the user account and allow the user to log in again. 
                  All their data will be accessible once more.
                </p>
              </div>
            </div>
          )}

          {actionType === 'delete' && (
            <>
              <div className="relative bg-gradient-to-br from-red-50 via-white to-red-50/50 border-2 border-red-200 rounded-xl p-5 mb-6 shadow-sm overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-red-800 font-bold mb-3 flex items-center gap-2 text-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Warning: This action is irreversible!
                  </p>
                  <p className="text-red-700 text-sm mb-3 leading-relaxed font-medium">
                    This will permanently delete the user account and ALL associated data including:
                  </p>
                  <ul className="text-red-700 text-sm space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 font-bold">•</span>
                      <span className="font-medium">Personal information and profile data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 font-bold">•</span>
                      <span className="font-medium">All loan applications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 font-bold">•</span>
                      <span className="font-medium">Document uploads and verification records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 font-bold">•</span>
                      <span className="font-medium">Communication history</span>
                    </li>
                  </ul>
                  <p className="text-red-700 text-sm mt-3 font-bold">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Type <span className="font-mono bg-red-100 px-3 py-1 rounded-lg text-red-600 font-bold border border-red-200">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 transition-all duration-300 font-medium"
                  autoFocus
                />
              </div>
            </>
          )}

          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-800 text-sm font-bold">{displayError}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 border-2 border-gray-300 rounded-xl hover:bg-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || (actionType === 'delete' && confirmText !== 'DELETE')}
              className={`shimmer-button flex-1 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                actionType === 'restore'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                  : confirmText === 'DELETE'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  : 'bg-gray-300'
              }`}
            >
              {isSubmitting ? 'Processing...' : (
                <>
                  {actionType === 'restore' && 'Restore Account'}
                  {actionType === 'delete' && 'Permanently Delete'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}