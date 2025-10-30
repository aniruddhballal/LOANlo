import { formatApplicationId, formatCurrency } from '../../../utils'

// Add LoanType interface
interface LoanType {
  _id: string
  name: string
  title: string
  catchyPhrase: string
  features: string[]
  interestRateMin: number
  interestRateMax: number
  maxAmount: number
  maxTenure: number
  isActive: boolean
}

interface LoanApplication {
  _id: string
  loanType: LoanType | null  // ← Allow null // ← Changed from string to LoanType
  amount: number
  tenure: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  createdAt: string
  documentsUploaded: boolean
}

interface FilterState {
  status: string
  amountMin: string
  amountMax: string
  dateFrom: string
  dateTo: string
}

export const searchInApplication = (app: LoanApplication, query: string): boolean => {
  const searchLower = query.toLowerCase()
  
  // Extract loan type name from the object with null check
  const loanTypeName = app.loanType?.name?.toLowerCase() || app.loanType?.title?.toLowerCase() || ''
  
  return (
    loanTypeName.includes(searchLower) ||
    formatApplicationId(app._id).toLowerCase().includes(searchLower) ||
    app._id.toLowerCase().includes(searchLower) ||
    app.status.toLowerCase().includes(searchLower) ||
    formatCurrency(app.amount).toLowerCase().includes(searchLower) ||
    app.amount.toString().includes(searchLower)
  )
}

export const applyFilters = (
  applications: LoanApplication[],
  searchQuery: string,
  filters: FilterState
): LoanApplication[] => {
  let result = [...applications]

  // Apply global search
  if (searchQuery) {
    result = result.filter(app => searchInApplication(app, searchQuery))
  }

  // Apply status filter
  if (filters.status !== 'all') {
    result = result.filter(app => app.status === filters.status)
  }

  // Apply amount filters
  if (filters.amountMin) {
    result = result.filter(app => app.amount >= Number(filters.amountMin))
  }
  if (filters.amountMax) {
    result = result.filter(app => app.amount <= Number(filters.amountMax))
  }

  // Apply date filters
  if (filters.dateFrom) {
    result = result.filter(app => new Date(app.createdAt) >= new Date(filters.dateFrom))
  }
  if (filters.dateTo) {
    result = result.filter(app => new Date(app.createdAt) <= new Date(filters.dateTo))
  }

  return result
}