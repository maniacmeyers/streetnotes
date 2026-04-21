'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { TopNav } from './top-nav'
import { useDashboard } from '@/lib/vbrick/dashboard-context'
import { neuTheme } from '@/lib/vbrick/theme'

export function VbrickShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { email } = useDashboard()
  const isDashboardRoot = pathname === '/vbrick/dashboard'

  useEffect(() => {
    if (email === null && !isDashboardRoot && pathname.startsWith('/vbrick/dashboard')) {
      router.replace('/vbrick/dashboard')
    }
  }, [email, isDashboardRoot, pathname, router])

  // On the dashboard root without email, page.tsx renders its own gate — skip chrome there.
  if (!email && isDashboardRoot) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen font-satoshi" style={{ background: neuTheme.colors.bg }}>
      <TopNav />
      <main>{children}</main>
    </div>
  )
}
