import ShinyText from '@/components/shiny-text'

export default function ParkingLotSection() {
  return (
    <section
      id="reality"
      className="relative px-6 py-28 sm:px-10 sm:py-36"
      style={{ background: 'var(--fg-paper-2)' }}
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-14 sm:grid-cols-12 sm:gap-12">
          {/* Body column */}
          <div className="sm:col-span-7">
            <span className="fg-eyebrow mb-6 block">The problem</span>

            <h2
              className="fg-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05] tracking-tight"
              style={{ color: 'var(--fg-ink)' }}
            >
              The best field signal dies between visits.{' '}
              <ShinyText
                text="Your team never gets to use it."
                className="fg-display-italic leading-[1.5]"
                color="#8B6B40"
                shineColor="#E8C9A0"
                speed={2.6}
                delay={4}
              />
            </h2>

            <p
              className="mt-8 text-[1.1rem] leading-[1.7]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              The provider named a buying window. The practice manager hinted
              at a competitor promo. You found the exact objection blocking the
              next order. You heard a story your whole team should know.
            </p>

            <p
              className="mt-6 text-[1.1rem] leading-[1.7]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              Then the day keeps moving. The Salesforce update gets thinner.
              The competitive signal never reaches the dashboard. The winning
              language stays trapped in one rep&apos;s head.
            </p>
          </div>

          {/* Stat callouts column */}
          <aside
            className="relative sm:col-span-5 sm:border-l sm:pl-10"
            style={{ borderColor: 'var(--fg-line)' }}
          >
            <span
              className="fg-eyebrow mb-8 block"
              style={{ color: 'var(--fg-gilt)' }}
            >
              What disappears
            </span>

            <ul className="space-y-8">
              {[
                {
                  stat: 'CRM',
                  label: 'follow-ups, stage changes, buying windows, and account context',
                },
                {
                  stat: 'Intel',
                  label: 'competitor moves, pricing pressure, promos, and objections',
                },
                {
                  stat: 'Stories',
                  label: 'the words, examples, and pitches that actually landed',
                },
              ].map((s) => (
                <li
                  key={s.label}
                  className="flex items-baseline gap-5 border-b pb-7 last:border-b-0 last:pb-0"
                  style={{ borderColor: 'var(--fg-line)' }}
                >
                  <span
                    className="fg-display shrink-0 text-[2rem] leading-none"
                    style={{
                      color: 'var(--fg-ink)',
                      fontVariationSettings: "'opsz' 24, 'SOFT' 50",
                    }}
                  >
                    {s.stat}
                  </span>
                  <span
                    className="text-[0.95rem] leading-[1.55]"
                    style={{ color: 'var(--fg-ink-2)' }}
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
