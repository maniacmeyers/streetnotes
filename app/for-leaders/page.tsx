import type { Metadata } from 'next'
import { Building2, Eye, Clock, DollarSign, HelpCircle, ArrowLeft } from 'lucide-react'
import Logo from '@/components/brand/logo'
import LeaderContactForm from '@/components/leader-contact-form'

export const metadata: Metadata = {
  title: 'StreetNotes for Sales Leaders — Field intelligence for aesthetic sales teams',
  description:
    'StreetNotes is the field-intelligence layer for aesthetic sales teams. Purpose-built for injectable and device reps. Request a 30-day pilot with up to 25 seats.',
}

const gapItems = [
  {
    label: 'Legacy CRM workflows (Veeva)',
    body: 'Built around rep activity and required fields. StreetNotes adds the missing visit context: injectors, unit counts, practice managers, and aesthetic buying cycles.',
  },
  {
    label: 'Horizontal CRMs (Salesforce)',
    body: 'Built for everyone, optimized for no one. Your reps bend their workflow to fit the tool. Most of the field intelligence never makes it in.',
  },
  {
    label: 'Practice software (PatientNow, Nextech, AestheticRecord)',
    body: 'Built for the practice, not the rep. They manage the patient chart. They don’t capture what happens the moment your rep walks out of the office.',
  },
  {
    label: 'Call recorders (Gong, Chorus, Fireflies)',
    body: 'Good for Zoom. Useless in the field. No aesthetic vocabulary, no competitor-brand tracking, no structured CRM push.',
  },
]

const pilotPhases = [
  {
    label: 'Day 0 — Kickoff',
    body: 'We sit down with your sales leadership and define what success looks like. Usually: unit-count lift in the cohort, trial conversions, and how fast new competitor moves show up in your pipeline. Rep cohort selected — up to 25 seats across 2–3 territories.',
  },
  {
    label: 'Days 1–7 — Onboarding',
    body: 'Our team runs rep training. We stand up the CRM integration path for Salesforce or Veeva, load the territory context, and get the first injector debriefs recorded in week one.',
  },
  {
    label: 'Days 8–23 — In production',
    body: 'Reps use it daily. Weekly rollup reviews with your sales leadership show account memory, objection patterns, and competitor shifts your reps are seeing in real time.',
  },
  {
    label: 'Days 24–30 — Decision',
    body: 'Results review against the metrics you set. Expand, extend, or walk. No pressure, no multi-year lock-in, no cleanup cost if you walk.',
  },
]

const dashboardCapabilities = [
  'Live view of every account, every injector, every competitor mention on your territory — updated as your reps speak their debriefs',
  'Weekly rollup: which brands are cresting, which are fading, where the movement is happening',
  'Objection-frequency map — which objection is showing up where, trending up or down, by rep or region',
  'Switch-story library — the exact narratives your best reps are using to move injectors between brands',
  'Account memory every rep on your team can pull from — no more losing context when territories change hands',
  'No call recording. No transcripts stored past 24 hours. Only structured CRM data persists.',
]

const faqItems = [
  {
    q: 'How is this different from Veeva?',
    a: 'Veeva is the system many teams already use to record activity. StreetNotes is the field layer reps actually use after a visit: it captures injector relationships, unit counts, practice-manager dynamics, buying windows, and follow-ups, then prepares the right fields for Veeva or Salesforce.',
  },
  {
    q: 'Which CRMs do you integrate with?',
    a: 'StreetNotes is being built around Salesforce and Veeva first. Pilot scope includes mapping the fields your reps need to update.',
  },
  {
    q: 'What about recording consent and data security?',
    a: 'StreetNotes is not a call recorder. Reps speak a 60-second debrief into their phone after a visit. The audio is transcribed and discarded within 24 hours; only the structured CRM fields persist. Everything is encrypted at rest and in transit, with per-brand tenant isolation available for pilots.',
  },
  {
    q: 'Who owns the data?',
    a: 'Your brand. Standard DPA, data-portability, and export terms are available before the pilot starts. Rep-captured data belongs to your organization, not ours.',
  },
  {
    q: 'Why you, why now?',
    a: 'Our co-founder spent years inside aesthetic software — building the tools the practices your reps sell to actually use. He watched brand reps walk in with pharma CRMs that couldn’t handle aesthetic reality. StreetNotes is what he wishes he’d had back then — and the timing is right now because AI finally makes the 60-second voice-to-CRM piece fast and accurate enough to trust.',
  },
  {
    q: 'What does the contract look like?',
    a: '30-day paid pilot with up to 25 seats. If the success metrics we set together are hit, expand to annual at $179/seat for 10 or more seats. Manager seat is free on any multi-rep team. No multi-year lock-in.',
  },
]

