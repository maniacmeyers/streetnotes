import {
  Radar,
  MessageSquareQuote,
  FileText,
  Rocket,
  Shield,
  BookOpen,
  Trophy,
  Mic,
  Target,
  Building2,
  Check,
} from 'lucide-react'
import WaitlistForm from '@/components/waitlist-form'
import ShinyText from '@/components/shiny-text'
import Logo from '@/components/brand/logo'
import BetaCounter from '@/components/beta-counter'

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#061222] text-white overflow-x-hidden relative">
      {/* ── AMBIENT BACKGROUND WASH ── */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] pointer-events-none opacity-60 z-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(0,230,118,0.15) 0%, rgba(0,230,118,0.04) 35%, transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed bottom-0 right-0 w-[800px] h-[800px] pointer-events-none opacity-40 z-0"
        style={{
          background:
            'radial-gradient(circle at bottom right, rgba(0,230,118,0.1) 0%, transparent 60%)',
        }}
      />

      {/* ── HEADER NAV ── */}
      <header className="sticky top-0 z-50 border-b border-volt/20 bg-[#061222]/80 backdrop-blur-xl">
        <nav
          aria-label="Main navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20"
        >
          <Logo size="lg" priority />

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/login"
              className="font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold text-white/60 hover:text-white min-h-[44px] flex items-center px-2 sm:px-3 transition-colors duration-150"
            >
              Login
            </a>
            <a
              href="/debrief"
              className="hidden sm:flex glass rounded-xl font-mono text-xs uppercase tracking-widest font-bold text-volt px-4 py-2 cursor-pointer min-h-[44px] items-center hover:border-volt/40 transition-all duration-200"
            >
              Try Free Tool
            </a>
            <a
              href="/debrief"
              className="sm:hidden glass rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold text-volt min-h-[44px] flex items-center px-3"
            >
              Free Tool
            </a>
            <a
              href="#waitlist"
              className="font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold bg-volt text-black rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 cursor-pointer min-h-[44px] flex items-center transition-all duration-200 shadow-glow-volt hover:shadow-glow-volt-lg"
            >
              Join Beta
            </a>
          </div>
        </nav>
      </header>

      <main id="main-content" className="relative z-10">
        {/* ── HERO SECTION ── */}
        <section className="relative" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-28 lg:py-36">
            {/* Eyebrow */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt">
                <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
                For the aesthetic professional
              </span>
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="font-bold text-[44px] sm:text-[80px] md:text-[112px] lg:text-[140px] leading-[0.9] text-white mb-6 sm:mb-8 tracking-tight"
            >
              You cover
              <br className="hidden sm:block" />{' '}
              47 accounts.
              <br className="hidden sm:block" />{' '}
              You remember{' '}
              <span className="text-volt drop-shadow-[0_0_40px_rgba(0,230,118,0.45)]">
                12
              </span>
              .
            </h1>

            {/* Subheadline */}
            <p className="font-body text-lg sm:text-xl md:text-2xl text-white/70 max-w-2xl mb-10 sm:mb-14 leading-relaxed">
              Your territory has more accounts than anyone can hold in their
              head. StreetNotes turns 60 seconds of voice — after every visit
              — into CRM data. Nothing drops.
            </p>

            {/* ── PRIMARY CTA: Free Tool Glass Card ── */}
            <div className="max-w-xl mb-10 sm:mb-12">
              <div className="glass-volt rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute -right-6 -bottom-8 font-bold text-[140px] sm:text-[180px] leading-none text-volt/5 pointer-events-none select-none">
                  MIC
                </div>

                <div className="relative">
                  <span className="inline-block glass-inset rounded-lg text-volt font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold px-3 py-1.5 mb-4">
                    Free — no signup required
                  </span>

                  <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-3 leading-tight">
                    See it work in{' '}
                    <span className="text-volt">60 seconds</span>
                  </h2>
                  <p className="font-body text-sm sm:text-base text-white/70 mb-6 max-w-md leading-relaxed">
                    Talk for one minute after your next call. Get back your CRM
                    fields, your follow-ups, and the prep for your next stop.
                    Free. No signup.
                  </p>

                  <a
                    href="/debrief"
                    className="inline-flex items-center gap-2 font-bold text-base sm:text-lg bg-volt text-black rounded-xl px-7 py-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px] shadow-glow-volt-lg"
                  >
                    Try it free
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ── SECONDARY: Waitlist ── */}
            <div id="waitlist" className="max-w-xl">
              <BetaCounter className="mb-4" />
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.15em] text-white/50 mb-3">
                Building with aesthetic pros before GA. Join the beta.
              </p>
              <WaitlistForm />
            </div>
          </div>
        </section>

        {/* ── PROBLEM: OLD WAY vs BETTER WAY ── */}
        <section className="border-t border-volt/10 py-16 sm:py-24" aria-labelledby="problem-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              The problem
            </span>
            <h2
              id="problem-heading"
              className="font-bold text-[32px] sm:text-[56px] md:text-[72px] lg:text-[88px] leading-[0.9] text-white mt-3 mb-12 sm:mb-16 tracking-tight"
            >
              Your CRM was built for{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                someone else&apos;s job
              </span>
            </h2>

            {/* Comparison rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Row 1: Old */}
              <div className="glass rounded-2xl p-6 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400/80 font-bold block mb-3">
                  Before StreetNotes
                </span>
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white/50 mb-4">
                  Your best notes live in your head.
                </p>
                <p className="font-body text-white/60 text-base sm:text-lg leading-relaxed">
                  You remember the Daxxify question Dr. Smith asked on Tuesday
                  — until Thursday, when you&apos;re in the next parking lot and
                  three visits have stacked on top of it.
                </p>
              </div>
              {/* Row 1: New */}
              <div className="glass-volt rounded-2xl p-6 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt font-bold block mb-3">
                  With StreetNotes
                </span>
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white mb-4">
                  Your notes write themselves.
                </p>
                <p className="font-body text-white/70 text-base sm:text-lg leading-relaxed">
                  Talk for 60 seconds in the car. Unit counts, injector
                  preferences, the real gatekeeper, the objection you owe an
                  answer to — all in your CRM before you hit the highway.
                </p>
              </div>

              {/* Row 2: Old */}
              <div className="glass rounded-2xl p-6 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400/80 font-bold block mb-3">
                  Before StreetNotes
                </span>
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white/50 mb-4">
                  &quot;Tox user.&quot; That&apos;s all the CRM knows.
                </p>
                <p className="font-body text-white/60 text-base sm:text-lg leading-relaxed">
                  So you send a generic follow-up. The same objection gets
                  raised at the next three accounts. You never see the pattern.
                </p>
              </div>
              {/* Row 2: New */}
              <div className="glass-volt rounded-2xl p-6 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt font-bold block mb-3">
                  With StreetNotes
                </span>
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white mb-4">
                  Walk in with the answer ready.
                </p>
                <p className="font-body text-white/70 text-base sm:text-lg leading-relaxed">
                  Every objection, every preference, every switch story from
                  your whole territory — in your pre-visit brief. You stop
                  repeating the same conversation three times a week.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="border-t border-volt/10 py-16 sm:py-24" aria-labelledby="how-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              How it works
            </span>
            <h2
              id="how-heading"
              className="font-bold text-[32px] sm:text-[56px] md:text-[72px] lg:text-[88px] leading-[0.9] text-white mt-3 mb-12 sm:mb-16 tracking-tight"
            >
              Three steps. Sixty seconds.{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                Done.
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {[
                {
                  step: '01',
                  title: 'Finish the visit',
                  body: 'Walk to the car. Pull out your phone.',
                },
                {
                  step: '02',
                  title: 'Talk for 60 seconds',
                  body: 'Say what happened in your own words. Units, objections, next steps, who really runs the practice. No forms. No typing.',
                },
                {
                  step: '03',
                  title: 'Review, then push',
                  body: 'Your CRM fields and follow-ups are ready. Confirm and send to Salesforce or HubSpot. Drive to the next stop.',
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden"
                >
                  {/* Giant step number watermark */}
                  <div
                    aria-hidden="true"
                    className="absolute -right-4 -top-8 font-bold text-[160px] sm:text-[200px] leading-none text-white/[0.03] pointer-events-none select-none"
                  >
                    {s.step.replace('0', '')}
                  </div>
                  <div className="relative">
                    <span className="inline-block glass-inset rounded-lg text-volt font-mono text-[10px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 mb-4">
                      Step {s.step}
                    </span>
                    <h3 className="font-bold text-xl sm:text-2xl md:text-3xl text-white mb-3 leading-tight">
                      {s.title}
                    </h3>
                    <p className="font-body text-white/60 text-sm sm:text-base leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPETITIVE INTELLIGENCE ── */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="ci-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Copy */}
              <div>
                <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt mb-5">
                  <Radar className="w-3 h-3" />
                  Competitive Intel
                </span>
                <h2
                  id="ci-heading"
                  className="font-bold text-[32px] sm:text-[48px] md:text-[64px] leading-[0.9] text-white mb-5 tracking-tight"
                >
                  Know what every competitor is{' '}
                  <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                    saying
                  </span>
                  .
                </h2>
                <p className="font-body text-lg sm:text-xl text-white/70 mb-6 leading-relaxed">
                  Every time an injector mentions another brand, StreetNotes
                  catches it. Sentiment, pricing signals, objection patterns —
                  across your whole team, your whole territory, all the time.
                  You stop learning about competitive moves a quarter late.
                </p>
                <ul className="space-y-3">
                  {[
                    'Injector quotes pulled from real calls, sentiment-tagged',
                    'Brand-mention trends across your territory, week over week',
                    'A weekly brief showing what’s cresting, what’s fading',
                    'Alerts when a new objection pattern shows up',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-volt mt-2.5 flex-shrink-0"
                        style={{ boxShadow: '0 0 8px rgba(0, 230, 118, 0.8)' }}
                        aria-hidden="true"
                      />
                      <span className="font-body text-base sm:text-lg text-white/80">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual preview — stacked glass cards */}
              <div className="relative min-h-[440px]">
                {/* Background glow */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-60"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(0,230,118,0.15) 0%, transparent 60%)',
                  }}
                />

                {/* Competitor bars card */}
                <div
                  className="relative glass rounded-2xl p-5 max-w-md ml-auto"
                  style={{ transform: 'rotate(-1deg)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt/80">
                      Tracked
                    </span>
                    <span className="font-mono text-[10px] text-white/40">Last 30d</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Daxxify', count: 18, pct: 100, pos: 60, neg: 25 },
                      { name: 'Dysport', count: 11, pct: 61, pos: 45, neg: 35 },
                      { name: 'Xeomin', count: 7, pct: 38, pos: 70, neg: 15 },
                      { name: 'Jeuveau', count: 4, pct: 22, pos: 50, neg: 30 },
                    ].map((c) => (
                      <div key={c.name} className="flex items-center gap-3">
                        <span className="font-bold text-xs text-white w-20 truncate">
                          {c.name}
                        </span>
                        <div className="flex-1">
                          <div
                            className="h-5 rounded-md overflow-hidden flex border border-white/10"
                            style={{
                              width: `${c.pct}%`,
                              minWidth: 20,
                              background: 'rgba(255,255,255,0.04)',
                            }}
                          >
                            <div
                              className="h-full"
                              style={{
                                width: `${c.pos}%`,
                                background: '#00E676',
                                boxShadow: '0 0 10px rgba(0, 230, 118, 0.6)',
                              }}
                            />
                            <div
                              className="h-full"
                              style={{
                                width: `${c.neg}%`,
                                background: '#f87171',
                              }}
                            />
                            <div
                              className="h-full"
                              style={{
                                width: `${100 - c.pos - c.neg}%`,
                                background: '#9ca3af',
                              }}
                            />
                          </div>
                        </div>
                        <span className="font-bold text-sm text-white w-6 text-right tabular-nums">
                          {c.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote card */}
                <div
                  className="relative glass rounded-2xl p-5 max-w-sm mt-4 mr-auto"
                  style={{ transform: 'rotate(1deg)' }}
                >
                  <div className="flex items-start gap-2.5">
                    <MessageSquareQuote className="w-4 h-4 text-volt flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm text-white/85 italic leading-relaxed mb-3">
                        &ldquo;Dr. Patel said her patients kept asking about Daxxify
                        duration — she wants trial vials before Aesthetic Next.&rdquo;
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block glass-inset rounded-md px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] font-bold text-volt">
                          Daxxify
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: '#00E676',
                            boxShadow: '0 0 6px rgba(0, 230, 118, 0.6)',
                          }}
                        />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                          Patel Aesthetics
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brief card */}
                <div
                  className="relative glass-volt rounded-2xl p-4 max-w-[260px] mt-4 ml-8"
                  style={{ transform: 'rotate(-1.5deg)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg glass-inset flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-volt" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold text-volt/80">
                        Weekly Brief
                      </p>
                      <p className="font-bold text-xs text-white truncate">
                        Daxxify wave cresting
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STORY VAULT ── */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="story-vault-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Visual preview — first on desktop */}
              <div className="relative min-h-[460px] order-2 lg:order-1">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-60"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(0,230,118,0.12) 0%, transparent 60%)',
                  }}
                />

                {/* Gamification header card */}
                <div
                  className="relative glass rounded-2xl p-4 max-w-md mx-auto"
                  style={{ transform: 'rotate(0.5deg)' }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          'radial-gradient(circle at 30% 30%, rgba(0, 255, 140, 0.35) 0%, rgba(10, 20, 15, 0.95) 60%, #000 100%)',
                        border: '1.5px solid rgba(0, 230, 118, 0.5)',
                        boxShadow:
                          'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(0, 230, 118, 0.3)',
                      }}
                    >
                      <span className="font-bold text-2xl text-volt drop-shadow-[0_0_6px_rgba(0,230,118,0.6)]">
                        7
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">Lv.7 Closer</span>
                        <span className="font-mono text-[10px] font-bold text-volt tabular-nums">
                          3,450 XP
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: '68%',
                            background: 'linear-gradient(90deg, #00E676 0%, #7dff9f 100%)',
                            boxShadow: '0 0 8px rgba(0, 230, 118, 0.6)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Challenge card */}
                <div
                  className="relative glass-volt rounded-2xl p-3.5 max-w-sm mx-auto mt-3"
                  style={{ transform: 'rotate(-0.5deg)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl glass-inset flex items-center justify-center flex-shrink-0">
                      <Target size={16} className="text-volt" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt">
                        Daily Drill
                      </p>
                      <p className="font-body text-sm text-white truncate">
                        Daxxify duration objection — under 45s
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vault entry card */}
                <div
                  className="relative glass rounded-2xl p-5 max-w-md mx-auto mt-4"
                  style={{ transform: 'rotate(0.75deg)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-block glass-inset rounded-md px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] font-bold text-volt">
                          Customer Story
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] font-bold text-volt">
                          <Trophy size={9} />
                          Personal Best
                        </span>
                      </div>
                      <p className="font-bold text-base text-white leading-tight">
                        Chen — Botox to Daxxify v3
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-white/40 mt-1.5">
                        Mar 28, 2026
                      </p>
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span
                        className="font-bold text-4xl text-volt leading-none tabular-nums"
                        style={{ textShadow: '0 0 16px rgba(0, 230, 118, 0.5)' }}
                      >
                        9.2
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] font-bold text-white/40 mt-1">
                        score
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div className="order-1 lg:order-2">
                <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt mb-5">
                  <BookOpen className="w-3 h-3" />
                  Story Vault
                </span>
                <h2
                  id="story-vault-heading"
                  className="font-bold text-[32px] sm:text-[48px] md:text-[64px] leading-[0.9] text-white mb-5 tracking-tight"
                >
                  Practice before you&apos;re{' '}
                  <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                    live
                  </span>
                  .
                </h2>
                <p className="font-body text-lg sm:text-xl text-white/70 mb-6 leading-relaxed">
                  Every rep knows what they should&apos;ve said — on the drive
                  home. StreetNotes gives you a place to rehearse the three
                  things that actually win deals: your pitch, your objection
                  comebacks, and your customer stories. Talk them out. Get
                  scored. Walk in ready.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  {[
                    { Icon: Rocket, label: 'Your pitch', body: 'The 30-second open that decides whether the rest of the meeting matters. Rehearse it until it sounds natural.' },
                    { Icon: Shield, label: 'Objection handling', body: '“Too expensive.” “Patients don’t ask for it.” Drill the comebacks until they’re instinct, not improv.' },
                    { Icon: BookOpen, label: 'Customer stories', body: 'Real wins from the field, turned into short stories you can tell in any injector’s office.' },
                    { Icon: Mic, label: 'Practice mode', body: 'Talk into your phone. Get scored on clarity, timing, and structure. Try again. Nail it before it counts.' },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="glass rounded-xl p-3.5 flex items-start gap-3"
                    >
                      <div
                        className="w-9 h-9 rounded-lg glass-inset flex items-center justify-center flex-shrink-0"
                        style={{
                          boxShadow:
                            'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 12px rgba(0,230,118,0.12)',
                        }}
                      >
                        <f.Icon className="w-4 h-4 text-volt" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white leading-tight">
                          {f.label}
                        </p>
                        <p className="font-body text-xs text-white/55 mt-0.5 leading-relaxed">
                          {f.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FREE TOOL CTA ── */}
        <section className="border-t border-volt/10 py-16 sm:py-24" aria-labelledby="free-tool-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-volt rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden">
              {/* Giant watermark */}
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center font-bold text-[220px] sm:text-[320px] text-volt/[0.04] pointer-events-none select-none leading-none"
              >
                MIC
              </div>

              <div className="relative">
                <span className="inline-flex items-center gap-2 glass-inset rounded-full px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
                  Free — no signup required
                </span>

                <h2
                  id="free-tool-heading"
                  className="font-bold text-[32px] sm:text-[56px] md:text-[72px] text-white mb-5 leading-[0.9] tracking-tight"
                >
                  Try it after your{' '}
                  <span className="text-volt drop-shadow-[0_0_30px_rgba(0,230,118,0.45)]">
                    next call
                  </span>
                </h2>

                <p className="font-body text-base sm:text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
                  Talk for 60 seconds. Get your CRM fields, your follow-ups,
                  and the prep for your next stop. No account. No download. No
                  reason not to.
                </p>

                <a
                  href="/debrief"
                  className="inline-flex items-center gap-2 font-bold text-lg sm:text-xl bg-volt text-black rounded-xl px-8 py-4 sm:px-10 sm:py-5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px] shadow-glow-volt-lg"
                >
                  Try it free
                  <span aria-hidden="true">→</span>
                </a>

                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 mt-5">
                  60 seconds. Structured CRM fields. Free forever.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section className="border-t border-volt/10 py-16 sm:py-24" aria-labelledby="benefits-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              What changes
            </span>
            <h2
              id="benefits-heading"
              className="font-bold text-[30px] sm:text-[56px] md:text-[72px] lg:text-[88px] leading-[0.9] text-white mt-3 mb-12 sm:mb-16 tracking-tight"
            >
              What changes when nothing{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                drops.
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {[
                {
                  title: 'You remember every injector',
                  body: 'Preferences, patient volume, objection history — on every account. You walk in like you were just there yesterday.',
                },
                {
                  title: 'You prep in 30 seconds, not 20 minutes',
                  body: 'Your pre-visit brief pulls from every conversation on your territory. The right objection, answered, ready to go.',
                },
                {
                  title: 'You see competitive moves early',
                  body: 'Every brand mention from every rep on your team shows up as territory intelligence — not six months later in a sales-kickoff slide.',
                },
                {
                  title: 'Your CRM is accurate for once',
                  body: 'Voice in, fields out. No Friday-night CRM catch-up. No forecast calls where you wing it. Pipeline data that actually matches the deals.',
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="glass rounded-2xl p-6 sm:p-8 hover:border-volt/30 hover:shadow-glow-volt transition-all duration-300 cursor-default"
                >
                  <h3 className="font-bold text-xl sm:text-2xl md:text-3xl text-white mb-3 leading-tight">
                    {b.title}
                  </h3>
                  <p className="font-body text-white/60 text-base sm:text-lg leading-relaxed">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRAND LEADER MODULE ── */}
        <section
          className="border-t border-volt/10 py-16 sm:py-24"
          aria-labelledby="brand-leader-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-3xl p-8 sm:p-12 md:p-16 max-w-4xl mx-auto relative overflow-hidden">
              {/* Background wash */}
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 w-72 h-72 pointer-events-none opacity-50"
                style={{
                  background:
                    'radial-gradient(circle, rgba(0,230,118,0.12) 0%, transparent 60%)',
                }}
              />

              <div className="relative">
                <span className="inline-flex items-center gap-2 glass-inset rounded-full px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt mb-6">
                  <Building2 className="w-3 h-3" />
                  For VPs of Sales at brands
                </span>

                <h2
                  id="brand-leader-heading"
                  className="font-bold text-[28px] sm:text-[44px] md:text-[56px] leading-[0.95] text-white mb-6 tracking-tight"
                >
                  Running sales at an aesthetic brand?{' '}
                  <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                    Your reps have a tool now.
                  </span>
                </h2>

                <p className="font-body text-base sm:text-lg md:text-xl text-white/70 mb-8 leading-relaxed max-w-2xl">
                  Veeva was built for pharma. Your horizontal CRM was built for
                  nobody. Aesthetic practice software was built for the practice.
                  StreetNotes is the first tool built for the rep — and the
                  visibility layer you&apos;ve been missing.
                </p>

                <a
                  href="/for-leaders"
                  className="inline-flex items-center gap-2 font-bold text-base sm:text-lg bg-volt text-black rounded-xl px-7 py-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px] shadow-glow-volt-lg"
                >
                  Request a pilot
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── CREDIBILITY ── */}
        <section className="border-t border-volt/10 py-16 sm:py-24" aria-labelledby="credibility-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold">
              Why us
            </span>
            <h2
              id="credibility-heading"
              className="font-bold text-[28px] sm:text-[52px] md:text-[68px] lg:text-[84px] leading-[0.9] text-white mt-3 mb-8 sm:mb-12 tracking-tight"
            >
              Built by people{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                from inside the industry
              </span>
            </h2>

            {/* Founder card */}
            <div className="glass rounded-2xl p-6 sm:p-10 md:p-12 max-w-3xl mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 font-bold mb-3">
                Our co-founder
              </p>
              <p className="font-body text-lg sm:text-xl md:text-2xl text-white/85 mb-5 leading-relaxed">
                <ShinyText
                  text="Spent years inside aesthetic software —"
                  color="#e5e7eb"
                  shineColor="#00E676"
                  speed={3}
                  spread={120}
                  className="font-body text-lg sm:text-xl md:text-2xl"
                />{' '}
                building the tools your accounts actually use every day.
              </p>
              <p className="font-body text-base sm:text-lg text-white/60 leading-relaxed">
                He watched brand reps walk in with pharma CRMs that couldn&apos;t
                handle aesthetic reality: unit counts, injector preferences,
                practice-manager dynamics. He watched injectors get asked for
                the same unit ranges three visits in a row because nothing got
                remembered in between. StreetNotes is what he wishes he&apos;d
                had then.
              </p>
            </div>

            {/* Insider-language proof grid */}
            <div>
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt/80 font-bold mb-5">
                StreetNotes knows…
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {[
                  '40 units vs 100 units is a different patient conversation',
                  'Daxxify duration objection ≠ Xeomin objection',
                  '“Filler fatigue” is a real buying signal',
                  'Practice manager ≠ MA ≠ injector — different asks, different timing',
                  'RHA, Restylane, Juvéderm, Versa are not the same conversation',
                  'Aesthetic Next, AMWC, Vegas Cosmetic — buying windows, not just conferences',
                ].map((fact) => (
                  <div
                    key={fact}
                    className="glass rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg glass-inset flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-volt" />
                    </div>
                    <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed">
                      {fact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="border-t border-volt/10 py-16 sm:py-28 relative" aria-labelledby="final-cta-heading">
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(0,230,118,0.18) 0%, transparent 60%)',
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2
              id="final-cta-heading"
              className="font-bold text-[40px] sm:text-[80px] md:text-[112px] lg:text-[140px] leading-[0.9] text-white mb-6 tracking-tight"
            >
              Nothing{' '}
              <span className="text-volt drop-shadow-[0_0_40px_rgba(0,230,118,0.45)]">
                drops.
              </span>
            </h2>
            <p className="font-body text-lg sm:text-xl md:text-2xl text-white/60 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Every conversation. Every preference. Every objection. All in.
            </p>

            <div className="mb-10 flex justify-center">
              <BetaCounter />
            </div>

            {/* Dual CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto text-left">
              {/* Rep track */}
              <div className="glass rounded-2xl p-6 sm:p-8">
                <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt font-bold mb-4">
                  For the field
                </p>
                <p className="font-bold text-xl sm:text-2xl text-white mb-5 leading-tight">
                  Join the beta.
                </p>
                <WaitlistForm />
              </div>

              {/* Brand leader track */}
              <div className="glass-volt rounded-2xl p-6 sm:p-8 flex flex-col">
                <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt font-bold mb-4">
                  For sales leaders
                </p>
                <p className="font-bold text-xl sm:text-2xl text-white mb-5 leading-tight">
                  Request a pilot.
                </p>
                <p className="font-body text-sm sm:text-base text-white/70 mb-6 leading-relaxed flex-1">
                  Purpose-built for aesthetic sales teams, deployed at 150–200
                  seats.
                </p>
                <a
                  href="/for-leaders"
                  className="inline-flex items-center gap-2 font-bold text-base sm:text-lg bg-volt text-black rounded-xl px-6 py-3.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px] shadow-glow-volt self-start"
                >
                  Request a pilot
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-volt/10 py-8 sm:py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" href={null} />
            <ShinyText
              text="— a ForgeTime.ai product"
              color="#4b5563"
              shineColor="#00E676"
              speed={3}
              spread={120}
              className="font-mono text-[10px] uppercase tracking-[0.15em]"
            />
          </div>
          <ShinyText
            text="Built for aesthetic reps who carry the bag"
            color="#4b5563"
            shineColor="#00E676"
            speed={3}
            spread={120}
            delay={1.5}
            className="font-mono text-[10px] uppercase tracking-[0.15em]"
          />
        </div>
      </footer>
    </div>
  )
}
