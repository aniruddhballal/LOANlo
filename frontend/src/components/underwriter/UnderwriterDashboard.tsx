import { useEffect, useState, useMemo } from 'react'
import { DashboardLayout } from '../dashboards/shared/DashboardLayout'
import { UnderwriterTableSkeleton } from '../ui/SkeletonComponents'
import { ErrorAlert } from '../dashboards/shared/ErrorAlert'
import { EmptyState } from '../dashboards/shared/EmptyState'
import LoanReviewModal from '../loan/LoanReviewModal'                   // done
import { SearchFilterBar } from '../ui/searchfilterbar/SearchFilterBar' // done
import { ApplicationsTable } from './ApplicationsTable'                 // done
import { RestorationRequestModal } from './RestorationRequestModal'     // done
import type { LoanApplication, FilterState, SortConfig} from '../dashboards/types'
import { applyFiltersAndSort } from '../ui/searchfilterbar/searchFilterUtils'
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

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(17, 24, 39, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(17, 24, 39, 0);
          }
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

        @keyframes countUp {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        .stats-counter {
          animation: countUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards;
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

        .view-toggle-btn {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .view-toggle-btn:hover {
          transform: translateY(-2px);
        }

        .view-toggle-btn:active {
          transform: translateY(0) scale(0.98);
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

        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            #f3f4f6 0%,
            #e5e7eb 50%,
            #f3f4f6 100%
          );
          background-size: 200% 100%;
          animation: shimmer-skeleton 1.5s infinite;
        }

        @keyframes shimmer-skeleton {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>

      <DashboardLayout 
        title="Underwriter Dashboard"
        welcomeTitle="Welcome Back!"
        welcomeSubtitle="Successfully authenticated to Underwriter Panel"
      >
        <section className="dashboard-container bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden card-hover gradient-border">
          <header className="px-8 py-8 border-b-2 border-gray-100 bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="header-title">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                  {showDeleted ? 'Deleted Loan Applications' : 'Loan Applications'}
                </h2>
                <p className="text-sm text-gray-600 font-medium tracking-wide">
                  {showDeleted 
                    ? 'Review applications that have been deleted' 
                    : 'Review and process submitted loan applications'}
                </p>
              </div>

              <div className="header-actions flex items-center gap-4 w-full lg:w-auto">
                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`shimmer-button view-toggle-btn flex-1 lg:flex-none px-6 py-3 text-sm font-bold rounded-xl shadow-lg transition-all duration-300 ${
                    !showDeleted 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-red-200' 
                      : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 shadow-gray-300'
                  }`}
                >
                  {showDeleted ? 'View Active' : 'View Deleted'}
                </button>
                <div className="text-sm font-medium text-gray-700">
                  {loading ? (
                    <div className="w-26 h-5 rounded bg-gray-200 animate-pulse"></div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">
                        {filteredAndSortedApplications.length}
                      </div>
                      <div className="text-sm text-gray-500">
                        of {showDeleted ? deletedApplications.length : applications.length}{" "}
                        {(showDeleted ? deletedApplications.length : applications.length) === 1 ? "Application" : "Applications"}
                      </div>
                    </div>
                  )}
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
          
          <div className="content-section p-8">
            {loading ? (
              <UnderwriterTableSkeleton rows={5} />
            ) : (
              <>
                {error && <ErrorAlert message={error} />}

                {!loading && filteredAndSortedApplications.length === 0 && !searchQuery && activeFilterCount === 0 && (
                  <div className="py-20">
                    <EmptyState 
                      title="No Applications Found"
                      description="There are currently no loan applications to review."
                    />
                  </div>
                )}

                {!loading && filteredAndSortedApplications.length === 0 && (searchQuery || activeFilterCount > 0) && (
                  <div className="text-center py-20 px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No applications found</h3>
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