import { RoleBadge } from './RoleBadge'
import { formatDate } from '../dashboards/utils/formatters'

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

interface UserMobileCardProps {
  user: User
  index: number
  onActionClick: (user: User, action: 'restore' | 'delete') => void
}

export function UserMobileCard({ user, index, onActionClick }: UserMobileCardProps) {
  return (
    <div 
      className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 overflow-hidden card-hover"
      style={{ animation: `fadeInUp 0.5s ease-out ${(index + 1) * 0.1}s both` }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 text-lg">
              {user.firstName} {user.lastName}
            </div>
            <RoleBadge role={user.role} />
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <span className="text-sm text-gray-600 font-bold">Email</span>
            <div className="text-sm text-gray-900 font-medium">{user.email}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600 font-bold">Phone</span>
            <div className="text-sm text-gray-900 font-medium">{user.phone || 'N/A'}</div>
          </div>
          {user.companyName && (
            <div>
              <span className="text-sm text-gray-600 font-bold">Company</span>
              <div className="text-sm text-gray-900 font-medium">{user.companyName}</div>
            </div>
          )}
          {user.city && user.state && (
            <div>
              <span className="text-sm text-gray-600 font-bold">Location</span>
              <div className="text-sm text-gray-900 font-medium">{user.city}, {user.state}</div>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600 font-bold">Deleted At</span>
            <div className="text-sm text-gray-900 font-medium">
              {user.deletedAt ? formatDate(user.deletedAt) : 'Unknown'}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t-2 border-gray-100">
          <button
            onClick={() => onActionClick(user, 'restore')}
            className="shimmer-button w-full px-5 py-3 text-sm font-bold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
          >
            Restore Account
          </button>
          <button
            onClick={() => onActionClick(user, 'delete')}
            className="shimmer-button w-full px-5 py-3 text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
          >
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  )
}