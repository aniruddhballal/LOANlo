interface RoleBadgeProps {
  role: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = {
    applicant: 'bg-blue-100 text-blue-800 border-blue-200',
    underwriter: 'bg-purple-100 text-purple-800 border-purple-200',
    system_admin: 'bg-gray-900 text-white border-gray-900'
  }[role] || 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-all duration-300 hover:scale-105 ${styles}`}>
      {role === 'system_admin' ? 'System Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}