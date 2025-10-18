import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '../ui/StatusMessages'
import api from '../../api'

interface ChangeDetail {
  oldValue: any
  newValue: any
}

interface ProfileHistoryEntry {
  _id: string
  userId: string
  changedFields: Record<string, ChangeDetail>
  changeType: 'profile_update' | 'profile_creation'
  timestamp: string
  ipAddress?: string
  userAgent?: string
  profileSnapshot?: {
    aadhaarNumber?: string
    panNumber?: string
    monthlyIncome?: string
    employmentType?: string
  }
}

const ProfileHistory = () => {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<ProfileHistoryEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [userId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const endpoint = `/profile-history/${userId}`
      const { data } = await api.get(endpoint)
      setHistory(data.history || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile history')
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Not Set'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') return value.toLocaleString('en-IN')
    if (typeof value === 'string') {
      // Format dates
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return new Date(value).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      }
      return value
    }
    return String(value)
  }

  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getChangeTypeColor = (type: string) => {
    return type === 'profile_creation' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getChangeTypeLabel = (type: string) => {
    return type === 'profile_creation' ? 'Profile Created' : 'Profile Updated'
  }

  if (loading) {
    return <LoadingState title="Loading Profile History" message="Please wait..." />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 opacity-60"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-light text-gray-900 mb-1 tracking-tight">
                    Profile Change History
                  </h1>
                  <p className="text-base text-gray-600 font-light">
                    Complete audit trail of profile modifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="relative px-5 py-2.5 text-sm font-medium text-gray-900 bg-white backdrop-blur-md border border-gray-300 rounded-lg shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 group"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                    <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Back</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading History</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No History Found</h3>
              <p className="text-gray-600">No profile changes have been recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  {/* Entry Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700">#{history.length - index}</span>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getChangeTypeColor(entry.changeType)}`}>
                          {getChangeTypeLabel(entry.changeType)}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">{formatTimestamp(entry.timestamp)}</p>
                      </div>
                    </div>
                    {entry.ipAddress && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">IP: {entry.ipAddress}</p>
                      </div>
                    )}
                  </div>

                  {/* Changed Fields */}
                  {Object.keys(entry.changedFields).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Changes Made:</h4>
                      {Object.entries(entry.changedFields).map(([field, change]) => (
                        <div key={field} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">{formatFieldName(field)}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-xs text-red-600 font-medium mb-1">Previous Value</p>
                              <p className="text-sm text-gray-900 font-mono">{formatValue(change.oldValue)}</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-xs text-green-600 font-medium mb-1">New Value</p>
                              <p className="text-sm text-gray-900 font-mono">{formatValue(change.newValue)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Profile Snapshot */}
                  {entry.profileSnapshot && Object.keys(entry.profileSnapshot).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Critical Fields Snapshot:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(entry.profileSnapshot).map(([key, value]) => (
                          value && (
                            <div key={key} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs text-blue-600 font-medium mb-1">{formatFieldName(key)}</p>
                              <p className="text-sm text-gray-900 font-mono">{formatValue(value)}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ProfileHistory