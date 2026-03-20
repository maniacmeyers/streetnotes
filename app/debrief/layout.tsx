import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vbrick Command Center — Call Intelligence',
  description:
    'AI-powered post-call intelligence for the Vbrick sales team.',
}

export default function DebriefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-[#061222] text-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-[#7ed4f7]/30 bg-[#061222] pt-safe">
        <nav aria-label="Debrief navigation" className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
          <span className="text-white font-bold uppercase text-sm tracking-widest">
            VBRICK COMMAND CENTER
          </span>
          <span className="text-xs text-gray-500">
            Powered by StreetNotes.ai
          </span>
        </nav>
      </header>
      {/* Content */}
      <main id="main-content" className="max-w-2xl mx-auto px-5 sm:px-4 py-6 sm:py-12 pb-safe">
        {children}
      </main>
    </div>
  )
}
