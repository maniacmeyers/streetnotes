'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { FaDownload, FaRedo } from 'react-icons/fa'
import type { DebriefOutput, DebriefStructuredOutput, BDRStructuredOutput } from '@/lib/debrief/types'
import { isBDROutput, isVbrickBDROutput } from '@/lib/debrief/types'
import DealMindMap from './deal-mind-map'
import SpinStatCard from './spin-stat-card'

interface ResultsDisplayProps {
  structured: DebriefOutput
  sessionId: string
  email: string
  durationSec: number
  onStartOver: () => void
}

const PRIORITY_BADGE: Record<string, string> = {
  high: 'text-red-700 bg-red-50 border-red-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-gray-500 bg-gray-50 border-gray-200',
}

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-400',
  low: 'border-l-gray-300',
}

const SENTIMENT_DOT: Record<string, string> = {
  positive: 'bg-emerald-500',
  neutral: 'bg-gray-400',
  negative: 'bg-red-500',
  unknown: 'bg-gray-300',
}

const PROSPECT_STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  'active-opportunity': { label: 'Active Opportunity', color: 'text-[#7ed4f7]', bg: 'bg-[#7ed4f7]/10' },
  'future-opportunity': { label: 'Future Opportunity', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'not-a-fit': { label: 'Not a Fit', color: 'text-red-400', bg: 'bg-red-400/10' },
  'needs-more-info': { label: 'Needs More Info', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  'referred-elsewhere': { label: 'Referred Elsewhere', color: 'text-purple-400', bg: 'bg-purple-400/10' },
}

const DISPOSITION_DISPLAY: Record<string, { label: string; color: string }> = {
  connected: { label: 'Connected', color: 'text-[#7ed4f7]' },
  voicemail: { label: 'Voicemail', color: 'text-amber-400' },
  gatekeeper: { label: 'Gatekeeper', color: 'text-blue-400' },
  'no-answer': { label: 'No Answer', color: 'text-gray-400' },
}

/* ─── Card ─── */
function Card({
  children,
  title,
  count,
  delay = 0,
  accent,
  className = '',
}: {
  children: React.ReactNode
  title: string
  count?: number
  delay?: number
  accent?: string
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.06),0_6px_20px_rgba(0,0,0,0.06)] border border-gray-200/80 overflow-hidden ${className}`}
    >
      <div
        className="px-6 py-3.5 bg-gray-800 flex items-center justify-between"
        style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
      >
        <h3 className="text-[13px] font-semibold text-white tracking-tight">
          {title}
        </h3>
        {count !== undefined && (
          <span className="text-[11px] font-semibold text-gray-400 bg-gray-700 px-2.5 py-1 rounded-full">
            {count}
          </span>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  )
}

/* ─── CRM Field ─── */
function Field({ label, value }: { label: string; value: string }) {
  const empty = value === 'Not mentioned'
  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-32 sm:w-36 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-[13px] sm:text-sm flex-1 leading-snug ${empty ? 'text-gray-300 italic' : 'text-gray-900 font-medium'}`}
      >
        {value}
      </span>
    </div>
  )
}

