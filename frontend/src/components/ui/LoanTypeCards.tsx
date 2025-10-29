import { useState } from 'react'

interface LoanCard {
  id: string
  title: string
  icon: string
  description: string
  features: string[]
  interestRate: string
  maxAmount: string
  tenure: string
  gradient: string
}

const loanCards: LoanCard[] = [
  {
    id: 'personal',
    title: 'Personal Loan',
    icon: '👤',
    description: 'Quick funds for any personal need',
    features: ['Minimal documentation', 'Quick approval', 'Flexible repayment'],
    interestRate: '10.5% - 18%',
    maxAmount: '₹25 Lakhs',
    tenure: 'Up to 5 years',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'home',
    title: 'Home Loan',
    icon: '🏠',
    description: 'Finance your dream home',
    features: ['Low interest rates', 'Tax benefits', 'Long tenure'],
    interestRate: '8.5% - 12%',
    maxAmount: '₹2 Crores',
    tenure: 'Up to 30 years',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'education',
    title: 'Education Loan',
    icon: '🎓',
    description: 'Invest in your future',
    features: ['Deferred repayment', 'Cover all expenses', 'Tax deduction'],
    interestRate: '9% - 15%',
    maxAmount: '₹50 Lakhs',
    tenure: 'Up to 15 years',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 'business',
    title: 'Business Loan',
    icon: '💼',
    description: 'Grow your business',
    features: ['Working capital', 'Equipment finance', 'Business expansion'],
    interestRate: '11% - 20%',
    maxAmount: '₹1 Crore',
    tenure: 'Up to 7 years',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'vehicle',
    title: 'Vehicle Loan',
    icon: '🚗',
    description: 'Drive your dream car',
    features: ['New & used vehicles', 'Up to 100% funding', 'Fast processing'],
    interestRate: '8.75% - 14%',
    maxAmount: '₹50 Lakhs',
    tenure: 'Up to 7 years',
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'gold',
    title: 'Gold Loan',
    icon: '💰',
    description: 'Quick loan against gold',
    features: ['Instant approval', 'Keep your gold safe', 'Low interest'],
    interestRate: '7% - 12%',
    maxAmount: '₹1 Crore',
    tenure: 'Up to 3 years',
    gradient: 'from-yellow-500 to-orange-500'
  }
]

interface LoanCardsProps {
  onSelectLoan?: (loanType: string) => void
}

export const LoanCards = ({ onSelectLoan }: LoanCardsProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">Choose Your Loan Type</h2>
        <p className="text-gray-600 font-light">Select the loan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loanCards.map((loan, index) => (
          <div
            key={loan.id}
            className="relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
            style={{ 
              animation: `fadeInUp 0.5s ease-out ${0.1 * index}s both` 
            }}
            onMouseEnter={() => setHoveredCard(loan.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onSelectLoan?.(loan.id)}
          >
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${loan.gradient} p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 text-6xl opacity-10 transform translate-x-4 -translate-y-2">
                {loan.icon}
              </div>
              <div className="relative z-10">
                <div className="text-4xl mb-3">{loan.icon}</div>
                <h3 className="text-2xl font-light mb-2">{loan.title}</h3>
                <p className="text-white/90 text-sm font-light">{loan.description}</p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              {/* Key Details */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                  <p className="text-sm font-medium text-gray-900">{loan.interestRate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Max Amount</p>
                  <p className="text-sm font-medium text-gray-900">{loan.maxAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tenure</p>
                  <p className="text-sm font-medium text-gray-900">{loan.tenure}</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {loan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <svg 
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 font-light">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Apply Button */}
              <button
                className={`w-full py-3 rounded-lg font-light transition-all duration-300 ${
                  hoveredCard === loan.id
                    ? `bg-gradient-to-r ${loan.gradient} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Select {loan.title}
              </button>
            </div>

            {/* Hover Indicator */}
            <div 
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${loan.gradient} transition-transform duration-300 ${
                hoveredCard === loan.id ? 'scale-x-100' : 'scale-x-0'
              }`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  )
}