import React from 'react';

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 py-12 px-4">
    <div className="max-w-4xl mx-auto relative">
      {/* Header Section */}
      <div className="text-center mb-16 relative">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl mb-8 shadow-lg border border-slate-200/50">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-light text-slate-900 mb-4 tracking-tight">Personal Details Form</h1>
        <p className="text-slate-500 font-normal text-lg leading-relaxed">Preparing your application interface...</p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-slate-400 to-slate-300 mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Loading Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-12 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-transparent to-slate-900"></div>
        </div>
        
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl mb-8 shadow-lg border border-slate-200/50">
            <svg className="animate-spin w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-light text-slate-900 mb-3 tracking-tight">Loading Application</h2>
          <p className="text-slate-500 mb-12 font-normal">Please wait while we initialize your form...</p>
          
          {/* Loading skeleton */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full animate-pulse"></div>
                  <div className="h-12 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded-xl animate-pulse border border-slate-200/30"></div>
                </div>
              ))}
            </div>
            
            {/* Progress indicator */}
            <div className="mt-8">
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface CongratulationsScreenProps {
  onNavigateToLoan: () => void;
}

export const CongratulationsScreen: React.FC<CongratulationsScreenProps> = ({ onNavigateToLoan }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 py-12 px-4">
    <div className="max-w-4xl mx-auto relative">
      {/* Header Section */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-green-500 rounded-full mb-6 shadow-2xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-light text-slate-900 mb-4 tracking-tight">Application Submitted</h1>
        <p className="text-slate-500 font-normal text-lg leading-relaxed">Your personal details have been saved successfully</p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-300 mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Completion Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-12 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-transparent to-emerald-900"></div>
        </div>
        
        <div className="relative text-center">
          <h2 className="text-3xl font-light text-slate-900 mb-4 tracking-tight">Form Completed</h2>
          <p className="text-slate-500 text-lg mb-12 font-normal max-w-md mx-auto leading-relaxed">
            Your personal details have been recorded. You can now proceed to apply for loans.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={onNavigateToLoan}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl font-medium hover:from-slate-900 hover:to-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="tracking-wide">APPLY FOR LOAN</span>
              <svg className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);