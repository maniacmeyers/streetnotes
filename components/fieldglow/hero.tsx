import ShinyText from '@/components/shiny-text'

export default function FieldGlowHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="fg-rake" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1320px] px-6 pb-28 pt-24 sm:px-10 sm:pb-36 sm:pt-32 lg:pt-40">
        {/* Eyebrow */}
        <div
          className="fg-reveal mb-12"
          style={{ color: 'var(--fg-ink-2)' }}
        >
          <span className="fg-eyebrow">
            Voice-first field intelligence for aesthetic sales
          </span>
        </div>

        {/* Massive editorial headline */}
        <h1
          className="fg-display fg-reveal max-w-[16ch] text-[clamp(3.4rem,11vw,9.5rem)] leading-[0.92]"
          style={{ animationDelay: '120ms', color: 'var(--fg-ink)' }}
        >
          Brain dump.
          <br />
          {' '}
          <ShinyText
            text="FieldGlow"
            className="fg-display-italic leading-[1.5]"
            color="#8B6B40"
            shineColor="#E8C9A0"
            speed={2.4}
            delay={3}
          />{' '}
          learns.
        </h1>

        {/* Plain-English explainer */}
        <p
          className="fg-reveal mt-10 max-w-[58ch] text-[1.18rem] leading-[1.55] sm:text-[1.32rem]"
          style={{ animationDelay: '220ms', color: 'var(--fg-ink-2)' }}
        >
          After a visit, talk through everything while it is still in your head.
          FieldGlow turns the note into Salesforce-ready updates, live
          competitive intel, and Story Vault material your team can reuse.
        </p>

        {/* Kicker — smarter-it-gets line, animated shine */}
        <div
          className="fg-reveal mt-7 max-w-[40ch]"
          style={{ animationDelay: '320ms' }}
        >
          <ShinyText
            text="The more you use it, the smarter it gets."
            className="fg-display-italic text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.5]"
            color="#8B6B40"
            shineColor="#E8C9A0"
            speed={2.6}
            delay={4}
          />
        </div>

        {/* CTAs */}
        <div
          className="fg-reveal mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6"
          style={{ animationDelay: '420ms' }}
        >
          <a href="/fieldglow/debrief" className="fg-btn-gilt cursor-pointer">
            Try the free brain dump
          </a>
          <a href="#apply" className="fg-btn-primary cursor-pointer">
            Apply for pilot access
          </a>
        </div>
        <p
          className="fg-reveal mt-4 text-[0.78rem] uppercase tracking-[0.22em]"
          style={{ animationDelay: '480ms', color: 'var(--fg-mute)' }}
        >
          No timer. No script. Get it out of your head.
        </p>

        {/* Positioning footnote */}
        <div
          className="fg-reveal mt-16 flex items-center gap-4 border-t pt-6"
          style={{ animationDelay: '520ms', borderColor: 'var(--fg-line)' }}
        >
          <span className="fg-gilt-rule shrink-0" aria-hidden="true" />
          <p
            className="text-[0.78rem] uppercase tracking-[0.22em]"
            style={{ color: 'var(--fg-mute)' }}
          >
            Built for medical aesthetic sales — injectables · lasers · body
            contouring · devices · skincare
          </p>
        </div>
      </div>
    </section>
  )
}
