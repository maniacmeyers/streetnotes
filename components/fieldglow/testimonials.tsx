const proofPoints = [
  {
    title: 'A messy brain dump becomes a Salesforce update.',
    body:
      'Provider sentiment, opportunity movement, next step, products discussed, and follow-up tasks come back organized for review.',
  },
  {
    title: 'Competitor mentions become live signal.',
    body:
      'Pricing pressure, promo chatter, product comparisons, and objection patterns roll up by account, territory, and category.',
  },
  {
    title: 'Good field language becomes Story Vault material.',
    body:
      'The pitch that landed and the objection handler that worked can be saved, scored, refined, and reused by the team.',
  },
]

export default function Testimonials() {
  return (
    <section id="voices" className="relative px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-16 grid gap-6 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <span className="fg-eyebrow">What the system creates</span>
          </div>
          <div className="sm:col-span-9">
            <h2
              className="fg-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-tight"
              style={{ color: 'var(--fg-ink)' }}
            >
              One debrief. Three assets your team can use.
            </h2>
          </div>
        </header>

        <div
          className="grid gap-px sm:grid-cols-3"
          style={{ background: 'var(--fg-line)' }}
        >
          {proofPoints.map((item, index) => (
            <article
              key={item.title}
              className="px-8 py-10 sm:px-10 sm:py-12"
              style={{ background: 'var(--fg-paper)' }}
            >
              <span
                className="fg-folio text-[1.6rem]"
                aria-hidden="true"
              >
                0{index + 1}
              </span>
              <h3
                className="fg-display mt-5 text-[1.5rem] leading-[1.2]"
                style={{ color: 'var(--fg-ink)' }}
              >
                {item.title}
              </h3>
              <p
                className="mt-5 text-[1rem] leading-[1.7]"
                style={{ color: 'var(--fg-ink-2)' }}
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
