'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import {
  Mic,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Target,
  FileText,
  ChevronRight,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Cookie helpers (retain existing redirect logic)                    */
/* ------------------------------------------------------------------ */

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                  */
/* ------------------------------------------------------------------ */

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 1200
    const steps = 40
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Section wrapper with fade-up animation                            */
/* ------------------------------------------------------------------ */

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`w-full max-w-6xl mx-auto px-6 ${className}`}
    >
      {children}
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */

export default function VbrickPage() {
  const [loading, setLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    const visited = getCookie('vbrick_visited')
    if (visited) {
      setShouldRedirect(true)
      window.location.href = '/vbrick/dashboard'
    } else {
      setLoading(false)
    }
  }, [])

  function handleCTA() {
    setCookie('vbrick_visited', '1', 365)
    window.location.href = '/vbrick/dashboard'
  }

  if (loading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
        <div className="text-white/40 text-sm font-body">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-body bg-[#0A1628] text-white antialiased">
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            Vbrick
          </span>
          <span className="text-slate-500 text-xs ml-1 hidden sm:inline">
            by StreetNotes.ai
          </span>
        </div>
        <button
          onClick={handleCTA}
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          See it live <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-6">
            For Revenue Leaders
          </p>
          <h1 className="text-[2.25rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Your reps make 200 calls a week.
            <br />
            <span className="text-slate-400">
              Salesforce captures maybe 20%.
            </span>
          </h1>
          <p className="mt-8 text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            The other 80% dies in the parking lot. Your forecast is built on whatever reps remembered to type at the end of the day. That&apos;s not a CRM problem. That&apos;s a data collection problem.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCTA}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-8 py-4 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              See it in action <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#how-it-works"
              className="text-slate-400 hover:text-slate-300 font-medium text-base transition-colors cursor-pointer"
            >
              How it works
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── THE PROBLEM ─────────────────────────────────────────── */}
      <Section className="pb-24">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
            The real cost
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
            You&apos;re paying for Salesforce.
            <br className="hidden sm:block" />
            Your reps are paying it lip service.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: BarChart3,
              stat: '$300',
              label: '/user/month for Salesforce',
              detail: 'Average enterprise Salesforce cost. Most orgs use less than 40% of what they pay for.',
            },
            {
              icon: Clock,
              stat: '71%',
              label: 'of selling time lost to admin',
              detail: 'Reps spend more time logging activities than selling. So they stop logging.',
            },
            {
              icon: TrendingUp,
              stat: '40%',
              label: 'pipeline inaccuracy rate',
              detail: 'Garbage in, garbage out. When deal data is stale, your forecast is fiction.',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
            >
              <card.icon className="w-6 h-6 text-blue-400 mb-4" />
              <div className="text-3xl font-extrabold text-white mb-1">
                {card.stat}
              </div>
              <div className="text-sm font-semibold text-slate-300 mb-3">
                {card.label}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── BEFORE / AFTER ──────────────────────────────────────── */}
      <Section className="pb-24">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
            The difference
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Same call. Different Salesforce entry.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Before */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-8">
            <div className="flex items-center gap-2 mb-6">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-bold text-sm uppercase tracking-wider">
                Without Vbrick
              </span>
            </div>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Call Notes</span>
                <span className="text-slate-400 text-right max-w-[60%]">
                  &quot;Good call with Tom. Will follow up.&quot;
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Next Steps</span>
                <span className="text-slate-600 italic">empty</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Deal Stage</span>
                <span className="text-slate-600 italic">unchanged</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Competitors</span>
                <span className="text-slate-600 italic">empty</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Budget</span>
                <span className="text-slate-600 italic">empty</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Close Date</span>
                <span className="text-slate-600 italic">3 months old</span>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">
                With Vbrick
              </span>
            </div>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Call Notes</span>
                <span className="text-slate-300 text-right max-w-[60%]">
                  5-point summary with action items
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Next Steps</span>
                <span className="text-emerald-400">
                  Send pricing by Thursday
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Deal Stage</span>
                <span className="text-emerald-400">
                  Moved to Negotiation
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Competitors</span>
                <span className="text-emerald-400">
                  Gong, Outreach
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-500">Budget</span>
                <span className="text-emerald-400">$85K approved</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Close Date</span>
                <span className="text-emerald-400">Updated: April 15</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <Section id="how-it-works" className="pb-24">
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
            60 seconds. No typing. No training.
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
            Rep finishes a call. Talks into their phone for one minute. Salesforce gets the full picture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: '01',
              icon: Mic,
              title: 'Rep talks for 60 seconds',
              description:
                'After every call, the rep hits record and debriefs naturally. No forms, no dropdowns, no CRM tab open.',
            },
            {
              step: '02',
              icon: Zap,
              title: 'AI extracts the CRM data',
              description:
                'Contacts, deal stage, next steps, competitors, budget, pain points, close date — all structured automatically.',
            },
            {
              step: '03',
              icon: Target,
              title: 'Salesforce gets the full story',
              description:
                'Every field populated. Every call documented. Your pipeline reflects what actually happened.',
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <span className="text-6xl font-extrabold text-white/[0.03] absolute -top-4 -left-2">
                {item.step}
              </span>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── WHAT GETS CAPTURED ──────────────────────────────────── */}
      <Section className="pb-24">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
            What lands in Salesforce
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
            Every field your reps never fill out — filled.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { icon: FileText, label: 'Call summary & key takeaways' },
            { icon: Users, label: 'Attendees, titles & roles' },
            { icon: Target, label: 'Deal stage updates' },
            { icon: TrendingUp, label: 'Budget & timeline' },
            { icon: BarChart3, label: 'Competitor mentions' },
            { icon: CheckCircle2, label: 'Next steps with owners & dates' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <item.icon className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <span className="text-sm font-medium text-slate-300">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── THE ROI ─────────────────────────────────────────────── */}
      <Section className="pb-24">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 sm:p-16">
          <div className="text-center mb-12">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
              The return
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
              Recover the investment you already made in Salesforce.
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
              You didn&apos;t buy Salesforce for three-word call notes. You bought it for pipeline intelligence. Vbrick makes that happen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                value: 100,
                suffix: '%',
                label: 'of calls captured',
                sub: 'Every conversation documented',
              },
              {
                value: 60,
                suffix: 's',
                label: 'per debrief',
                sub: 'Zero friction for reps',
              },
              {
                value: 0,
                suffix: '',
                label: 'behavior change required',
                sub: 'Just talk. That\'s it.',
              },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                  {metric.value === 0 ? (
                    <span>Zero</span>
                  ) : (
                    <AnimatedNumber
                      value={metric.value}
                      suffix={metric.suffix}
                    />
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-300 mb-1">
                  {metric.label}
                </div>
                <div className="text-xs text-slate-500">{metric.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CRO MESSAGE ─────────────────────────────────────────── */}
      <Section className="pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-6">
            For the CRO
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8">
            No more excuses for empty Salesforce fields.
          </h2>
          <div className="text-left space-y-6 text-slate-400 text-base sm:text-lg leading-relaxed">
            <p>
              You&apos;ve spent years trying to get reps to update the CRM. Training sessions. Mandates. Dashboards that shame non-compliance. Nothing sticks because the problem isn&apos;t willpower — it&apos;s friction.
            </p>
            <p>
              Reps won&apos;t type detailed call notes into Salesforce at 5pm. They won&apos;t fill out 12 fields after every call. But they will talk for 60 seconds while walking to their car.
            </p>
            <p className="text-white font-medium">
              Vbrick removes the friction. The data flows. Your pipeline becomes real. Your forecasts become trustworthy. And the Salesforce investment you already made starts paying for itself.
            </p>
          </div>
        </div>
      </Section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <Section className="pb-32">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            See it with your team&apos;s next 10 calls.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            No setup. No integrations yet. Just record, review, and see what your reps actually said.
          </p>
          <button
            onClick={handleCTA}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-10 py-5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-3 shadow-lg shadow-blue-600/20"
          >
            Launch the Command Center <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </Section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
            <Mic className="w-3 h-3 text-white" />
          </div>
          <span className="text-slate-500 text-xs font-medium">
            Vbrick by StreetNotes.ai
          </span>
        </div>
        <span className="text-slate-600 text-xs">Confidential</span>
      </footer>
    </div>
  )
}
