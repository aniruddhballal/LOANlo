import { Link } from 'react-router-dom'
import { Trash2, Users } from 'lucide-react'
import { DashboardLayout } from './shared/DashboardLayout'

export default function SystemAdminDashboard() {
  return (
    <DashboardLayout 
      title="System Admin Dashboard"
      welcomeTitle="Welcome, Administrator!"
      welcomeSubtitle="Manage system operations and restoration requests"
    >
      {/* Admin Actions */}
      <section className="mb-10">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-gray-900 mb-2">Restoration Actions</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gray-900 to-gray-600"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link 
            to="/admin/deleted-applications" 
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Trash2 className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                  Deleted Loan Applications
                </h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">
                  Review and manage restoration requests for soft-deleted loan applications. Approve, reject, or permanently delete applications.
                </p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/admin/deleted-users" 
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                  Deleted User Accounts
                </h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">
                  Manage soft-deleted user accounts. View account details, restore accounts, or permanently delete user data from the system.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  )
}