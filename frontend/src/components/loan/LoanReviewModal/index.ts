// Main component export (default export)
export { default } from './LoanReviewModal'

// Re-export types for external use
export type { 
  LoanApplication, 
  DocumentRequirement, 
  ApprovalData 
} from './types'

// Re-export utility functions that might be useful elsewhere
export { 
  formatCurrency, 
  formatDate, 
  getLoanTypeLabel,
  getStatusColor 
} from './utils'