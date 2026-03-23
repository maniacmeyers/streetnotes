'use client'

import { useRef, useEffect, useState } from 'react'
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
  Shield,
  DollarSign,
} from 'lucide-react'

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
/*  Section wrapper                                                   */
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
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function VbrickSitePage() {
  return (
    <div className="min-h-screen font-inter bg-[#0A1628] text-white antialiased">
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            StreetNotes
          </span>
          <span className="text-slate-500 text-xs ml-1 hidden sm:inline">
            for Vbrick
          </span>
        </div>
        <a
          href="/dashboard"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          Open Command Center <ChevronRight className="w-4 h-4" />
        </a>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-6">
            Built for Vbrick Revenue Leadership
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
            <a
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-8 py-4 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              Launch Command Center <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#the-problem"
              className="text-slate-400 hover:text-slate-300 font-medium text-base transition-colors cursor-pointer"
            >
              See the data gap
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── THE PROBLEM ─────────────────────────────────────────── */}
      <Section id="the-problem" className="pb-24">
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
              icon: DollarSign,
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

      {/* ── TECHNICAL DEBT ──────────────────────────────────────── */}
      <Section className="pb-24">
        <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.02] p-10 sm:p-14 max-w-4xl mx-auto relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.04) 0%, transparent 60%)',
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">
                Technical Debt You Already Own
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
              You bought Salesforce to run a data-driven sales org.
              <br className="hidden sm:block" />
              <span className="text-slate-400">Instead you got an expensive contact list.</span>
            </h2>
            <div className="space-y-4 text-slate-400 text-base sm:text-lg leading-relaxed">
              <p>
                Every empty field in Salesforce is technical debt. Every &quot;Had good call, will follow up&quot; note is a signal your CRM can&apos;t act on. Every stale deal stage is a forecast you can&apos;t trust.
              </p>
              <p>
                You didn&apos;t underpay for the tool. You&apos;re under-collecting the data. The ROI you were promised when you signed the Salesforce contract is sitting in your reps&apos; heads, evaporating after every call.
              </p>
              <p className="text-white font-medium">
                StreetNotes recovers that investment. Not by adding another tool your reps have to learn — by removing the friction that keeps them from using the one you already have.
              </p>
            </div>
          </div>
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
                What your CRM looks like now
              </span>
            </div>
            <div className="space-y-4 font-mono text-sm">
              {[
                ['Call Notes', '"Good call with Tom. Will follow up."'],
                ['Next Steps', 'empty'],
                ['Deal Stage', 'unchanged since January'],
                ['Competitors', 'empty'],
                ['Budget', 'empty'],
                ['Close Date', '3 months overdue'],
                ['Pain Points', 'empty'],
                ['Decision Makers', 'empty'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-slate-500">{label}</span>
                  <span className={value === 'empty' ? 'text-slate-600 italic' : 'text-slate-400 text-right max-w-[55%]'}>
                    {value === 'empty' ? '—' : value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">
                After a 60-second voice debrief
              </span>
            </div>
            <div className="space-y-4 font-mono text-sm">
              {[
                ['Call Notes', '5-point summary with action items'],
                ['Next Steps', 'Send pricing deck by Thursday'],
                ['Deal Stage', 'Moved to Negotiation'],
                ['Competitors', 'Panopto, Microsoft Stream'],
                ['Budget', '$85K approved for Q3'],
                ['Close Date', 'Updated: April 15'],
                ['Pain Points', 'Scaling live events, compliance'],
                ['Decision Makers', 'VP IT + CFO approval needed'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-emerald-400 text-right max-w-[55%]">{value}</span>
                </div>
              ))}
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
            60 seconds. No typing. No training. No behavior change.
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
                'After every call, the rep hits record and debriefs naturally. No forms, no dropdowns, no CRM tab open. They just talk about what happened.',
            },
            {
              step: '02',
              icon: Zap,
              title: 'AI extracts every CRM field',
              description:
                'Contacts, deal stage, next steps, competitors mentioned, budget discussed, pain points, timeline changes — all structured automatically.',
            },
            {
              step: '03',
              icon: Target,
              title: 'Salesforce gets the full story',
              description:
                'Every field populated. Every call documented. Your pipeline reflects reality. Your forecast becomes something you can actually trust.',
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
            { icon: FileText, label: 'Call summary with key takeaways' },
            { icon: Users, label: 'Attendees, titles, and decision roles' },
            { icon: Target, label: 'Deal stage updates with reasoning' },
            { icon: TrendingUp, label: 'Budget, timeline, and close date' },
            { icon: BarChart3, label: 'Competitor mentions and positioning' },
            { icon: CheckCircle2, label: 'Next steps with owners and due dates' },
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

      {/* ── COACHING + SPIN ─────────────────────────────────────── */}
      <Section className="pb-24">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Beyond data capture
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
            Every call scored. Every rep coached. Automatically.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="text-lg font-bold text-white mb-3">SPIN Scoring</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Every debrief is automatically scored on SPIN methodology — Situation, Problem, Implication, Need-Payoff. You see which reps are asking the right questions and which are stuck in surface-level discovery.
            </p>
            <div className="grid grid-cols-4 gap-3">
              {['S', 'P', 'I', 'N'].map((letter) => (
                <div key={letter} className="rounded-lg bg-white/[0.03] p-3 text-center">
                  <span className="font-fira-code font-bold text-xl text-blue-400">{letter}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="text-lg font-bold text-white mb-3">Head-to-Head Leaderboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              BDRs see their conversion rates, appointment rates, and SPIN scores stacked against each other in real time. Competition drives behavior. Clean data is the byproduct.
            </p>
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-1">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xs text-slate-400">Butcher</span>
              </div>
              <span className="font-inter font-black text-xl text-slate-600">VS</span>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-1">
                  <span className="text-slate-400 font-bold text-sm">K</span>
                </div>
                <span className="text-xs text-slate-400">Kara</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── THE ROI ─────────────────────────────────────────────── */}
      <Section className="pb-24">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 sm:p-16 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.04) 0%, transparent 50%)',
            }}
          />
          <div className="relative">
            <div className="text-center mb-12">
              <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
                The return
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
                Recover the Salesforce investment you already made.
              </h2>
              <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
                You didn&apos;t buy Salesforce for three-word call notes. You bought it for pipeline intelligence. StreetNotes makes that finally happen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 text-center">
              {[
                { value: 100, suffix: '%', label: 'of calls captured', sub: 'Every conversation documented' },
                { value: 60, suffix: 's', label: 'per debrief', sub: 'Zero friction for reps' },
                { value: 8, suffix: '+', label: 'CRM fields per call', sub: 'From a single voice note' },
                { value: 0, suffix: '', label: 'behavior change', sub: "Just talk. That's it." },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                    {metric.value === 0 ? (
                      <span>Zero</span>
                    ) : (
                      <AnimatedNumber value={metric.value} suffix={metric.suffix} />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-300 mb-1">{metric.label}</div>
                  <div className="text-xs text-slate-500">{metric.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── CRO MESSAGE ─────────────────────────────────────────── */}
      <Section className="pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-6">
            The bottom line
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8">
            There&apos;s no excuse for empty Salesforce fields anymore.
          </h2>
          <div className="text-left space-y-6 text-slate-400 text-base sm:text-lg leading-relaxed">
            <p>
              You&apos;ve spent years trying to get reps to update the CRM. Training sessions. Mandates. Dashboards that shame non-compliance. Nothing sticks because the problem isn&apos;t willpower — it&apos;s friction.
            </p>
            <p>
              Reps won&apos;t type detailed call notes into Salesforce at 5pm. They won&apos;t fill out 12 fields after every call. But they will talk for 60 seconds while walking to their car.
            </p>
            <p className="text-white font-medium">
              StreetNotes removes the friction. The data flows. Your pipeline becomes real. Your forecasts become trustworthy. And the Salesforce investment you already made starts paying for itself.
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
            No contract. No long onboarding. Your BDRs open the Command Center, import their call list, and start debriefing.
          </p>
          <a
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-10 py-5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-3 shadow-lg shadow-blue-600/20"
          >
            Launch the Command Center <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </Section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
            <Mic className="w-3 h-3 text-white" />
          </div>
          <span className="text-slate-500 text-xs font-medium">
            StreetNotes.ai
          </span>
        </div>
        <span className="text-slate-600 text-xs">Confidential — Prepared for Vbrick</span>
      </footer>
    </div>
  )
}
