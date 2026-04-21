import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vbrick Command Center — Call Intelligence',
  description: 'AI-powered call intelligence for the Vbrick sales team.',
}

export default function VbrickLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
