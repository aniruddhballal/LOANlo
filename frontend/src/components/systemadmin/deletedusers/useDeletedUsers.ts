import { useState, useEffect, useMemo } from 'react'
import api from '../../../api'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  isDeleted: boolean
  deletedAt?: string
  createdAt: string
  employmentType?: string
  companyName?: string
  monthlyIncome?: number
  city?: string
  state?: string
}

export function useDeletedUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'restore' | 'delete' | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  })
  const [filters, setFilters] = useState({
    role: 'all',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchDeletedUsers()
  }, [])

  const fetchDeletedUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/profile/admin/deleted-users')
      if (data.success) {
        setUsers(data.users)
      } else {
        setError('Failed to fetch deleted users')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (user: User, action: 'restore' | 'delete') => {
    setSelectedUser(user)
    setActionType(action)
    setActionModalOpen(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setActionModalOpen(false)
    setSelectedUser(null)
    setActionType(null)
    setError(null)
  }

  const handleConfirmAction = async () => {
    if (!selectedUser || !actionType) return

    try {
      if (actionType === 'restore') {
        await api.post(`/profile/restore/${selectedUser._id}`)
      } else if (actionType === 'delete') {
        await api.delete(`/profile/admin/permanent-delete/${selectedUser._id}`)
      }

      await fetchDeletedUsers()
      handleCloseModal()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process action')
    }
  }

  const searchInUser = (user: User, query: string) => {
    const searchLower = query.toLowerCase()
    return (
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.companyName?.toLowerCase().includes(searchLower) ||
      user.city?.toLowerCase().includes(searchLower)
    )
  }

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]

    if (searchQuery) {
      result = result.filter(user => searchInUser(user, searchQuery))
    }

    if (filters.role !== 'all') {
      result = result.filter(user => user.role === filters.role)
    }

    if (filters.dateFrom) {
      result = result.filter(user => new Date(user.deletedAt || '') >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter(user => new Date(user.deletedAt || '') <= new Date(filters.dateTo))
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal: any, bVal: any

        switch (sortConfig.key) {
          case 'name':
            aVal = `${a.firstName} ${a.lastName}`.toLowerCase()
            bVal = `${b.firstName} ${b.lastName}`.toLowerCase()
            break
          case 'email':
            aVal = a.email?.toLowerCase() || ''
            bVal = b.email?.toLowerCase() || ''
            break
          case 'role':
            aVal = a.role
            bVal = b.role
            break
          case 'deletedAt':
            aVal = new Date(a.deletedAt || '').getTime()
            bVal = new Date(b.deletedAt || '').getTime()
            break
          default:
            return 0
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [users, searchQuery, filters, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      role: 'all',
      dateFrom: '',
      dateTo: ''
    })
    setSearchQuery('')
    setSortConfig({ key: null, direction: 'asc' })
  }

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length + (searchQuery ? 1 : 0)

  return {
    users,
    loading,
    error,
    selectedUser,
    actionModalOpen,
    actionType,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    sortConfig,
    filters,
    filteredAndSortedUsers,
    activeFilterCount,
    handleActionClick,
    handleCloseModal,
    handleConfirmAction,
    handleSort,
    handleFilterChange,
    clearFilters
  }
}