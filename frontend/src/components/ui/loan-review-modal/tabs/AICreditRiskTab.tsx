import { Activity } from 'lucide-react'
import type { LoanApplication } from '../types'

interface AICreditRiskTabProps {
  application: LoanApplication
}

export default function AICreditRiskTab({}: AICreditRiskTabProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-50 rounded-full mb-4 shadow-sm">
          <Activity className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          AI Credit Risk Analysis
        </h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
          Powered by our AI model
        </p>

        {/* Embed the Streamlit app */}
        <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md border">
          <iframe
            src="https://credit-risk-predictor-dedh.onrender.com/"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Credit Risk Predictor"
          />
        </div>
      </div>
    </div>
  )
}