/* ─── BDR Results ─── */
function BDRResults({
  structured,
  sessionId,
  email,
  durationSec,
  onStartOver,
}: {
  structured: BDRStructuredOutput
  sessionId: string
  email: string
  durationSec: number
  onStartOver: () => void
}) {
  const [downloading, setDownloading] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const inlineDownloadRef = useRef<HTMLDivElement>(null)

  const d = structured
  const statusDisplay = PROSPECT_STATUS_DISPLAY[d.prospectStatus] || PROSPECT_STATUS_DISPLAY['needs-more-info']
  const dispositionDisplay = DISPOSITION_DISPLAY[d.callDisposition] || DISPOSITION_DISPLAY['connected']

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
      a.download = `vbrick-command-center-${new Date().toISOString().split('T')[0]}.pdf`
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

  let delay = 0.08
  const nd = () => {
    delay += 0.05
    return delay
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 max-w-2xl mx-auto pb-4">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-3 pb-1"
      >
        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7ed4f7] animate-pulse" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Call Logged
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
          {d.contactSnapshot.company !== 'Not mentioned'
            ? d.contactSnapshot.company
            : d.contactSnapshot.name !== 'Not mentioned'
              ? d.contactSnapshot.name
              : 'Cold Call Summary'}
        </h1>
        {d.contactSnapshot.name !== 'Not mentioned' && d.contactSnapshot.company !== 'Not mentioned' && (
          <p className="text-sm text-gray-400 mt-1.5">
            {d.contactSnapshot.name}
            {d.contactSnapshot.title !== 'Not mentioned' ? `, ${d.contactSnapshot.title}` : ''}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className={`inline-flex items-center text-[11px] font-semibold ${statusDisplay.color} ${statusDisplay.bg} px-2.5 py-1 rounded-md`}>
            {statusDisplay.label}
          </span>
          <span className="text-gray-600">&middot;</span>
          <span className={`text-[11px] font-semibold ${dispositionDisplay.color}`}>
            {dispositionDisplay.label}
          </span>
          <span className="text-gray-600">&middot;</span>
          <span className="text-[11px] text-gray-500">{email}</span>
          <span className="text-gray-600">&middot;</span>
          <span className="text-[11px] text-gray-500">
            {durationSec > 0 ? `${Math.round(durationSec / 60)}m ${durationSec % 60}s` : 'Imported'}
          </span>
        </div>
      </motion.div>

      {/* ─── Action bar ─── */}
      <motion.div
        ref={inlineDownloadRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.3 }}
        className="flex gap-2.5"
      >
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-3.5 px-5 rounded-xl shadow-md hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-50"
        >
          <FaDownload className="text-xs" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="flex items-center justify-center gap-2 bg-white text-gray-500 text-sm font-medium py-3.5 px-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
        >
          <FaRedo className="text-[10px]" />
          New
        </button>
      </motion.div>

      {/* ─── Prospect Status — the truth ─── */}
      <Card title="The Truth" delay={nd()} accent="#7ed4f7">
        <p className="text-[13px] sm:text-sm text-gray-700 leading-relaxed">
          {d.theTruth}
        </p>
        {d.prospectStatusDetail && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1.5">
              Status Detail
            </p>
            <p className="text-[13px] sm:text-sm text-gray-600 leading-relaxed">
              {d.prospectStatusDetail}
            </p>
          </div>
        )}
      </Card>

      {/* ─── SPIN Stat Card (Vbrick) ─── */}
      {isVbrickBDROutput(structured) && (
        <SpinStatCard spin={structured.spin} />
      )}

      {/* ─── CRM Activity Preview ─── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: nd(), duration: 0.45 }}
        className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.1)] border border-gray-200/80 overflow-hidden"
      >
        <div className="px-6 py-4 bg-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#7ed4f7] shadow-[0_0_8px_rgba(126,212,247,0.5)]" />
            <h3 className="text-[13px] font-semibold text-white tracking-tight">
              CRM Activity Log
            </h3>
          </div>
          <span className="text-[10px] font-medium text-gray-400 tracking-wide">
            How this looks in your CRM
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
              Call Activity
            </p>
            <Field label="Disposition" value={dispositionDisplay.label} />
            <Field label="Contact" value={d.contactSnapshot.name} />
            {d.contactSnapshot.title !== 'Not mentioned' && (
              <Field label="Title" value={d.contactSnapshot.title} />
            )}
            <Field label="Company" value={d.contactSnapshot.company} />
            {d.contactSnapshot.directLine !== 'Not mentioned' && (
              <Field label="Direct Line" value={d.contactSnapshot.directLine} />
            )}
            {d.contactSnapshot.email !== 'Not mentioned' && (
              <Field label="Email" value={d.contactSnapshot.email} />
            )}
            <Field label="Current Solution" value={d.currentSolution} />
            <Field label="Status" value={statusDisplay.label} />
          </div>

          {/* Next Action */}
          <div className="px-6 py-5 bg-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">
              Next Action
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-[13px] sm:text-sm text-gray-800 font-medium leading-relaxed">
                {d.nextAction.action}
              </p>
              <p className="text-[11px] text-gray-400 mt-1.5">
                When: {d.nextAction.when}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
          <span className="text-[10px] text-gray-300 tracking-wide">
            Powered by <span className="font-semibold text-gray-400">StreetNotes</span>
          </span>
        </div>
      </motion.div>

      {/* ─── AE Briefing (conditional) ─── */}
      {d.aeBriefing && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: nd(), duration: 0.4 }}
          className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.1)] border-2 border-[#7ed4f7]/30 overflow-hidden"
        >
          <div className="px-6 py-4 bg-gray-900 flex items-center justify-between" style={{ borderLeft: '4px solid #7ed4f7' }}>
            <h3 className="text-[13px] font-semibold text-[#7ed4f7] tracking-tight">
              AE Briefing
            </h3>
            <span className="text-[10px] font-medium text-gray-400 tracking-wide">
              Share with your AE before the meeting
            </span>
          </div>
          <div className="px-6 py-5">
            <p className="text-[13px] sm:text-sm text-gray-700 leading-relaxed">
              {d.aeBriefing}
            </p>
          </div>
        </motion.div>
      )}

      {/* ─── Objections ─── */}
      {d.objections.length > 0 && (
        <Card title="Objections" count={d.objections.length} delay={nd()} accent="#F59E0B">
          <ul className="space-y-3">
            {d.objections.map((obj, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                <span className="text-[13px] sm:text-sm text-gray-600 leading-relaxed">
                  {obj}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ─── Referral ─── */}
      {d.referral && (
        <Card title="Referral" delay={nd()} accent="#8B5CF6">
          <Field label="Referred To" value={d.referral.referredTo} />
          <Field label="Reason" value={d.referral.reason} />
        </Card>
      )}

      {/* Mobile spacer */}
      <div className="h-16 sm:hidden" />

      {/* Sticky download bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/80 px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 text-sm font-semibold py-3.5 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <FaDownload className="text-xs" />
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Deal Results ─── */
function DealResults({
  structured,
  sessionId,
  email,
  durationSec,
  onStartOver,
}: {
  structured: DebriefStructuredOutput
  sessionId: string
  email: string
  durationSec: number
  onStartOver: () => void
}) {
  const d = structured
  const [downloading, setDownloading] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const inlineDownloadRef = useRef<HTMLDivElement>(null)
  const snap = d.dealSnapshot

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

  const primary = d.attendees[0]
  const contactDisplay =
    primary && primary.name !== 'Not mentioned'
      ? `${primary.name}${primary.title !== 'Not mentioned' ? `, ${primary.title}` : ''}`
      : null

  let delay = 0.08
  const nd = () => {
    delay += 0.05
    return delay
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 max-w-2xl mx-auto pb-4">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-3 pb-1"
      >
        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7ed4f7] animate-pulse" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            CRM-Ready Output
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
          {snap.companyName !== 'Not mentioned'
            ? snap.companyName
            : 'Post-Call Summary'}
        </h1>
        {contactDisplay && (
          <p className="text-sm text-gray-400 mt-1.5">{contactDisplay}</p>
        )}
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center text-[11px] font-semibold text-[#7ed4f7] bg-[#7ed4f7]/10 px-2.5 py-1 rounded-md">
            {snap.dealStage}
          </span>
          <span className="text-gray-600">&middot;</span>
          <span className="text-[11px] text-gray-500">{email}</span>
          <span className="text-gray-600">&middot;</span>
          <span className="text-[11px] text-gray-500">
            {Math.round(durationSec / 60)}m {durationSec % 60}s
          </span>
        </div>
      </motion.div>

      {/* ─── Action bar ─── */}
      <motion.div
        ref={inlineDownloadRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.3 }}
        className="flex gap-2.5"
      >
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-3.5 px-5 rounded-xl shadow-md hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-50"
        >
          <FaDownload className="text-xs" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="flex items-center justify-center gap-2 bg-white text-gray-500 text-sm font-medium py-3.5 px-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
        >
          <FaRedo className="text-[10px]" />
          New
        </button>
      </motion.div>

      {/* ─── CRM PREVIEW ─── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.1)] border border-gray-200/80 overflow-hidden"
      >
        {/* Dark header */}
        <div className="px-6 py-4 bg-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#7ed4f7] shadow-[0_0_8px_rgba(126,212,247,0.5)]" />
            <h3 className="text-[13px] font-semibold text-white tracking-tight">
              CRM Preview
            </h3>
          </div>
          <span className="text-[10px] font-medium text-gray-400 tracking-wide">
            How this looks in your CRM
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Opportunity fields */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
              Opportunity Details
            </p>
            <Field label="Account" value={snap.companyName} />
            {primary && primary.name !== 'Not mentioned' && (
              <Field
                label="Primary Contact"
                value={`${primary.name}${primary.title !== 'Not mentioned' ? ` — ${primary.title}` : ''}`}
              />
            )}
            <Field label="Stage" value={snap.dealStage} />
            <Field label="Amount" value={snap.estimatedValue} />
            <Field label="Close Date" value={snap.closeDate} />
            <Field label="Next Step" value={snap.nextStep} />
          </div>

          {/* Notes */}
          {d.opportunityNotes && (
            <div className="px-6 py-5 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">
                Description / Notes
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <p className="text-[13px] sm:text-sm text-gray-600 leading-relaxed">
                  {d.opportunityNotes}
                </p>
              </div>
            </div>
          )}

          {/* Tasks */}
          {d.followUpTasks.length > 0 && (
            <div className="px-6 py-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">
                Open Activities
                <span className="ml-2 text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full text-[9px]">
                  {d.followUpTasks.length}
                </span>
              </p>
              <div className="space-y-2">
                {d.followUpTasks.map((task, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 py-3 px-4 bg-gray-50/80 rounded-lg border-l-4 ${PRIORITY_BORDER[task.priority]}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] sm:text-sm text-gray-800 leading-snug font-medium">
                        {task.task}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          {task.owner === 'rep' ? 'You' : 'Prospect'}
                        </span>
                        {task.dueDate !== 'Not specified' && (
                          <>
                            <span className="text-gray-200">&middot;</span>
                            <span className="text-[10px] text-gray-400">
                              {task.dueDate}
                            </span>
                          </>
                        )}
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_BADGE[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Powered by footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
          <span className="text-[10px] text-gray-300 tracking-wide">
            Powered by <span className="font-semibold text-gray-400">StreetNotes</span>
          </span>
        </div>
      </motion.div>

      {/* ─── Attendees ─── */}
      {d.attendees.length > 0 && d.attendees[0].name !== 'Not mentioned' && (
        <Card
          title="Meeting Attendees"
          count={d.attendees.length}
          delay={nd()}
          accent="#3B82F6"
        >
          <div className="space-y-2">
            {d.attendees.map((att, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${SENTIMENT_DOT[att.sentiment]}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[13px] sm:text-sm font-semibold text-gray-900">
                      {att.name}
                    </span>
                    {att.role !== 'Unknown' && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                        {att.role}
                      </span>
                    )}
                  </div>
                  {att.title !== 'Not mentioned' && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {att.title}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Call Summary ─── */}
      {d.callSummary.length > 0 && (
        <Card
          title="Call Summary"
          count={d.callSummary.length}
          delay={nd()}
          accent="#7ed4f7"
        >
          <ul className="space-y-3">
            {d.callSummary.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#7ed4f7] mt-2" />
                <span className="text-[13px] sm:text-sm text-gray-600 leading-relaxed">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ─── Deal Mind Map ─── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: nd(), duration: 0.4 }}
        className="bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.06),0_6px_20px_rgba(0,0,0,0.06)] border border-gray-200/80 overflow-hidden"
      >
        <div
          className="px-6 py-3.5 bg-gray-900 flex items-center justify-between"
          style={{ borderLeft: '4px solid #374151' }}
        >
          <h3 className="text-[13px] font-semibold text-white tracking-tight">
            Deal Map
          </h3>
          <span className="text-[10px] font-medium text-gray-400 tracking-wide">
            Visual overview of deal relationships
          </span>
        </div>
        <div className="p-2 sm:p-4">
          <DealMindMap data={d} />
        </div>
      </motion.div>

      {/* ─── Deal Details ─── */}
      {(d.painPoints.length > 0 ||
        d.risks.length > 0 ||
        d.competitorsMentioned.length > 0 ||
        d.productsDiscussed.length > 0) && (
        <Card title="Deal Details" delay={nd()} accent="#6B7280">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {d.painPoints.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2.5">
                  Pain Points
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.painPoints.map((p, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {d.risks.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2.5">
                  Risks
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.risks.map((r, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {d.competitorsMentioned.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2.5">
                  Competitors
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.competitorsMentioned.map((c, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {d.productsDiscussed.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2.5">
                  Products Discussed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.productsDiscussed.map((p, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Mobile spacer */}
      <div className="h-16 sm:hidden" />

      {/* Sticky download bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/80 px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 text-sm font-semibold py-3.5 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <FaDownload className="text-xs" />
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main ─── */
export default function ResultsDisplay({
  structured,
  sessionId,
  email,
  durationSec,
  onStartOver,
}: ResultsDisplayProps) {
  if (isBDROutput(structured)) {
    return (
      <BDRResults
        structured={structured}
        sessionId={sessionId}
        email={email}
        durationSec={durationSec}
        onStartOver={onStartOver}
      />
    )
  }

  return (
    <DealResults
      structured={structured as DebriefStructuredOutput}
      sessionId={sessionId}
      email={email}
      durationSec={durationSec}
      onStartOver={onStartOver}
    />
  )
}
