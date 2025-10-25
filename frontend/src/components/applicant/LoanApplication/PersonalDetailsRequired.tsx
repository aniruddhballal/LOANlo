import React from 'react'

interface PersonalDetailsRequiredProps {
  onNavigateToPersonalDetails: () => void
  onNavigateBack: () => void
}

export const PersonalDetailsRequired: React.FC<PersonalDetailsRequiredProps> = ({
  onNavigateToPersonalDetails,
  onNavigateBack
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 flex items-center justify-center">
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-amber-200 p-12 text-center">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="1.5"/>
          <rect x="11" y="7" width="2" height="7" rx="1" fill="#D97706"/>
          <rect x="11" y="16" width="2" height="2" rx="1" fill="#D97706"/>
        </svg>
      </div>
      
      <h2 className="text-3xl font-light text-gray-900 mb-4">Personal Details Required</h2>
      <p className="text-lg text-gray-600 font-light mb-8">
        Please complete your personal details before applying for a loan. This information helps us verify your identity and process your application.
      </p>
      
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-left">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Required Information:</h3>
        <ul className="text-gray-700 space-y-2 text-sm font-light">
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3"></div>
            Personal Information (Name, DOB, Gender, etc.)
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3"></div>
            Contact Information (Email, Phone, Address)
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3"></div>
            Employment Information (Job, Income details)
          </li>
        </ul>
      </div>
      
      <div className="flex justify-center gap-4 flex-wrap">
        <button 
          onClick={onNavigateToPersonalDetails}
          className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-xl font-light hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <span className="tracking-wide">Complete Personal Details</span>
          <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button 
          onClick={onNavigateBack}
          className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-light hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <svg width="20" height="20" className="mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <span className="tracking-wide">Back to Dashboard</span>
        </button>
      </div>
    </div>
  </div>
)