import { useEffect, useState, useMemo } from 'react'
import { DashboardLayout } from './shared/DashboardLayout'
import { UnderwriterTableSkeleton } from '../ui/SkeletonComponents'
import { ErrorAlert } from './shared/ErrorAlert'
import { EmptyState } from './shared/EmptyState'
import LoanReviewModal from '../loan/LoanReviewModal'
import { SearchFilterBar } from './SearchFilterBar'
import { ApplicationsTable } from './ApplicationsTable'
import { RestorationRequestModal } from './RestorationRequestModal'
import type { LoanApplication, FilterState, SortConfig} from './types'
import { applyFiltersAndSort } from './searchFilterUtils'
import api from '../../api'

export default function UnderwriterDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [showDeleted, setShowDeleted] = useState(false)
  const [deletedApplications, setDeletedApplications] = useState<LoanApplication[]>([])

  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [applicationToRequest, setApplicationToRequest] = useState<string | null>(null)
  const [pendingRestorationRequests, setPendingRestorationRequests] = useState<Set<string>>(new Set())

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
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
    if (showDeleted) {
      fetchDeletedApplications()
      fetchPendingRestorationRequests()
    } else {
      fetchApplications()
    }
  }, [showDeleted])

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/loans/underwriter/all')
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
      const { data } = await api.get('/loans/underwriter/deleted')
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

  const fetchPendingRestorationRequests = async () => {
    try {
      const { data } = await api.get('/loans/underwriter/my-restoration-requests')
      if (data.success) {
        const pendingIds = new Set<string>(
          data.requests
            .filter((req: any) => req.status === 'pending')
            .map((req: any) => req.applicationId as string)
        )
        setPendingRestorationRequests(pendingIds)
      }
    } catch (err) {
      console.error('Failed to fetch restoration requests', err)
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
      const { data } = await api.get('/loans/underwriter/all')
      if (data.success) {
        setApplications(data.applications)
      }
    } catch {
      setError('Server error')
    }
  }

  const filteredAndSortedApplications = useMemo(() => {
    return applyFiltersAndSort(
      showDeleted ? deletedApplications : applications,
      searchQuery,
      filters,
      sortConfig
    )
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

  const handleRequestRestoration = (applicationId: string) => {
    setApplicationToRequest(applicationId)
    setRequestModalOpen(true)
  }

  const handleSubmitRestorationRequest = async (reason: string) => {
    try {
      const { data } = await api.post(`/loans/underwriter/request-restoration/${applicationToRequest}`, {
        reason
      })
      
      if (data.success)
        setPendingRestorationRequests(prev => new Set([...prev, applicationToRequest!]))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit restoration request')
      throw err
    }
  }

  const handleCancelRequest = () => {
    setRequestModalOpen(false)
    setApplicationToRequest(null)
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
                  <ApplicationsTable
                    applications={filteredAndSortedApplications}
                    showDeleted={showDeleted}
                    pendingRestorationRequests={pendingRestorationRequests}
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                    handleReviewClick={handleReviewClick}
                    handleRequestRestoration={handleRequestRestoration}
                  />
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

      <RestorationRequestModal
        isOpen={requestModalOpen}
        onClose={handleCancelRequest}
        onSubmit={handleSubmitRestorationRequest}
        error={error}
      />
    </>
  )
}