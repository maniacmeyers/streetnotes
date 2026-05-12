const steps = [
  {
    n: '01',
    title: 'Brain dump in your own words',
    body: 'Right after the visit, while it is still fresh. Talk as long as you need. No timer, no script, no tiny form fields.',
  },
  {
    n: '02',
    title: 'Review the Salesforce update',
    body: 'Account context, opportunity movement, next steps, attendees, products, and field notes come back organized. You stay in control before anything gets pushed.',
  },
  {
    n: '03',
    title: 'Competitive intel goes live',
    body: 'Pricing moves, promos, objections, and new tactics mentioned by anyone on the team roll into a live view leaders can actually use.',
  },
  {
    n: '04',
    title: 'Story Vault gets smarter',
    body: 'The best pitches, objection handlers, and field stories get saved, scored, and turned into reusable team material.',
  },
]

import ShinyText from '@/components/shiny-text'

export default function HowItWorks() {
  return (
    <section id="how" className="relative px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-20 grid gap-6 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <span className="fg-eyebrow">How it works</span>
          </div>
          <div className="sm:col-span-9">
            <h2
              className="fg-display text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1] tracking-tight"
              style={{ color: 'var(--fg-ink)' }}
            >
              No script.{' '}
              <ShinyText
                text="Four outputs."
                className="fg-display-italic leading-[1.5]"
                color="#8B6B40"
                shineColor="#E8C9A0"
                speed={2.4}
                delay={3.5}
              />{' '}
              Every debrief.
            </h2>
            <p
              className="mt-6 max-w-[60ch] text-[1.05rem] leading-[1.7]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              The same simple flow after every visit — medspa, surgery
              center, dermatology office, or dinner with a key account.
            </p>
          </div>
        </header>

        <ol>
          {steps.map((s) => (
            <li
              key={s.n}
              className="grid gap-8 border-t py-12 sm:grid-cols-12 sm:gap-10 sm:py-14"
              style={{ borderColor: 'var(--fg-line)' }}
            >
              <div className="sm:col-span-2">
                <span
                  className="fg-folio text-[clamp(3.5rem,7vw,5.5rem)]"
                  aria-hidden="true"
                >
                  {s.n}
                </span>
              </div>

              <div className="sm:col-span-10">
                <h3
                  className="fg-display text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.15]"
                  style={{ color: 'var(--fg-ink)' }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-4 max-w-[60ch] text-[1.02rem] leading-[1.7]"
                  style={{ color: 'var(--fg-ink-2)' }}
                >
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <hr className="fg-rule" />
      </div>
    </section>
  )
}
