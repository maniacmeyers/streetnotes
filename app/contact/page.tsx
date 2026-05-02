import type { Metadata } from 'next'
import { ArrowLeft, Mail, MapPin, MessageSquare } from 'lucide-react'
import Logo from '@/components/brand/logo'

export const metadata: Metadata = {
  title: 'Contact StreetNotes',
  description:
    'Contact StreetNotes for beta access, pilot questions, and support for voice-to-CRM workflows for aesthetic sales teams.',
}

export default function ContactPage() {
  return (
    <InfoPageShell eyebrow="Contact" title="Talk to StreetNotes">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            Icon: Mail,
            label: 'Email',
            value: 'hello@streetnotes.ai',
            href: 'mailto:hello@streetnotes.ai',
          },
          {
            Icon: MessageSquare,
            label: 'Best for',
            value: 'Beta access, pilots, product questions',
          },
          {
            Icon: MapPin,
            label: 'Built for',
            value: 'Aesthetic sales reps and brand teams',
          },
        ].map((item) => (
          <div key={item.label} className="sn-card rounded-2xl p-6">
            <item.Icon className="mb-5 h-6 w-6 text-volt" aria-hidden="true" />
            <p className="font-mono text-xs font-bold uppercase text-white/45">
              {item.label}
            </p>
            {item.href ? (
              <a
                href={item.href}
                className="mt-2 block text-lg font-bold text-white hover:text-volt"
              >
                {item.value}
              </a>
            ) : (
              <p className="mt-2 text-lg font-bold leading-snug text-white">
                {item.value}
              </p>
            )}
          </div>
        ))}
      </div>
      <section className="sn-card mt-8 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white">Current product context</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/68">
          StreetNotes turns a 60-second post-visit voice debrief into CRM-ready
          notes, account memory, competitive intel, and field follow-ups for
          aesthetic sales teams. For sales-leader pilots, include your CRM,
          approximate seat count, and territories in your note.
        </p>
      </section>
    </InfoPageShell>
  )
}

function InfoPageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="sn-landing min-h-[100dvh] bg-[#061222] text-white">
      <div className="sn-grid-bg" aria-hidden="true" />
      <header className="sticky top-0 z-50 border-b border-volt/20 bg-[#061222]/86 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Logo size="lg" priority />
          <a
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 font-mono text-xs font-bold uppercase text-white/70 hover:border-volt/45 hover:text-volt"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </a>
        </nav>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="font-mono text-xs font-bold uppercase text-volt">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-[56px] leading-[0.9] text-white sm:text-[88px] md:text-[112px]">
          {title}
        </h1>
        <div className="mt-10">{children}</div>
      </main>
    </div>
  )
}
