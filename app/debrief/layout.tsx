import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post-Call Brain Dump — Free Sales Debrief Tool | StreetNotes.ai',
  description:
    'Hit the mic after your sales call. Get structured deal notes, objections, next steps, and a deal mind map in 60 seconds. Free.',
}

export default function DebriefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-dark text-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b-2 sm:border-b-4 border-volt/30 bg-dark pt-safe">
        <nav aria-label="Debrief navigation" className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
          <a href="/" className="flex items-center min-h-[44px]" aria-label="StreetNotes.ai home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/streetnotes_logo.png"
              alt="StreetNotes.ai"
              className="h-8 sm:h-10 w-auto"
            />
          </a>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-volt font-bold border-2 border-volt/40 px-3 py-1" aria-label="This is a free tool">
            Free Tool
          </span>
        </nav>
      </header>
      {/* Content — extra px on mobile for neo-shadow offset */}
      <main id="main-content" className="max-w-2xl mx-auto px-5 sm:px-4 py-6 sm:py-12 pb-safe">
        {children}
      </main>
    </div>
  )
}
