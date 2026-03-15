'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  FaDownload,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa'
import type {
  DebriefStructuredOutput,
  DealSegment,
  BANTStatus,
  NextStepsStatus,
} from '@/lib/debrief/types'
import DealMindMap from './deal-mind-map'
import BridgeCTA from './bridge-cta'

interface ResultsDisplayProps {
  structured: DebriefStructuredOutput
  sessionId: string
  email: string
  durationSec: number
  dealSegment: DealSegment
  onStartOver: () => void
}

/* ─── BANT Gap Pill ─── */
function BANTGapPill({ label, status }: { label: string; status: BANTStatus }) {
  const styles: Record<BANTStatus, string> = {
    confirmed: 'bg-volt/20 border-volt text-volt',
    implied: 'bg-yellow-400/20 border-yellow-400 text-yellow-400',
    missing: 'bg-red-500/20 border-red-500 text-red-500',
  }
  const statusLabels: Record<BANTStatus, string> = {
    confirmed: 'Confirmed',
    implied: 'Implied',
    missing: 'Not identified',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.1em] text-gray-400">
        {label}
      </span>
      <div className={`flex items-center gap-1.5 border px-2 py-0.5 sm:px-2.5 sm:py-1 ${styles[status]}`}>
        <span className={`w-2 h-2 rounded-full ${
          status === 'confirmed' ? 'bg-volt' :
          status === 'implied' ? 'bg-yellow-400' :
          'bg-red-500 animate-pulse'
        }`} />
        <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider">
          {statusLabels[status]}
        </span>
      </div>
    </div>
  )
}

