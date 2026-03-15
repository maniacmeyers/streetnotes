import WaitlistForm from '@/components/waitlist-form'
import ShinyText from '@/components/shiny-text'
import ElectricBorder from '@/components/electric-border'

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-dark text-white overflow-x-hidden">
      {/* ── HEADER NAV ── */}
      <header className="sticky top-0 z-50 bg-dark border-b-4 border-volt/30">
        <nav
          aria-label="Main navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20"
        >
          {/* Logo */}
          <a href="/" className="flex items-center min-h-[44px]" aria-label="StreetNotes.ai home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/streetnotes_logo.png"
              alt="StreetNotes.ai"
              className="h-10 sm:h-14 md:h-16 w-auto"
            />
          </a>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="/debrief"
              className="hidden sm:flex font-mono text-xs uppercase tracking-widest font-bold text-volt border-2 border-volt/40 px-4 py-2 cursor-pointer min-h-[44px] items-center hover:bg-volt/10 transition-colors duration-100"
            >
              Try Free Tool
            </a>
            <a
              href="/debrief"
              className="sm:hidden font-mono text-[10px] uppercase tracking-wider font-bold bg-volt/10 text-volt border border-volt/40 min-h-[44px] flex items-center px-3"
            >
              Free Tool
            </a>
            <a
              href="#waitlist"
              className="header-cta font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold bg-volt text-black border-2 sm:border-4 border-black px-3 py-1.5 sm:px-5 sm:py-2.5 cursor-pointer min-h-[44px] flex items-center transition-transform duration-100"
            >
              Join Beta
            </a>
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* ── HERO SECTION ── */}
        <section className="relative border-b-8 border-black bg-dark" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 lg:py-32">
            {/* Sticker badge */}
            <div className="mb-6 sm:mb-8">
              <span className="sticker -rotate-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
                For reps who&apos;d rather sell than type
              </span>
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="font-display uppercase text-[40px] sm:text-[64px] md:text-[100px] lg:text-[130px] xl:text-[150px] leading-[0.85] text-white mb-6 sm:mb-8"
              style={{
                textShadow: '4px 4px 0px #000000',
              }}
            >
              Stop losing
              <br />
              deals in the
              <br />
              <span className="text-volt">parking lot</span>
            </h1>

            {/* Subheadline */}
            <p className="font-body text-lg sm:text-xl md:text-2xl italic text-gray-300 max-w-2xl mb-8 sm:mb-12">
              StreetNotes turns your voice into CRM data. Finish the meeting. Hit
              record. Your CRM updates itself.
            </p>

            {/* ── PRIMARY CTA: Brain Dump ── */}
            <div className="max-w-lg mb-8 sm:mb-10">
              <div className="bg-volt border-4 border-black neo-shadow p-5 sm:p-6 relative">
                {/* Watermark — clipped independently so ElectricBorder overflow is visible */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                  <div
                    className="absolute -right-4 -bottom-4 font-display text-[100px] sm:text-[140px] text-black select-none leading-none"
                    style={{ opacity: 0.06 }}
                  >
                    MIC
                  </div>
                </div>

                <div className="relative">
                  <span className="inline-block bg-black text-volt font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold px-2.5 py-1 mb-3 sm:mb-4">
                    Free — no signup needed
                  </span>

                  <h2 className="font-display text-[24px] sm:text-[36px] md:text-[44px] uppercase leading-[0.85] text-black mb-2 sm:mb-3">
                    Try it right now
                  </h2>
                  <p className="font-body text-sm sm:text-base text-black/70 mb-4 sm:mb-5 max-w-sm">
                    60 seconds of talking. Structured deal notes, objections, next steps, and a PDF. Free.
                  </p>

                  <ElectricBorder color="#00E676" speed={1} chaos={0.2} borderRadius={0} className="inline-block">
                    <a
                      href="/debrief"
                      className="inline-flex items-center font-display text-base sm:text-xl uppercase bg-black text-volt border-4 border-black px-6 sm:px-8 py-3 sm:py-4 cursor-pointer hover:bg-dark active:bg-dark transition-colors duration-100 min-h-[44px]"
                    >
                      Start a Brain Dump →
                    </a>
                  </ElectricBorder>
                </div>
              </div>
            </div>

            {/* ── SECONDARY CTA: Waitlist ── */}
            <div id="waitlist" className="max-w-lg">
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.1em] text-gray-300 mb-2 sm:mb-3">
                Already sold? Join the beta.
              </p>
              <WaitlistForm />
            </div>
          </div>

          {/* Background watermark */}
          <div
            className="absolute top-1/2 right-0 -translate-y-1/2 font-display text-[400px] text-white pointer-events-none select-none hidden lg:block"
            style={{ opacity: 0.03 }}
            aria-hidden="true"
          >
            REC
          </div>
        </section>

        {/* ── PROBLEM: OLD WAY vs BETTER WAY ── */}
        <section className="border-b-8 border-black" aria-labelledby="problem-heading">
          {/* Section label */}
          <div className="bg-dark px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b-4 border-black">
            <div className="max-w-7xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold">
                The problem
              </span>
              <h2 id="problem-heading" className="font-display text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] uppercase leading-[0.85] text-white mt-2">
                Your CRM is{' '}
                <span className="text-volt">lying to you</span>
              </h2>
            </div>
          </div>

          {/* Comparison rows */}
          <div className="divide-y-4 divide-black">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-black p-5 sm:p-8 lg:p-10 border-b-4 md:border-b-0 md:border-r-4 border-black">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold block mb-3">
                  The old way
                </span>
                <p className="font-display text-[26px] sm:text-[40px] md:text-[52px] lg:text-[60px] uppercase leading-[0.85] text-white/60">
                  8 calls. 6pm. Still typing.
                </p>
                <p className="font-body text-gray-300 mt-3 sm:mt-4 text-base sm:text-lg">
                  You enter the bare minimum. Contact name. &quot;Good call.&quot;
                  Move on.
                </p>
              </div>
              <div className="bg-volt p-5 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-black/60 font-bold block mb-3">
                  The StreetNotes way
                </span>
                <p className="font-display text-[26px] sm:text-[40px] md:text-[52px] lg:text-[60px] uppercase leading-[0.85] text-black">
                  8 calls. Done in 60 seconds.
                </p>
                <p className="font-body text-black/70 mt-3 sm:mt-4 text-base sm:text-lg">
                  Hit record. Talk. Your CRM is updated with rich detail before
                  you start the car.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-black p-5 sm:p-8 lg:p-10 border-b-4 md:border-b-0 md:border-r-4 border-black">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold block mb-3">
                  Monday forecast call
                </span>
                <p className="font-display text-[26px] sm:text-[40px] md:text-[52px] lg:text-[60px] uppercase leading-[0.85] text-white/60">
                  &quot;Uh... let me check&quot;
                </p>
                <p className="font-body text-gray-300 mt-3 sm:mt-4 text-base sm:text-lg">
                  Your pipeline data is garbage because you only entered the
                  minimum.
                </p>
              </div>
              <div className="bg-volt p-5 sm:p-8 lg:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-black/60 font-bold block mb-3">
                  Monday forecast call
                </span>
                <p className="font-display text-[26px] sm:text-[40px] md:text-[52px] lg:text-[60px] uppercase leading-[0.85] text-black">
                  &quot;Pull it up&quot;
                </p>
                <p className="font-body text-black/70 mt-3 sm:mt-4 text-base sm:text-lg">
                  Walk in confident. Every deal, every detail, already in the CRM.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS: PROCESS BLUEPRINT ── */}
        <section className="bg-dark border-b-8 border-black py-12 sm:py-16 md:py-24" aria-labelledby="how-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold">
              How it works
            </span>
            <h2 id="how-heading" className="font-display text-[28px] sm:text-[48px] md:text-[64px] lg:text-[80px] uppercase leading-[0.85] text-white mt-2 mb-10 sm:mb-16">
              Three steps. Sixty seconds.{' '}
              <span className="text-volt">Done.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="relative bg-white border-4 sm:border-8 border-black neo-shadow-white p-5 pt-10 sm:p-8 sm:pt-12">
                <div className="absolute -top-3 sm:-top-4 -left-1 sm:-left-2 rotate-[-2deg]">
                  <span className="bg-volt text-black font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] border-3 sm:border-4 border-black px-2 sm:px-3 py-0.5 sm:py-1">
                    Step 01
                  </span>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center font-display text-[120px] sm:text-[200px] text-black pointer-events-none select-none"
                  style={{ opacity: 0.03 }}
                  aria-hidden="true"
                >
                  1
                </div>
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase text-black mb-3 sm:mb-4 relative">
                  Finish your meeting
                </h3>
                <p className="font-body text-black/70 text-base sm:text-lg relative">
                  Walk to the car. Grab your phone.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white border-4 sm:border-8 border-black neo-shadow-white p-5 pt-10 sm:p-8 sm:pt-12">
                <div className="absolute -top-3 sm:-top-4 -left-1 sm:-left-2 rotate-[2deg]">
                  <span className="bg-volt text-black font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] border-3 sm:border-4 border-black px-2 sm:px-3 py-0.5 sm:py-1">
                    Step 02
                  </span>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center font-display text-[120px] sm:text-[200px] text-black pointer-events-none select-none"
                  style={{ opacity: 0.03 }}
                  aria-hidden="true"
                >
                  2
                </div>
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase text-black mb-3 sm:mb-4 relative">
                  Hit record. Talk.
                </h3>
                <p className="font-body text-black/70 text-base sm:text-lg relative">
                  Tell StreetNotes what happened — in your own words. The AI asks
                  the right follow-up questions. No forms. No typing.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white border-4 sm:border-8 border-black neo-shadow-white p-5 pt-10 sm:p-8 sm:pt-12">
                <div className="absolute -top-3 sm:-top-4 -left-1 sm:-left-2 rotate-[-1deg]">
                  <span className="bg-volt text-black font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] border-3 sm:border-4 border-black px-2 sm:px-3 py-0.5 sm:py-1">
                    Step 03
                  </span>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center font-display text-[120px] sm:text-[200px] text-black pointer-events-none select-none"
                  style={{ opacity: 0.03 }}
                  aria-hidden="true"
                >
                  3
                </div>
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase text-black mb-3 sm:mb-4 relative">
                  Review. Confirm. Done.
                </h3>
                <p className="font-body text-black/70 text-base sm:text-lg relative">
                  StreetNotes populates every CRM field — contact, company, notes,
                  next steps, deal stage — directly inside your CRM. Review the
                  structured data, tap confirm, and it&apos;s live. Fully integrated. No copy-paste.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FREE TOOL CTA ── */}
        <section className="bg-black border-b-8 border-black py-12 sm:py-16 md:py-20" aria-labelledby="free-tool-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-4 border-volt bg-dark p-6 sm:p-10 md:p-14 text-center relative">
                {/* Background watermark */}
                <div
                  className="absolute inset-0 flex items-center justify-center font-display text-[200px] sm:text-[300px] text-volt pointer-events-none select-none"
                  style={{ opacity: 0.03 }}
                  aria-hidden="true"
                >
                  MIC
                </div>

                <div className="relative">
                  <span className="sticker -rotate-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold mb-6 inline-block">
                    Free — no signup required
                  </span>

                  <h2 id="free-tool-heading" className="font-display text-[28px] sm:text-[48px] md:text-[64px] uppercase leading-[0.85] text-white mb-4">
                    Try it <span className="text-volt">right now</span>
                  </h2>

                  <p className="font-body text-base sm:text-lg md:text-xl text-gray-300 max-w-xl mx-auto mb-8">
                    Our Post-Call Brain Dump turns 60 seconds of talking into structured deal
                    notes, a mind map, and a downloadable PDF. No account needed.
                  </p>

                  <div className="inline-block">
                    <ElectricBorder color="#00E676" speed={1} chaos={0.2} borderRadius={0} className="inline-block">
                      <a
                        href="/debrief"
                        className="inline-flex items-center font-display text-lg sm:text-xl uppercase bg-black text-volt border-4 border-black px-8 py-4 cursor-pointer hover:bg-dark active:bg-dark transition-colors duration-100 min-h-[44px]"
                      >
                        Start a Brain Dump →
                      </a>
                    </ElectricBorder>
                  </div>

                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-4">
                    60 seconds. Structured deal notes. Free forever.
                  </p>
                </div>
              </div>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section className="bg-white border-b-8 border-black py-12 sm:py-16 md:py-24" aria-labelledby="benefits-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold">
              What changes
            </span>
            <h2 id="benefits-heading" className="font-display text-[26px] sm:text-[48px] md:text-[64px] lg:text-[80px] uppercase leading-[0.85] text-black mt-2 mb-10 sm:mb-16">
              What would you do with 6-8 hours back{' '}
              <span className="text-volt bg-black px-3 sm:px-4 inline-block mt-1 sm:mt-0">
                every week?
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Benefit 1 */}
              <div className="border-3 sm:border-4 border-black p-5 sm:p-8 neo-shadow-sm bg-white cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none sm:hover:translate-x-1 sm:hover:translate-y-1 sm:hover:shadow-none transition-transform duration-100">
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl uppercase text-black mb-2 sm:mb-3">
                  CRM stays full
                </h3>
                <p className="font-body text-black/70 text-base sm:text-lg">
                  Rich deal data after every call — not the bare minimum you typed
                  at a red light.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="border-3 sm:border-4 border-black p-5 sm:p-8 neo-shadow-sm bg-white cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none sm:hover:translate-x-1 sm:hover:translate-y-1 sm:hover:shadow-none transition-transform duration-100">
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl uppercase text-black mb-2 sm:mb-3">
                  Forecast calls. Confident.
                </h3>
                <p className="font-body text-black/70 text-base sm:text-lg">
                  Your pipeline is accurate because the data actually made it into
                  the CRM.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="border-3 sm:border-4 border-black p-5 sm:p-8 neo-shadow-sm bg-white cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none sm:hover:translate-x-1 sm:hover:translate-y-1 sm:hover:shadow-none transition-transform duration-100">
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl uppercase text-black mb-2 sm:mb-3">
                  Deal mind map
                </h3>
                <p className="font-body text-black/70 text-base sm:text-lg">
                  A living story of every deal that builds with each meeting — so
                  you never lose the thread.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="border-3 sm:border-4 border-black p-5 sm:p-8 neo-shadow-sm bg-white cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none sm:hover:translate-x-1 sm:hover:translate-y-1 sm:hover:shadow-none transition-transform duration-100">
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl uppercase text-black mb-2 sm:mb-3">
                  Works with your stack
                </h3>
                <p className="font-body text-black/70 text-base sm:text-lg">
                  Salesforce. HubSpot. Microsoft Dynamics. Zoho CRM. More coming based on what you tell us.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CREDIBILITY ── */}
        <section className="bg-black border-b-8 border-black py-12 sm:py-16 md:py-24" aria-labelledby="credibility-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold">
              Why us
            </span>
            <h2 id="credibility-heading" className="font-display text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] uppercase leading-[0.85] text-white mt-2 mb-6 sm:mb-8">
              Built by people who&apos;ve actually{' '}
              <span className="text-volt">successfully carried a quota</span>
            </h2>

            <div className="max-w-3xl">
              <p className="font-body text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 sm:mb-6">
                We&apos;re not a SaaS team that read about sales in a blog post.
              </p>
              <p className="font-body text-base sm:text-lg text-gray-400 mb-4 sm:mb-6">
                45 years of combined SMB, mid-market, and enterprise sales and
                sales leadership experience. 28x President&apos;s Clubs. We&apos;ve
                been the rep in the parking lot, typing half-assed notes into the
                CRM before the next meeting.
              </p>
              <p className="font-body text-base sm:text-lg text-gray-400 mb-6 sm:mb-8">
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

              <div className="inline-block">
                <span className="sticker rotate-[2deg] font-mono text-xs sm:text-sm text-black font-bold uppercase tracking-[0.1em]">
                  We fixed that.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="bg-volt border-b-8 border-black py-12 sm:py-16 md:py-24" aria-labelledby="final-cta-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              id="final-cta-heading"
              className="font-display text-[36px] sm:text-[56px] md:text-[80px] lg:text-[100px] uppercase leading-[0.85] text-black mb-4"
              style={{
                textShadow: '3px 3px 0px rgba(0,0,0,0.1)',
              }}
            >
              Voice-to-CRM
            </h2>
            <p className="font-body text-lg sm:text-xl md:text-2xl italic text-black/70 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Because &quot;I&apos;ll enter it later&quot; is how deals die.
            </p>

            {/* Waitlist form */}
            <div className="max-w-lg mx-auto">
              <WaitlistForm variant="light" />
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-dark border-t-4 border-black py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/streetnotes_logo.png"
              alt="StreetNotes.ai"
              className="h-8 sm:h-10 w-auto"
            />
            <ShinyText
              text="— a ForgeTime.ai product"
              color="#4b5563"
              shineColor="#00E676"
              speed={3}
              spread={120}
              className="font-mono text-[10px] uppercase tracking-[0.1em]"
            />
          </div>
          <ShinyText
            text="Built for reps who'd rather sell than type"
            color="#4b5563"
            shineColor="#00E676"
            speed={3}
            spread={120}
            delay={1.5}
            className="font-mono text-[10px] uppercase tracking-[0.1em]"
          />
        </div>
      </footer>
    </div>
  )
}
