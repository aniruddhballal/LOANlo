import type { DocumentRequirement } from './loan/LoanReviewModal/types'

export const getRequiredDocuments = (): DocumentRequirement[] => {
  return [
    {
      name: 'Aadhaar Card',
      type: 'aadhaar',
      required: true,
      uploaded: false,
      description: 'Government issued identity proof with 12-digit unique number'
    },
    {
      name: 'PAN Card',
      type: 'pan',
      required: true,
      uploaded: false,
      description: 'Permanent Account Number card for tax identification'
    },
    {
      name: 'Salary Slips (Last 3 months)',
      type: 'salary_slips',
      required: true,
      uploaded: false,
      description: 'Recent salary certificates showing current income'
    },
    {
      name: 'Bank Statements (Last 6 months)',
      type: 'bank_statements',
      required: true,
      uploaded: false,
      description: 'Bank account statements for financial verification'
    },
    {
      name: 'Employment Certificate',
      type: 'employment_certificate',
      required: true,
      uploaded: false,
      description: 'Letter from employer confirming current employment status'
    },
    {
      name: 'Photo',
      type: 'photo',
      required: true,
      uploaded: false,
      description: 'Recent passport-size photograph for identification'
    },
    {
      name: 'Address Proof',
      type: 'address_proof',
      required: false,
      uploaded: false,
      description: 'Utility bill or rent agreement showing current address'
    },
    {
      name: 'Income Tax Returns',
      type: 'itr',
      required: false,
      uploaded: false,
      description: 'IT returns for additional income verification'
    }
  ]
}

export const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatApplicationId = (id: string) => `#${id.toUpperCase()}`

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'text-green-800 bg-green-100 border-green-400'
    case 'rejected': return 'text-red-800 bg-red-100 border-red-400'
    case 'under_review': return 'text-blue-800 bg-blue-100 border-blue-400'
    default: return 'text-amber-800 bg-amber-100 border-amber-400'
  }
}

export const getLoanTypeLabel = (type: string) => {
  const types = {
    personal: 'Personal Loan',
    home: 'Home Loan',
    vehicle: 'Vehicle Loan',
    business: 'Business Loan',
    education: 'Education Loan'
  }
  return types[type as keyof typeof types] || type
}

export const getDocumentProgress = (documents?: DocumentRequirement[]) => {
  if (!documents) return { uploaded: 0, total: 0, percentage: 0 }
  
  const requiredDocs = documents.filter(doc => doc.required)
  const uploadedDocs = requiredDocs.filter(doc => doc.uploaded)
  
  return {
    uploaded: uploadedDocs.length,
    total: requiredDocs.length,
    percentage: requiredDocs.length > 0 ? (uploadedDocs.length / requiredDocs.length) * 100 : 0
  }
}

export const getProgressBarColor = (percentage: number) => {
  if (percentage < 30) return 'bg-gradient-to-r from-red-500 to-red-600'
  if (percentage < 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  if (percentage < 100) return 'bg-gradient-to-r from-yellow-500 to-green-500'
  return 'bg-gradient-to-r from-green-500 to-green-600'
}