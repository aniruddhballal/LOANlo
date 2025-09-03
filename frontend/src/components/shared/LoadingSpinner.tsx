// components/shared/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  text?: string
}

export const LoadingSpinner = ({ text = "Loading..." }: LoadingSpinnerProps) => (
  <div className="flex justify-center items-center py-16">
    <div className="relative">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-200"></div>
    </div>
    <span className="ml-4 text-gray-700 font-medium">{text}</span>
  </div>
)