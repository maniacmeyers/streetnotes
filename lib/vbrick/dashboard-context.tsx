'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'

interface DashboardContextValue {
  email: string | null
  setEmail: (email: string | null) => void
  displayName: string
  activeSection: 'dashboard' | 'stories' | 'ci'
  setActiveSection: (section: 'dashboard' | 'stories' | 'ci') => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

function deriveDisplayName(email: string | null): string {
  if (!email) return ''
  const configured = VBRICK_CONFIG.bdrDisplayNames?.[email]
  if (configured) return configured
  const localPart = email.split('@')[0]
  const first = localPart.split('.')[0]
  return first.charAt(0).toUpperCase() + first.slice(1)
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [email, setEmailState] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'stories' | 'ci'>('dashboard')

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmailState(stored)
  }, [])

  const setEmail = useCallback((next: string | null) => {
    setEmailState(next)
    if (next) {
      localStorage.setItem('vbrick_email', next)
    } else {
      localStorage.removeItem('vbrick_email')
    }
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        email,
        setEmail,
        displayName: deriveDisplayName(email),
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
