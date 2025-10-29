import { Link } from 'react-router-dom'
import { DashboardLayout } from '../dashboards/shared/DashboardLayout'

export default function UnderwriterDashboard() {
  return (
    <DashboardLayout 
      title="Underwriter Dashboard"
      welcomeTitle="Welcome Back!"
      welcomeSubtitle="Successfully authenticated to Underwriter Panel"
    >
      <section className="mb-10">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-gray-900 mb-2">Available Services</h2>
          <div className="w-44 h-0.5 bg-gradient-to-r from-gray-900 to-gray-600"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link 
            to="/loan-applications" 
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                  Loan Applications
                </h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">
                  Review and process loan applications submitted by applicants. View active and deleted applications.
                </p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/loan-type-details" 
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 7l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                  View/Update Loan Type Details
                </h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">
                  Manage and configure loan type details, interest rates, and eligibility criteria for different loan products.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  )
}