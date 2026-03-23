import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StreetNotes for Vbrick — Recover Your Salesforce Investment',
  description:
    'Your reps make 200 calls a week. Salesforce captures maybe 20%. StreetNotes fixes the data gap with 60-second voice debriefs.',
}

export default function VbrickSiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
