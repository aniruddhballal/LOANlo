import { Activity } from 'lucide-react'
import type { LoanApplication } from '../types'
import { useState } from 'react'
import api from '../../../../api'

interface AICreditRiskTabProps {
  application: LoanApplication
}

export default function AICreditRiskTab({ application }: AICreditRiskTabProps) {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const predict = async () => {
    try {
      setLoading(true)
      // Calculate age
      const dob = application.userId?.dateOfBirth
      const age = dob
        ? Math.floor(
            (Date.now() - new Date(dob).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null
      // Income
      const income = application.userId?.monthlyIncome
        ? Number(application.userId.monthlyIncome)
        : null
      // Interest rate (approved or avg)
      const loanInterest =
        application.approvalDetails?.interestRate ??
        (typeof application.loanType === 'object'
          ? (application.loanType.interestRateMin +
              application.loanType.interestRateMax) / 2
          : null)
      // Approved amount (fallback to requested)
      const approvedAmount =
        application.approvalDetails?.approvedAmount ?? application.amount
      // Loan percent income (real)
      const loanPercentIncome =
        income && income > 0 ? approvedAmount / income : 0
      // Final payload
      const payload = {
        // real calculated values
        age,
        income,
        emp_length: application.userId?.workExperience ?? 2,
        loan_amnt: approvedAmount,
        loan_int_rate: loanInterest,
        loan_percent_income: loanPercentIncome,
        // fallback values for model-only fields
        home_ownership: "RENT",
        loan_intent: "PERSONAL",
        loan_grade: "C",
        default_on_file: "N",
        cred_hist_length: 3,
      }
      const { data } = await api.post('/credit-risk/predict', payload)
      setResult(`Risk: ${data.risk_level} (${data.risk_score})`)
    } catch (err) {
      setResult('Error: Could not get prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div 
        className="group bg-white rounded-xl border border-gray-200 p-12 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 overflow-hidden text-center"
        style={{ animation: 'fadeInUp 0.5s ease-out' }}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full mb-6 shadow-lg transition-transform duration-300 group-hover:scale-105">
            <Activity className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
            AI Credit Risk Analysis
          </h3>
          
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-8 text-base">
            Powered by our advanced machine learning model to assess credit risk
          </p>
          
          <button
            onClick={predict}
            disabled={loading}
            className="group/btn relative px-6 py-3 text-sm font-medium text-white bg-gray-900 border border-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-gray-800 hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
                  <span>Get Prediction</span>
                </>
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
          </button>
          
          {result && (
            <div 
              className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-xl"
              style={{ animation: 'fadeInUp 0.3s ease-out' }}
            >
              <p className="text-sm font-medium text-gray-500 mb-2 tracking-wide uppercase">
                Prediction Result
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {result}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  )
}