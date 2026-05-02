import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/components/brand/logo'

export const metadata: Metadata = {
  title: 'Terms | StreetNotes',
  description:
    'Current terms information for StreetNotes beta access, free debriefs, and sales leader pilots.',
}

const sections = [
  {
    title: 'Current availability',
    body: 'StreetNotes includes a free debrief experience, beta access for aesthetic sales reps, and pilot conversations for sales leaders. Features may change while the product is in active development.',
  },
  {
    title: 'Acceptable use',
    body: 'Use StreetNotes only for lawful business purposes and only with information you are permitted to submit. Do not submit sensitive patient information, payment data, credentials, or content you do not have rights to process.',
  },
  {
    title: 'Output review',
    body: 'StreetNotes creates structured outputs from user-provided debriefs. Review all notes, follow-ups, CRM fields, and recommendations before using or syncing them into a system of record.',
  },
  {
    title: 'Pilots and integrations',
    body: 'Salesforce, Veeva, retention, data ownership, export, and workflow requirements for sales-leader pilots should be agreed in writing before rollout.',
  },
  {
    title: 'No professional advice',
    body: 'StreetNotes is a productivity and sales workflow tool. It does not provide medical, legal, compliance, or financial advice.',
  },
  {
    title: 'Contact',
    body: 'Questions about these terms can be sent to hello@streetnotes.ai.',
  },
]

export default function TermsPage() {
  return (
    <InfoPageShell eyebrow="Terms" title="Terms information">
      <p className="mb-8 max-w-3xl text-sm font-mono uppercase tracking-[0.16em] text-white/42">
        Last updated April 26, 2026
      </p>
      <div className="grid gap-4">
        {sections.map((section) => (
          <section key={section.title} className="sn-card rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            <p className="mt-4 max-w-4xl text-base leading-relaxed text-white/68">
              {section.body}
            </p>
          </section>
        ))}
      </div>
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
