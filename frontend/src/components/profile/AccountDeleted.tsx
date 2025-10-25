const AccountDeleted = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card with fade in animation */}
        <div 
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 overflow-hidden relative"
          style={{ animation: 'fadeInUp 0.6s ease-out' }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-transparent pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div 
              className="flex justify-center mb-6"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>

            {/* Main Message */}
            <div 
              className="text-center mb-8"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
            >
              <div className="relative inline-block pb-3 mb-3">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                  Account Deleted Successfully
                </h1>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                We're sorry to see you go. Your account and all associated data have been removed from our system.
              </p>
            </div>

            {/* Info Box */}
            <div 
              className="group relative bg-white rounded-xl border border-blue-200 p-6 mb-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 overflow-hidden"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start space-x-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600 flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 tracking-tight">What happens next?</h3>
                  <ul className="text-sm text-gray-700 space-y-1.5">
                    <li>• Your personal information has been permanently removed</li>
                    <li>• All loan applications have been archived</li>
                    <li>• You will no longer receive emails from us</li>
                    <li>• You can create a new account anytime</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recovery Notice */}
            <div 
              className="group relative bg-white rounded-xl border border-amber-200 p-6 mb-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5 overflow-hidden"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start space-x-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600 flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 tracking-tight">Didn't mean to delete your account?</h3>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    If this was a mistake or you'd like to recover your account, please contact our system administrator immediately.
                  </p>
                  <a
                    href={`mailto:${import.meta.env.VITE_SYSTEM_ADMIN_EMAIL}?subject=Account Recovery Request`}
                    className="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-800 transition-all duration-300 hover:translate-x-1"
                  >
                    Contact System Administrator
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-1">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.5s both' }}
            >
              <a
                href="/login"
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-black text-center"
              >
                Back to Login
              </a>
              <a
                href="/register"
                className="px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:bg-gray-50 hover:border-gray-400 text-center"
              >
                Create New Account
              </a>
            </div>

            {/* Footer */}
            <div 
              className="mt-8 pt-6 border-t border-gray-200 text-center"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.6s both' }}
            >
              <p className="text-sm text-gray-500 tracking-wide">
                Thank you for using LOANlo. We hope to serve you again in the future.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
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

export default AccountDeleted