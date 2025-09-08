interface ErrorAlertProps {
  message: string
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => (
  <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-xl">
    <div className="flex items-center space-x-3">
      <svg width="20" height="20" className="text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span className="text-red-800 font-medium">{message}</span>
    </div>
  </div>
)