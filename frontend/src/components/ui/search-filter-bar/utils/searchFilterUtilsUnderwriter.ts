import type { LoanApplication, FilterState, SortConfig } from '../../../types'
import { formatApplicationId, formatCurrency, formatDate } from '../../../utils'

export const searchInApplication = (app: LoanApplication, query: string): boolean => {
  const searchLower = query.toLowerCase()
  return (
    formatApplicationId(app._id).toLowerCase().includes(searchLower) ||
    `${app.userId?.firstName} ${app.userId?.lastName}`.toLowerCase().includes(searchLower) ||
    app.loanType?.name?.toLowerCase().includes(searchLower) || // added
    app.status?.toLowerCase().includes(searchLower) ||
    formatCurrency(app.amount).replace(/,/g, '').toLowerCase().includes(searchLower.replace(/,/g, '')) ||
    formatDate(app.createdAt).toLowerCase().includes(searchLower)
  )
}

export const applyFiltersAndSort = (
  applications: LoanApplication[],
  searchQuery: string,
  filters: FilterState,
  sortConfig: SortConfig
): LoanApplication[] => {
  let result = [...applications]

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
}