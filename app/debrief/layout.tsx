import type { Metadata } from 'next'

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
      <header className="border-b border-volt/30 bg-[#061222] pt-safe">
        <nav aria-label="Debrief navigation" className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
          <span className="text-white font-bold uppercase text-sm tracking-widest">
            STREETNOTES.AI
          </span>
          <span className="text-xs text-gray-500">
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
