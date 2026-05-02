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
  if (value > 0.5) return <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" style={{ color: neuTheme.colors.score.green }} />
  if (value < -0.5) return <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" style={{ color: neuTheme.colors.score.red }} />
  return <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" style={{ color: neuTheme.colors.text.subtle }} />
}

function PlayerAvatar({ name, isLeading, size = 40 }: { name: string; isLeading: boolean; size?: number }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
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

interface PlayerStats {
  name: string
  isLeading: boolean
  elevator: { value: number; trend: number; lead: boolean }
  objection: { value: number; trend: number; lead: boolean }
  customer: { value: number; trend: number; lead: boolean }
}

function MetricLine({
  label,
  value,
  trend,
  lead,
  decimals = 0,
}: {
  label: string
  value: number
  trend: number
  lead: boolean
  decimals?: number
}) {
  return (
    <div className="flex items-center justify-between py-1 min-w-0">
      <span
        className="text-[10px] uppercase tracking-[0.1em] font-inter truncate pr-2"
        style={{ color: neuTheme.colors.text.muted }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <TrendArrow value={trend} />
        <span
          className="font-fira-code font-bold text-base tabular-nums"
          style={{
            color: lead ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
          }}
        >
          <CountUp value={value} decimals={decimals} />
        </span>
      </div>
    </div>
  )
}

function PlayerStatBlock({ player, delay }: { player: PlayerStats; delay: number }) {
  return (
    <motion.div
      className="flex gap-3 items-start min-w-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <PlayerAvatar name={player.name} isLeading={player.isLeading} size={40} />
      <div className="flex-1 min-w-0">
        <h4
          className="font-inter font-black text-sm uppercase tracking-tight truncate mb-1"
          style={{ color: neuTheme.colors.text.heading }}
        >
          {player.name}
        </h4>
        <MetricLine label="Elevator Pitch" value={player.elevator.value} trend={player.elevator.trend} lead={player.elevator.lead} />
        <MetricLine label="Objection" value={player.objection.value} trend={player.objection.trend} lead={player.objection.lead} />
        <MetricLine label="Customer Story" value={player.customer.value} trend={player.customer.trend} lead={player.customer.lead} />
      </div>
    </motion.div>
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

function DesktopMetricRow({ label, valueA, valueB, trendA, trendB, decimals, delay }: MetricRowProps) {
  const aLeads = valueA > valueB
  const bLeads = valueB > valueA

  return (
    <motion.div
      className="hidden sm:grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center gap-2 justify-end">
        <TrendArrow value={trendA} />
        <span
          className="font-fira-code font-bold text-xl tabular-nums"
          style={{ color: aLeads ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted }}
        >
          <CountUp value={valueA} decimals={decimals || 0} />
        </span>
      </div>
      <span
        className="text-[10px] uppercase tracking-[0.12em] font-inter text-center px-1"
        style={{ color: neuTheme.colors.text.muted, minWidth: 140 }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="font-fira-code font-bold text-xl tabular-nums"
          style={{ color: bLeads ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted }}
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

  const aStats: PlayerStats = {
    name: a.name,
    isLeading: aWins > bWins,
    elevator: { value: a.elevatorPitch, trend: a.elevatorTrend, lead: a.elevatorPitch > b.elevatorPitch },
    objection: { value: a.objectionHandling, trend: a.objectionTrend, lead: a.objectionHandling > b.objectionHandling },
    customer: { value: a.customerStory, trend: a.customerTrend, lead: a.customerStory > b.customerStory },
  }

  const bStats: PlayerStats = {
    name: b.name,
    isLeading: bWins > aWins,
    elevator: { value: b.elevatorPitch, trend: b.elevatorTrend, lead: b.elevatorPitch > a.elevatorPitch },
    objection: { value: b.objectionHandling, trend: b.objectionTrend, lead: b.objectionHandling > a.objectionHandling },
    customer: { value: b.customerStory, trend: b.customerTrend, lead: b.customerStory > a.customerStory },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full min-w-0"
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
          boxSizing: 'border-box',
        }}
      >
        {/* ─── Mobile: stacked per-player blocks ─── */}
        <div className="sm:hidden space-y-4">
          <PlayerStatBlock player={aStats} delay={0.3} />
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
            }}
          />
          <PlayerStatBlock player={bStats} delay={0.4} />
          <p
            className="text-[9px] font-inter text-center pt-1"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Practice sessions this week · Resets Monday
          </p>
        </div>

        {/* ─── Desktop: original head-to-head row ─── */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 mb-2">
            <motion.div
              className="flex flex-col items-end gap-1 min-w-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <PlayerAvatar name={a.name} isLeading={aWins > bWins} size={48} />
              <h4
                className="font-inter font-black text-lg uppercase tracking-wide truncate w-full text-right"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {a.name}
              </h4>
            </motion.div>
            <motion.span
              className="font-inter font-black text-2xl px-2"
              style={{ color: neuTheme.colors.text.subtle }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4, type: 'spring' }}
            >
              VS
            </motion.span>
            <motion.div
              className="flex flex-col items-start gap-1 min-w-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <PlayerAvatar name={b.name} isLeading={bWins > aWins} size={48} />
              <h4
                className="font-inter font-black text-lg uppercase tracking-wide truncate w-full text-left"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {b.name}
              </h4>
            </motion.div>
          </div>

          <div
            className="h-px my-3"
            style={{
              background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
            }}
          />

          <DesktopMetricRow
            label="Elevator Pitch"
            valueA={a.elevatorPitch}
            valueB={b.elevatorPitch}
            trendA={a.elevatorTrend}
            trendB={b.elevatorTrend}
            delay={0.5}
          />
          <DesktopMetricRow
            label="Objection Handling"
            valueA={a.objectionHandling}
            valueB={b.objectionHandling}
            trendA={a.objectionTrend}
            trendB={b.objectionTrend}
            delay={0.6}
          />
          <DesktopMetricRow
            label="Customer Stories"
            valueA={a.customerStory}
            valueB={b.customerStory}
            trendA={a.customerTrend}
            trendB={b.customerTrend}
            delay={0.7}
          />

          <p
            className="text-[10px] font-inter text-center mt-4"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Practice sessions this week · Resets Monday
          </p>
        </div>
      </div>
    </motion.div>
  )
}
