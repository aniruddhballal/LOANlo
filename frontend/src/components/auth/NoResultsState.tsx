interface NoResultsStateProps {
  clearFilters: () => void
}

export function NoResultsState({ clearFilters }: NoResultsStateProps) {
  return (
    <div className="text-center py-20 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No users found</h3>
      <p className="text-gray-500 text-base mb-6 max-w-md mx-auto">
        Try adjusting your search criteria or filters to find what you're looking for
      </p>
      <button
        onClick={clearFilters}
        className="shimmer-button px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
      >
        Clear All Filters
      </button>
    </div>
  )
}