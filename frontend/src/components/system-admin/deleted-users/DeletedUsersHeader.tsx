import { SearchFilterBar } from '../../ui/search-filter-bar/SearchFilterBar'

interface DeletedUsersHeaderProps {
  loading: boolean
  filteredCount: number
  totalCount: number
  searchQuery: string
  setSearchQuery: (query: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  activeFilterCount: number
  clearFilters: () => void
  filters: {
    role: string
    dateFrom: string
    dateTo: string
  }
  handleFilterChange: (key: string, value: string) => void
}

export function DeletedUsersHeader({
  loading,
  filteredCount,
  totalCount,
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  activeFilterCount,
  clearFilters,
  filters,
  handleFilterChange
}: DeletedUsersHeaderProps) {
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'applicant', label: 'Applicant' },
    { value: 'underwriter', label: 'Underwriter' },
    { value: 'system_admin', label: 'System Admin' }
  ]

  return (
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
                {filteredCount}
              </div>
              <div className="text-sm text-gray-500">
                of {totalCount} {totalCount === 1 ? "User" : "Users"}
              </div>
            </div>
          )}
        </div>
      </div>
      
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
        searchPlaceholder="Search by name, email, phone, role, company, or city..."
        showAmountFilters={false}
        statusLabel="Role"
        statusOptions={roleOptions}
      />
    </header>
  )
}