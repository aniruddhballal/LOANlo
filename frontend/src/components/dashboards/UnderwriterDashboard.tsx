import { useEffect, useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import { DashboardLayout } from './shared/DashboardLayout'
import { UnderwriterTableSkeleton } from '../ui/SkeletonComponents'
import { ErrorAlert } from './shared/ErrorAlert'
import { EmptyState } from './shared/EmptyState'
import { StatusBadge } from './shared/StatusBadge'
import { formatCurrency, formatDate, formatTime, formatApplicationId } from './utils/formatters'
import LoanReviewModal from '../loan/LoanReviewModal'
import api from '../../api'

interface LoanApplication {
  _id: string
  amount: number
  status: string
  createdAt: string
  userId: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
}

export default function UnderwriterDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [showDeleted, setShowDeleted] = useState(false)
  const [deletedApplications, setDeletedApplications] = useState<LoanApplication[]>([])
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [applicationToRestore, setApplicationToRestore] = useState<string | null>(null)
  const [restoreConfirmText, setRestoreConfirmText] = useState('')
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  })
  const [filters, setFilters] = useState({
    status: 'all',
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedApplications()
    } else {
      fetchApplications()
    }
  }, [showDeleted])

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/loans/all')
      if (data.success) {
        setApplications(data.applications)
      } else {
        setError('Failed to fetch loan applications')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeletedApplications = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/loans/deleted')
      if (data.success) {
        setDeletedApplications(data.applications)
      } else {
        setError('Failed to fetch deleted applications')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedApplicationId(null)
  }

  const refreshApplications = async () => {
    try {
      const { data } = await api.get('/loans/all')
      if (data.success) {
        setApplications(data.applications)
      }
    } catch {
      setError('Server error')
    }
  }

  // Global search function
  const searchInApplication = (app: LoanApplication, query: string) => {
    const searchLower = query.toLowerCase()
    return (
      formatApplicationId(app._id).toLowerCase().includes(searchLower) ||
      `${app.userId?.firstName} ${app.userId?.lastName}`.toLowerCase().includes(searchLower) ||
      app.userId?.email?.toLowerCase().includes(searchLower) ||
      app.userId?.phone?.toLowerCase().includes(searchLower) ||
      app.status?.toLowerCase().includes(searchLower) ||
      formatCurrency(app.amount).toLowerCase().includes(searchLower) ||
      formatDate(app.createdAt).toLowerCase().includes(searchLower)
    )
  }

  // Filter and sort logic
  const filteredAndSortedApplications = useMemo(() => {
    let result = [...(showDeleted ? deletedApplications : applications)]

    // Apply global search
    if (searchQuery) {
      result = result.filter(app => searchInApplication(app, searchQuery))
    }

    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(app => app.status === filters.status)
    }

    if (filters.amountMin) {
      result = result.filter(app => app.amount >= Number(filters.amountMin))
    }

    if (filters.amountMax) {
      result = result.filter(app => app.amount <= Number(filters.amountMax))
    }

    if (filters.dateFrom) {
      result = result.filter(app => new Date(app.createdAt) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter(app => new Date(app.createdAt) <= new Date(filters.dateTo))
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal: any, bVal: any

        switch (sortConfig.key) {
          case 'reference':
            aVal = a._id
            bVal = b._id
            break
          case 'applicant':
            aVal = `${a.userId?.firstName} ${a.userId?.lastName}`.toLowerCase()
            bVal = `${b.userId?.firstName} ${b.userId?.lastName}`.toLowerCase()
            break
          case 'amount':
            aVal = a.amount
            bVal = b.amount
            break
          case 'status':
            aVal = a.status
            bVal = b.status
            break
          case 'submitted':
            aVal = new Date(a.createdAt).getTime()
            bVal = new Date(b.createdAt).getTime()
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
  }, [applications, deletedApplications, showDeleted, searchQuery, filters, sortConfig])

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
      status: 'all',
      amountMin: '',
      amountMax: '',
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

  const handleRestoreClick = (applicationId: string) => {
    setApplicationToRestore(applicationId)
    setRestoreModalOpen(true)
  }

  const handleRestoreConfirm = async () => {
    if (restoreConfirmText !== 'RESTORE') {
      setError('Please type RESTORE to confirm')
      return
    }

    try {
      await api.patch(`/loans/restore/${applicationToRestore}`)
      // Refresh both lists
      fetchDeletedApplications()
      fetchApplications()
      // Close modal and reset
      setRestoreModalOpen(false)
      setApplicationToRestore(null)
      setRestoreConfirmText('')
    } catch {
      setError('Failed to restore application')
    }
  }

  const handleRestoreCancel = () => {
    setRestoreModalOpen(false)
    setApplicationToRestore(null)
    setRestoreConfirmText('')
  }

  return (
    <>
      <DashboardLayout 
        title="Underwriter Dashboard"
        welcomeTitle="Welcome Back!"
        welcomeSubtitle="Successfully authenticated to Underwriter Panel"
      >
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-1">
                  {showDeleted ? 'Deleted Loan Applications' : 'Loan Applications'}
                </h2>
                <p className="text-sm text-gray-600 font-light">
                  {showDeleted 
                    ? 'Review applications that have been deleted' 
                    : 'Review and process submitted loan applications'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    showDeleted 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showDeleted ? 'View Active' : 'View Deleted'}
                </button>
                <div className="text-sm font-medium text-gray-700">
                  {loading 
                    ? <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    : `${filteredAndSortedApplications.length} of ${showDeleted ? deletedApplications.length : applications.length} ${(showDeleted ? deletedApplications.length : applications.length) === 1 ? "Application" : "Applications"}`}
                </div>
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
                    placeholder="Search by reference, name, email, phone, status, or amount..."
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="under_review">Under Review</option>
                      </select>
                    </div>

                    {/* Amount Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="₹0"
                        value={filters.amountMin}
                        onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="₹10,00,000"
                        value={filters.amountMax}
                        onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
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

            {!loading && filteredAndSortedApplications.length === 0 && !searchQuery && activeFilterCount === 0 && (
              <EmptyState 
                title="No Applications Found"
                description="There are currently no loan applications to review."
              />
            )}

            {!loading && filteredAndSortedApplications.length === 0 && (searchQuery || activeFilterCount > 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">No applications found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
              </div>
            )}

            {!loading && filteredAndSortedApplications.length > 0 && (
              <div className="overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50 border-b border-gray-200">
                        <tr>
                          <th 
                            onClick={() => handleSort('reference')}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              Reference
                              <SortIcon columnKey="reference" />
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('applicant')}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              Applicant
                              <SortIcon columnKey="applicant" />
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Contact
                          </th>
                          <th 
                            onClick={() => handleSort('amount')}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              Amount
                              <SortIcon columnKey="amount" />
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('status')}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              Status
                              <SortIcon columnKey="status" />
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('submitted')}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              Submitted
                              <SortIcon columnKey="submitted" />
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredAndSortedApplications.map((app) => (
                          <tr key={app._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                                {formatApplicationId(app._id)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-8 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {app.userId?.firstName} {app.userId?.lastName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="text-gray-900 font-medium">{app.userId?.email}</div>
                                <div className="text-gray-600 font-light">{app.userId?.phone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-gray-900 text-lg">
                                {formatCurrency(app.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div>{formatDate(app.createdAt)}</div>
                              <div className="text-xs text-gray-500 font-light">
                                {formatTime(app.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {showDeleted ? (
                                <button
                                  onClick={() => handleRestoreClick(app._id)}
                                  className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  Restore
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReviewClick(app._id)}
                                  className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  Review
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {filteredAndSortedApplications.map((app) => (
                    <div 
                      key={app._id} 
                      className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {app.userId?.firstName?.charAt(0)}{app.userId?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {app.userId?.firstName} {app.userId?.lastName}
                            </div>
                            <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                              {formatApplicationId(app._id)}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-light">Amount</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(app.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-light">Email</span>
                          <span className="text-sm text-gray-900">{app.userId?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-light">Phone</span>
                          <span className="text-sm text-gray-900">{app.userId?.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-light">Submitted</span>
                          <span className="text-sm text-gray-900">{formatDate(app.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                        {showDeleted ? (
                          <button
                            onClick={() => handleRestoreClick(app._id)}
                            className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReviewClick(app._id)}
                            className="flex-1 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200"
                          >
                            Review
                          </button>
                        )}
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

      {modalOpen && selectedApplicationId && (
        <LoanReviewModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          applicationId={selectedApplicationId}
          onApplicationUpdated={refreshApplications}
        />
      )}

      {/* Restore Confirmation Modal */}
      {restoreModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Restoration
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to restore this loan application? This will make it active again and visible to the applicant.
            </p>
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Type <span className="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">RESTORE</span> to confirm:
            </p>
            <input
              type="text"
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              placeholder="Type RESTORE"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleRestoreCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={restoreConfirmText !== 'RESTORE'}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  restoreConfirmText === 'RESTORE'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}