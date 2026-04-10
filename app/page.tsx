import WaitlistForm from '@/components/waitlist-form'
import ShinyText from '@/components/shiny-text'
import Logo from '@/components/brand/logo'

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
                For reps who&apos;d rather sell than type
              </span>
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="font-bold text-[44px] sm:text-[80px] md:text-[112px] lg:text-[140px] leading-[0.9] text-white mb-6 sm:mb-8 tracking-tight"
            >
              Stop losing
              <br className="hidden sm:block" />{' '}
              deals in the
              <br className="hidden sm:block" />{' '}
              <span className="text-volt drop-shadow-[0_0_40px_rgba(0,230,118,0.45)]">
                parking lot
              </span>
            </h1>

            {/* Subheadline */}
            <p className="font-body text-lg sm:text-xl md:text-2xl text-white/70 max-w-2xl mb-10 sm:mb-14 leading-relaxed">
              StreetNotes turns your voice into CRM data. Finish the meeting. Hit
              record. Your CRM updates itself.
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
                    Try it <span className="text-volt">right now</span>
                  </h2>
                  <p className="font-body text-sm sm:text-base text-white/70 mb-6 max-w-md leading-relaxed">
                    60 seconds of talking. Structured deal notes, objections, next
                    steps, and a PDF. Free.
                  </p>

                  <a
                    href="/debrief"
                    className="inline-flex items-center gap-2 font-bold text-base sm:text-lg bg-volt text-black rounded-xl px-7 py-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px] shadow-glow-volt-lg"
                  >
                    Start a Brain Dump
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ── SECONDARY: Waitlist ── */}
            <div id="waitlist" className="max-w-xl">
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.15em] text-white/50 mb-3">
                Already sold? Join the beta.
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
              Your CRM is{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                lying to you
              </span>
            </h2>

            {/* Comparison rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Row 1: Old */}
              <div className="glass rounded-2xl p-6 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400/80 font-bold block mb-3">
                  The old way
                </span>
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white/50 mb-4">
                  8 calls. 6pm. Still typing.
                </p>
                <p className="font-body text-white/60 text-base sm:text-lg leading-relaxed">
                  You enter the bare minimum. Contact name. &quot;Good call.&quot;
                  Move on.
                </p>
              </div>
              {/* Row 1: New */}
              <div className="glass-volt rounded-2xl p-6 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt font-bold block mb-3">
                  The StreetNotes way
                </span>
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white mb-4">
                  8 calls. Done in 60 seconds.
                </p>
                <p className="font-body text-white/70 text-base sm:text-lg leading-relaxed">
                  Hit record. Talk. Your CRM is updated with rich detail before you
                  start the car.
                </p>
              </div>

              {/* Row 2: Old */}
              <div className="glass rounded-2xl p-6 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400/80 font-bold block mb-3">
                  Monday forecast call
                </span>
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white/50 mb-4">
                  &quot;Uh... let me check&quot;
                </p>
                <p className="font-body text-white/60 text-base sm:text-lg leading-relaxed">
                  Your pipeline data is garbage because you only entered the
                  minimum.
                </p>
              </div>
              {/* Row 2: New */}
              <div className="glass-volt rounded-2xl p-6 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt font-bold block mb-3">
                  Monday forecast call
                </span>
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white mb-4">
                  &quot;Pull it up&quot;
                </p>
                <p className="font-body text-white/70 text-base sm:text-lg leading-relaxed">
                  Walk in confident. Every deal, every detail, already in the CRM.
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
                  title: 'Finish your meeting',
                  body: 'Walk to the car. Grab your phone.',
                },
                {
                  step: '02',
                  title: 'Hit record. Talk.',
                  body: 'Tell StreetNotes what happened — in your own words. The AI asks the right follow-up questions. No forms. No typing.',
                },
                {
                  step: '03',
                  title: 'Review. Confirm. Done.',
                  body: 'StreetNotes populates every CRM field — contact, company, notes, next steps, deal stage — directly inside your CRM. Review the structured data, tap confirm, and it\'s live.',
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
                  Try it{' '}
                  <span className="text-volt drop-shadow-[0_0_30px_rgba(0,230,118,0.45)]">
                    right now
                  </span>
                </h2>

                <p className="font-body text-base sm:text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
                  Our Post-Call Brain Dump turns 60 seconds of talking into structured
                  deal notes, a mind map, and a downloadable PDF. No account needed.
                </p>

                <a
                  href="/debrief"
                  className="inline-flex items-center gap-2 font-bold text-lg sm:text-xl bg-volt text-black rounded-xl px-8 py-4 sm:px-10 sm:py-5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px] shadow-glow-volt-lg"
                >
                  Start a Brain Dump
                  <span aria-hidden="true">→</span>
                </a>

                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 mt-5">
                  60 seconds. Structured deal notes. Free forever.
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
              What would you do with 6-8 hours back{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                every week?
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {[
                {
                  title: 'CRM stays full',
                  body: 'Rich deal data after every call — not the bare minimum you typed at a red light.',
                },
                {
                  title: 'Forecast calls. Confident.',
                  body: 'Your pipeline is accurate because the data actually made it into the CRM.',
                },
                {
                  title: 'Deal mind map',
                  body: 'A living story of every deal that builds with each meeting — so you never lose the thread.',
                },
                {
                  title: 'Works with your stack',
                  body: 'Salesforce. HubSpot. Microsoft Dynamics. Zoho CRM. More coming based on what you tell us.',
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
              Built by people who&apos;ve actually{' '}
              <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
                successfully carried a quota
              </span>
            </h2>

            <div className="glass rounded-2xl p-6 sm:p-10 md:p-12 max-w-3xl">
              <p className="font-body text-lg sm:text-xl md:text-2xl text-white/80 mb-5 leading-relaxed">
                We&apos;re not a SaaS team that read about sales in a blog post.
              </p>
              <p className="font-body text-base sm:text-lg text-white/60 mb-5 leading-relaxed">
                45 years of combined SMB, mid-market, and enterprise sales and
                sales leadership experience. 28x President&apos;s Clubs. We&apos;ve
                been the rep in the parking lot, typing half-assed notes into the
                CRM before the next meeting.
              </p>
              <p className="font-body text-base sm:text-lg text-white/60 mb-8 leading-relaxed">
                <ShinyText
                  text="We built StreetNotes because no one else did."
                  color="#9ca3af"
                  shineColor="#00E676"
                  speed={3}
                  spread={120}
                  className="font-body text-base sm:text-lg"
                />{' '}
                Gong records your calls. Fireflies takes notes. But at the end of
                the day, you&apos;re still the one updating the CRM.
              </p>

              <span className="inline-block glass-inset rounded-lg font-mono text-xs sm:text-sm text-volt font-bold uppercase tracking-[0.15em] px-4 py-2">
                We fixed that.
              </span>
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
              Voice<span className="text-volt">-to-</span>CRM
            </h2>
            <p className="font-body text-lg sm:text-xl md:text-2xl text-white/60 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Because &quot;I&apos;ll enter it later&quot; is how deals die.
            </p>

            {/* Waitlist form */}
            <div className="max-w-xl mx-auto">
              <WaitlistForm />
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
            text="Built for reps who'd rather sell than type"
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
