import type { Metadata } from 'next'
import Logo from '@/components/brand/logo'

export const metadata: Metadata = {
  title: 'StreetNotes.ai — Post-Call Brain Dump',
  description:
    '60 seconds of talking. Structured CRM notes, follow-up tasks, and a downloadable PDF. Free.',
}

export default function DebriefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-[#061222] text-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-volt/20 bg-[#061222]/80 backdrop-blur-xl pt-safe">
        <nav aria-label="Debrief navigation" className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
          <Logo size="sm" priority />
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] text-volt/80 border border-volt/30 px-2 py-1">
            Free Tool
          </span>
        </nav>
      </header>
      {/* Content */}
      <main id="main-content" className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-safe">
        {children}
      </main>
    </div>
  )
}
