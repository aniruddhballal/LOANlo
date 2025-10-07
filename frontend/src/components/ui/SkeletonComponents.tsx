// shared/SkeletonComponents.tsx
import React from 'react';

// Base skeleton component
interface SkeletonBaseProps {
  className?: string;
  children?: React.ReactNode;
}

const SkeletonBase: React.FC<SkeletonBaseProps> = ({ className = "", children }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

// Individual skeleton elements
const SkeletonBox = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded-lg ${className}`} />
);

const SkeletonText = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded-md h-4 ${className}`} />
);

const SkeletonCircle = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded-full ${className}`} />
);

// Personal Details Section Skeleton (for ApplicantDashboard)
export const PersonalDetailsSkeleton = () => (
  <SkeletonBase>
    <div className="mb-8 rounded-xl p-6 shadow-sm border bg-white border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <SkeletonCircle className="w-12 h-12" />
          <div>
            <SkeletonText className="w-48 mb-2" />
            <SkeletonText className="w-64 h-3" />
          </div>
        </div>
        <SkeletonBox className="w-32 h-12 rounded-lg" />
      </div>
    </div>
  </SkeletonBase>
);

// Service Actions Skeleton (for ApplicantDashboard)
export const ServiceActionsSkeleton = () => (
  <SkeletonBase>
    <section className="mb-10">
      <div className="mb-6">
        <SkeletonText className="w-48 h-8 mb-2" />
        <SkeletonBox className="w-16 h-0.5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start space-x-4">
              <SkeletonBox className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <SkeletonText className="w-40 h-5 mb-2" />
                <SkeletonText className="w-full h-3 mb-1" />
                <SkeletonText className="w-3/4 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </SkeletonBase>
);

// Application Card Skeleton (for ApplicantDashboard)
export const ApplicationCardSkeleton = () => (
  <div className="border border-gray-200 rounded-xl p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6 flex-1 min-w-0">
        <SkeletonCircle className="w-10 h-10" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4 mb-3">
            <SkeletonText className="w-32 h-5" />
            <SkeletonBox className="w-20 h-6 rounded-full" />
          </div>
          
          <div className="flex items-center space-x-6">
            <SkeletonText className="w-24 h-4" />
            <SkeletonText className="w-28 h-4" />
            <SkeletonText className="w-32 h-4" />
          </div>
        </div>
      </div>
      
      <SkeletonBox className="w-48 h-12 rounded-xl" />
    </div>
  </div>
);

// Table Row Skeleton (for UnderwriterDashboard desktop table)
export const TableRowSkeleton = () => (
  <tr className="hover:bg-gray-50/50">
    <td className="px-6 py-4 whitespace-nowrap">
      <SkeletonBox className="w-20 h-6 rounded" />
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center space-x-3">
        <SkeletonCircle className="w-8 h-8" />
        <div>
          <SkeletonText className="w-32 mb-1" />
          <SkeletonText className="w-16 h-3" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <SkeletonText className="w-40 mb-1" />
      <SkeletonText className="w-28 h-3" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <SkeletonText className="w-20 h-5" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <SkeletonBox className="w-16 h-6 rounded-full" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <SkeletonText className="w-20 mb-1" />
      <SkeletonText className="w-16 h-3" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <SkeletonBox className="w-16 h-7 rounded-lg" />
    </td>
  </tr>
);

// Mobile Card Skeleton (for UnderwriterDashboard mobile view)
export const MobileCardSkeleton = () => (
  <div className="border border-gray-200 rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <SkeletonCircle className="w-10 h-10" />
        <div>
          <SkeletonText className="w-32 mb-1" />
          <SkeletonBox className="w-20 h-6 rounded" />
        </div>
      </div>
      <SkeletonBox className="w-16 h-6 rounded-full" />
    </div>

    <div className="space-y-3 mb-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <SkeletonText className="w-16 h-3" />
          <SkeletonText className="w-24 h-3" />
        </div>
      ))}
    </div>

    <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
      <SkeletonBox className="flex-1 h-8 rounded-lg" />
    </div>
  </div>
);

// Complete Table Skeleton (for UnderwriterDashboard)
export const UnderwriterTableSkeleton = ({ rows = 5 }) => (
  <SkeletonBase>
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <MobileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// Enhanced Loading Spinner (replacement for LoadingSpinner)
const sizeClasses = {
  small: "w-4 h-4 border",
  default: "w-8 h-8 border-2",
  large: "w-12 h-12 border-3",
} as const;

type SpinnerSize = keyof typeof sizeClasses; // "small" | "default" | "large"

interface LoadingSpinnerProps {
  text?: string;
  size?: SpinnerSize;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Loading...",
  size = "default",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4`}
      ></div>
      <p className="text-gray-600 font-light text-lg">{text}</p>
      <div className="mt-4 flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Compact Loading Spinner
export const CompactLoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center space-x-3">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      <span className="text-gray-600 font-light">{text}</span>
    </div>
  </div>
);

// Application Status Page Skeleton
export const ApplicationStatusSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
    {/* Subtle geometric background */}
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <div className="absolute top-0 left-0 w-full h-full" style={{
        backgroundImage: `linear-gradient(30deg, transparent 40%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.02) 60%, transparent 60%),
                         linear-gradient(150deg, transparent 40%, rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.01) 60%, transparent 60%)`
      }}></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
      <SkeletonBase>
        {/* Header Skeleton */}
        <div className="mb-12">
          <div className="border-l-4 border-gray-300 pl-6">
            <SkeletonText className="w-96 h-10 mb-3" />
            <SkeletonText className="w-[500px] h-6" />
          </div>
        </div>

        {/* Applications Section Skeleton */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <SkeletonText className="w-48 h-7 mb-2" />
                <SkeletonText className="w-72 h-4" />
              </div>
              <SkeletonBox className="w-32 h-10 rounded-lg" />
            </div>
          </header>

          {/* Application Cards */}
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  {/* Main Content Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-6 flex-1 min-w-0">
                      <SkeletonCircle className="w-10 h-10" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <SkeletonText className="w-40 h-6" />
                          <SkeletonBox className="w-24 h-6 rounded-full" />
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <SkeletonText className="w-32 h-5" />
                          <SkeletonText className="w-28 h-5" />
                          <SkeletonText className="w-36 h-5" />
                          <SkeletonText className="w-32 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <SkeletonBox className="w-48 h-10 rounded-lg" />
                    <div className="flex items-center space-x-3">
                      <SkeletonBox className="w-32 h-10 rounded-lg" />
                      <SkeletonBox className="w-36 h-10 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation Skeleton */}
        <div className="mt-12 flex justify-between items-center">
          <SkeletonBox className="w-48 h-12 rounded-lg" />
          <SkeletonBox className="w-56 h-12 rounded-lg" />
        </div>
      </SkeletonBase>
    </div>
  </div>
);