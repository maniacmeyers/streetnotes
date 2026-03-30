'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface DashboardContextValue {
  email: string | null
  setEmail: (email: string | null) => void
  activeSection: 'dashboard' | 'stories' | 'ci'
  setActiveSection: (section: 'dashboard' | 'stories' | 'ci') => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [email, setEmailState] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'stories' | 'ci'>('dashboard')

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmailState(stored)
  }, [])

  const setEmail = (email: string | null) => {
    setEmailState(email)
    if (email) {
      localStorage.setItem('vbrick_email', email)
    } else {
      localStorage.removeItem('vbrick_email')
    }
  }

  return (
    <DashboardContext.Provider value={{ email, setEmail, activeSection, setActiveSection }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
