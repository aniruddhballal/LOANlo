import { useEffect, useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, ArrowUpDown, Mail, Phone, Briefcase } from 'lucide-react'
import { DashboardLayout } from '../dashboards/shared/DashboardLayout'
import { UnderwriterTableSkeleton } from '../ui/SkeletonComponents'
import { ErrorAlert } from '../dashboards/shared/ErrorAlert'
import { EmptyState } from '../dashboards/shared/EmptyState'
import { formatDate, formatTime } from '../dashboards/utils/formatters'
import api from '../../api'

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
  const [confirmText, setConfirmText] = useState('')

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
    setConfirmText('')
    setError(null)
  }

  const handleCloseModal = () => {
    setActionModalOpen(false)
    setSelectedUser(null)
    setActionType(null)
    setConfirmText('')
    setError(null)
  }

  const handleConfirmAction = async () => {
    if (!selectedUser || !actionType) return

    if (actionType === 'delete' && confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

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
      applicant: 'bg-blue-100 text-blue-800',
      underwriter: 'bg-purple-100 text-purple-800',
      system_admin: 'bg-gray-900 text-white'
    }[role] || 'bg-gray-100 text-gray-800'

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles}`}>
        {role === 'system_admin' ? 'System Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  return (
    <>
      <DashboardLayout 
        title="Deleted User Accounts"
        welcomeTitle="User Account Management"
        welcomeSubtitle="Manage soft-deleted user accounts and restore or permanently delete them"
      >
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-1">
                  Deleted Users
                </h2>
                <p className="text-sm text-gray-600 font-light">
                  View and manage soft-deleted user accounts
                </p>
              </div>

              <div className="text-sm font-medium text-gray-700">
                {loading 
                  ? <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  : `${filteredAndSortedUsers.length} of ${users.length} ${users.length === 1 ? "User" : "Users"}`}
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Global Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, role, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative text-gray-900"                
                >
                  <SlidersHorizontal className="w-5 h-5 text-gray-900" />
                  <span className="font-medium">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={filters.role}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                      >
                        <option value="all">All Roles</option>
                        <option value="applicant">Applicant</option>
                        <option value="underwriter">Underwriter</option>
                        <option value="system_admin">System Admin</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deleted From</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deleted To</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>
          
          <div className="p-8">
            {loading ? (
              <UnderwriterTableSkeleton rows={5} />
            ) : (
              <>
                {error && <ErrorAlert message={error} />}

                {!loading && filteredAndSortedUsers.length === 0 && !searchQuery && activeFilterCount === 0 && (
                  <EmptyState 
                    title="No Deleted Users"
                    description="There are currently no deleted user accounts."
                  />
                )}

                {!loading && filteredAndSortedUsers.length === 0 && (searchQuery || activeFilterCount > 0) && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-2">No users found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                  </div>
                )}

                {!loading && filteredAndSortedUsers.length > 0 && (
                  <div className="overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                              <th 
                                onClick={() => handleSort('name')}
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  User
                                  <SortIcon columnKey="name" />
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('email')}
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Contact
                                  <SortIcon columnKey="email" />
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('role')}
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Role
                                  <SortIcon columnKey="role" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Additional Info
                              </th>
                              <th 
                                onClick={() => handleSort('deletedAt')}
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Deleted At
                                  <SortIcon columnKey="deletedAt" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredAndSortedUsers.map((user) => (
                              <tr key={user._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {user.firstName} {user.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500">ID: {user._id.slice(-8)}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                      <Mail className="w-4 h-4 text-gray-400" />
                                      {user.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Phone className="w-4 h-4 text-gray-400" />
                                      {user.phone || 'N/A'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <RoleBadge role={user.role} />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1 text-sm">
                                    {user.companyName && (
                                      <div className="flex items-center gap-2 text-gray-700">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        {user.companyName}
                                      </div>
                                    )}
                                    {user.city && user.state && (
                                      <div className="text-gray-600">
                                        {user.city}, {user.state}
                                      </div>
                                    )}
                                    {user.monthlyIncome && (
                                      <div className="text-gray-600">
                                        ₹{user.monthlyIncome.toLocaleString()}/mo
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {user.deletedAt ? (
                                    <>
                                      <div>{formatDate(user.deletedAt)}</div>
                                      <div className="text-xs text-gray-500 font-light">
                                        {formatTime(user.deletedAt)}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-gray-400 italic">Unknown</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleActionClick(user, 'restore')}
                                      className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() => handleActionClick(user, 'delete')}
                                      className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
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
                      {filteredAndSortedUsers.map((user) => (
                        <div 
                          key={user._id} 
                          className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-lg">
                                {user.firstName} {user.lastName}
                              </div>
                              <RoleBadge role={user.role} />
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div>
                              <span className="text-sm text-gray-600 font-light">Email</span>
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-light">Phone</span>
                              <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                            </div>
                            {user.companyName && (
                              <div>
                                <span className="text-sm text-gray-600 font-light">Company</span>
                                <div className="text-sm text-gray-900">{user.companyName}</div>
                              </div>
                            )}
                            {user.city && user.state && (
                              <div>
                                <span className="text-sm text-gray-600 font-light">Location</span>
                                <div className="text-sm text-gray-900">{user.city}, {user.state}</div>
                              </div>
                            )}
                            <div>
                              <span className="text-sm text-gray-600 font-light">Deleted At</span>
                              <div className="text-sm text-gray-900">
                                {user.deletedAt ? formatDate(user.deletedAt) : 'Unknown'}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleActionClick(user, 'restore')}
                              className="w-full px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                            >
                              Restore Account
                            </button>
                            <button
                              onClick={() => handleActionClick(user, 'delete')}
                              className="w-full px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                            >
                              Permanently Delete
                            </button>
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
      {actionModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {actionType === 'restore' && 'Restore User Account'}
              {actionType === 'delete' && 'Permanently Delete User'}
            </h3>

            {/* User Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <RoleBadge role={selectedUser.role} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <div className="font-medium text-gray-900">{selectedUser.email}</div>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <div className="font-medium text-gray-900">{selectedUser.phone || 'N/A'}</div>
                </div>
                {selectedUser.companyName && (
                  <div>
                    <span className="text-gray-600">Company:</span>
                    <div className="font-medium text-gray-900">{selectedUser.companyName}</div>
                  </div>
                )}
                {selectedUser.city && selectedUser.state && (
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <div className="font-medium text-gray-900">{selectedUser.city}, {selectedUser.state}</div>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Account Created:</span>
                  <div className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Deleted On:</span>
                  <div className="font-medium text-gray-900">
                    {selectedUser.deletedAt ? formatDate(selectedUser.deletedAt) : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action-specific content */}
            {actionType === 'restore' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium mb-2">✓ Restore Account</p>
                <p className="text-green-700 text-sm">
                  This will restore the user account and allow the user to log in again. 
                  All their data will be accessible once more.
                </p>
              </div>
            )}

            {actionType === 'delete' && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action is irreversible!</p>
                  <p className="text-red-700 text-sm mb-2">
                    This will permanently delete the user account and ALL associated data including:
                  </p>
                  <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
                    <li>Personal information and profile data</li>
                    <li>All loan applications</li>
                    <li>Document uploads and verification records</li>
                    <li>Communication history</li>
                  </ul>
                  <p className="text-red-700 text-sm mt-2 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                    autoFocus
                  />
                </div>
              </>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionType === 'delete' && confirmText !== 'DELETE'}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  actionType === 'restore'
                    ? 'bg-green-600 hover:bg-green-700'
                    : confirmText === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {actionType === 'restore' && 'Restore Account'}
                {actionType === 'delete' && 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}