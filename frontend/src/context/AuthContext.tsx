import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'applicant' | 'underwriter' | 'system_admin'
  phone?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, options?: { skipDelay?: boolean }) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  completeLogin: () => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/verify')
        .then(({ data }) => {
          if (data.success) {
            setUser(data.user)
          }
        })
        .catch(() => {
          // api.ts' interceptor handles 401
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token changed (login in another tab) → re-verify
          api.get('/auth/verify')
            .then(({ data }) => {
              if (data.success) {
                setUser(data.user)
              } else {
                setUser(null)
              }
            })
            .catch(() => setUser(null))
        } else {
          // Token removed (logout in another tab)
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])


  const login = async (email: string, password: string, options?: { skipDelay?: boolean }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)

      if (options?.skipDelay) {
        setUser(data.user)
      } else {
        localStorage.setItem('pendingUser', JSON.stringify(data.user))
      }
    } catch (error) {
      throw error
    }
  }

  // Function to complete the login after animations
  const completeLogin = () => {
    const pendingUser = localStorage.getItem('pendingUser')
    if (pendingUser) {
      setUser(JSON.parse(pendingUser))
      localStorage.removeItem('pendingUser')
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const { data } = await api.post('/auth/register', userData)
      localStorage.setItem('token', data.token)
      setUser(data.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('pendingUser')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    completeLogin // Expose this for manual completion
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}