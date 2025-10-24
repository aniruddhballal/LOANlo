import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'

interface UserTableHeaderProps {
  sortConfig: { key: string | null; direction: 'asc' | 'desc' }
  onSort: (key: string) => void
}

const SortIcon = ({ columnKey, sortConfig }: { columnKey: string; sortConfig: { key: string | null; direction: 'asc' | 'desc' } }) => {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />
  }
  return sortConfig.direction === 'asc' 
    ? <ChevronUp className="w-4 h-4 text-gray-900" />
    : <ChevronDown className="w-4 h-4 text-gray-900" />
}

export function UserTableHeader({ sortConfig, onSort }: UserTableHeaderProps) {
  return (
    <thead className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b-2 border-gray-200">
      <tr>
        <th 
          onClick={() => onSort('name')}
          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            User
            <SortIcon columnKey="name" sortConfig={sortConfig} />
          </div>
        </th>
        <th 
          onClick={() => onSort('email')}
          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            Contact
            <SortIcon columnKey="email" sortConfig={sortConfig} />
          </div>
        </th>
        <th 
          onClick={() => onSort('role')}
          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            Role
            <SortIcon columnKey="role" sortConfig={sortConfig} />
          </div>
        </th>
        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
          Additional Info
        </th>
        <th 
          onClick={() => onSort('deletedAt')}
          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            Deleted At
            <SortIcon columnKey="deletedAt" sortConfig={sortConfig} />
          </div>
        </th>
        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  )
}