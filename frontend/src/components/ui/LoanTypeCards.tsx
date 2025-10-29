import { User, Home, GraduationCap, Briefcase, Car, Coins } from 'lucide-react'

export interface LoanCard {
  id: string
  title: string
  description: string
  features: string[]
  interestRate: string
  maxAmount: string
  tenure: string
  icon: any
  accentColor: string
}

export const loanCards: LoanCard[] = [
  {
    id: 'personal',
    title: 'Personal Loan',
    description: 'Quick funds for any personal need',
    features: ['Minimal documentation', 'Quick approval', 'Flexible repayment'],
    interestRate: '10.5% - 18%',
    maxAmount: '₹25 Lakhs',
    tenure: 'Up to 5 years',
    icon: User,
    accentColor: 'from-blue-500/10 to-blue-600/5'
  },
  {
    id: 'home',
    title: 'Home Loan',
    description: 'Finance your dream home',
    features: ['Low interest rates', 'Tax benefits', 'Long tenure'],
    interestRate: '8.5% - 12%',
    maxAmount: '₹2 Crores',
    tenure: 'Up to 30 years',
    icon: Home,
    accentColor: 'from-green-500/10 to-green-600/5'
  },
  {
    id: 'education',
    title: 'Education Loan',
    description: 'Invest in your future',
    features: ['Deferred repayment', 'Cover all expenses', 'Tax deduction'],
    interestRate: '9% - 15%',
    maxAmount: '₹50 Lakhs',
    tenure: 'Up to 15 years',
    icon: GraduationCap,
    accentColor: 'from-purple-500/10 to-purple-600/5'
  },
  {
    id: 'business',
    title: 'Business Loan',
    description: 'Grow your business',
    features: ['Working capital', 'Equipment finance', 'Business expansion'],
    interestRate: '11% - 20%',
    maxAmount: '₹1 Crore',
    tenure: 'Up to 7 years',
    icon: Briefcase,
    accentColor: 'from-orange-500/10 to-orange-600/5'
  },
  {
    id: 'vehicle',
    title: 'Vehicle Loan',
    description: 'Drive your dream car',
    features: ['New & used vehicles', 'Up to 100% funding', 'Fast processing'],
    interestRate: '8.75% - 14%',
    maxAmount: '₹50 Lakhs',
    tenure: 'Up to 7 years',
    icon: Car,
    accentColor: 'from-cyan-500/10 to-cyan-600/5'
  },
  {
    id: 'gold',
    title: 'Gold Loan',
    description: 'Quick loan against gold',
    features: ['Instant approval', 'Keep your gold safe', 'Low interest'],
    interestRate: '7% - 12%',
    maxAmount: '₹1 Crore',
    tenure: 'Up to 3 years',
    icon: Coins,
    accentColor: 'from-amber-500/10 to-amber-600/5'
  }
]