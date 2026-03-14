'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import {
  FaDownload,
  FaCheck,
  FaTimes,
  FaUser,
  FaHandshake,
  FaExclamationTriangle,
} from 'react-icons/fa'
import type { DebriefStructuredOutput, ConfidenceLevel } from '@/lib/debrief/types'
import DealMindMap from './deal-mind-map'
import BridgeCTA from './bridge-cta'

interface ResultsDisplayProps {
  structured: DebriefStructuredOutput
  sessionId: string
  email: string
  durationSec: number
  onStartOver: () => void
}

/* ─── Confidence badge ─── */
function ConfidenceDot({ level }: { level: ConfidenceLevel }) {
  const colors: Record<ConfidenceLevel, string> = {
    high: 'bg-volt',
    medium: 'bg-yellow-400',
    low: 'bg-gray-400',
  }
  const labels: Record<ConfidenceLevel, string> = {
    high: 'Confirmed',
    medium: 'Implied',
    low: 'Unconfirmed',
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[level]}`} />
      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400">
        {labels[level]}
      </span>
    </span>
  )
}

/* ─── Owner badge ─── */
function OwnerBadge({ owner }: { owner: 'rep' | 'prospect' | 'other' }) {
  const styles: Record<string, string> = {
    rep: 'bg-volt text-black',
    prospect: 'bg-blue-400 text-black',
    other: 'bg-gray-500 text-white',
  }
  const labels: Record<string, string> = {
    rep: 'You',
    prospect: 'Prospect',
    other: 'Other',
  }
  return (
    <span
      className={`font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 ${styles[owner]}`}
    >
      {labels[owner]}
    </span>
  )
}

/* ─── Sentiment indicator ─── */
function SentimentBorder({
  sentiment,
}: {
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown'
}) {
  const colors: Record<string, string> = {
    positive: 'border-l-volt',
    neutral: 'border-l-gray-400',
    negative: 'border-l-red-500',
    unknown: 'border-l-gray-600',
  }
  return colors[sentiment] || colors.unknown
}

/* ─── Section wrapper with stagger ─── */
function Section({
  children,
  index,
  title,
  icon,
}: {
  children: React.ReactNode
  index: number
  title: string
  icon?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
    >
      <div className="border-3 sm:border-4 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
        <div className="border-b-3 sm:border-b-4 border-black px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2">
          {icon && <span className="text-black">{icon}</span>}
          <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
            {title}
          </h3>
        </div>
        <div className="p-3 sm:p-5">{children}</div>
      </div>
    </motion.div>
  )
}

/* ─── Deal Score Badge ─── */
function DealScoreBadge({
  score,
  rationale,
}: {
  score: number
  rationale: string
}) {
  const color =
    score >= 7
      ? 'bg-volt text-black border-black'
      : score >= 4
        ? 'bg-yellow-400 text-black border-black'
        : 'bg-red-500 text-white border-black'

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 ${color} border-4 flex items-center justify-center`}
      >
        <span className="font-display text-3xl sm:text-4xl">{score}</span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400">
        Deal Score
      </span>
      <p className="font-body text-xs text-gray-500 text-center max-w-xs italic">
        {rationale}
      </p>
    </div>
  )
}

