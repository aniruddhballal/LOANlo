const AccountDeleted = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Account Deleted Successfully
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            We're sorry to see you go. Your account and all associated data have been removed from our system.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Didn't mean to delete your account?</h3>
              <p className="text-sm text-gray-700 mb-3">
                If this was a mistake or you'd like to recover your account, please contact our system administrator immediately.
              </p>
              <a
                  href={`mailto:${import.meta.env.VITE_SYSTEM_ADMIN_EMAIL}?subject=Account Recovery Request`}
                  className="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md text-center"
          >
            Back to Login
          </a>
          <a
            href="/register"
            className="px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 text-center"
          >
            Create New Account
          </a>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Thank you for using LoanLo. We hope to serve you again in the future.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccountDeleted