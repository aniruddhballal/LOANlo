import { useAuth } from '../../../context/AuthContext'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const { user, logout } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning'
    if (hour < 17) return 'Afternoon'
    return 'Evening'
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-semibold text-lg tracking-wider shadow-lg">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-1 tracking-tight">
                {title}
              </h1>
              <p className="text-base text-gray-600 font-light">
                Good {getGreeting()}, 
                <span className="font-medium text-gray-900 ml-1">
                  {user?.firstName} {user?.lastName}
                </span>
                {subtitle && <span className="ml-2 text-gray-500">• {subtitle}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={logout} 
              className="relative px-5 py-2.5 text-sm font-medium text-white bg-black backdrop-blur-md border border-white/20 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-500 group"
            >
              <span className="relative z-10">Sign Out</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}