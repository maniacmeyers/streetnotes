'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Phone, SkipForward, CheckCircle2 } from 'lucide-react'
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
        <span className="text-[11px] uppercase tracking-[0.2em] text-blue-400 font-inter font-medium">
          Session — {totalCount} Calls
        </span>
        <button
          onClick={onEndSession}
          className="text-xs text-slate-500 hover:text-white font-inter uppercase tracking-wider cursor-pointer transition-colors duration-200"
        >
          End Session
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
            boxShadow: '0 0 8px rgba(59,130,246,0.3)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <p className="text-xs text-slate-500 font-fira-code">
        {completedCount} of {totalCount} completed
      </p>

      {/* Up Next card */}
      {upNext && (
        <div
          className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-5"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <p className="text-[10px] uppercase tracking-[0.15em] text-blue-400 font-inter mb-2">
            Up Next
          </p>
          <h3 className="text-white font-inter font-bold text-lg">
            {upNext.contact_name}
          </h3>
          {upNext.contact_title && (
            <p className="text-slate-400 text-sm font-inter">
              {upNext.contact_title} — {upNext.company}
            </p>
          )}
          {!upNext.contact_title && (
            <p className="text-slate-400 text-sm font-inter">{upNext.company}</p>
          )}

          {upNext.phone && (
            <a
              href={`tel:${upNext.phone}`}
              className="text-blue-400 font-fira-code text-lg mt-2 inline-block cursor-pointer hover:text-blue-300 transition-colors"
            >
              <Phone className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {upNext.phone}
            </a>
          )}

          {upNext.salesforce_notes && (
            <p className="text-slate-500 text-xs font-inter mt-2 italic">
              {upNext.salesforce_notes}
            </p>
          )}

          <button
            onClick={() => onSkip(upNext.id)}
            className="mt-3 text-slate-500 text-xs font-inter hover:text-slate-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <SkipForward className="w-3 h-3" />
            Skip
          </button>
        </div>
      )}

      {!upNext && completedCount > 0 && (
        <div className="text-center py-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-white font-inter font-bold text-sm">All calls completed</p>
          <button
            onClick={onEndSession}
            className="mt-4 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
          >
            End Session — Generate Report
          </button>
        </div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Completed calls */}
      {completed.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-inter mb-2">
            Completed
          </p>
          <AnimatePresence>
            {completed.map((item) => (
              <motion.div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02]"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.disposition ? (
                  <DispositionDot disposition={item.disposition} />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                )}
                <span className="text-white text-sm font-inter flex-1 truncate">
                  {item.contact_name}
                </span>
                {item.prospectStatus && (
                  <Badge variant={statusVariant(item.prospectStatus)}>
                    {item.prospectStatus.replace(/-/g, ' ')}
                  </Badge>
                )}
                <span className={`font-fira-code text-sm ${item.spinScore ? scoreColorClass(item.spinScore) : 'text-slate-600'}`}>
                  {item.spinScore ? item.spinScore.toFixed(1) : '—'}
                </span>
                <span className="text-slate-500 text-xs font-fira-code">
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
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent my-2" />
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-inter mb-2">
            Remaining
          </p>
          {remaining.map((item) => (
            <button
              key={item.id}
              onClick={() => onJumpTo(item.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-50 hover:opacity-80 hover:bg-white/[0.03] transition-all duration-200 cursor-pointer w-full text-left"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
              <span className="text-white text-sm font-inter flex-1 truncate">
                {item.contact_name}
              </span>
              <span className="text-slate-500 text-xs font-inter truncate">
                {item.company}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
