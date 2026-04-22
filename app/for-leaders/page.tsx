import type { Metadata } from 'next'
import { Building2, Eye, Clock, DollarSign, HelpCircle, ArrowLeft } from 'lucide-react'
import Logo from '@/components/brand/logo'
import LeaderContactForm from '@/components/leader-contact-form'

export const metadata: Metadata = {
  title: 'StreetNotes for Sales Leaders — Field intelligence for aesthetic sales teams',
  description:
    'StreetNotes is the field-intelligence layer for aesthetic sales teams. Purpose-built for injectable and device reps, deployed at 150–200 seats. Book a call with co-founder Michael Hervis.',
}

const gapItems = [
  {
    label: 'Veeva',
    body: 'Built for pharma rep workflows. Doesn’t model injectors, practice managers, unit-count-driven deals, or aesthetic buying cycles.',
  },
  {
    label: 'Salesforce / HubSpot',
    body: 'Horizontal B2B CRMs. Your reps bend their workflow to fit the tool instead of the other way around.',
  },
  {
    label: 'Symplast, PatientNow, Nextech, AestheticRecord',
    body: 'Built for the practice, not the rep. They manage the patient chart. They don’t capture what happens in the room when your rep is standing there.',
  },
  {
    label: 'Gong, Chorus, Fireflies',
    body: 'Record calls and meetings. Don’t understand aesthetic vocabulary, competitor taxonomy, or unit-count signals. No push to your CRM.',
  },
]

const pilotPhases = [
  {
    label: 'Week 0',
    body: 'Kickoff with sales leadership. Define success metrics (unit-count lift, trial conversions, account-manager tenure signal, competitor-mention visibility). Rep cohort selected — typically 25 seats across 2–3 territories.',
  },
  {
    label: 'Weeks 1–2',
    body: 'Onboarding. Michael runs the rep sessions. CRM integration stood up (Salesforce or HubSpot). Territory data loaded. First injector debriefs recorded.',
  },
  {
    label: 'Weeks 3–8',
    body: 'Production use. Weekly rollup review with sales leadership. Territory heatmap surfaces competitor shifts your reps are seeing in real time — before they show up in pipeline data.',
  },
  {
    label: 'Week 9',
    body: 'Results review against success metrics. Decision point: expand to full brand deployment (150–200 seats) or terminate. No pressure, no lock-in.',
  },
]

const dashboardCapabilities = [
  'Rep → Territory → Account → Injector hierarchy, updated as your reps capture debriefs',
  'Weekly rollup: competitor mentions by brand, sentiment, region',
  'Objection-frequency map — which objection is showing up where, trending up or down',
  'Switch-story library: the narratives your top reps are actually using to move injectors',
  'Account-level memory: every injector preference, unit count, practice-manager dynamic — queryable by any rep on the team',
  'No recording, no transcript storage past 24 hours. Only structured CRM data persists.',
]

