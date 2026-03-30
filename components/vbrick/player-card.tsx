'use client'

import { motion } from 'motion/react'
import { Flame } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { scoreColorClass } from '@/lib/vbrick/colors'
import { CountUp } from './count-up'

interface PlayerCardProps {
  name: string
  title?: string
  streak: number
  todayCalls: number
  spinAvg: number
  compact?: boolean
  showStats?: boolean
}

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: `linear-gradient(135deg, ${neuTheme.colors.accent.primary}, ${neuTheme.colors.accent.hover})`,
      }}
    >
      <span className="text-white font-inter font-bold text-sm">{initial}</span>
    </div>
  )
}

export function PlayerCard({
  name,
  title = 'BDR — Vbrick',
  streak,
  todayCalls,
  spinAvg,
  compact = false,
  showStats = true,
}: PlayerCardProps) {
  const streakActive = streak > 0

  if (compact) {
    return (
      <motion.div
        className="rounded-xl p-4"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
          borderLeft: `3px solid ${neuTheme.colors.accent.primary}`,
        }}
        layout
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div className="flex-1 min-w-0">
            <span
              className="font-inter font-bold text-base block truncate"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {name}
            </span>
            <span
              className="font-fira-code text-xs"
              style={{ color: neuTheme.colors.text.muted }}
            >
              {todayCalls} calls today
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-xl p-5"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raised,
        borderLeft: `3px solid ${neuTheme.colors.accent.primary}`,
      }}
      layout
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={name} />
        <div>
          <h2
            className="font-inter font-bold text-lg"
            style={{ color: neuTheme.colors.text.heading }}
          >
            {name}
          </h2>
          <p className="text-xs font-inter" style={{ color: neuTheme.colors.text.muted }}>
            {title}
          </p>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-3 gap-2">
          {/* Streak */}
          <div
            className="rounded-lg p-3 text-center"
            style={{ boxShadow: neuTheme.shadows.insetSm, background: neuTheme.colors.bg }}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Flame
                className="w-3.5 h-3.5"
                style={{ color: streakActive ? neuTheme.colors.accent.primary : neuTheme.colors.text.subtle }}
              />
              <span
                className="font-fira-code font-bold text-base"
                style={{ color: neuTheme.colors.text.heading }}
              >
                <CountUp value={streak} />
              </span>
            </div>
            <span
              className="text-[9px] uppercase tracking-widest font-inter"
              style={{ color: neuTheme.colors.text.muted }}
            >
              days
            </span>
          </div>

          {/* Today */}
          <div
            className="rounded-lg p-3 text-center"
            style={{ boxShadow: neuTheme.shadows.insetSm, background: neuTheme.colors.bg }}
          >
            <div className="mb-0.5">
              <span
                className="font-fira-code font-bold text-base"
                style={{ color: neuTheme.colors.text.heading }}
              >
                <CountUp value={todayCalls} />
              </span>
            </div>
            <span
              className="text-[9px] uppercase tracking-widest font-inter"
              style={{ color: neuTheme.colors.text.muted }}
            >
              today
            </span>
          </div>

          {/* SPIN avg */}
          <div
            className="rounded-lg p-3 text-center"
            style={{ boxShadow: neuTheme.shadows.insetSm, background: neuTheme.colors.bg }}
          >
            <div className="mb-0.5">
              <span className={`font-fira-code font-bold text-base ${scoreColorClass(spinAvg)}`}>
                <CountUp value={spinAvg} decimals={1} />
              </span>
            </div>
            <span
              className="text-[9px] uppercase tracking-widest font-inter"
              style={{ color: neuTheme.colors.text.muted }}
            >
              SPIN
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
