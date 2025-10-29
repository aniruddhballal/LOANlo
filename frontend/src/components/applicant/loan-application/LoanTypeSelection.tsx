import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Home, GraduationCap, Briefcase, Car, Coins, Wallet } from 'lucide-react'
import api from '../../../api' // Adjust path based on your file structure

interface LoanCard {
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
  // Display fields
  interestRate: string
  maxAmountFormatted: string
  tenure: string
  description: string
}

// Icon mapping
const getIconForLoanType = (name: string): any => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('personal')) return User
  if (lowerName.includes('home') || lowerName.includes('house')) return Home
  if (lowerName.includes('education') || lowerName.includes('student')) return GraduationCap
  if (lowerName.includes('business') || lowerName.includes('startup')) return Briefcase
  if (lowerName.includes('vehicle') || lowerName.includes('car') || lowerName.includes('auto')) return Car
  if (lowerName.includes('gold')) return Coins
  return Wallet
}

// Color mapping
const getAccentColorForLoanType = (name: string): string => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('personal')) return 'from-blue-500/10 to-blue-600/5'
  if (lowerName.includes('home')) return 'from-green-500/10 to-green-600/5'
  if (lowerName.includes('education')) return 'from-purple-500/10 to-purple-600/5'
  if (lowerName.includes('business')) return 'from-orange-500/10 to-orange-600/5'
  if (lowerName.includes('vehicle') || lowerName.includes('car')) return 'from-cyan-500/10 to-cyan-600/5'
  if (lowerName.includes('gold')) return 'from-amber-500/10 to-amber-600/5'
  return 'from-gray-500/10 to-gray-600/5'
}

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const LoanTypeSelection = () => {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [loanCards, setLoanCards] = useState<LoanCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        setLoading(true)
        const response = await api.get('/loan-types')
        
        const loanTypesArray = response.data.loanTypes || response.data
        
        // Transform backend data
        const transformedCards: LoanCard[] = loanTypesArray
          .filter((loan: any) => loan.isActive)
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
            accentColor: getAccentColorForLoanType(loan.name),
            // Display formatted fields
            interestRate: `${loan.interestRateMin}% - ${loan.interestRateMax}%`,
            maxAmountFormatted: formatCurrency(loan.maxAmount),
            tenure: `Up to ${loan.maxTenure} year${loan.maxTenure > 1 ? 's' : ''}`,
            description: loan.catchyPhrase
          }))
        
        setLoanCards(transformedCards)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching loan types:', err)
        setError(err.response?.data?.message || err.message || 'Failed to load loan types')
      } finally {
        setLoading(false)
      }
    }

    fetchLoanTypes()
  }, [])

  const handleSelectLoan = (loanId: string) => {
    navigate('/apply-loan', { state: { selectedLoanType: loanId } })
  }

  const handleNavigateBack = () => {
    navigate('/dashboard/applicant')
  }

  const styles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `

if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loan types...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-gray-900 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <style>{styles}</style>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header Section */}
        <div 
          className="text-center mb-12 relative"
          style={{ animation: 'fadeInUp 0.5s ease-out 0s both' }}
        >
          <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">Select Your Loan Type</h1>
          <p className="text-lg text-gray-600 font-light tracking-wide">
            Choose the loan that best fits your needs
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-gray-900 to-gray-600 mx-auto mt-6"></div>
        </div>

        {/* Loan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loanCards.map((loan, index) => {
            const IconComponent = loan.icon
            return (
              <div
                key={loan._id}
                className={`relative bg-gradient-to-br ${loan.accentColor} rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer group ${
                  hoveredCard === loan._id ? 'shadow-xl -translate-y-1' : 'shadow-sm'
                }`}
                style={{ 
                  animation: `fadeInUp 0.5s ease-out ${0.1 * index}s both` 
                }}
                onMouseEnter={() => setHoveredCard(loan._id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleSelectLoan(loan._id)}
              >
                {/* Card Content */}
                <div className="p-6 relative z-10">
                  {/* Icon and Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-light text-gray-900 mb-2 tracking-wide">{loan.title}</h3>
                      <p className="text-sm text-gray-600 font-light">{loan.description}</p>
                    </div>
                    <div className={`ml-4 p-3 bg-gradient-to-br ${loan.accentColor} rounded-lg`}>
                      <IconComponent className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-90 h-px bg-gray-300 mb-6"></div>

                  {/* Key Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-light tracking-wide">Interest Rate</span>
                      <span className="text-sm text-gray-900 font-light">{loan.interestRate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-light tracking-wide">Max Amount</span>
                      <span className="text-sm text-gray-900 font-light">{loan.maxAmountFormatted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-light tracking-wide">Tenure</span>
                      <span className="text-sm text-gray-900 font-light">{loan.tenure}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-gray-100">
                    {loan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-xs text-gray-600 font-light leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <button
                    className={`w-full py-3 rounded-lg font-light tracking-wide transition-all duration-300 ${
                      hoveredCard === loan._id
                        ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Select Loan
                  </button>
                </div>

                {/* Bottom accent line */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-900 to-gray-600 transition-transform duration-300 ${
                    hoveredCard === loan._id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                ></div>
              </div>
            )
          })}
        </div>

        {/* Back to Dashboard Button */}
        <div 
          className="mt-12 text-center"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
        >
          <button 
            onClick={handleNavigateBack}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-light hover:from-black hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
          >
            <svg 
              width="20" 
              height="20" 
              className="mr-3 transition-transform duration-300 group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 16l-4-4m0 0l4-4m-4 4h18" 
              />
            </svg>
            Return to Dashboard
          </button>
        </div>

        {/* Footer */}
        <div 
          className="text-center mt-8 text-gray-500"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.5s both' }}
        >
          <p className="text-sm font-light tracking-wide">© 2025 LOANlo Financial Services. All rights reserved.</p>
          <p className="text-xs font-light mt-2">Secure • Professional • Confidential</p>
        </div>
      </div>
    </div>
  )
}

export default LoanTypeSelection