import React from 'react'

interface PersonalDetailsRequiredProps {
  onNavigateToPersonalDetails: () => void
  onNavigateBack: () => void
}

export const PersonalDetailsRequired: React.FC<PersonalDetailsRequiredProps> = ({
  onNavigateToPersonalDetails,
  onNavigateBack
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
    <div className="max-w-4xl mx-auto relative">
      {/* Header Section */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600 to-red-500 rounded-full mb-6 shadow-2xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">Personal Details Required</h1>
        <p className="text-xl text-gray-600 font-medium tracking-wide">Please complete your personal details first</p>
        <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Warning Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200 p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-bl-3xl opacity-50"></div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Personal Details First</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            To apply for a loan, you need to first provide your personal details. 
            This helps us verify your identity and prepare your account for further checks.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-3">Required Information:</h3>
            <ul className="text-red-700 space-y-2 text-sm">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                Personal Information (Name, DOB, Gender, etc.)
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                Contact Information (Email, Phone, Address)
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                Employment Information (Job, Income details)
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={onNavigateToPersonalDetails}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="tracking-wide">COMPLETE PERSONAL DETAILS</span>
              <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button 
              onClick={onNavigateBack}
              className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="tracking-wide">GO BACK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)