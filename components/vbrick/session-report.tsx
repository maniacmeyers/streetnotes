'use client'

import { motion } from 'motion/react'
import { Download, X } from 'lucide-react'
import { GlassCardElevated } from './glass-card'
import { CountUp } from './count-up'
import { LuminousDivider } from './luminous-divider'
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
        className={`font-fira-code font-bold text-4xl ${
          highlight ? 'text-green-500' : 'text-white'
        }`}
        style={highlight ? { textShadow: '0 0 20px rgba(34,197,94,0.4)' } : undefined}
      >
        <CountUp value={value} decimals={decimals || 0} suffix={suffix} />
      </span>
      <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-inter mt-1">
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
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#7ed4f7] font-inter font-medium">
          Session Report
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors cursor-pointer"
          aria-label="Close report"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <GlassCardElevated>
        {/* Duration header */}
        <motion.p
          className="text-center text-gray-400 text-sm font-inter mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Session Duration: <span className="font-fira-code text-white">{duration}</span>
        </motion.p>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <StatReveal label="Total Calls" value={totalCalls} delay={0.3} />
          <StatReveal label="Connected" value={connectedCount} delay={0.45} />
          <StatReveal label="Appointments" value={appointmentsCount} delay={0.6} highlight={appointmentsCount > 0} />
        </div>

        <LuminousDivider className="my-4" />

        <div className="grid grid-cols-3 gap-6 mb-6">
          <StatReveal label="Conv Rate" value={convRate} suffix="%" delay={0.75} />
          <StatReveal label="Appt Rate" value={apptRate} suffix="%" delay={0.9} />
          <StatReveal label="Avg SPIN" value={averageSpin} decimals={1} delay={1.05} />
        </div>

        <LuminousDivider className="my-4" />

        {/* Best SPIN */}
        <motion.div
          className="text-center py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-inter mb-1">
            Best SPIN
          </p>
          <span
            className="font-fira-code font-bold text-5xl text-green-500"
            style={{ textShadow: '0 0 20px rgba(34,197,94,0.4)' }}
          >
            <CountUp value={bestSpin} decimals={1} />
          </span>
          {bestSpinContact && (
            <p className="text-gray-400 text-sm font-inter mt-1">{bestSpinContact}</p>
          )}
        </motion.div>
      </GlassCardElevated>

      {/* Export buttons */}
      <div className="flex gap-4">
        <a
          href={`/api/vbrick/export/csv?sessionId=${sessionId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#7ed4f7', color: '#061222' }}
          download
        >
          <Download className="w-4 h-4" />
          Download CSV
        </a>
        <a
          href={`/api/vbrick/export/pdf?sessionId=${sessionId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer border border-[#7ed4f7] text-[#7ed4f7] transition-colors hover:bg-[#7ed4f7]/10"
          download
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {/* Call breakdown */}
      {calls.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-inter">
            Call Breakdown
          </p>
          {calls.filter(c => c.status === 'completed').map((call) => (
            <div
              key={call.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02]"
            >
              {call.disposition ? (
                <DispositionDot disposition={call.disposition} />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-gray-600 inline-block" />
              )}
              <span className="text-white text-sm font-inter flex-1 truncate">
                {call.contact_name}
              </span>
              {call.prospectStatus && (
                <Badge variant={call.prospectStatus === 'active-opportunity' ? 'green' : call.prospectStatus === 'future-opportunity' ? 'cyan' : 'gray'}>
                  {call.prospectStatus.replace(/-/g, ' ')}
                </Badge>
              )}
              <span className={`font-fira-code text-sm ${call.spinScore ? scoreColorClass(call.spinScore) : 'text-gray-600'}`}>
                {call.spinScore ? call.spinScore.toFixed(1) : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
