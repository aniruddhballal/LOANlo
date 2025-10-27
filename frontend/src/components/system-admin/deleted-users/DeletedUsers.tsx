import { DashboardLayout } from '../../dashboards/shared/DashboardLayout.tsx'
import { UnderwriterTableSkeleton } from '../../ui/SkeletonComponents.tsx'
import { ErrorAlert } from '../../dashboards/shared/ErrorAlert.tsx'
import { EmptyState } from '../../dashboards/shared/EmptyState.tsx'
import { UserActionModal } from './UserActionModal.tsx'
import { DeletedUsersStyles } from './DeletedUsersStyles.tsx'
import { DeletedUsersHeader } from './DeletedUsersHeader.tsx'
import { NoResultsState } from './NoResultsState.tsx'
import { UsersList } from './UsersList.tsx'
import { useDeletedUsers } from './useDeletedUsers.ts'

export default function DeletedUsers() {
  const {
    users,
    loading,
    error,
    selectedUser,
    actionModalOpen,
    actionType,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    sortConfig,
    filters,
    filteredAndSortedUsers,
    activeFilterCount,
    handleActionClick,
    handleCloseModal,
    handleConfirmAction,
    handleSort,
    handleFilterChange,
    clearFilters
  } = useDeletedUsers()

  return (
    <>
      <DeletedUsersStyles />

      <DashboardLayout 
        title="Deleted User Accounts"
        welcomeTitle="User Account Management"
        welcomeSubtitle="Manage soft-deleted user accounts and restore or permanently delete them"
      >
        <section className="dashboard-container bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden card-hover gradient-border">
          <DeletedUsersHeader
            loading={loading}
            filteredCount={filteredAndSortedUsers.length}
            totalCount={users.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            activeFilterCount={activeFilterCount}
            clearFilters={clearFilters}
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
          
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
                  <NoResultsState clearFilters={clearFilters} />
                )}

                {!loading && filteredAndSortedUsers.length > 0 && (
                  <UsersList
                    users={filteredAndSortedUsers}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onActionClick={handleActionClick}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </DashboardLayout>

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