/* ─── Mutual Next Steps Banner ─── */
function NextStepsBanner({
  status,
  repActions,
  prospectActions,
  recoveryScript,
}: {
  status: NextStepsStatus
  repActions: Array<{ action: string; dueDate?: string }>
  prospectActions: Array<{ action: string; dueDate?: string }>
  recoveryScript?: string
}) {
  const bannerStyles: Record<NextStepsStatus, string> = {
    confirmed: 'bg-volt/10 border-volt',
    'one-sided': 'bg-yellow-400/10 border-yellow-400',
    none: 'bg-red-500/10 border-red-500',
  }
  const titleStyles: Record<NextStepsStatus, string> = {
    confirmed: 'text-volt',
    'one-sided': 'text-yellow-400',
    none: 'text-red-500',
  }
  const titles: Record<NextStepsStatus, string> = {
    confirmed: 'NEXT STEPS LOCKED',
    'one-sided': 'ONE-SIDED NEXT STEPS',
    none: 'NO NEXT STEPS',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 sm:border-4 ${bannerStyles[status]} p-3 sm:p-4`}
    >
      <p className={`font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold ${titleStyles[status]} mb-2`}>
        {titles[status]}
      </p>

      {status === 'confirmed' && (
        <div className="space-y-1">
          {repActions.map((a, i) => (
            <p key={`r${i}`} className="font-body text-[13px] sm:text-sm text-black/80">
              <span className="font-mono text-[9px] uppercase tracking-wider text-volt font-bold mr-2">You:</span>
              {a.action}{a.dueDate ? ` — ${a.dueDate}` : ''}
            </p>
          ))}
          {prospectActions.map((a, i) => (
            <p key={`p${i}`} className="font-body text-[13px] sm:text-sm text-black/80">
              <span className="font-mono text-[9px] uppercase tracking-wider text-blue-400 font-bold mr-2">Them:</span>
              {a.action}{a.dueDate ? ` — ${a.dueDate}` : ''}
            </p>
          ))}
        </div>
      )}

      {status === 'one-sided' && (
        <div>
          <p className="font-body text-[13px] sm:text-sm text-black/70 mb-2">
            You have action items, but your prospect committed to nothing specific. Deals without mutual accountability lose momentum.
          </p>
          {recoveryScript && (
            <div className="border-l-2 border-yellow-400 pl-3 mt-2">
              <p className="font-mono text-[9px] uppercase tracking-wider text-yellow-600 mb-1">Recovery move:</p>
              <p className="font-body text-xs sm:text-sm text-black/80 italic">{recoveryScript}</p>
            </div>
          )}
        </div>
      )}

      {status === 'none' && (
        <div>
          <p className="font-body text-[13px] sm:text-sm text-black/70 font-medium mb-2">
            No next meeting. No mutual actions. No timeline. This call ended without forward motion.
          </p>
          {recoveryScript && (
            <div className="border-l-2 border-red-500 pl-3 mt-2">
              <p className="font-mono text-[9px] uppercase tracking-wider text-red-500 mb-1">Recovery — send within 24 hours:</p>
              <p className="font-body text-xs sm:text-sm text-black/80 italic">{recoveryScript}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

/* ─── Collapsible Objection Card ─── */
function ObjectionCard({
  surfaceObjection,
  realBlocker,
  evidence,
  recoveryPlay,
}: {
  surfaceObjection: string
  realBlocker: string
  evidence: string[]
  recoveryPlay: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-l-3 sm:border-l-4 border-l-red-500 bg-red-500/5 pl-3 py-2 sm:py-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-start justify-between gap-2 min-h-[44px]"
      >
        <div className="flex-1">
          <p className="font-mono text-[9px] uppercase tracking-wider text-red-400 mb-0.5">Surface objection</p>
          <p className="font-body text-[13px] sm:text-sm text-black font-medium">{surfaceObjection}</p>
        </div>
        <span className="text-gray-400 mt-1 flex-shrink-0">
          {expanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Real blocker</p>
                <p className="font-body text-xs sm:text-sm text-black/80">{realBlocker}</p>
              </div>
              {evidence.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Evidence</p>
                  {evidence.map((e, i) => (
                    <p key={i} className="font-body text-xs text-black/60 italic border-l-2 border-volt/30 pl-2 mb-1">
                      &ldquo;{e}&rdquo;
                    </p>
                  ))}
                </div>
              )}
              <div className="bg-black/5 p-2 sm:p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-black/50 mb-0.5">Recovery play</p>
                <p className="font-body text-xs sm:text-sm text-black/90 font-medium">{recoveryPlay}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Section wrapper ─── */
function Section({
  children,
  index,
  title,
}: {
  children: React.ReactNode
  index: number
  title: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.35 }}
    >
      <div className="border-2 sm:border-4 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
        <div className="border-b-2 sm:border-b-4 border-black px-3 py-2 sm:px-4 sm:py-3">
          <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
            {title}
          </h3>
        </div>
        <div className="p-3 sm:p-5">{children}</div>
      </div>
    </motion.div>
  )
}

/* ─── Tabbed reference section ─── */
type ReferenceTab = 'stakeholders' | 'signals' | 'risks' | 'competitors'

function TabbedReference({ data }: { data: DebriefStructuredOutput }) {
  const [activeTab, setActiveTab] = useState<ReferenceTab>('stakeholders')

  const allTabs: Array<{ key: ReferenceTab; label: string; count: number }> = [
    { key: 'stakeholders', label: 'Stakeholders', count: data.decisionMakers.length },
    { key: 'signals', label: 'Signals', count: data.buyingSignals.length },
    { key: 'risks', label: 'Risks', count: data.risks.length },
    { key: 'competitors', label: 'Competitors', count: data.competitorsMentioned.length },
  ]
  const tabs = allTabs.filter(t => t.count > 0)

  if (tabs.length === 0) return null

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b-2 border-black overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] px-3 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap border-b-2 -mb-[2px] transition-colors min-h-[44px] ${
              activeTab === tab.key
                ? 'border-volt text-volt font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-3 sm:p-5">
        {activeTab === 'stakeholders' && (
          <div className="space-y-2">
            {data.decisionMakers.map((dm, i) => {
              const sentimentColors: Record<string, string> = {
                positive: 'border-l-volt',
                neutral: 'border-l-gray-400',
                negative: 'border-l-red-500',
                unknown: 'border-l-gray-600',
              }
              return (
                <div key={i} className={`border-l-3 sm:border-l-4 pl-3 py-1 ${sentimentColors[dm.sentiment] || sentimentColors.unknown}`}>
                  <p className="font-body text-[13px] sm:text-sm text-black font-medium">{dm.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-body text-xs text-black/60">{dm.role}</span>
                    <span className={`font-mono text-[9px] uppercase tracking-wider ${
                      dm.sentiment === 'positive' ? 'text-volt' :
                      dm.sentiment === 'negative' ? 'text-red-500' : 'text-gray-400'
                    }`}>{dm.sentiment}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {data.buyingSignals.map((signal, i) => (
              <span key={i} className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-volt border-2 border-volt/40 bg-volt/10 px-2.5 sm:px-3 py-1">
                {signal}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {data.risks.map((risk, i) => (
              <span key={i} className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-red-400 border-2 border-red-500/40 bg-red-500/10 px-2.5 sm:px-3 py-1">
                {risk}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {data.competitorsMentioned.map((comp, i) => (
              <span key={i} className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-600 border-2 border-gray-300 bg-gray-50 px-2.5 sm:px-3 py-1">
                {comp}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Segment badge ─── */
const SEGMENT_LABELS: Record<DealSegment, string> = {
  'smb': 'SMB',
  'mid-market': 'Mid-Market',
  'enterprise': 'Enterprise',
  'partner-channel': 'Partner',
}

/* ─── Main results component ─── */
export default function ResultsDisplay({
  structured,
  sessionId,
  email,
  durationSec,
  dealSegment,
  onStartOver,
}: ResultsDisplayProps) {
  const [downloading, setDownloading] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const inlineDownloadRef = useRef<HTMLDivElement>(null)
  const d = structured

  useEffect(() => {
    const target = inlineDownloadRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/debrief/pdf?sessionId=${sessionId}`)
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `streetnotes-debrief-${new Date().toISOString().split('T')[0]}.pdf`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(`/api/debrief/pdf?sessionId=${sessionId}`, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  let sIdx = 0

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <motion.div className="text-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-3">
          <span className="inline-block bg-white border-2 sm:border-3 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 -rotate-1 font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
            Deal Intelligence Report
          </span>
        </div>
        <h2
          className="font-display text-[28px] sm:text-[48px] uppercase leading-[0.85] text-white mb-2"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          {d.dealSnapshot.companyName !== 'Not mentioned' ? d.dealSnapshot.companyName : 'Deal Intel'}
        </h2>
        <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-gray-500">
          {email} &middot; {Math.round(durationSec / 60)}m{durationSec % 60}s &middot; {SEGMENT_LABELS[dealSegment]}
        </p>
      </motion.div>

      {/* Quick download + start over */}
      <motion.div ref={inlineDownloadRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} className="flex gap-3">
        <button type="button" onClick={handleDownloadPDF} disabled={downloading} className="brutalist-btn bg-volt text-black flex-1 flex items-center justify-center gap-2">
          <FaDownload className="text-sm" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
        <button type="button" onClick={onStartOver} className="brutalist-btn bg-white text-black flex items-center justify-center">
          New
        </button>
      </motion.div>

      {/* 1. Mutual Next Steps Banner */}
      <NextStepsBanner
        status={d.mutualNextSteps.status}
        repActions={d.mutualNextSteps.repActions}
        prospectActions={d.mutualNextSteps.prospectActions}
        recoveryScript={d.mutualNextSteps.recoveryScript}
      />

      {/* 2. Deal Pattern Card (hero) */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}>
        <div className="border-2 sm:border-4 border-black bg-white shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000]">
          <div className="border-b-2 sm:border-b-4 border-black px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between">
            <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">Deal Pattern</h3>
            <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 border border-gray-300 px-2 py-0.5">
              {SEGMENT_LABELS[dealSegment]}
            </span>
          </div>
          <div className="p-4 sm:p-6">
            <h2 className="font-display text-[22px] sm:text-[32px] uppercase leading-[0.9] text-black mb-2">
              {d.dealPattern.name}
            </h2>
            <p className="font-body text-[13px] sm:text-sm text-black/60 italic mb-4 sm:mb-5">
              {d.dealPattern.description}
            </p>

            {/* BANT Gap Row */}
            <div className="flex justify-between gap-2 sm:gap-4 mb-4 sm:mb-5">
              <BANTGapPill label="Budget" status={d.dealPattern.gapAnalysis.budget} />
              <BANTGapPill label="Authority" status={d.dealPattern.gapAnalysis.authority} />
              <BANTGapPill label="Need" status={d.dealPattern.gapAnalysis.need} />
              <BANTGapPill label="Timeline" status={d.dealPattern.gapAnalysis.timeline} />
            </div>

            {/* Evidence */}
            {d.dealPattern.evidence.length > 0 && (
              <div className="mb-4 sm:mb-5">
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Evidence</p>
                {d.dealPattern.evidence.map((e, i) => (
                  <p key={i} className="font-body text-xs text-black/60 italic border-l-2 border-volt/30 pl-2 mb-1">
                    &ldquo;{e}&rdquo;
                  </p>
                ))}
              </div>
            )}

            {/* Recommended Actions */}
            {d.dealPattern.recommendedActions.length > 0 && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">What to do next</p>
                {d.dealPattern.recommendedActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2.5 mb-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-volt border-2 border-black flex items-center justify-center font-mono text-[10px] font-bold text-black">
                      {i + 1}
                    </span>
                    <p className="font-body text-[13px] sm:text-sm text-black/80 flex-1">{action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3. Buyer Psychology */}
      <Section index={sIdx++} title="Buyer Psychology">
        {/* Commitment Analysis — two columns on desktop, stacked on mobile */}
        {(d.commitmentAnalysis.realCommitments.length > 0 || d.commitmentAnalysis.fillerSignals.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
            {/* Real Commitments */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-volt font-bold mb-2">Real Commitments</p>
              {d.commitmentAnalysis.realCommitments.length > 0 ? (
                <div className="space-y-2">
                  {d.commitmentAnalysis.realCommitments.map((c, i) => (
                    <div key={i} className="border-l-2 border-volt pl-2">
                      <p className="font-body text-xs sm:text-sm text-black/80 italic">&ldquo;{c.quote}&rdquo;</p>
                      <p className="font-body text-[11px] text-black/50 mt-0.5">{c.significance}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-xs text-black/40 italic">No real commitments detected.</p>
              )}
            </div>

            {/* Filler Signals */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-yellow-500 font-bold mb-2">Watch These</p>
              {d.commitmentAnalysis.fillerSignals.length > 0 ? (
                <div className="space-y-3">
                  {d.commitmentAnalysis.fillerSignals.map((f, i) => (
                    <div key={i} className="border-l-2 border-yellow-400 pl-2">
                      <p className="font-body text-xs sm:text-sm text-black/80 italic">&ldquo;{f.quote}&rdquo;</p>
                      <p className="font-body text-[11px] text-black/50 mt-0.5">{f.meaning}</p>
                      <p className="font-body text-[11px] text-black/70 mt-1 font-medium">
                        <span className="text-yellow-600">&rarr;</span> {f.recoveryMove}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-xs text-black/40 italic">No filler signals detected.</p>
              )}
            </div>
          </div>
        )}

        {/* Objection Diagnostics */}
        {d.objectionDiagnostics.length > 0 && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-2 mt-2">Objection Diagnostics</p>
            <div className="space-y-2">
              {d.objectionDiagnostics.map((obj, i) => (
                <ObjectionCard key={i} {...obj} />
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* 4. Deal Snapshot (compressed) */}
      <Section index={sIdx++} title="Deal Snapshot">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-4">
          {[
            { label: 'Company', value: d.dealSnapshot.companyName },
            { label: 'Contact', value: d.dealSnapshot.contactName },
            { label: 'Title', value: d.dealSnapshot.contactTitle },
            { label: 'Stage', value: d.dealSnapshot.dealStage },
            { label: 'Value', value: d.dealSnapshot.estimatedValue },
            { label: 'Timeline', value: d.dealSnapshot.timeline },
          ].map((field) => (
            <div key={field.label}>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-gray-400 block mb-0.5">
                {field.label}
              </span>
              <p className={`font-body text-[13px] sm:text-sm ${
                field.value === 'Not mentioned' ? 'text-gray-400 italic' : 'text-black font-medium'
              }`}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Call Summary */}
      {d.callSummary.length > 0 && (
        <Section index={sIdx++} title="Call Summary">
          <ul className="space-y-2">
            {d.callSummary.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-volt mt-2" />
                <span className="font-body text-[13px] sm:text-sm text-black/80">{bullet}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 6. Tabbed Reference (Stakeholders | Signals | Risks | Competitors) */}
      {(d.decisionMakers.length > 0 || d.buyingSignals.length > 0 || d.risks.length > 0 || d.competitorsMentioned.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + sIdx++ * 0.06, duration: 0.35 }}
        >
          <div className="border-2 sm:border-4 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
            <TabbedReference data={d} />
          </div>
        </motion.div>
      )}

      {/* 7. Mind Map */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 + sIdx * 0.06, duration: 0.35 }}
      >
        <div className="border-2 sm:border-4 border-black shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000] overflow-hidden">
          <div className="border-b-2 sm:border-b-4 border-black px-3 py-2 sm:px-4 sm:py-3 bg-white">
            <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
              Deal Mind Map
            </h3>
          </div>
          <DealMindMap data={d} />
        </div>
      </motion.div>

      {/* 8. Bridge CTA */}
      <BridgeCTA />

      {/* Bottom spacer for sticky bar on mobile */}
      <div className="h-16 sm:hidden" />

      {/* Sticky download bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 bg-dark/95 backdrop-blur-sm border-t-2 border-volt/30 px-4 py-3 pb-safe">
          <button type="button" onClick={handleDownloadPDF} disabled={downloading} className="brutalist-btn bg-volt text-black w-full flex items-center justify-center gap-2 border-2">
            <FaDownload className="text-xs" />
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      )}
    </div>
  )
}
