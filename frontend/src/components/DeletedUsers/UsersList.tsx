import { UserTableHeader } from './UserTableHeader.tsx'
import { UserTableRow } from './UserTableRow.tsx'
import { UserMobileCard } from './UserMobileCard.tsx'

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

interface UsersListProps {
  users: User[]
  sortConfig: { key: string | null; direction: 'asc' | 'desc' }
  onSort: (key: string) => void
  onActionClick: (user: User, action: 'restore' | 'delete') => void
}

export function UsersList({ users, sortConfig, onSort, onActionClick }: UsersListProps) {
  return (
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <UserTableHeader sortConfig={sortConfig} onSort={onSort} />
            <tbody className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <UserTableRow
                  key={user._id}
                  user={user}
                  index={index}
                  onActionClick={onActionClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.map((user, index) => (
          <UserMobileCard
            key={user._id}
            user={user}
            index={index}
            onActionClick={onActionClick}
          />
        ))}
      </div>
    </div>
  )
}