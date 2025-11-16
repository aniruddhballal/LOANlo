export interface DocumentRequirement {
  name: string
  type: string
  required: boolean
  uploaded: boolean
  description: string
  uploadedAt?: string
}

export interface LoanApplication {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
    dateOfBirth?: string
    monthlyIncome?: number
    workExperience?: number
  }
  loanType: {
    _id: string
    name: string
    interestRateMin: number
    interestRateMax: number
    maxAmount: number
    maxTenure: number
    title: string
    catchyPhrase: string
    features: string[]
    isActive: boolean
  } | 'personal' | 'home' | 'vehicle' | 'business' | 'education'
  amount: number
  purpose: string
  tenure: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  documentsUploaded: boolean
  documents?: DocumentRequirement[]
  statusHistory: Array<{
    status: string
    timestamp: string
    comment?: string
    updatedBy?: string
  }>
  rejectionReason?: string
  approvalDetails?: {
    approvedAmount: number
    interestRate: number
    tenure: number
    emi: number
  }
  createdAt: string
  updatedAt: string
}

export interface ApprovalData {
  approvedAmount: number
  interestRate: number
  tenure: number
  emi: number
}