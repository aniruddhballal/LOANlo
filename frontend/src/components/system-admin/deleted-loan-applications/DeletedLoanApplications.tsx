import { useEffect, useState, useMemo } from 'react'
import { DashboardLayout } from '../../dashboards/shared/DashboardLayout'
import { UnderwriterTableSkeleton } from '../../ui/SkeletonComponents'
import { ErrorAlert } from '../../dashboards/shared/ErrorAlert'
import { EmptyState } from '../../dashboards/shared/EmptyState'
import { SearchFilterBar } from '../../ui/search-filter-bar/SearchFilterBar'
import { RequestsTable } from './RequestsTable'
import { RequestsMobileView } from './RequestsMobileView'
import { ReviewModal } from './ReviewModal'
import api from '../../../api'
import {
  applyFilters,
  countActiveFilters
} from '../../ui/search-filter-bar/utils/searchFilterUtilsRestoration'
import type {
  RestorationRequest,
  FilterState
  } from '../../ui/search-filter-bar/utils/searchFilterUtilsRestoration'


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
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    amountMin: '',
    amountMax: '',
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

  // Filter and sort logic using the utility functions
  const filteredAndSortedRequests = useMemo(() => {
    // Apply filters using the utility function
    let result = applyFilters(requests, searchQuery, filters)

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
          case 'amount':
            aVal = a.applicationId?.amount || 0
            bVal = b.applicationId?.amount || 0
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
      amountMin: '',
      amountMax: '',
      dateFrom: '',
      dateTo: ''
    })
    setSearchQuery('')
    setSortConfig({ key: null, direction: 'asc' })
  }

  const activeFilterCount = countActiveFilters(filters, searchQuery)
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
              searchPlaceholder="Search by reference, applicant, underwriter, reason, or amount..."
              showAmountFilters={true}
              statusLabel="Request Status"
              statusOptions={[
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
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
                  <div className="text-center py-20 px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg mx-auto">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Requests Found</h3>
                    <p className="text-gray-500 text-base mb-6 max-w-md mx-auto">
                      Try adjusting your search criteria or filters to find what you're looking for
                    </p>
                    <button
                      onClick={clearFilters}
                      className="shimmer-button px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                    >
                      Clear All Filters
                    </button>
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