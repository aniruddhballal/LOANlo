// hooks/useLoginOverlay.ts
import { useState, useEffect } from 'react'

export const useLoginOverlay = () => {
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  useEffect(() => {
    const loginSuccess = sessionStorage.getItem('loginSuccess')
    if (loginSuccess === 'true') {
      setJustLoggedIn(true)

      const timer = setTimeout(() => {
        setJustLoggedIn(false)
        sessionStorage.removeItem('loginSuccess')
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [])

  return justLoggedIn
}