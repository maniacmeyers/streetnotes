'use client'

import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react'
import { CountUp } from './count-up'

interface PlayerKPIs {
  name: string
  convRate: number
  apptRate: number
  spinAvg: number
  convTrend: number
  apptTrend: number
  spinTrend: number
}

interface LeaderboardProps {
  players: PlayerKPIs[]
}

function TrendArrow({ value }: { value: number }) {
  if (value > 0.5) return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
  if (value < -0.5) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />
  return <Minus className="w-3.5 h-3.5 text-slate-600" />
}

function PlayerAvatar({ name, isLeading }: { name: string; isLeading: boolean }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="relative">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-inter font-bold text-lg ${
          isLeading
            ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
            : 'bg-white/[0.06] text-slate-400 border border-white/[0.08]'
        }`}
      >
        {initial}
      </div>
      {isLeading && (
        <Crown className="w-4 h-4 text-amber-400 absolute -top-2 -right-1" />
      )}
    </div>
  )
}

function MetricRow({
  label,
  valueA,
  valueB,
  trendA,
  trendB,
  suffix,
  decimals,
  delay,
}: {
  label: string
  valueA: number
  valueB: number
  trendA: number
  trendB: number
  suffix?: string
  decimals?: number
  delay: number
}) {
  const aLeads = valueA > valueB
  const bLeads = valueB > valueA
  const tied = valueA === valueB

  return (
    <motion.div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Player A value */}
      <div className="flex items-center gap-2 justify-end">
        <TrendArrow value={trendA} />
        <span
          className={`font-fira-code font-bold text-xl tabular-nums ${
            aLeads ? 'text-blue-400' : tied ? 'text-white' : 'text-slate-400'
          }`}
        >
          <CountUp value={valueA} decimals={decimals || 0} suffix={suffix} />
        </span>
      </div>

      {/* Label */}
      <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500 font-inter text-center min-w-[140px]">
        {label}
      </span>

      {/* Player B value */}
      <div className="flex items-center gap-2">
        <span
          className={`font-fira-code font-bold text-xl tabular-nums ${
            bLeads ? 'text-blue-400' : tied ? 'text-white' : 'text-slate-400'
          }`}
        >
          <CountUp value={valueB} decimals={decimals || 0} suffix={suffix} />
        </span>
        <TrendArrow value={trendB} />
      </div>
    </motion.div>
  )
}

export function Leaderboard({ players }: LeaderboardProps) {
  if (players.length < 2) return null

  const [a, b] = players

  // Count total category wins
  const aWins = [
    a.convRate > b.convRate,
    a.apptRate > b.apptRate,
    a.spinAvg > b.spinAvg,
  ].filter(Boolean).length
  const bWins = [
    b.convRate > a.convRate,
    b.apptRate > a.apptRate,
    b.spinAvg > a.spinAvg,
  ].filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-blue-400 font-inter font-medium mb-3">
        Head-to-Head
      </h3>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden relative">
        {/* Subtle gradient accent */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.04) 0%, transparent 60%)',
          }}
        />

        <div className="relative">
          {/* Player names */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-2">
            <motion.div
              className="flex flex-col items-end gap-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <PlayerAvatar name={a.name} isLeading={aWins > bWins} />
              <h4 className="font-inter font-black text-lg uppercase tracking-wide text-white">
                {a.name}
              </h4>
            </motion.div>

            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4, type: 'spring' }}
            >
              <span className="font-inter font-black text-2xl text-slate-600">
                VS
              </span>
            </motion.div>

            <motion.div
              className="flex flex-col items-start gap-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <PlayerAvatar name={b.name} isLeading={bWins > aWins} />
              <h4 className="font-inter font-black text-lg uppercase tracking-wide text-white">
                {b.name}
              </h4>
            </motion.div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent my-3" />

          {/* Metrics */}
          <MetricRow
            label="Answer to Conversation"
            valueA={a.convRate}
            valueB={b.convRate}
            trendA={a.convTrend}
            trendB={b.convTrend}
            suffix="%"
            delay={0.5}
          />
          <MetricRow
            label="Conversation to Appt"
            valueA={a.apptRate}
            valueB={b.apptRate}
            trendA={a.apptTrend}
            trendB={b.apptTrend}
            suffix="%"
            delay={0.6}
          />
          <MetricRow
            label="SPIN Average"
            valueA={a.spinAvg}
            valueB={b.spinAvg}
            trendA={a.spinTrend}
            trendB={b.spinTrend}
            decimals={1}
            delay={0.7}
          />
        </div>

        <motion.p
          className="text-[10px] text-slate-600 font-inter text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          Week resets Monday
        </motion.p>
      </div>
    </motion.div>
  )
}
