type Feature = {
  number: string
  name: string
  title: string
  body: string
  detail: string
}

const features: Feature[] = [
  {
    number: '01',
    name: 'Voice → Salesforce',
    title: 'Salesforce gets the full field note.',
    body: 'Brain dump like you would to a teammate. FieldGlow pulls out the account context, opportunity movement, follow-ups, products, objections, and next steps. You review on screen before anything gets pushed.',
    detail: 'Focused on Salesforce for this pilot.',
  },
  {
    number: '02',
    name: 'Live competitor intel',
    title: 'See competitor moves while they are still fresh.',
    body: 'Every time a rep mentions a competitor, price, promo, objection, or tactic, FieldGlow tags the signal and rolls it into a live view. Leaders see what the floor is hearing before the next pipeline review.',
    detail: 'This is where generic voice-to-CRM stops short.',
  },
  {
    number: '03',
    name: 'Story Vault',
    title: 'Your best field language becomes reusable.',
    body: 'The objection handler that worked, the comparison that landed, the clinical trust story that changed the room — FieldGlow saves it, scores it, and turns the strongest versions into team templates.',
    detail: 'A living library for aesthetic sales teams.',
  },
  {
    number: '04',
    name: 'Self-learning memory',
    title: 'Every debrief teaches the next one.',
    body: 'FieldGlow learns your territory, provider names, product shorthand, competitor patterns, and winning stories. The more your team talks, the sharper the Salesforce output and team knowledge become.',
    detail: 'Built to compound call by call.',
  },
]

import ShinyText from '@/components/shiny-text'

export default function FeaturesSection() {
  return (
    <section
      id="what"
      className="relative px-6 py-28 sm:px-10 sm:py-36"
      style={{ background: 'var(--fg-paper-2)' }}
    >
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-20 grid gap-6 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <span className="fg-eyebrow">What it does</span>
          </div>
          <div className="sm:col-span-9">
            <h2
              className="fg-display text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1] tracking-tight"
              style={{ color: 'var(--fg-ink)' }}
            >
              More than voice-to-CRM.{' '}
              <ShinyText
                text="A learning field system."
                className="fg-display-italic leading-[1.5]"
                color="#8B6B40"
                shineColor="#E8C9A0"
                speed={2.4}
                delay={3.5}
              />
            </h2>
          </div>
        </header>

        <div
          className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4"
          style={{ background: 'var(--fg-line)' }}
        >
          {features.map((f) => (
            <article
              key={f.name}
              className="flex flex-col px-2 py-12 sm:px-8 sm:py-10"
              style={{ background: 'var(--fg-paper-2)' }}
            >
              <span
                className="fg-folio text-[2.2rem]"
                aria-hidden="true"
              >
                {f.number}
              </span>

              <p
                className="mt-3 text-[0.7rem] uppercase tracking-[0.26em]"
                style={{ color: 'var(--fg-gilt)' }}
              >
                {f.name}
              </p>

              <h3
                className="fg-display mt-5 text-[1.55rem] leading-[1.2] sm:text-[1.8rem]"
                style={{ color: 'var(--fg-ink)' }}
              >
                {f.title}
              </h3>

              <p
                className="mt-5 flex-1 text-[1rem] leading-[1.7]"
                style={{ color: 'var(--fg-ink-2)' }}
              >
                {f.body}
              </p>

              <p
                className="mt-8 text-[0.85rem] leading-[1.5]"
                style={{ color: 'var(--fg-mute)' }}
              >
                {f.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
