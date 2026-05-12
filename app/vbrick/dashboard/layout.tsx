import type { Metadata } from 'next'
import { DashboardProvider } from '@/lib/vbrick/dashboard-context'
import { VbrickShell } from '@/components/vbrick/vbrick-shell'
import { TourProvider } from '@/components/vbrick/tour-provider'

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
      <TourProvider>
        <VbrickShell>{children}</VbrickShell>
      </TourProvider>
    </DashboardProvider>
  )
}
