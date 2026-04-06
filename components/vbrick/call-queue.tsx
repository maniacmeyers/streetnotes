'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Phone, SkipForward, CheckCircle2 } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { DispositionDot, Badge } from './badge'
import { scoreColorClass } from '@/lib/vbrick/colors'
import type { CallDisposition, ProspectStatus } from '@/lib/debrief/types'

export interface QueueItem {
  id: string
  contact_name: string
  contact_title: string | null
  company: string
  phone: string | null
  salesforce_notes: string | null
  extra_fields: Record<string, string> | null
  queue_position: number
  status: 'pending' | 'completed' | 'skipped'
  debrief_session_id: string | null
  completed_at: string | null
  // Populated from debrief data when available:
  disposition?: CallDisposition
  prospectStatus?: ProspectStatus
  spinScore?: number
}

interface CallQueueProps {
  queue: QueueItem[]
  totalCount: number
  completedCount: number
  onSkip: (itemId: string) => void
  onJumpTo: (itemId: string) => void
  onEndSession: () => void
}

function formatTime(ts: string | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function statusVariant(status?: ProspectStatus): 'cyan' | 'green' | 'amber' | 'red' | 'gray' {
  if (!status) return 'gray'
  switch (status) {
    case 'active-opportunity': return 'green'
    case 'future-opportunity': return 'cyan'
    case 'needs-more-info': return 'amber'
    case 'not-a-fit': return 'red'
    default: return 'gray'
  }
}

export function CallQueue({
  queue,
  totalCount,
  completedCount,
  onSkip,
  onJumpTo,
  onEndSession,
}: CallQueueProps) {
  const upNext = queue.find(q => q.status === 'pending')
  const completed = queue.filter(q => q.status === 'completed' || q.status === 'skipped')
  const remaining = queue.filter(q => q.status === 'pending' && q.id !== upNext?.id)
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Queue header */}
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] uppercase tracking-[0.2em] font-inter font-medium"
          style={{ color: neuTheme.colors.accent.primary }}
        >
          Session — {totalCount} Calls
        </span>
        <button
          onClick={onEndSession}
          className="text-xs font-inter uppercase tracking-wider cursor-pointer transition-colors duration-200"
          style={{ color: neuTheme.colors.text.muted }}
          onMouseEnter={(e) => { e.currentTarget.style.color = neuTheme.colors.text.heading }}
          onMouseLeave={(e) => { e.currentTarget.style.color = neuTheme.colors.text.muted }}
        >
          End Session
        </button>
      </div>

      {/* Progress bar — inset track + raised fill */}
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.insetSm,
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${neuTheme.colors.accent.primary}, ${neuTheme.colors.accent.hover})`,
            boxShadow: '1px 1px 3px #a3b1c6, -1px -1px 3px #ffffff',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <p className="text-xs font-fira-code" style={{ color: neuTheme.colors.text.muted }}>
        {completedCount} of {totalCount} completed
      </p>

      {/* Up Next card — raised neumorphic */}
      {upNext && (
        <div
          className="rounded-xl p-5"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raised,
            borderLeft: `3px solid ${neuTheme.colors.accent.primary}`,
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.15em] font-inter mb-2"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            Up Next
          </p>
          <h3
            className="font-inter font-bold text-lg"
            style={{ color: neuTheme.colors.text.heading }}
          >
            {upNext.contact_name}
          </h3>
          {upNext.contact_title && (
            <p className="text-sm font-inter" style={{ color: neuTheme.colors.text.muted }}>
              {upNext.contact_title} — {upNext.company}
            </p>
          )}
          {!upNext.contact_title && (
            <p className="text-sm font-inter" style={{ color: neuTheme.colors.text.muted }}>
              {upNext.company}
            </p>
          )}

          {upNext.phone && (
            <a
              href={`tel:${upNext.phone}`}
              className="font-fira-code text-lg mt-2 inline-block cursor-pointer transition-colors"
              style={{ color: neuTheme.colors.accent.primary }}
              onMouseEnter={(e) => { e.currentTarget.style.color = neuTheme.colors.accent.hover }}
              onMouseLeave={(e) => { e.currentTarget.style.color = neuTheme.colors.accent.primary }}
            >
              <Phone className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {upNext.phone}
            </a>
          )}

          {upNext.salesforce_notes && (
            <p
              className="text-xs font-inter mt-2 italic"
              style={{ color: neuTheme.colors.text.muted }}
            >
              {upNext.salesforce_notes}
            </p>
          )}

          {upNext.extra_fields && Object.keys(upNext.extra_fields).length > 0 && (
            <div className="mt-2 space-y-0.5">
              {Object.entries(upNext.extra_fields).map(([key, value]) => (
                <p key={key} className="text-xs font-inter" style={{ color: neuTheme.colors.text.muted }}>
                  <span style={{ color: neuTheme.colors.text.body }}>{key}:</span> {value}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={() => onSkip(upNext.id)}
            className="mt-3 text-xs font-inter transition-colors cursor-pointer flex items-center gap-1"
            style={{ color: neuTheme.colors.text.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.color = neuTheme.colors.text.body }}
            onMouseLeave={(e) => { e.currentTarget.style.color = neuTheme.colors.text.muted }}
          >
            <SkipForward className="w-3 h-3" />
            Skip
          </button>
        </div>
      )}

      {!upNext && completedCount > 0 && (
        <div className="text-center py-6">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: neuTheme.colors.score.green }} />
          <p
            className="font-inter font-bold text-sm"
            style={{ color: neuTheme.colors.text.heading }}
          >
            All calls completed
          </p>
          <button
            onClick={onEndSession}
            className="mt-4 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 text-white"
            style={{
              backgroundColor: neuTheme.colors.accent.primary,
              boxShadow: neuTheme.shadows.raisedSm,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = neuTheme.colors.accent.hover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = neuTheme.colors.accent.primary }}
          >
            End Session — Generate Report
          </button>
        </div>
      )}

      <div
        className="h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
        }}
      />

      {/* Completed calls */}
      {completed.length > 0 && (
        <div className="space-y-1">
          <p
            className="text-[10px] uppercase tracking-[0.15em] font-inter mb-2"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Completed
          </p>
          <AnimatePresence>
            {completed.map((item) => (
              <motion.div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  background: neuTheme.colors.bg,
                  boxShadow: neuTheme.shadows.raisedSm,
                }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.disposition ? (
                  <DispositionDot disposition={item.disposition} />
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
                  {item.contact_name}
                </span>
                {item.prospectStatus && (
                  <Badge variant={statusVariant(item.prospectStatus)}>
                    {item.prospectStatus.replace(/-/g, ' ')}
                  </Badge>
                )}
                <span className={`font-fira-code text-sm ${item.spinScore ? scoreColorClass(item.spinScore) : ''}`}
                  style={!item.spinScore ? { color: neuTheme.colors.text.subtle } : undefined}
                >
                  {item.spinScore ? item.spinScore.toFixed(1) : '—'}
                </span>
                <span className="text-xs font-fira-code" style={{ color: neuTheme.colors.text.muted }}>
                  {formatTime(item.completed_at)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Remaining queue */}
      {remaining.length > 0 && (
        <div className="space-y-1">
          <div
            className="h-px my-2"
            style={{
              background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
            }}
          />
          <p
            className="text-[10px] uppercase tracking-[0.15em] font-inter mb-2"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Remaining
          </p>
          {remaining.map((item) => (
            <button
              key={item.id}
              onClick={() => onJumpTo(item.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-50 hover:opacity-80 transition-all duration-200 cursor-pointer w-full text-left"
              style={{ background: neuTheme.colors.bg }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = neuTheme.shadows.raisedSm }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: neuTheme.colors.text.subtle }}
              />
              <span
                className="text-sm font-inter flex-1 truncate"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {item.contact_name}
              </span>
              <span className="text-xs font-inter truncate" style={{ color: neuTheme.colors.text.muted }}>
                {item.company}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
