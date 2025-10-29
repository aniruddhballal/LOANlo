import { useState } from 'react'

interface LoanCard {
  id: string
  title: string
  description: string
  features: string[]
  interestRate: string
  maxAmount: string
  tenure: string
}

const loanCards: LoanCard[] = [
  {
    id: 'personal',
    title: 'Personal Loan',
    description: 'Quick funds for any personal need',
    features: ['Minimal documentation', 'Quick approval', 'Flexible repayment'],
    interestRate: '10.5% - 18%',
    maxAmount: '₹25 Lakhs',
    tenure: 'Up to 5 years'
  },
  {
    id: 'home',
    title: 'Home Loan',
    description: 'Finance your dream home',
    features: ['Low interest rates', 'Tax benefits', 'Long tenure'],
    interestRate: '8.5% - 12%',
    maxAmount: '₹2 Crores',
    tenure: 'Up to 30 years'
  },
  {
    id: 'education',
    title: 'Education Loan',
    description: 'Invest in your future',
    features: ['Deferred repayment', 'Cover all expenses', 'Tax deduction'],
    interestRate: '9% - 15%',
    maxAmount: '₹50 Lakhs',
    tenure: 'Up to 15 years'
  },
  {
    id: 'business',
    title: 'Business Loan',
    description: 'Grow your business',
    features: ['Working capital', 'Equipment finance', 'Business expansion'],
    interestRate: '11% - 20%',
    maxAmount: '₹1 Crore',
    tenure: 'Up to 7 years'
  },
  {
    id: 'vehicle',
    title: 'Vehicle Loan',
    description: 'Drive your dream car',
    features: ['New & used vehicles', 'Up to 100% funding', 'Fast processing'],
    interestRate: '8.75% - 14%',
    maxAmount: '₹50 Lakhs',
    tenure: 'Up to 7 years'
  },
  {
    id: 'gold',
    title: 'Gold Loan',
    description: 'Quick loan against gold',
    features: ['Instant approval', 'Keep your gold safe', 'Low interest'],
    interestRate: '7% - 12%',
    maxAmount: '₹1 Crore',
    tenure: 'Up to 3 years'
  }
]

interface LoanCardsProps {
  onSelectLoan?: (loanType: string) => void
}

export const LoanCards = ({ onSelectLoan }: LoanCardsProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="mb-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-wide">Choose Your Loan Type</h2>
        <p className="text-gray-600 font-light">Select the loan that best fits your needs</p>
        <div className="w-16 h-0.5 bg-gray-300 mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loanCards.map((loan, index) => (
          <div
            key={loan.id}
            className={`relative bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer group ${
              hoveredCard === loan.id ? 'shadow-xl -translate-y-1' : 'shadow-sm'
            }`}
            style={{ 
              animation: `fadeInUp 0.5s ease-out ${0.1 * index}s both` 
            }}
            onMouseEnter={() => setHoveredCard(loan.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onSelectLoan?.(loan.id)}
          >
            {/* Subtle corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-xl opacity-50"></div>

            {/* Card Content */}
            <div className="p-6 relative z-10">
              {/* Title */}
              <h3 className="text-xl font-light text-gray-900 mb-2 tracking-wide">{loan.title}</h3>
              <p className="text-sm text-gray-600 font-light mb-6">{loan.description}</p>

              {/* Divider */}
              <div className="w-12 h-px bg-gray-300 mb-6"></div>

              {/* Key Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-light tracking-wide">Interest Rate</span>
                  <span className="text-sm text-gray-900 font-light">{loan.interestRate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-light tracking-wide">Max Amount</span>
                  <span className="text-sm text-gray-900 font-light">{loan.maxAmount}</span>
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
                  hoveredCard === loan.id
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
                hoveredCard === loan.id ? 'scale-x-100' : 'scale-x-0'
              }`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  )
}