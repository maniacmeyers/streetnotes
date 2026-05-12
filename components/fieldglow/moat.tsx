const learnings = [
  {
    title: 'Your specific territory.',
    body: 'Provider names, clinic patterns, the difference between your top accounts and your problem ones.',
  },
  {
    title: 'Your top objections.',
    body: 'The price pushback, the safety question, the “we already use Allergan” line. With your best answers attached.',
  },
  {
    title: 'Your competitors’ moves.',
    body: 'Pricing changes, new promos, sales tactics — captured the moment a rep mentions them.',
  },
  {
    title: 'Your winning stories.',
    body: 'The pitches that closed. The objection handlers that landed. The case studies that turned the call.',
  },
]

import ShinyText from '@/components/shiny-text'

export default function MoatSection() {
  return (
    <section id="why" className="relative px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-16 grid gap-6 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <span className="fg-eyebrow">Why it gets smarter</span>
          </div>
          <div className="sm:col-span-9">
            <h2
              className="fg-display text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1] tracking-tight"
              style={{ color: 'var(--fg-ink)' }}
            >
              Every note teaches the next one.{' '}
              <ShinyText
                text="FieldGlow learns"
                className="fg-display-italic leading-[1.5]"
                color="#8B6B40"
                shineColor="#E8C9A0"
                speed={2.6}
                delay={3.5}
              />{' '}
              as your team talks.
            </h2>
            <p
              className="mt-6 max-w-[60ch] text-[1.05rem] leading-[1.7]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              The more your team debriefs, the more Salesforce extraction
              tightens, competitive intel sharpens, and Story Vault compounds.
              Four things FieldGlow learns about your team:
            </p>
          </div>
        </header>

        <ul className="grid gap-px sm:grid-cols-2"
          style={{ background: 'var(--fg-line)' }}
        >
          {learnings.map((l, i) => (
            <li
              key={l.title}
              className="px-8 py-10 sm:px-10 sm:py-12"
              style={{ background: 'var(--fg-paper)' }}
            >
              <div className="flex items-baseline gap-5">
                <span
                  className="fg-folio shrink-0 text-[1.6rem]"
                  aria-hidden="true"
                >
                  0{i + 1}
                </span>
                <h3
                  className="fg-display text-[1.45rem] leading-[1.25]"
                  style={{
                    color: 'var(--fg-ink)',
                    fontVariationSettings: "'opsz' 24, 'SOFT' 30",
                  }}
                >
                  {l.title}
                </h3>
              </div>
              <p
                className="mt-4 pl-[3.5rem] text-[0.98rem] leading-[1.65]"
                style={{ color: 'var(--fg-ink-2)' }}
              >
                {l.body}
              </p>
            </li>
          ))}
        </ul>

        <p
          className="mt-14 max-w-[60ch] text-[1.02rem] leading-[1.7]"
          style={{ color: 'var(--fg-ink-2)' }}
        >
          That&apos;s the part generic voice capture cannot fake. Your field memory
          compounds while one-off transcripts go stale.
        </p>
      </div>
    </section>
  )
}
