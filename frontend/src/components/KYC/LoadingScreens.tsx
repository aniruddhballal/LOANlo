import React from 'react';

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
    <div className="max-w-4xl mx-auto relative">
      {/* Header Section */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full mb-6 shadow-2xl">
          <span className="text-3xl font-bold text-white tracking-wider">KYC</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">Know Your Customer</h1>
        <p className="text-xl text-gray-600 font-medium tracking-wide">Loading your verification details...</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Loading Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-12 relative overflow-hidden">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full mb-6">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading KYC Information</h2>
          <p className="text-gray-600 mb-8">Please wait while we fetch your verification details...</p>
          
          {/* Loading skeleton */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              ))}
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
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
    <div className="max-w-4xl mx-auto relative">
      {/* Header Section */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-green-500 rounded-full mb-6 shadow-2xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">KYC Complete!</h1>
        <p className="text-xl text-gray-600 font-medium tracking-wide">Your verification is successful</p>
        <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Completion Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-12 relative overflow-hidden">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Complete</h2>
          <p className="text-lg text-gray-600 mb-8">Your KYC details have been successfully verified. You can now proceed to apply for loans.</p>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={onNavigateToLoan}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="tracking-wide">APPLY FOR LOAN</span>
              <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);