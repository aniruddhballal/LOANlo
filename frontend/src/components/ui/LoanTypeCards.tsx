import { User, Home, GraduationCap, Briefcase, Car, Coins, Wallet, TrendingUp, Award } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface LoanCard {
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
  icon: any
  accentColor: string
}

// Icon mapping based on loan name (you can customize this)
const getIconForLoanType = (name: string): any => {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('personal')) return User
  if (lowerName.includes('home') || lowerName.includes('house')) return Home
  if (lowerName.includes('education') || lowerName.includes('student')) return GraduationCap
  if (lowerName.includes('business') || lowerName.includes('startup')) return Briefcase
  if (lowerName.includes('vehicle') || lowerName.includes('car') || lowerName.includes('auto')) return Car
  if (lowerName.includes('gold')) return Coins
  if (lowerName.includes('wedding') || lowerName.includes('marriage')) return Award
  if (lowerName.includes('medical') || lowerName.includes('health')) return TrendingUp
  
  // Default icon
  return Wallet
}

// Color mapping based on loan name (you can customize this)
const getAccentColorForLoanType = (name: string): string => {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('personal')) return 'from-blue-500/10 to-blue-600/5'
  if (lowerName.includes('home') || lowerName.includes('house')) return 'from-green-500/10 to-green-600/5'
  if (lowerName.includes('education') || lowerName.includes('student')) return 'from-purple-500/10 to-purple-600/5'
  if (lowerName.includes('business') || lowerName.includes('startup')) return 'from-orange-500/10 to-orange-600/5'
  if (lowerName.includes('vehicle') || lowerName.includes('car')) return 'from-cyan-500/10 to-cyan-600/5'
  if (lowerName.includes('gold')) return 'from-amber-500/10 to-amber-600/5'
  if (lowerName.includes('wedding')) return 'from-pink-500/10 to-pink-600/5'
  if (lowerName.includes('medical')) return 'from-red-500/10 to-red-600/5'
  
  // Default color
  return 'from-gray-500/10 to-gray-600/5'
}

// Format currency in Indian format
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Hook to fetch loan types from backend
export const useLoanCards = () => {
  const [loanCards, setLoanCards] = useState<LoanCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/loan-types')
        
        if (!response.ok) {
          throw new Error('Failed to fetch loan types')
        }
        
        const text = await response.text()
        if (!text) {
          throw new Error('Empty response from server')
        }
        
        const data = JSON.parse(text)
        const loanTypesArray = data.loanTypes || data
        
        // Transform backend data to match LoanCard interface
        const transformedCards: LoanCard[] = loanTypesArray
          .filter((loan: any) => loan.isActive) // Only show active loans
          .map((loan: any) => ({
            _id: loan._id,
            name: loan.name,
            title: loan.title,
            catchyPhrase: loan.catchyPhrase,
            features: loan.features,
            interestRateMin: loan.interestRateMin,
            interestRateMax: loan.interestRateMax,
            maxAmount: loan.maxAmount,
            maxTenure: loan.maxTenure,
            isActive: loan.isActive,
            icon: getIconForLoanType(loan.name),
            accentColor: getAccentColorForLoanType(loan.name)
          }))
        
        setLoanCards(transformedCards)
        setError(null)
      } catch (err) {
        console.error('Error fetching loan types:', err)
        setError(err instanceof Error ? err.message : 'Failed to load loan types')
        setLoanCards([]) // Fallback to empty array
      } finally {
        setLoading(false)
      }
    }

    fetchLoanTypes()
  }, [])

  return { loanCards, loading, error }
}

// Helper function to format the data for display
export const formatLoanCardForDisplay = (card: LoanCard) => {
  return {
    ...card,
    interestRate: `${card.interestRateMin}% - ${card.interestRateMax}%`,
    maxAmount: formatCurrency(card.maxAmount),
    tenure: `Up to ${card.maxTenure} year${card.maxTenure > 1 ? 's' : ''}`,
    description: card.catchyPhrase
  }
}

// Export for backward compatibility (if needed for static fallback)
export const defaultLoanCards: LoanCard[] = []