/* ─── Main results component ─── */
export default function ResultsDisplay({
  structured,
  sessionId,
  email,
  durationSec,
  onStartOver,
}: ResultsDisplayProps) {
  const [downloading, setDownloading] = useState(false)
  const d = structured

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
      // Open in new tab as fallback
      window.open(`/api/debrief/pdf?sessionId=${sessionId}`, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  let sectionIndex = 0

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      {/* Results header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-3 sm:mb-4">
          <span className="inline-block bg-white border-2 sm:border-3 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 -rotate-1 font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
            Your debrief is ready
          </span>
        </div>
        <h2
          className="font-display text-[28px] sm:text-[48px] uppercase leading-[0.85] text-white mb-2"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          {d.dealSnapshot.companyName !== 'Not mentioned'
            ? d.dealSnapshot.companyName
            : 'Deal Intel'}
        </h2>
        <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-gray-500">
          {email} &middot; {Math.round(durationSec / 60)}m{durationSec % 60}s
          recording
        </p>
      </motion.div>

      {/* Deal Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
        className="flex justify-center"
      >
        <DealScoreBadge
          score={d.dealScore}
          rationale={d.dealScoreRationale}
        />
      </motion.div>

      {/* Deal Snapshot */}
      <Section index={sectionIndex++} title="Deal Snapshot">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            {
              label: 'Company',
              value: d.dealSnapshot.companyName,
              key: 'companyName',
            },
            {
              label: 'Contact',
              value: d.dealSnapshot.contactName,
              key: 'contactName',
            },
            {
              label: 'Title',
              value: d.dealSnapshot.contactTitle,
              key: 'contactTitle',
            },
            {
              label: 'Stage',
              value: d.dealSnapshot.dealStage,
              key: 'dealStage',
            },
            {
              label: 'Value',
              value: d.dealSnapshot.estimatedValue,
              key: 'estimatedValue',
            },
            {
              label: 'Timeline',
              value: d.dealSnapshot.timeline,
              key: 'timeline',
            },
          ].map((field) => (
            <div key={field.key}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400">
                  {field.label}
                </span>
                {d.dealSnapshot.confidence?.[field.key] && (
                  <ConfidenceDot
                    level={d.dealSnapshot.confidence[field.key]}
                  />
                )}
              </div>
              <p
                className={`font-body text-sm ${
                  field.value === 'Not mentioned'
                    ? 'text-gray-400 italic'
                    : 'text-black font-medium'
                }`}
              >
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Summary */}
      <Section index={sectionIndex++} title="Summary">
        <p className="font-body text-sm text-black/80 leading-relaxed italic">
          {d.summary}
        </p>
        <div className="mt-3">
          <ConfidenceDot level={d.overallConfidence} />
        </div>
      </Section>

      {/* Key Takeaways */}
      {d.keyTakeaways.length > 0 && (
        <Section
          index={sectionIndex++}
          title="Key Takeaways"
          icon={<FaCheck className="text-xs" />}
        >
          <ul className="space-y-2">
            {d.keyTakeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-volt border-2 border-black flex items-center justify-center mt-0.5">
                  <FaCheck className="text-[8px] text-black" />
                </span>
                <span className="font-body text-sm text-black/80">{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Objections */}
      {d.objections.length > 0 && (
        <Section
          index={sectionIndex++}
          title="Objections"
          icon={<FaExclamationTriangle className="text-xs" />}
        >
          <div className="space-y-3">
            {d.objections.map((obj, i) => (
              <div
                key={i}
                className={`border-l-4 pl-3 py-2 ${obj.resolved ? 'border-l-volt bg-volt/5' : 'border-l-red-500 bg-red-500/5'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {obj.resolved ? (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-volt font-bold flex items-center gap-1">
                      <FaCheck className="text-[8px]" /> Resolved
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-red-500 font-bold flex items-center gap-1">
                      <FaTimes className="text-[8px]" /> Unresolved
                    </span>
                  )}
                </div>
                <p className="font-body text-sm text-black font-medium">
                  {obj.objection}
                </p>
                {obj.response && obj.response !== 'Not mentioned' && (
                  <p className="font-body text-xs text-black/60 mt-1">
                    Response: {obj.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Next Steps */}
      {d.nextSteps.length > 0 && (
        <Section index={sectionIndex++} title="Next Steps">
          <div className="space-y-3">
            {d.nextSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b border-black/10 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <OwnerBadge owner={step.owner} />
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm text-black">{step.action}</p>
                  {step.dueDate && step.dueDate !== 'Not mentioned' && (
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">
                      Due: {step.dueDate}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Decision Makers */}
      {d.decisionMakers.length > 0 && (
        <Section
          index={sectionIndex++}
          title="Decision Makers"
          icon={<FaUser className="text-xs" />}
        >
          <div className="space-y-2">
            {d.decisionMakers.map((dm, i) => (
              <div
                key={i}
                className={`border-l-4 pl-3 py-2 ${SentimentBorder({ sentiment: dm.sentiment })}`}
              >
                <p className="font-body text-sm text-black font-medium">
                  {dm.name}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="font-body text-xs text-black/60">
                    {dm.role}
                  </span>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wider ${
                      dm.sentiment === 'positive'
                        ? 'text-volt'
                        : dm.sentiment === 'negative'
                          ? 'text-red-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {dm.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Buying Signals */}
      {d.buyingSignals.length > 0 && (
        <Section
          index={sectionIndex++}
          title="Buying Signals"
          icon={<FaHandshake className="text-xs" />}
        >
          <div className="flex flex-wrap gap-2">
            {d.buyingSignals.map((signal, i) => (
              <span
                key={i}
                className="font-mono text-[10px] uppercase tracking-wider text-volt border-2 border-volt/40 bg-volt/10 px-3 py-1"
              >
                {signal}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Risks */}
      {d.risks.length > 0 && (
        <Section
          index={sectionIndex++}
          title="Risks"
          icon={<FaExclamationTriangle className="text-xs" />}
        >
          <div className="flex flex-wrap gap-2">
            {d.risks.map((risk, i) => (
              <span
                key={i}
                className="font-mono text-[10px] uppercase tracking-wider text-red-400 border-2 border-red-500/40 bg-red-500/10 px-3 py-1"
              >
                {risk}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Competitors */}
      {d.competitorsMentioned.length > 0 && (
        <Section index={sectionIndex++} title="Competitors Mentioned">
          <div className="flex flex-wrap gap-2">
            {d.competitorsMentioned.map((comp, i) => (
              <span
                key={i}
                className="font-mono text-[10px] uppercase tracking-wider text-gray-600 border-2 border-gray-300 bg-gray-50 px-3 py-1"
              >
                {comp}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Mind Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + sectionIndex * 0.1, duration: 0.4 }}
      >
        <div className="border-3 sm:border-4 border-black shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000] overflow-hidden">
          <div className="border-b-3 sm:border-b-4 border-black px-3 py-2.5 sm:px-4 sm:py-3 bg-white">
            <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
              Deal Mind Map
            </h3>
            <p className="sm:hidden font-mono text-[8px] uppercase tracking-[0.1em] text-gray-400 mt-1">
              Rotate to landscape for the best view
            </p>
          </div>
          <DealMindMap data={d} />
        </div>
      </motion.div>

      {/* Download PDF + Start Over */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + (sectionIndex + 1) * 0.1, duration: 0.4 }}
        className="flex flex-col gap-3"
      >
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="brutalist-btn bg-volt text-black w-full flex items-center justify-center gap-3"
        >
          <FaDownload className="text-sm" />
          {downloading ? 'Generating PDF...' : 'Download PDF'}
        </button>

        <button
          type="button"
          onClick={onStartOver}
          className="font-mono text-xs uppercase tracking-[0.1em] text-gray-400 hover:text-white transition-colors py-3 min-h-[44px]"
        >
          Start new debrief
        </button>
      </motion.div>

      {/* Bridge CTA */}
      <BridgeCTA />
    </div>
  )
}
