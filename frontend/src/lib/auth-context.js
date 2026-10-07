'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi } from './api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'auth_lab_access_token'

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const persist = useCallback((token, nextUser) => {
    setAccessToken(token)
    setUser(nextUser || null)
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const bootstrap = useCallback(async () => {
    try {
      // Prefer refresh cookie (survives refresh even if localStorage cleared mid-session)
      const refreshed = await authApi.refresh()
      persist(refreshed.data.accessToken, refreshed.data.user)
    } catch {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (!saved) {
        persist(null, null)
        return
      }
      try {
        const me = await authApi.me(saved)
        persist(saved, me.data.user)
      } catch {
        persist(null, null)
      }
    } finally {
      setLoading(false)
    }
  }, [persist])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const loginSuccess = (data) => {
    persist(data.accessToken, data.user)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors on logout
    }
    persist(null, null)
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        loading,
        isAuthenticated: Boolean(accessToken && user),
        loginSuccess,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
