import { useEffect, useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, ArrowUpDown, CheckCircle, XCircle, Clock } from 'lucide-react'
import { DashboardLayout } from './shared/DashboardLayout'
import { UnderwriterTableSkeleton } from '../ui/SkeletonComponents'
import { ErrorAlert } from './shared/ErrorAlert'
import { EmptyState } from './shared/EmptyState'
import { formatCurrency, formatDate, formatTime, formatApplicationId } from './utils/formatters'
import api from '../../api'

interface User {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
}

interface LoanApplication {
  _id: string
  amount: number
  status: string
  createdAt: string
  deletedAt?: string
  userId: User
}

interface RestorationRequest {
  _id: string
  applicationId: LoanApplication
  requestedBy: User
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: User
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
}

export default function SystemAdminDashboard() {
  const [requests, setRequests] = useState<RestorationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RestorationRequest | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [confirmText, setConfirmText] = useState('')

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  })
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchRestorationRequests()
  }, [])

  const fetchRestorationRequests = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/loans/restoration-requests', {
        params: { status: filters.status !== 'all' ? filters.status : undefined }
      })
      if (data.success) {
        setRequests(data.requests)
      } else {
        setError('Failed to fetch restoration requests')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (request: RestorationRequest, action: 'approve' | 'reject' | 'delete') => {
    setSelectedRequest(request)
    setActionType(action)
    setReviewModalOpen(true)
    setReviewNotes('')
    setConfirmText('')
  }

  const handleCloseModal = () => {
    setReviewModalOpen(false)
    setSelectedRequest(null)
    setActionType(null)
    setReviewNotes('')
    setConfirmText('')
    setError(null)
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return

    // Validation
    if (actionType === 'reject' && reviewNotes.trim().length === 0) {
      setError('Rejection reason is required')
      return
    }

    if (actionType === 'delete' && confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    try {
      if (actionType === 'approve') {
        await api.post(`/loans/restoration-requests/${selectedRequest._id}/approve`, {
          notes: reviewNotes
        })
      } else if (actionType === 'reject') {
        await api.post(`/loans/restoration-requests/${selectedRequest._id}/reject`, {
          notes: reviewNotes
        })
      } else if (actionType === 'delete') {
        await api.delete(`/loans/permanent-delete/${selectedRequest.applicationId._id}`)
      }

      await fetchRestorationRequests()
      handleCloseModal()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process action')
    }
  }

  // Global search function
  const searchInRequest = (req: RestorationRequest, query: string) => {
    const searchLower = query.toLowerCase()
    return (
      (req.applicationId ? formatApplicationId(req.applicationId._id).toLowerCase().includes(searchLower) : false) ||
      `${req.requestedBy?.firstName} ${req.requestedBy?.lastName}`.toLowerCase().includes(searchLower) ||
      `${req.applicationId?.userId?.firstName || ''} ${req.applicationId?.userId?.lastName || ''}`.toLowerCase().includes(searchLower) ||
      req.reason?.toLowerCase().includes(searchLower) ||
      req.status?.toLowerCase().includes(searchLower)
    )
  }

  // Filter and sort logic
  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests]

    // Apply global search
    if (searchQuery) {
      result = result.filter(req => searchInRequest(req, searchQuery))
    }

    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(req => req.status === filters.status)
    }

    if (filters.dateFrom) {
      result = result.filter(req => new Date(req.createdAt) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter(req => new Date(req.createdAt) <= new Date(filters.dateTo))
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal: any, bVal: any

        switch (sortConfig.key) {
          case 'reference':
            aVal = a.applicationId?._id || ''
            bVal = b.applicationId?._id || ''
            break
          case 'applicant':
            aVal = `${a.applicationId?.userId?.firstName || ''} ${a.applicationId?.userId?.lastName || ''}`.toLowerCase()
            bVal = `${b.applicationId?.userId?.firstName || ''} ${b.applicationId?.userId?.lastName || ''}`.toLowerCase()
            break
          case 'requestedBy':
            aVal = `${a.requestedBy?.firstName} ${a.requestedBy?.lastName}`.toLowerCase()
            bVal = `${b.requestedBy?.firstName} ${b.requestedBy?.lastName}`.toLowerCase()
            break
          case 'status':
            aVal = a.status
            bVal = b.status
            break
          case 'requested':
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
  }, [requests, searchQuery, filters, sortConfig])

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

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }[status] || 'bg-gray-100 text-gray-800'

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />
    }[status]

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles}`}>
        {icons}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <>
      <DashboardLayout 
        title="System Admin Dashboard"
        welcomeTitle="Welcome, Administrator!"
        welcomeSubtitle="Manage restoration requests and system operations"
      >
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-1">
                  Restoration Requests
                </h2>
                <p className="text-sm text-gray-600 font-light">
                  Review and manage application restoration requests from underwriters
                </p>
              </div>

              <div className="flex items-center gap-4">
                {pendingCount > 0 && (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
                    {pendingCount} Pending
                  </div>
                )}
                <div className="text-sm font-medium text-gray-700">
                  {loading 
                    ? <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    : `${filteredAndSortedRequests.length} of ${requests.length} ${requests.length === 1 ? "Request" : "Requests"}`}
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
                    placeholder="Search by reference, applicant, underwriter, or reason..."
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
                      </select>
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

                {!loading && filteredAndSortedRequests.length === 0 && !searchQuery && activeFilterCount === 0 && (
                  <EmptyState 
                    title="No Restoration Requests"
                    description="There are currently no restoration requests to review."
                  />
                )}

                {!loading && filteredAndSortedRequests.length === 0 && (searchQuery || activeFilterCount > 0) && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-2">No requests found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                  </div>
                )}

                {!loading && filteredAndSortedRequests.length > 0 && (
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
                              <th 
                                onClick={() => handleSort('requestedBy')}
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Requested By
                                  <SortIcon columnKey="requestedBy" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Reason
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
                                onClick={() => handleSort('requested')}
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Requested
                                  <SortIcon columnKey="requested" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredAndSortedRequests.map((req) => (
                              <tr key={req._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {req.applicationId ? (
                                    <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                                      {formatApplicationId(req.applicationId._id)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs italic">Deleted</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {req.applicationId?.userId ? (
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                        {req.applicationId.userId.firstName?.charAt(0)}{req.applicationId.userId.lastName?.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-900 text-sm">
                                          {req.applicationId.userId.firstName} {req.applicationId.userId.lastName}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm italic">N/A</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm">
                                    <div className="text-gray-900 font-medium">
                                      {req.requestedBy?.firstName} {req.requestedBy?.lastName}
                                    </div>
                                    <div className="text-gray-600 text-xs">Underwriter</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 max-w-xs truncate" title={req.reason}>
                                    {req.reason}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <StatusBadge status={req.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <div>{formatDate(req.createdAt)}</div>
                                  <div className="text-xs text-gray-500 font-light">
                                    {formatTime(req.createdAt)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {req.status === 'pending' && req.applicationId ? (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleReviewClick(req, 'approve')}
                                        className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleReviewClick(req, 'reject')}
                                        className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                                      >
                                        Reject
                                      </button>
                                      <button
                                        onClick={() => handleReviewClick(req, 'delete')}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      {req.applicationId ? 'Reviewed' : 'App Deleted'}
                                    </div>
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
                      {filteredAndSortedRequests.map((req) => (
                        <div 
                          key={req._id} 
                          className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-4">
                            {req.applicationId ? (
                              <span className="font-mono bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                                {formatApplicationId(req.applicationId._id)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs italic">Application Deleted</span>
                            )}
                            <StatusBadge status={req.status} />
                          </div>
                          <div className="space-y-3 mb-4">
                            <div>
                              <span className="text-sm text-gray-600 font-light">Applicant</span>
                              <div className="font-semibold text-gray-900">
                                {req.applicationId?.userId ? 
                                  `${req.applicationId.userId.firstName} ${req.applicationId.userId.lastName}` : 
                                  'N/A'}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-light">Requested By</span>
                              <div className="font-semibold text-gray-900">
                                {req.requestedBy?.firstName} {req.requestedBy?.lastName}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-light">Reason</span>
                              <div className="text-sm text-gray-900">{req.reason}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-light">Requested</span>
                              <div className="text-sm text-gray-900">{formatDate(req.createdAt)}</div>
                            </div>
                          </div>
                        {req.status === 'pending' && req.applicationId && (
                          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleReviewClick(req, 'approve')}
                              className="w-full px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                            >
                              Approve Restoration
                            </button>
                            <button
                              onClick={() => handleReviewClick(req, 'reject')}
                              className="w-full px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                            >
                              Reject Request
                            </button>
                            <button
                              onClick={() => handleReviewClick(req, 'delete')}
                              className="w-full px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200"
                            >
                              Permanently Delete
                            </button>
                          </div>
                        )}
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

      {/* Review Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {actionType === 'approve' && 'Approve Restoration Request'}
              {actionType === 'reject' && 'Reject Restoration Request'}
              {actionType === 'delete' && 'Permanently Delete Application'}
            </h3>

            {/* Application Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Application ID:</span>
                  <div className="font-mono font-semibold text-gray-900">
                    {formatApplicationId(selectedRequest.applicationId._id)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(selectedRequest.applicationId.amount)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Applicant:</span>
                  <div className="font-semibold text-gray-900">
                    {selectedRequest.applicationId?.userId?.firstName} {selectedRequest.applicationId?.userId?.lastName}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Requested By:</span>
                  <div className="font-semibold text-gray-900">
                    {selectedRequest.requestedBy?.firstName} {selectedRequest.requestedBy?.lastName}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-600 text-sm">Restoration Reason:</span>
                <div className="text-gray-900 mt-1">{selectedRequest.reason}</div>
              </div>
            </div>

            {/* Action-specific content */}
            {actionType === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-gray-900 resize-none"
                  rows={3}
                />
              </div>
            )}

            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Explain why this restoration request is being rejected..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none text-gray-900 resize-none"
                  rows={3}
                  autoFocus
                />
              </div>
            )}

            {actionType === 'delete' && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action is irreversible!</p>
                  <p className="text-red-700 text-sm">
                    This will permanently delete the loan application and all associated data. 
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
                disabled={
                  (actionType === 'reject' && reviewNotes.trim().length === 0) ||
                  (actionType === 'delete' && confirmText !== 'DELETE')
                }
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionType === 'reject'
                    ? reviewNotes.trim().length > 0
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-300 cursor-not-allowed'
                    : confirmText === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {actionType === 'approve' && 'Confirm Approval'}
                {actionType === 'reject' && 'Confirm Rejection'}
                {actionType === 'delete' && 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}