'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { TopNav } from './top-nav'
import { useDashboard } from '@/lib/vbrick/dashboard-context'
import { neuTheme } from '@/lib/vbrick/theme'

export function VbrickShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { email, hydrated } = useDashboard()
  const isDashboardRoot = pathname === '/vbrick/dashboard'

  useEffect(() => {
    // Only redirect AFTER localStorage has been checked — otherwise we redirect
    // on initial render before the provider's email state has hydrated.
    if (!hydrated) return
    if (email === null && !isDashboardRoot && pathname.startsWith('/vbrick/dashboard')) {
      router.replace('/vbrick/dashboard')
    }
  }, [hydrated, email, isDashboardRoot, pathname, router])

  // On the dashboard root without email, page.tsx renders its own gate — skip chrome there.
  if (hydrated && !email && isDashboardRoot) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen font-satoshi" style={{ background: neuTheme.colors.bg }}>
      <TopNav />
      <main>{children}</main>
    </div>
  )
}
