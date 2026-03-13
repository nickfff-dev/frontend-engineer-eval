'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User, AuthContextType } from '@/types/types'
import { MOCK_USERS } from '@/lib/mock-data'


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  React.useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem('session');
      if (session) {
        const session_data = JSON.parse(session);
        const user = MOCK_USERS.find(u => u.id === session_data.user_id)
        if (user) {
          setUser(user)
        }
      }
    }
    checkSession();
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password)
    if (!foundUser) {
      setIsLoading(false);
      return;
    }
    const existing_session = localStorage.getItem('session');
    if (!existing_session) {
      // Simple mock authentication - any email with "admin" in it logs in as admin
      setUser(foundUser);
      localStorage.setItem('session', JSON.stringify({ id: crypto.randomUUID(), user_id: foundUser.id, role: foundUser.role, createdAt: new Date() }))
      setIsLoading(false);
      return;
    }
    const session = JSON.parse(existing_session);
    if (session.user_id !== foundUser.id) {
      localStorage.removeItem('session');
      localStorage.setItem('session', JSON.stringify({ id: crypto.randomUUID(), user_id: foundUser.id, role: foundUser.role, createdAt: new Date() }))
    }
    setIsLoading(false);
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('session');
    // refresh data on logout
    localStorage.removeItem('tasks');
    localStorage.removeItem('submissions')
    setUser(null);
  }, [])

  return (
    <AuthContext.Provider value={{ user, users: MOCK_USERS, login, logout, isLoading }}>
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
