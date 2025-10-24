import { useEffect, useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ArrowUpDown, Mail, Phone, Briefcase } from 'lucide-react'
import { DashboardLayout } from '../dashboards/shared/DashboardLayout'
import { UnderwriterTableSkeleton } from '../ui/SkeletonComponents'
import { ErrorAlert } from '../dashboards/shared/ErrorAlert'
import { EmptyState } from '../dashboards/shared/EmptyState'
import { formatDate, formatTime } from '../dashboards/utils/formatters'
import api from '../../api'
import { SearchFilterBar } from '../dashboards/SearchFilterBar'
import { UserActionModal } from './UserActionModal'

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

export default function DeletedUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'restore' | 'delete' | null>(null)

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  })
  const [filters, setFilters] = useState({
    role: 'all',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchDeletedUsers()
  }, [])

  const fetchDeletedUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/profile/admin/deleted-users')
      if (data.success) {
        setUsers(data.users)
      } else {
        setError('Failed to fetch deleted users')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (user: User, action: 'restore' | 'delete') => {
    setSelectedUser(user)
    setActionType(action)
    setActionModalOpen(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setActionModalOpen(false)
    setSelectedUser(null)
    setActionType(null)
    setError(null)
  }

  const handleConfirmAction = async () => {
    if (!selectedUser || !actionType) return

    try {
      if (actionType === 'restore') {
        await api.post(`/profile/restore/${selectedUser._id}`)
      } else if (actionType === 'delete') {
        await api.delete(`/profile/admin/permanent-delete/${selectedUser._id}`)
      }

      await fetchDeletedUsers()
      handleCloseModal()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process action')
    }
  }

  // Global search function
  const searchInUser = (user: User, query: string) => {
    const searchLower = query.toLowerCase()
    return (
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.companyName?.toLowerCase().includes(searchLower) ||
      user.city?.toLowerCase().includes(searchLower)
    )
  }

  // Filter and sort logic
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]

    // Apply global search
    if (searchQuery) {
      result = result.filter(user => searchInUser(user, searchQuery))
    }

    // Apply filters
    if (filters.role !== 'all') {
      result = result.filter(user => user.role === filters.role)
    }

    if (filters.dateFrom) {
      result = result.filter(user => new Date(user.deletedAt || '') >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter(user => new Date(user.deletedAt || '') <= new Date(filters.dateTo))
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal: any, bVal: any

        switch (sortConfig.key) {
          case 'name':
            aVal = `${a.firstName} ${a.lastName}`.toLowerCase()
            bVal = `${b.firstName} ${b.lastName}`.toLowerCase()
            break
          case 'email':
            aVal = a.email?.toLowerCase() || ''
            bVal = b.email?.toLowerCase() || ''
            break
          case 'role':
            aVal = a.role
            bVal = b.role
            break
          case 'deletedAt':
            aVal = new Date(a.deletedAt || '').getTime()
            bVal = new Date(b.deletedAt || '').getTime()
            break
          default:
            return 0
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [users, searchQuery, filters, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      role: 'all',
      dateFrom: '',
      dateTo: ''
    })
    setSearchQuery('')
    setSortConfig({ key: null, direction: 'asc' })
  }

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length + (searchQuery ? 1 : 0)

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-gray-900" />
      : <ChevronDown className="w-4 h-4 text-gray-900" />
  }

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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .dashboard-container {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-title {
          animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-actions {
          animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1);
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

        .card-hover {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card-hover:hover {
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .gradient-border {
          position: relative;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #f9f9f9, #ffffff, #f9f9f9);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gradient-border:hover::before {
          opacity: 1;
        }

        .content-section {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards;
        }
      `}</style>

      <DashboardLayout 
        title="Deleted User Accounts"
        welcomeTitle="User Account Management"
        welcomeSubtitle="Manage soft-deleted user accounts and restore or permanently delete them"
      >
        <section className="dashboard-container bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden card-hover gradient-border">
          <header className="px-8 py-8 border-b-2 border-gray-100 bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="header-title">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                  Deleted Users
                </h2>
                <p className="text-sm text-gray-600 font-medium tracking-wide">
                  View and manage soft-deleted user accounts
                </p>
              </div>

              <div className="header-actions text-sm font-medium text-gray-700">
                {loading ? (
                  <div className="w-26 h-12 rounded bg-gray-200 animate-pulse"></div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">
                      {filteredAndSortedUsers.length}
                    </div>
                    <div className="text-sm text-gray-500">
                      of {users.length} {users.length === 1 ? "User" : "Users"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Filter Bar */}
            <SearchFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              filters={{
                status: filters.role,
                amountMin: '',
                amountMax: '',
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo
              }}
              handleFilterChange={(key, value) => {
                if (key === 'status') {
                  handleFilterChange('role', value)
                } else {
                  handleFilterChange(key, value)
                }
              }}
            />
          </header>
          
          <div className="content-section p-8">
            {loading ? (
              <UnderwriterTableSkeleton rows={5} />
            ) : (
              <>
                {error && <ErrorAlert message={error} />}

                {!loading && filteredAndSortedUsers.length === 0 && !searchQuery && activeFilterCount === 0 && (
                  <div className="py-20">
                    <EmptyState 
                      title="No Deleted Users"
                      description="There are currently no deleted user accounts."
                    />
                  </div>
                )}

                {!loading && filteredAndSortedUsers.length === 0 && (searchQuery || activeFilterCount > 0) && (
                  <div className="text-center py-20 px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No users found</h3>
                    <p className="text-gray-500 text-base mb-6 max-w-md mx-auto">
                      Try adjusting your search criteria or filters to find what you're looking for
                    </p>
                    <button
                      onClick={clearFilters}
                      className="shimmer-button px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {!loading && filteredAndSortedUsers.length > 0 && (
                  <div className="overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b-2 border-gray-200">
                            <tr>
                              <th 
                                onClick={() => handleSort('name')}
                                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  User
                                  <SortIcon columnKey="name" />
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('email')}
                                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Contact
                                  <SortIcon columnKey="email" />
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('role')}
                                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Role
                                  <SortIcon columnKey="role" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Additional Info
                              </th>
                              <th 
                                onClick={() => handleSort('deletedAt')}
                                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Deleted At
                                  <SortIcon columnKey="deletedAt" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredAndSortedUsers.map((user, index) => (
                              <tr 
                                key={user._id} 
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
                                      onClick={() => handleActionClick(user, 'restore')}
                                      className="shimmer-button px-4 py-2 text-xs font-bold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() => handleActionClick(user, 'delete')}
                                      className="shimmer-button px-4 py-2 text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {filteredAndSortedUsers.map((user, index) => (
                        <div 
                          key={user._id} 
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
                                onClick={() => handleActionClick(user, 'restore')}
                                className="shimmer-button w-full px-5 py-3 text-sm font-bold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                              >
                                Restore Account
                              </button>
                              <button
                                onClick={() => handleActionClick(user, 'delete')}
                                className="shimmer-button w-full px-5 py-3 text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                              >
                                Permanently Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </DashboardLayout>

      {/* Action Modal */}
      <UserActionModal
        isOpen={actionModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        user={selectedUser}
        actionType={actionType}
        error={error}
      />
    </>
  )
}