import FieldGlowWaitlist from './waitlist-form'
import ShinyText from '@/components/shiny-text'

export default function FinalCta() {
  return (
    <section
      id="apply"
      className="relative overflow-hidden px-6 py-28 sm:px-10 sm:py-36"
      style={{ background: 'var(--fg-ink)' }}
    >
      {/* Subtle warm rake */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 0%, rgba(168, 133, 90, 0.18), transparent 60%), radial-gradient(ellipse 70% 50% at 20% 100%, rgba(212, 162, 138, 0.10), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid gap-16 sm:grid-cols-12 sm:gap-12">
          <div className="sm:col-span-7">
            <span
              className="fg-eyebrow"
              style={{ color: 'var(--fg-paper)' }}
            >
              Apply for pilot access
            </span>

            <h2
              className="fg-display mt-6 text-[clamp(2.6rem,6vw,5rem)] leading-[1] tracking-tight"
              style={{ color: 'var(--fg-paper)' }}
            >
              Build the field memory your team{' '}
              <ShinyText
                text="keeps."
                className="fg-display-italic leading-[1.5]"
                color="#D4A28A"
                shineColor="#F8E7D5"
                speed={2.4}
                delay={3}
              />
            </h2>

            <p
              className="mt-8 max-w-[52ch] text-[1.1rem] leading-[1.7]"
              style={{ color: 'rgba(242, 235, 223, 0.78)' }}
            >
              We are opening Salesforce pilots with medical aesthetic teams
              that want cleaner CRM updates, live competitor intel, and a Story
              Vault that learns from every debrief.
            </p>

            <ul
              className="mt-10 space-y-4 text-[0.98rem] leading-[1.6]"
              style={{ color: 'rgba(242, 235, 223, 0.75)' }}
            >
              {[
                'Start with the free brain dump before a pilot conversation.',
                'Focused on Salesforce workflows for this phase.',
                'Apply with a work email — we respond within two business days.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-4">
                  <span
                    className="fg-display-italic mt-1 text-[0.95rem]"
                    style={{ color: 'var(--fg-blush)' }}
                  >
                    —
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-5">
            <div
              className="border p-8 sm:p-10"
              style={{
                background: 'rgba(242, 235, 223, 0.04)',
                borderColor: 'rgba(212, 199, 178, 0.25)',
              }}
            >
              <p
                className="text-[0.7rem] uppercase tracking-[0.26em]"
                style={{ color: 'var(--fg-blush)' }}
              >
                Request a pilot
              </p>

              <p
                className="fg-display mt-3 text-[1.45rem] leading-[1.25]"
                style={{ color: 'var(--fg-paper)' }}
              >
                Tell us where Salesforce gets thin.
              </p>

              <div className="mt-8">
                <FieldGlowWaitlist
                  buttonLabel="Apply"
                  fineprint="No credit card. We respond within two business days."
                  variant="dark"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t pt-8"
          style={{ borderColor: 'rgba(212, 199, 178, 0.18)' }}
        >
          <p
            className="text-[0.72rem] uppercase tracking-[0.24em]"
            style={{ color: 'rgba(242, 235, 223, 0.5)' }}
          >
            Brain dump in the field · Learn by territory · Push to Salesforce
          </p>
          <p
            className="fg-display-italic text-[1.05rem]"
            style={{
              color: 'var(--fg-blush)',
              fontVariationSettings: "'opsz' 24, 'SOFT' 80",
            }}
          >
            Built for teams that want the field to teach the system.
          </p>
        </div>
      </div>
    </section>
  )
}
