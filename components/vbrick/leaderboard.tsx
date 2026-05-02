'use client'

import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { CountUp } from './count-up'

interface PlayerKPIs {
  name: string
  elevatorPitch: number
  objectionHandling: number
  customerStory: number
  elevatorTrend: number
  objectionTrend: number
  customerTrend: number
}

interface LeaderboardProps {
  players: PlayerKPIs[]
}

function TrendArrow({ value }: { value: number }) {
  if (value > 0.5) return <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: neuTheme.colors.score.green }} />
  if (value < -0.5) return <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: neuTheme.colors.score.red }} />
  return <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: neuTheme.colors.text.subtle }} />
}

function PlayerAvatar({ name, isLeading, size = 48 }: { name: string; isLeading: boolean; size?: number }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="rounded-full flex items-center justify-center font-inter font-bold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          ...(isLeading
            ? {
                background: `linear-gradient(135deg, ${neuTheme.colors.accent.primary}, ${neuTheme.colors.accent.hover})`,
                color: '#ffffff',
              }
            : {
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raisedSm,
                color: neuTheme.colors.text.muted,
              }),
        }}
      >
        {initial}
      </div>
      {isLeading && (
        <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 -right-1" />
      )}
    </div>
  )
}

interface MetricRowProps {
  label: string
  valueA: number
  valueB: number
  trendA: number
  trendB: number
  decimals?: number
  delay: number
}

function MetricRow({ label, valueA, valueB, trendA, trendB, decimals, delay }: MetricRowProps) {
  const aLeads = valueA > valueB
  const bLeads = valueB > valueA

  return (
    <motion.div
      className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 py-2 sm:py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Player A */}
      <div className="flex items-center gap-1 justify-end overflow-hidden">
        <TrendArrow value={trendA} />
        <span
          className="font-fira-code font-bold text-base sm:text-xl tabular-nums"
          style={{
            color: aLeads ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
          }}
        >
          <CountUp value={valueA} decimals={decimals || 0} />
        </span>
      </div>

      {/* Label */}
      <span
        className="text-[9px] sm:text-[10px] uppercase tracking-[0.08em] sm:tracking-[0.12em] font-inter text-center px-0.5 sm:px-1 leading-tight"
        style={{ color: neuTheme.colors.text.muted, maxWidth: 110 }}
      >
        {label}
      </span>

      {/* Player B */}
      <div className="flex items-center gap-1 overflow-hidden">
        <span
          className="font-fira-code font-bold text-base sm:text-xl tabular-nums"
          style={{
            color: bLeads ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
          }}
        >
          <CountUp value={valueB} decimals={decimals || 0} />
        </span>
        <TrendArrow value={trendB} />
      </div>
    </motion.div>
  )
}

export function Leaderboard({ players }: LeaderboardProps) {
  if (players.length < 2) return null

  const [a, b] = players

  const aWins = [
    a.elevatorPitch > b.elevatorPitch,
    a.objectionHandling > b.objectionHandling,
    a.customerStory > b.customerStory,
  ].filter(Boolean).length
  const bWins = [
    b.elevatorPitch > a.elevatorPitch,
    b.objectionHandling > a.objectionHandling,
    b.customerStory > a.customerStory,
  ].filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3
        className="text-[11px] uppercase tracking-[0.2em] font-inter font-medium mb-3"
        style={{ color: neuTheme.colors.accent.primary }}
      >
        Head-to-Head
      </h3>

      <div
        className="rounded-2xl p-3 sm:p-6 overflow-hidden relative w-full"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
        }}
      >
        {/* Header — same 3-col grid as metric rows so columns align */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 mb-2">
          <motion.div
            className="flex flex-col items-end gap-1 min-w-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <PlayerAvatar name={a.name} isLeading={aWins > bWins} size={40} />
            <h4
              className="font-inter font-black text-xs sm:text-lg uppercase tracking-tight sm:tracking-wide truncate w-full text-right"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {a.name}
            </h4>
          </motion.div>

          <motion.span
            className="font-inter font-black text-sm sm:text-2xl px-1"
            style={{ color: neuTheme.colors.text.subtle }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4, type: 'spring' }}
          >
            VS
          </motion.span>

          <motion.div
            className="flex flex-col items-start gap-1 min-w-0"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <PlayerAvatar name={b.name} isLeading={bWins > aWins} size={40} />
            <h4
              className="font-inter font-black text-xs sm:text-lg uppercase tracking-tight sm:tracking-wide truncate w-full text-left"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {b.name}
            </h4>
          </motion.div>
        </div>

        <div
          className="h-px my-2 sm:my-3"
          style={{
            background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
          }}
        />

        <MetricRow
          label="Elevator Pitch"
          valueA={a.elevatorPitch}
          valueB={b.elevatorPitch}
          trendA={a.elevatorTrend}
          trendB={b.elevatorTrend}
          delay={0.5}
        />
        <MetricRow
          label="Objection"
          valueA={a.objectionHandling}
          valueB={b.objectionHandling}
          trendA={a.objectionTrend}
          trendB={b.objectionTrend}
          delay={0.6}
        />
        <MetricRow
          label="Customer Story"
          valueA={a.customerStory}
          valueB={b.customerStory}
          trendA={a.customerTrend}
          trendB={b.customerTrend}
          delay={0.7}
        />

        <motion.p
          className="text-[9px] sm:text-[10px] font-inter text-center mt-3 sm:mt-4"
          style={{ color: neuTheme.colors.text.muted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          Practice sessions this week · Resets Monday
        </motion.p>
      </div>
    </motion.div>
  )
}
