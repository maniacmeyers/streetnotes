'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Phone } from 'lucide-react'
import { DispositionDot, Badge } from './badge'
import { scoreColorClass } from '@/lib/vbrick/colors'
import type { CallDisposition, ProspectStatus } from '@/lib/debrief/types'

export interface RecentCall {
  id: string
  contactName: string
  company: string
  disposition: CallDisposition
  prospectStatus?: ProspectStatus
  spinScore?: number
  timestamp: string
  debriefSessionId?: string
}

function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function statusVariant(status?: ProspectStatus): 'cyan' | 'green' | 'amber' | 'red' | 'gray' {
  if (!status) return 'gray'
  switch (status) {
    case 'active-opportunity': return 'green'
    case 'future-opportunity': return 'cyan'
    case 'needs-more-info': return 'amber'
    case 'not-a-fit': return 'red'
    case 'referred-elsewhere': return 'gray'
    default: return 'gray'
  }
}

function statusLabel(status?: ProspectStatus): string {
  if (!status) return ''
  return status.replace(/-/g, ' ')
}

export function RecentCalls({ calls }: { calls: RecentCall[] }) {
  if (calls.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <Phone className="w-6 h-6 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-sm font-inter">No recent calls</p>
        <p className="text-slate-600 text-xs font-inter mt-1">
          Debriefed calls will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {calls.map((call) => (
          <motion.div
            key={call.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200 cursor-default"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <DispositionDot disposition={call.disposition} />

            <div className="flex-1 min-w-0">
              <p className="text-white font-inter font-semibold text-sm truncate">
                {call.contactName}
              </p>
              <p className="text-slate-500 text-xs font-inter truncate">
                {call.company}
              </p>
            </div>

            {call.prospectStatus && (
              <Badge variant={statusVariant(call.prospectStatus)}>
                {statusLabel(call.prospectStatus)}
              </Badge>
            )}

            <span
              className={`font-fira-code font-bold text-sm min-w-[32px] text-right ${
                call.spinScore ? scoreColorClass(call.spinScore) : 'text-slate-600'
              }`}
            >
              {call.spinScore ? call.spinScore.toFixed(1) : '—'}
            </span>

            <span className="text-slate-600 text-xs font-fira-code min-w-[50px] text-right">
              {formatRelativeTime(call.timestamp)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
