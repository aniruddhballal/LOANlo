import { Mail, Phone, Briefcase } from 'lucide-react'
import { RoleBadge } from './RoleBadge'
import { formatDate, formatTime } from '../../utils'

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

interface UserTableRowProps {
  user: User
  index: number
  onActionClick: (user: User, action: 'restore' | 'delete') => void
}

export function UserTableRow({ user, index, onActionClick }: UserTableRowProps) {
  return (
    <tr 
      className="group hover:bg-gray-50/50 transition-all duration-300"
      style={{ animation: `fadeInUp 0.5s ease-out ${(index + 1) * 0.05}s both` }}
    >
      <td className="px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-transform duration-300 group-hover:scale-110">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-gray-500 font-medium">ID: {user._id.slice(-8)}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
            <Mail className="w-4 h-4 text-gray-400" />
            {user.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Phone className="w-4 h-4 text-gray-400" />
            {user.phone || 'N/A'}
          </div>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-6 py-5">
        <div className="space-y-1.5 text-sm">
          {user.companyName && (
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Briefcase className="w-4 h-4 text-gray-400" />
              {user.companyName}
            </div>
          )}
          {user.city && user.state && (
            <div className="text-gray-600 font-medium">
              {user.city}, {user.state}
            </div>
          )}
          {user.monthlyIncome && (
            <div className="text-gray-600 font-medium">
              ₹{user.monthlyIncome.toLocaleString()}/mo
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
        {user.deletedAt ? (
          <>
            <div className="font-bold text-gray-900">{formatDate(user.deletedAt)}</div>
            <div className="text-xs text-gray-500 font-medium">
              {formatTime(user.deletedAt)}
            </div>
          </>
        ) : (
          <span className="text-gray-400 italic font-medium">Unknown</span>
        )}
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex gap-2">
          <button
            onClick={() => onActionClick(user, 'restore')}
            className="shimmer-button px-4 py-2 text-xs font-bold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
          >
            Restore
          </button>
          <button
            onClick={() => onActionClick(user, 'delete')}
            className="shimmer-button px-4 py-2 text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}