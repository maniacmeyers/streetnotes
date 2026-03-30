import type { Metadata } from 'next'
import { DashboardProvider } from '@/lib/vbrick/dashboard-context'

export const metadata: Metadata = {
  title: 'Vbrick Command Center — Dashboard',
  description: 'BDR performance dashboard for Vbrick',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  )
}
