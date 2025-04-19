'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication status on mount
    const authStatus = document.cookie.includes('isAuthenticated=true')
    setIsAuthenticated(authStatus)
  }, [])

  const login = async (username: string, password: string) => {
    if (username === 'Admin' && password === 'Nuch07!') {
      // Set authentication cookie
      document.cookie = 'isAuthenticated=true; path=/'
      setIsAuthenticated(true)
      router.push('/rewrite')
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    // Remove authentication cookie
    document.cookie = 'isAuthenticated=false; path=/'
    setIsAuthenticated(false)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 