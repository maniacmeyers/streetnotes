const benefits = [
  {
    n: '01',
    title: 'Hear the floor while it is still moving.',
    body: 'See what reps are encountering by territory, account, competitor, product, and objection without waiting for the next Monday call.',
  },
  {
    n: '02',
    title: 'Coach from real field language.',
    body: 'Track which Story Vault pitches and objection handlers show up in real debriefs. Coach from what reps actually say.',
  },
  {
    n: '03',
    title: 'Turn the best note into team material.',
    body: 'Take a strong objection handler from a top rep and turn it into a reusable prompt, story, or talk track for the rest of the floor.',
  },
  {
    n: '04',
    title: 'Reduce CRM cleanup without rushing reps.',
    body: 'Reps get the note out of their head in the moment. Salesforce gets a cleaner update after review.',
  },
]

import ShinyText from '@/components/shiny-text'

export default function ForLeaders() {
  return (
    <section
      id="leaders"
      className="relative px-6 py-28 sm:px-10 sm:py-36"
      style={{ background: 'var(--fg-paper-2)' }}
    >
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-20 grid gap-6 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <span className="fg-eyebrow">For sales leaders</span>
          </div>
          <div className="sm:col-span-9">
            <h2
              className="fg-display text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1] tracking-tight"
              style={{ color: 'var(--fg-ink)' }}
            >
              Run the floor from what reps are{' '}
              <ShinyText
                text="hearing now."
                className="fg-display-italic leading-[1.5]"
                color="#8B6B40"
                shineColor="#E8C9A0"
                speed={2.6}
                delay={4}
              />
            </h2>
            <p
              className="mt-6 max-w-[60ch] text-[1.05rem] leading-[1.7]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              Built for aesthetic sales leaders who need more than call notes.
              FieldGlow turns rep debriefs into Salesforce updates, live market
              signal, and a learning library of what works.
            </p>
          </div>
        </header>

        <div
          className="grid gap-px sm:grid-cols-2"
          style={{ background: 'var(--fg-line)' }}
        >
          {benefits.map((b) => (
            <article
              key={b.title}
              className="px-8 py-12 sm:px-12 sm:py-14"
              style={{ background: 'var(--fg-paper-2)' }}
            >
              <span
                className="fg-folio text-[1.8rem]"
                aria-hidden="true"
              >
                {b.n}
              </span>
              <h3
                className="fg-display mt-4 text-[1.5rem] leading-[1.2] sm:text-[1.75rem]"
                style={{ color: 'var(--fg-ink)' }}
              >
                {b.title}
              </h3>
              <p
                className="mt-4 max-w-[44ch] text-[1rem] leading-[1.7]"
                style={{ color: 'var(--fg-ink-2)' }}
              >
                {b.body}
              </p>
            </article>
          ))}
        </div>

        {/* Stat banner */}
        <div
          className="mt-20 grid gap-10 border-t pt-14 sm:grid-cols-3"
          style={{ borderColor: 'var(--fg-line)' }}
        >
          {[
            { stat: 'Salesforce', label: 'updates reps can review and push' },
            { stat: 'Live intel', label: 'competitor signal by account and territory' },
            { stat: 'Story Vault', label: 'field language that improves over time' },
          ].map((s) => (
            <div key={s.label}>
              <p
                className="fg-display text-[clamp(2.6rem,5vw,4rem)] leading-[1]"
                style={{ color: 'var(--fg-ink)' }}
              >
                {s.stat}
              </p>
              <p
                className="mt-3 text-[0.78rem] uppercase tracking-[0.22em]"
                style={{ color: 'var(--fg-mute)' }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
