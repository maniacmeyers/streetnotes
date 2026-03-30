'use client'

import { motion } from 'motion/react'
import { Download, X } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { GlassCardElevated } from './glass-card'
import { CountUp } from './count-up'
import { DispositionDot, Badge } from './badge'
import { scoreColorClass } from '@/lib/vbrick/colors'
import type { QueueItem } from './call-queue'

interface SessionReportProps {
  sessionId: string
  duration: string
  totalCalls: number
  connectedCount: number
  appointmentsCount: number
  convRate: number
  apptRate: number
  averageSpin: number
  bestSpin: number
  bestSpinContact: string
  calls: QueueItem[]
  onClose: () => void
}

function StatReveal({
  label,
  value,
  suffix,
  decimals,
  highlight,
  delay,
}: {
  label: string
  value: number
  suffix?: string
  decimals?: number
  highlight?: boolean
  delay: number
}) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <span
        className="font-fira-code font-bold text-4xl"
        style={{
          color: highlight ? neuTheme.colors.score.green : neuTheme.colors.text.heading,
          textShadow: highlight ? `0 0 20px ${neuTheme.colors.score.green}60` : undefined,
        }}
      >
        <CountUp value={value} decimals={decimals || 0} suffix={suffix} />
      </span>
      <p
        className="text-[10px] uppercase tracking-[0.15em] font-inter mt-1"
        style={{ color: neuTheme.colors.text.muted }}
      >
        {label}
      </p>
    </motion.div>
  )
}

export function SessionReport({
  sessionId,
  duration,
  totalCalls,
  connectedCount,
  appointmentsCount,
  convRate,
  apptRate,
  averageSpin,
  bestSpin,
  bestSpinContact,
  calls,
  onClose,
}: SessionReportProps) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <h2
          className="text-[11px] uppercase tracking-[0.2em] font-inter font-medium"
          style={{ color: neuTheme.colors.accent.primary }}
        >
          Session Report
        </h2>
        <button
          onClick={onClose}
          className="transition-colors cursor-pointer"
          style={{ color: neuTheme.colors.text.muted }}
          onMouseEnter={(e) => { e.currentTarget.style.color = neuTheme.colors.text.heading }}
          onMouseLeave={(e) => { e.currentTarget.style.color = neuTheme.colors.text.muted }}
          aria-label="Close report"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <GlassCardElevated>
        {/* Duration header */}
        <motion.p
          className="text-center text-sm font-inter mb-6"
          style={{ color: neuTheme.colors.text.muted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Session Duration:{' '}
          <span className="font-fira-code" style={{ color: neuTheme.colors.text.heading }}>
            {duration}
          </span>
        </motion.p>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <StatReveal label="Total Calls" value={totalCalls} delay={0.3} />
          <StatReveal label="Connected" value={connectedCount} delay={0.45} />
          <StatReveal label="Appointments" value={appointmentsCount} delay={0.6} highlight={appointmentsCount > 0} />
        </div>

        <div
          className="h-px my-4"
          style={{
            background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
          }}
        />

        <div className="grid grid-cols-3 gap-6 mb-6">
          <StatReveal label="Answer to Conversation Rate" value={convRate} suffix="%" delay={0.75} />
          <StatReveal label="Conversation to Appointment Rate" value={apptRate} suffix="%" delay={0.9} />
          <StatReveal label="Average SPIN" value={averageSpin} decimals={1} delay={1.05} />
        </div>

        <div
          className="h-px my-4"
          style={{
            background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
          }}
        />

        {/* Best SPIN */}
        <motion.div
          className="text-center py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.15em] font-inter mb-1"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Best SPIN
          </p>
          <span
            className="font-fira-code font-bold text-5xl"
            style={{
              color: neuTheme.colors.score.green,
              textShadow: `0 0 20px ${neuTheme.colors.score.green}60`,
            }}
          >
            <CountUp value={bestSpin} decimals={1} />
          </span>
          {bestSpinContact && (
            <p className="text-sm font-inter mt-1" style={{ color: neuTheme.colors.text.muted }}>
              {bestSpinContact}
            </p>
          )}
        </motion.div>
      </GlassCardElevated>

      {/* Export buttons */}
      <div className="flex gap-4">
        <a
          href={`/api/vbrick/export/csv?sessionId=${sessionId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-all hover:opacity-90 text-white"
          style={{
            backgroundColor: neuTheme.colors.accent.primary,
            boxShadow: neuTheme.shadows.raisedSm,
          }}
          download
        >
          <Download className="w-4 h-4" />
          Download CSV
        </a>
        <a
          href={`/api/vbrick/export/pdf?sessionId=${sessionId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-colors"
          style={{
            color: neuTheme.colors.accent.primary,
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
          }}
          download
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {/* Call breakdown */}
      {calls.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-[10px] uppercase tracking-[0.15em] font-inter"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Call Breakdown
          </p>
          <div
            className="rounded-xl p-2"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.inset,
            }}
          >
            {calls.filter(c => c.status === 'completed').map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
              >
                {call.disposition ? (
                  <DispositionDot disposition={call.disposition} />
                ) : (
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: neuTheme.colors.text.subtle }}
                  />
                )}
                <span
                  className="text-sm font-inter flex-1 truncate"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  {call.contact_name}
                </span>
                {call.prospectStatus && (
                  <Badge variant={call.prospectStatus === 'active-opportunity' ? 'green' : call.prospectStatus === 'future-opportunity' ? 'cyan' : 'gray'}>
                    {call.prospectStatus.replace(/-/g, ' ')}
                  </Badge>
                )}
                <span
                  className={`font-fira-code text-sm ${call.spinScore ? scoreColorClass(call.spinScore) : ''}`}
                  style={!call.spinScore ? { color: neuTheme.colors.text.subtle } : undefined}
                >
                  {call.spinScore ? call.spinScore.toFixed(1) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
