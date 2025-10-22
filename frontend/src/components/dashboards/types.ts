export interface LoanApplication {
  _id: string
  amount: number
  status: string
  createdAt: string
  userId: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
  restorationRequest?: {
    _id: string
    status: 'pending' | 'approved' | 'rejected'
  }
}

export interface FilterState {
  status: string
  amountMin: string
  amountMax: string
  dateFrom: string
  dateTo: string
}

export interface SortConfig {
  key: string | null
  direction: 'asc' | 'desc'
}