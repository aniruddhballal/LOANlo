import { useEffect, useState, useMemo } from 'react'
import { DashboardLayout } from '../dashboards/shared/DashboardLayout'
import { UnderwriterTableSkeleton } from '../ui/SkeletonComponents'
import { ErrorAlert } from '../dashboards/shared/ErrorAlert'
import { EmptyState } from '../dashboards/shared/EmptyState'
import { formatApplicationId } from '../utils'
import { SearchFilterBar } from './SearchFilterBar'
import { RequestsTable } from './RequestsTable'
import { RequestsMobileView } from './RequestsMobileView'
import { ReviewModal } from './ReviewModal'
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

export default function DeletedLoanApplications() {
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
      const { data } = await api.get('/loans/admin/restoration-requests', {
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
        await api.post(`/loans/admin/restoration-requests/${selectedRequest._id}/approve`, {
          notes: reviewNotes
        })
      } else if (actionType === 'reject') {
        await api.post(`/loans/admin/restoration-requests/${selectedRequest._id}/reject`, {
          notes: reviewNotes
        })
      } else if (actionType === 'delete') {
        await api.delete(`/loans/admin/permanent-delete/${selectedRequest.applicationId._id}`)
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
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <>
      <DashboardLayout 
        title="Deleted Loan Applications"
        welcomeTitle="Application Restoration Management"
        welcomeSubtitle="Review and manage restoration requests for deleted loan applications"
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

            <SearchFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              filters={filters}
              handleFilterChange={handleFilterChange}
            />
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
                    <div className="hidden lg:block">
                      <RequestsTable
                        requests={filteredAndSortedRequests}
                        sortConfig={sortConfig}
                        handleSort={handleSort}
                        handleReviewClick={handleReviewClick}
                      />
                    </div>

                    <div className="lg:hidden">
                      <RequestsMobileView
                        requests={filteredAndSortedRequests}
                        handleReviewClick={handleReviewClick}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </DashboardLayout>

      <ReviewModal
        isOpen={reviewModalOpen}
        selectedRequest={selectedRequest}
        actionType={actionType}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
        confirmText={confirmText}
        setConfirmText={setConfirmText}
        error={error}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
      />
    </>
  )
}