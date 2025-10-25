import { formatApplicationId } from '../../../utils'

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

export interface RestorationRequest {
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

export interface FilterState {
  status: string
  amountMin: string
  amountMax: string
  dateFrom: string
  dateTo: string
}

/**
 * Search function for restoration requests
 * Searches across multiple fields including reference, applicant, underwriter, and reason
 */
export const searchInRestorationRequest = (req: RestorationRequest, query: string): boolean => {
  const searchLower = query.toLowerCase()
  
  return (
    // Application reference
    (req.applicationId ? formatApplicationId(req.applicationId._id).toLowerCase().includes(searchLower) : false) ||
    
    // Applicant name
    `${req.applicationId?.userId?.firstName || ''} ${req.applicationId?.userId?.lastName || ''}`.toLowerCase().includes(searchLower) ||
    
    // Applicant email
    req.applicationId?.userId?.email?.toLowerCase().includes(searchLower) ||
    
    // Applicant phone
    req.applicationId?.userId?.phone?.toLowerCase().includes(searchLower) ||
    
    // Requested by (underwriter)
    `${req.requestedBy?.firstName} ${req.requestedBy?.lastName}`.toLowerCase().includes(searchLower) ||
    req.requestedBy?.email?.toLowerCase().includes(searchLower) ||
    
    // Reason for restoration
    req.reason?.toLowerCase().includes(searchLower) ||
    
    // Status
    req.status?.toLowerCase().includes(searchLower) ||
    
    // Amount
    req.applicationId?.amount?.toString().includes(searchLower)
  )
}

/**
 * Apply all filters to restoration requests
 */
export const applyFilters = (
  requests: RestorationRequest[],
  searchQuery: string,
  filters: FilterState
): RestorationRequest[] => {
  let result = [...requests]

  // Apply global search
  if (searchQuery) {
    result = result.filter(req => searchInRestorationRequest(req, searchQuery))
  }

  // Apply status filter
  if (filters.status !== 'all') {
    result = result.filter(req => req.status === filters.status)
  }

  // Apply amount filters (based on application amount)
  if (filters.amountMin) {
    result = result.filter(req => 
      req.applicationId?.amount >= Number(filters.amountMin)
    )
  }

  if (filters.amountMax) {
    result = result.filter(req => 
      req.applicationId?.amount <= Number(filters.amountMax)
    )
  }

  // Apply date filters (based on request creation date)
  if (filters.dateFrom) {
    result = result.filter(req => 
      new Date(req.createdAt) >= new Date(filters.dateFrom)
    )
  }

  if (filters.dateTo) {
    result = result.filter(req => 
      new Date(req.createdAt) <= new Date(filters.dateTo)
    )
  }

  return result
}

/**
 * Count active filters (excluding 'all' status and empty values)
 */
export const countActiveFilters = (filters: FilterState, searchQuery: string): number => {
  let count = 0
  
  if (filters.status && filters.status !== 'all') count++
  if (filters.amountMin) count++
  if (filters.amountMax) count++
  if (filters.dateFrom) count++
  if (filters.dateTo) count++
  if (searchQuery) count++
  
  return count
}