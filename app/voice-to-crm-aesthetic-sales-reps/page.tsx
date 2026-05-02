import type { Metadata } from 'next'
import { ArrowLeft, BookOpen, DatabaseZap, Mic, Radar } from 'lucide-react'
import Logo from '@/components/brand/logo'

export const metadata: Metadata = {
  title: 'Voice-to-CRM for Aesthetic Sales Reps | StreetNotes',
  description:
    'A current overview of StreetNotes voice-to-CRM workflows for aesthetic sales reps and sales leaders.',
}

const items = [
  {
    Icon: Mic,
    title: '60-second debriefs',
    body: 'Reps talk after a visit while the account details are still fresh.',
  },
  {
    Icon: DatabaseZap,
    title: 'CRM-ready structure',
    body: 'StreetNotes turns the debrief into account fields, follow-ups, objections, and next steps.',
  },
  {
    Icon: Radar,
    title: 'Competitive intel',
    body: 'Brand mentions and objection patterns become visible across the territory.',
  },
  {
    Icon: BookOpen,
    title: 'Story practice',
    body: 'Winning stories and objection responses can be rehearsed before the next live conversation.',
  },
]

export default function VoiceToCrmOverviewPage() {
  return (
    <div className="sn-landing min-h-[100dvh] bg-[#061222] text-white">
      <div className="sn-grid-bg" aria-hidden="true" />
      <header className="sticky top-0 z-50 border-b border-volt/20 bg-[#061222]/86 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Logo size="lg" priority />
          <a
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 font-mono text-xs font-bold uppercase text-white/70 hover:border-volt/45 hover:text-volt"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </a>
        </nav>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="font-mono text-xs font-bold uppercase text-volt">
          Product overview
        </p>
        <h1 className="mt-3 max-w-5xl font-display text-[54px] leading-[0.9] text-white sm:text-[88px] md:text-[112px]">
          Voice-to-CRM for aesthetic sales reps
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
          StreetNotes captures what reps usually lose between the practice door
          and the next account: injector preferences, unit signals, objections,
          competitor mentions, and follow-up context.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <section key={item.title} className="sn-card rounded-2xl p-6 sm:p-8">
              <item.Icon className="mb-5 h-6 w-6 text-volt" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">{item.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-white/68">
                {item.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="/debrief"
            className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-volt px-7 py-4 font-bold text-black shadow-glow-volt-lg hover:scale-[1.02]"
          >
            Try the free debrief
          </a>
          <a
            href="/for-leaders"
            className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-7 py-4 font-bold text-white hover:border-volt/45 hover:text-volt"
          >
            View sales leader pilot
          </a>
        </div>
      </main>
    </div>
  )
}
