import type { LoanApplication } from '../types'
import { formatDate, getStatusColor } from '../../../utils'

interface StatusHistoryTabProps {
  application: LoanApplication
}

export default function StatusHistoryTab({ application }: StatusHistoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Header with gradient underline */}
      <div className="relative pb-3">
        <h3 className="font-semibold text-gray-900 text-xl tracking-tight">Status Timeline</h3>
        <div className="absolute bottom-0 left-0 w-24 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>
      </div>

      {/* Timeline Container */}
      <div className="space-y-6">
        {application.statusHistory.map((entry, index) => (
          <div 
            key={index} 
            className="group"
            style={{ 
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
            }}
          >
            {/* Content card */}
            <div className="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 overflow-hidden">
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-300 hover:scale-105 ${getStatusColor(entry.status)}`}>
                    {entry.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600 font-medium tracking-wide">{formatDate(entry.timestamp)}</span>
                </div>

                {/* Comment */}
                {entry.comment && (
                  <p className="text-gray-700 mt-3 leading-relaxed text-sm border-l-2 border-gray-200 pl-3 italic">{entry.comment}</p>
                )}

                {/* Updated by */}
                {entry.updatedBy && (
                  <div className="flex items-center mt-3 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Updated by:</span>
                    <span className="ml-1 text-gray-700">{entry.updatedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
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