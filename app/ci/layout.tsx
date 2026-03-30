import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StreetNotes CI — Competitive Intelligence',
  description:
    'Real-time competitive intelligence from your sales team\'s voice notes.',
}

export default function CILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {children}
    </div>
  )
}
