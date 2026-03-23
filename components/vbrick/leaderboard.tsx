'use client'

import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { GlassCard } from './glass-card'
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
  if (value > 0.5) return <TrendingUp className="w-3.5 h-3.5 text-green-500" />
  if (value < -0.5) return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
  return <Minus className="w-3.5 h-3.5 text-gray-500" />
}

function KPIRow({
  label,
  value,
  trend,
  suffix,
  decimals,
  isLeading,
}: {
  label: string
  value: number
  trend: number
  suffix?: string
  decimals?: number
  isLeading: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-inter">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={`font-fira-code font-bold text-2xl ${
            isLeading ? 'text-[#7ed4f7]' : 'text-white'
          }`}
          style={isLeading ? { textShadow: '0 0 12px rgba(126,212,247,0.4)' } : undefined}
        >
          <CountUp value={value} decimals={decimals || 0} suffix={suffix} />
        </span>
        <TrendArrow value={trend} />
      </div>
    </div>
  )
}

export function Leaderboard({ players }: LeaderboardProps) {
  if (players.length < 2) return null

  const [a, b] = players

  const convLeader = a.convRate >= b.convRate ? 0 : 1
  const apptLeader = a.apptRate >= b.apptRate ? 0 : 1
  const spinLeader = a.spinAvg >= b.spinAvg ? 0 : 1

  return (
    <GlassCard title="Head-to-Head">
      <div className="flex items-stretch gap-6">
        {/* Player A */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="font-inter font-black text-xl uppercase tracking-wide text-white mb-4 text-center">
            {a.name}
          </h3>
          <KPIRow label="Answer to Conversation Rate" value={a.convRate} trend={a.convTrend} suffix="%" isLeading={convLeader === 0} />
          <KPIRow label="Conversation to Appointment Rate" value={a.apptRate} trend={a.apptTrend} suffix="%" isLeading={apptLeader === 0} />
          <KPIRow label="SPIN Average" value={a.spinAvg} trend={a.spinTrend} decimals={1} isLeading={spinLeader === 0} />
        </motion.div>

        {/* VS */}
        <div className="flex items-center px-2">
          <span className="font-inter font-black text-3xl text-[#7ed4f7] opacity-60">
            VS
          </span>
        </div>

        {/* Player B */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-inter font-black text-xl uppercase tracking-wide text-white mb-4 text-center">
            {b.name}
          </h3>
          <KPIRow label="Answer to Conversation Rate" value={b.convRate} trend={b.convTrend} suffix="%" isLeading={convLeader === 1} />
          <KPIRow label="Conversation to Appointment Rate" value={b.apptRate} trend={b.apptTrend} suffix="%" isLeading={apptLeader === 1} />
          <KPIRow label="SPIN Average" value={b.spinAvg} trend={b.spinTrend} decimals={1} isLeading={spinLeader === 1} />
        </motion.div>
      </div>

      <p className="text-[10px] text-gray-600 font-inter text-center mt-4">
        Week resets Monday
      </p>
    </GlassCard>
  )
}
