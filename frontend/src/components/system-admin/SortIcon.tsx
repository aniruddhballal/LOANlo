import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'

interface SortIconProps {
  columnKey: string
  sortConfig: { key: string | null; direction: 'asc' | 'desc' }
}

export function SortIcon({ columnKey, sortConfig }: SortIconProps) {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />
  }
  return sortConfig.direction === 'asc' 
    ? <ChevronUp className="w-4 h-4 text-gray-900" />
    : <ChevronDown className="w-4 h-4 text-gray-900" />
}