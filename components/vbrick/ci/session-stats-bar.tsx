'use client'

import { motion } from 'motion/react'
import { Phone, MessageSquare, Calendar } from 'lucide-react'
import { NeuCard } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'

interface SessionStatsBarProps {
  dials: number
  conversations: number
  meetings: number
  loading?: boolean
}

interface StatConfig {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

function StatBox({ label, value, icon, color, delay }: StatConfig & { delay: number }) {
  return (
    <NeuCard hover padding="md" radius="lg" className="flex-1 min-w-0">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${color}18`,
            boxShadow: neuTheme.shadows.insetSm,
          }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p
            className="font-satoshi text-[11px] uppercase tracking-widest mb-0.5"
            style={{ color: neuTheme.colors.text.muted }}
          >
            {label}
          </p>
          <motion.p
            className="font-general-sans font-bold text-2xl leading-none tabular-nums"
            style={{ color: neuTheme.colors.text.heading }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
          >
            {value}
          </motion.p>
        </div>
      </div>
    </NeuCard>
  )
}

export function SessionStatsBar({ dials, conversations, meetings, loading }: SessionStatsBarProps) {
  if (loading) {
    return (
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <NeuCard key={i} hover={false} padding="md" radius="lg" className="flex-1">
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl" style={{ background: neuTheme.colors.shadow }} />
              <div className="space-y-2 flex-1">
                <div className="h-2 rounded-full w-12" style={{ background: neuTheme.colors.shadow }} />
                <div className="h-5 rounded-full w-8" style={{ background: neuTheme.colors.shadow }} />
              </div>
            </div>
          </NeuCard>
        ))}
      </div>
    )
  }

  const stats: StatConfig[] = [
    {
      label: 'Dials',
      value: dials,
      icon: <Phone size={18} />,
      color: neuTheme.colors.accent.primary,
    },
    {
      label: 'Convos',
      value: conversations,
      icon: <MessageSquare size={18} />,
      color: neuTheme.colors.status.warning,
    },
    {
      label: 'Meetings',
      value: meetings,
      icon: <Calendar size={18} />,
      color: neuTheme.colors.status.success,
    },
  ]

  return (
    <div className="flex gap-3">
      {stats.map((stat, idx) => (
        <StatBox key={stat.label} {...stat} delay={idx * 0.1} />
      ))}
    </div>
  )
}
