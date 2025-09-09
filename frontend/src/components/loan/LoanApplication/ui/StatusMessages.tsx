import React from 'react'

interface LoadingStateProps {
  title?: string
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  title = "Checking Your Status", 
  message = "Please wait while we verify your information..." 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
    {/* Elegant animated background patterns */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 border border-gray-100 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/3 -right-32 w-64 h-64 border border-gray-200 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-24 left-1/4 w-48 h-48 border border-gray-150 rounded-full opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-2/3 right-1/4 w-32 h-32 border border-gray-100 rounded-full opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}></div>
    </div>
    
    <div className="relative z-10 flex items-center justify-center min-h-screen">
      <div className="text-center p-8">
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto border-4 border-gray-200 rounded-full animate-spin border-t-gray-900"></div>
          <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-gray-100 rounded-full animate-ping opacity-75"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-light text-gray-900 tracking-wide">{title}</h2>
          <p className="text-gray-600">{message}</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

interface ErrorMessageProps {
  message: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="mb-8 p-4 bg-red-50/20 border-2 border-red-400 rounded-lg animate-shake">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-semibold text-red-800">{message}</p>
      </div>
    </div>
  </div>
)

export const SuccessMessage: React.FC = () => (
  <div className="mb-8 animate-[slideDown_0.6s_ease-out]">
    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4 animate-[zoomIn_0.4s_ease-out_0.2s_both]">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-green-100">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-800 mb-1 animate-[slideLeft_0.5s_ease-out_0.3s_both]">
            Personal Details Complete
          </h3>
          <p className="text-green-700 animate-[slideLeft_0.5s_ease-out_0.4s_both]">
            Your identity information has been successfully saved. You can now proceed with your loan application.
          </p>
        </div>
      </div>
    </div>
  </div>
)