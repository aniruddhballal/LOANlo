import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { FilterState } from './types'

interface SearchFilterBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  activeFilterCount: number
  clearFilters: () => void
  filters: FilterState
  handleFilterChange: (key: string, value: string) => void
}

export function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  activeFilterCount,
  clearFilters,
  filters,
  handleFilterChange
}: SearchFilterBarProps) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to { 
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
          }
        }
        
        @keyframes badge-pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(17, 24, 39, 0.4);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(17, 24, 39, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(17, 24, 39, 0);
          }
        }
        
        .shimmer-button {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transform: translateX(-100%);
          transition: transform 0.6s;
        }
        
        .shimmer-button:hover::before {
          animation: shimmer 0.7s ease-in-out;
        }
        
        .filter-panel-animate {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .badge-animate {
          animation: badge-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .search-focus {
          transition: all 0.3s ease;
        }
        
        .search-focus:focus {
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1),
                      0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .filter-input:focus {
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
        }
        
        .clear-button-hover {
          transition: all 0.2s ease;
        }
        
        .clear-button-hover:hover {
          transform: rotate(90deg);
        }
      `}</style>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Global Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search by reference, name, email, phone, status, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 search-focus hover:border-gray-400 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 clear-button-hover"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shimmer-button flex items-center gap-2 px-5 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                showFilters 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                  : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg badge-animate pointer-events-none">
                {activeFilterCount}
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="shimmer-button px-5 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white 
              hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 border-2 border-gray-300 
              hover:border-gray-500 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-gray-200 shadow-lg filter-panel-animate">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-gray-900 transition-colors">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none text-gray-900 font-medium bg-white hover:border-gray-400 transition-all duration-200 filter-input cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>

              {/* Amount Range */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-gray-900 transition-colors">
                  Min Amount
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="₹0"
                  value={filters.amountMin}
                  onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none text-gray-900 font-medium bg-white hover:border-gray-400 transition-all duration-200 filter-input"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-gray-900 transition-colors">
                  Max Amount
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="₹10,00,000"
                  value={filters.amountMax}
                  onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none text-gray-900 font-medium bg-white hover:border-gray-400 transition-all duration-200 filter-input"
                />
              </div>

              {/* Date Range */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-gray-900 transition-colors">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none text-gray-900 font-medium bg-white hover:border-gray-400 transition-all duration-200 filter-input cursor-pointer"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-gray-900 transition-colors">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none text-gray-900 font-medium bg-white hover:border-gray-400 transition-all duration-200 filter-input cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}