import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/components/brand/logo'

export const metadata: Metadata = {
  title: 'Privacy | StreetNotes',
  description:
    'Current privacy information for StreetNotes voice-to-CRM workflows, beta access, and sales leader pilots.',
}

const sections = [
  {
    title: 'What StreetNotes is',
    body: 'StreetNotes is a voice-to-CRM workflow for aesthetic sales teams. Reps use it to turn post-visit debriefs into structured account notes, follow-ups, competitive intel, and CRM-ready fields.',
  },
  {
    title: 'Information we collect',
    body: 'Depending on how you use StreetNotes, we may collect your email address, waitlist or pilot details, submitted account debrief content, generated structured outputs, product usage events, and technical information needed to operate the service.',
  },
  {
    title: 'How we use information',
    body: 'We use information to provide and improve StreetNotes, process debriefs, create CRM-ready outputs, respond to contact requests, support beta and pilot programs, maintain security, and communicate product updates.',
  },
  {
    title: 'Audio and transcripts',
    body: 'StreetNotes is designed around short post-visit debriefs, not live call recording. Audio and transcript handling may vary by beta or pilot configuration, and production deployments can define retention, export, and CRM-sync requirements in writing.',
  },
  {
    title: 'Data ownership and access',
    body: 'For sales-leader pilots, rep-captured account data is intended to belong to the customer organization. Access controls, CRM mappings, and data processing terms should be confirmed before rollout.',
  },
  {
    title: 'Contact',
    body: 'Questions about privacy or data handling can be sent to hello@streetnotes.ai.',
  },
]

export default function PrivacyPage() {
  return (
    <InfoPageShell eyebrow="Privacy" title="Privacy information">
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