export default function ForLeadersPage() {
  return (
    <div className="min-h-[100dvh] bg-[#061222] text-white overflow-x-hidden relative">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] pointer-events-none opacity-60 z-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(0,230,118,0.15) 0%, rgba(0,230,118,0.04) 35%, transparent 60%)',
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-volt/20 bg-[#061222]/80 backdrop-blur-xl">
        <nav
          aria-label="Main navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20"
        >
          <Logo size="lg" priority />
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              className="font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold text-white/60 hover:text-white min-h-[44px] flex items-center px-2 sm:px-3 transition-colors duration-150"
            >
              <ArrowLeft className="w-3 h-3 mr-1.5" />
              For reps
            </a>
            <a
              href="#request-pilot"
              className="font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold bg-volt text-black rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 cursor-pointer min-h-[44px] flex items-center transition-all duration-200 shadow-glow-volt hover:shadow-glow-volt-lg"
            >
              Request a pilot
            </a>
          </div>
        </nav>
      </header>

      <main id="main-content" className="relative z-10">
        {/* Hero */}
        <section className="relative" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-28">
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt">
                <Building2 className="w-3 h-3" />
                For VPs of Sales at aesthetic brands
              </span>
            </div>

            <h1
              id="hero-heading"
              className="font-bold text-[40px] sm:text-[72px] md:text-[96px] lg:text-[120px] leading-[0.9] text-white mb-6 sm:mb-8 tracking-tight"
            >
              Your reps hear
              <br className="hidden sm:block" />{' '}
              everything.
              <br className="hidden sm:block" />{' '}
              Your pipeline sees{' '}
              <span className="text-volt drop-shadow-[0_0_40px_rgba(0,230,118,0.45)]">
                almost none of it
              </span>
              .
            </h1>

            <p className="font-body text-lg sm:text-xl md:text-2xl text-white/70 max-w-3xl mb-10 leading-relaxed">
              Injector preferences. Competitor pricing. Objection patterns.
              Switching stories. The field intelligence that actually moves
              share stays in your reps&apos; heads. StreetNotes captures it 60
              seconds after each visit and structures it into your CRM —
              purpose-built for aesthetic sales teams and piloted with up to
              25 seats before wider rollout.
            </p>

            <a
              href="#request-pilot"
              className="inline-flex items-center gap-2 font-bold text-lg sm:text-xl bg-volt text-black rounded-xl px-8 py-4 sm:px-10 sm:py-5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px] shadow-glow-volt-lg"
            >
              Request a pilot
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        {/* The gap */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="gap-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              The gap
            </span>
            <h2
              id="gap-heading"
              className="font-bold text-[28px] sm:text-[48px] md:text-[64px] leading-[0.95] text-white mt-3 mb-10 sm:mb-14 tracking-tight max-w-4xl"
            >
              No one built for your reps.{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                So they didn’t use anything.
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {gapItems.map((item) => (
                <div key={item.label} className="glass rounded-2xl p-6 sm:p-7">
                  <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt font-bold mb-3">
                    {item.label}
                  </p>
                  <p className="font-body text-base sm:text-lg text-white/75 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it deploys */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="deploy-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              How it deploys
            </span>
            <h2
              id="deploy-heading"
              className="font-bold text-[28px] sm:text-[48px] md:text-[64px] leading-[0.95] text-white mt-3 mb-4 tracking-tight"
            >
              30-day pilot.{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                Hands-on.
              </span>
            </h2>
            <p className="font-body text-lg sm:text-xl text-white/70 mb-10 sm:mb-14 leading-relaxed max-w-3xl">
              Up to 25 seats, 30 days, success metrics defined with you
              upfront. Expand, extend, or walk. No multi-year lock-in.
            </p>

            <div className="space-y-3 sm:space-y-4">
              {pilotPhases.map((p) => (
                <div
                  key={p.label}
                  className="glass rounded-2xl p-6 sm:p-7 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 md:gap-8 items-start"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-volt font-bold flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {p.label}
                  </p>
                  <p className="font-body text-base sm:text-lg text-white/80 leading-relaxed">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What a VP sees Monday morning */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="dashboard-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              What you see Monday morning
            </span>
            <h2
              id="dashboard-heading"
              className="font-bold text-[28px] sm:text-[48px] md:text-[64px] leading-[0.95] text-white mt-3 mb-10 sm:mb-14 tracking-tight max-w-4xl"
            >
              The visibility layer between{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                your reps and your CRM
              </span>
              .
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {dashboardCapabilities.map((cap) => (
                <div
                  key={cap}
                  className="glass rounded-xl p-5 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg glass-inset flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Eye className="w-4 h-4 text-volt" />
                  </div>
                  <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed">
                    {cap}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="pricing-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              Pricing
            </span>
            <h2
              id="pricing-heading"
              className="font-bold text-[28px] sm:text-[48px] md:text-[64px] leading-[0.95] text-white mt-3 mb-10 tracking-tight"
            >
              Straight. No bundles.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl">
              <div className="glass rounded-2xl p-7 sm:p-9">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-volt" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt font-bold">
                    Pilot
                  </p>
                </div>
                <p className="font-bold text-4xl sm:text-5xl text-white mb-3 leading-none">
                  $199<span className="text-2xl text-white/60">/seat/mo</span>
                </p>
                <p className="font-body text-white/60 text-sm sm:text-base mb-6">
                  Up to 25 seats, 30 days. Full functionality, manager seat included.
                </p>
                <ul className="space-y-2 text-white/70 text-sm sm:text-base">
                  <li>· Success metrics defined upfront</li>
                  <li>· Hands-on onboarding</li>
                  <li>· Weekly leadership review</li>
                  <li>· Clear expand, extend, or walk decision</li>
                </ul>
              </div>

              <div className="glass-volt rounded-2xl p-7 sm:p-9">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-volt" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt font-bold">
                    Brand deployment (post-pilot)
                  </p>
                </div>
                <p className="font-bold text-4xl sm:text-5xl text-white mb-3 leading-none">
                  $179<span className="text-2xl text-white/70">/seat/mo</span>
                </p>
                <p className="font-body text-white/70 text-sm sm:text-base mb-6">
                  10+ seats, annual. Manager seat free with any multi-rep team.
                </p>
                <ul className="space-y-2 text-white/80 text-sm sm:text-base">
                  <li>· Annual commitment</li>
                  <li>· Tenant isolation available</li>
                  <li>· Custom CRM integration on request</li>
                  <li>· Dedicated success contact</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Founders */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="founder-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              Who&apos;s building this
            </span>
            <h2
              id="founder-heading"
              className="font-bold text-[28px] sm:text-[48px] md:text-[64px] leading-[0.95] text-white mt-3 mb-10 tracking-tight"
            >
              Two founders.{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                One from each side.
              </span>
            </h2>

            <div className="glass rounded-2xl p-6 sm:p-10 md:p-12 max-w-4xl space-y-5">
              <p className="font-body text-lg sm:text-xl text-white/85 leading-relaxed">
                Our co-founder spent years inside aesthetic software — building
                the tools your accounts actually use every day. He sat with
                injectors, practice managers, and medical directors and watched
                them work around tools that weren&apos;t designed for their
                reality.
              </p>
              <p className="font-body text-base sm:text-lg text-white/70 leading-relaxed">
                He watched something else too: brand reps walking in with
                pharma CRMs, asking the same unit-count questions three visits
                in a row because nothing got remembered between calls.
                Injectors tolerated it. Nobody fixed it.
              </p>
              <p className="font-body text-base sm:text-lg text-white/70 leading-relaxed">
                Co-founder Jeff Meyers brings 20+ years of enterprise SaaS
                sales leadership — the GTM discipline to pair with the domain
                side. Together they&apos;re building what the brand side has
                been missing.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              FAQ
            </span>
            <h2
              id="faq-heading"
              className="font-bold text-[28px] sm:text-[48px] md:text-[64px] leading-[0.95] text-white mt-3 mb-10 tracking-tight"
            >
              Six questions brand leaders ask.
            </h2>

            <div className="space-y-3 sm:space-y-4 max-w-4xl">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="glass rounded-2xl p-5 sm:p-6 group"
                >
                  <summary className="font-bold text-base sm:text-lg text-white cursor-pointer list-none flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-volt flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{item.q}</span>
                    <span
                      aria-hidden="true"
                      className="text-volt font-mono text-sm group-open:rotate-45 transition-transform"
                    >
                      +
                    </span>
                  </summary>
                  <p className="font-body text-sm sm:text-base text-white/75 leading-relaxed mt-4 ml-8">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Request a pilot — form */}
        <section
          id="request-pilot"
          className="border-t border-volt/10 py-16 sm:py-28 relative scroll-mt-20"
          aria-labelledby="contact-heading"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(0,230,118,0.18) 0%, transparent 60%)',
            }}
          />

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <h2
              id="contact-heading"
              className="font-bold text-[32px] sm:text-[56px] md:text-[72px] leading-[0.95] text-white mb-6 tracking-tight text-center"
            >
              Request a pilot.
            </h2>
            <p className="font-body text-base sm:text-lg md:text-xl text-white/70 mb-10 leading-relaxed text-center">
              Tell us what you&apos;re working on — team size, rough timeline,
              anything specific you want to cover. We&apos;ll be in touch within
              two business days.
            </p>

            <LeaderContactForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-volt/10 py-8 sm:py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
              — a ForgeTime.ai product
            </span>
          </div>
          <a
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors"
          >
            ← Back to rep site
          </a>
        </div>
      </footer>
    </div>
  )
}