const faqItems = [
  {
    q: 'How is this different from Veeva?',
    a: 'Veeva was built for the pharma rep-to-physician detail model — prescription-driven, heavily regulated, call-plan-centric. Aesthetics is a relationship-and-volume model: injector trust, unit counts, practice-manager dynamics, and buying windows around conferences. Veeva doesn’t capture any of that. StreetNotes is purpose-built for it.',
  },
  {
    q: 'Which CRMs do you integrate with?',
    a: 'Salesforce and HubSpot are live today. Others (including Veeva, if your org is on it) on request as part of a pilot scope.',
  },
  {
    q: 'What about recording consent and data security?',
    a: 'StreetNotes is not a call recorder. Reps speak a 60-second debrief into their phone after a visit. Audio is transcribed and discarded; only structured CRM data is persisted. All data is encrypted at rest and in transit. Per-brand tenant isolation is available for pilot deployments.',
  },
  {
    q: 'Who owns the data?',
    a: 'Your brand. Standard DPA and data-portability terms available pre-pilot. Rep-captured data belongs to your organization, not ours.',
  },
  {
    q: 'Why you, why now?',
    a: 'Co-founder Michael Hervis spent years at Symplast, building software for aesthetic practices. He watched brand reps get handed pharma CRMs that didn’t fit the work. StreetNotes is what he wishes had existed then.',
  },
  {
    q: 'What does the contract look like?',
    a: '60-day paid pilot (25 seats). If success metrics are met, expand to annual at $179/seat for 10+ seats. Manager seat free with any multi-rep team. No multi-year lock-in.',
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
              href="#talk-to-michael"
              className="font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold bg-volt text-black rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 cursor-pointer min-h-[44px] flex items-center transition-all duration-200 shadow-glow-volt hover:shadow-glow-volt-lg"
            >
              Talk to Michael
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
              The aesthetic
              <br className="hidden sm:block" />{' '}
              sales team you{' '}
              <span className="text-volt drop-shadow-[0_0_40px_rgba(0,230,118,0.45)]">
                can’t see
              </span>
              .
            </h1>

            <p className="font-body text-lg sm:text-xl md:text-2xl text-white/70 max-w-3xl mb-10 leading-relaxed">
              You have 3,000 reps. Each covers ~47 accounts. Between dial-in
              meetings, you have almost no visibility into what&apos;s actually
              happening in the room — which injectors are shifting, which
              objections are spreading, which competitors are cresting.
              StreetNotes is the field-intelligence layer purpose-built for
              that gap.
            </p>

            <a
              href="#talk-to-michael"
              className="inline-flex items-center gap-2 font-bold text-lg sm:text-xl bg-volt text-black rounded-xl px-8 py-4 sm:px-10 sm:py-5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px] shadow-glow-volt-lg"
            >
              Book a call with Michael
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
              60-day pilot.{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                Michael-led.
              </span>
            </h2>
            <p className="font-body text-lg sm:text-xl text-white/70 mb-10 sm:mb-14 leading-relaxed max-w-3xl">
              Pilot: 25 seats, 9 weeks, success metrics defined with you upfront.
              Expand or walk. No multi-year lock-in.
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
                  25 seats, 60 days. Full functionality, manager seat included.
                </p>
                <ul className="space-y-2 text-white/70 text-sm sm:text-base">
                  <li>· Success metrics defined upfront</li>
                  <li>· Michael-led onboarding</li>
                  <li>· Weekly leadership review</li>
                  <li>· Month-to-month during pilot</li>
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

        {/* Michael, in depth */}
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
              Michael Hervis.{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                Ex-VP, Symplast.
              </span>
            </h2>

            <div className="glass rounded-2xl p-6 sm:p-10 md:p-12 max-w-4xl space-y-5">
              <p className="font-body text-lg sm:text-xl text-white/85 leading-relaxed">
                Michael spent years at Symplast building software used by
                aesthetic practices across the country. He sat with injectors,
                practice managers, and medical directors — watching them try to
                work with tools that weren&apos;t built for their reality.
              </p>
              <p className="font-body text-base sm:text-lg text-white/70 leading-relaxed">
                He watched something else too: the brand reps walking in with
                pharma CRMs, asking the same unit-count questions three visits
                in a row because nothing got remembered between calls. Injectors
                tolerated it. Nobody fixed it.
              </p>
              <p className="font-body text-base sm:text-lg text-white/70 leading-relaxed">
                Co-founder Jeff Meyers brings 20+ years of enterprise SaaS sales
                leadership — the GTM discipline to pair with Michael&apos;s
                domain access. Together they built StreetNotes to be the tool
                the brand side has been missing.
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

        {/* Talk to Michael — form */}
        <section
          id="talk-to-michael"
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
              Book a call.
            </h2>
            <p className="font-body text-base sm:text-lg md:text-xl text-white/70 mb-10 leading-relaxed text-center">
              Tell Michael what you&apos;re working on. He&apos;ll reach out
              directly within two business days.
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
