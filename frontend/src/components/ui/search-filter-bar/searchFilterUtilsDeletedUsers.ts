// Utility functions for deleted users search and filtering

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

interface DeletedUsersFilters {
  role: string
  dateFrom: string
  dateTo: string
}

/**
 * Searches across user fields for deleted users
 */
export function searchInDeletedUser(user: User, query: string): boolean {
  const searchLower = query.toLowerCase()
  const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
  
  return [
    fullName,
    user.email,
    user.phone,
    user.role,
    user.companyName,
    user.city
  ].some(field => field?.toLowerCase().includes(searchLower))
}

/**
 * Applies filters to deleted users list
 */
export function applyDeletedUsersFilters(
  users: User[],
  filters: DeletedUsersFilters
): User[] {
  let result = [...users]

  // Role filter
  if (filters.role !== 'all') {
    result = result.filter(user => user.role === filters.role)
  }

  // Date range filters
  if (filters.dateFrom) {
    result = result.filter(
      user => new Date(user.deletedAt || '') >= new Date(filters.dateFrom)
    )
  }

  if (filters.dateTo) {
    result = result.filter(
      user => new Date(user.deletedAt || '') <= new Date(filters.dateTo)
    )
  }

  return result
}

/**
 * Calculates the number of active filters
 */
export function getActiveDeletedUsersFilterCount(
  filters: DeletedUsersFilters,
  searchQuery: string
): number {
  const filterCount = Object.values(filters).filter(
    v => v && v !== 'all'
  ).length
  return filterCount + (searchQuery ? 1 : 0)
}

/**
 * Returns initial/default filter state
 */
export function getDefaultDeletedUsersFilters(): DeletedUsersFilters {
  return {
    role: 'all',
    dateFrom: '',
    dateTo: ''
  }
}