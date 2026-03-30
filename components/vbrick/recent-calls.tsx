'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Phone } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
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
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
        }}
      >
        <Phone className="w-6 h-6 mx-auto mb-2" style={{ color: neuTheme.colors.text.subtle }} />
        <p className="text-sm font-inter" style={{ color: neuTheme.colors.text.muted }}>
          No recent calls
        </p>
        <p className="text-xs font-inter mt-1" style={{ color: neuTheme.colors.text.subtle }}>
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-default transition-all duration-200"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.raisedSm,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            layout
            whileHover={{ boxShadow: neuTheme.shadows.raised }}
          >
            <DispositionDot disposition={call.disposition} />

            <div className="flex-1 min-w-0">
              <p
                className="font-inter font-semibold text-sm truncate"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {call.contactName}
              </p>
              <p
                className="text-xs font-inter truncate"
                style={{ color: neuTheme.colors.text.muted }}
              >
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
                call.spinScore ? scoreColorClass(call.spinScore) : ''
              }`}
              style={!call.spinScore ? { color: neuTheme.colors.text.subtle } : undefined}
            >
              {call.spinScore ? call.spinScore.toFixed(1) : '—'}
            </span>

            <span
              className="text-xs font-fira-code min-w-[50px] text-right"
              style={{ color: neuTheme.colors.text.subtle }}
            >
              {formatRelativeTime(call.timestamp)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
