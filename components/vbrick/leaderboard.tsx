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
  delay,
}: {
  label: string
  value: number
  trend: number
  suffix?: string
  decimals?: number
  isLeading: boolean
  delay: number
}) {
  return (
    <motion.div
      className="flex items-center justify-between py-2"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
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
    </motion.div>
  )
}

export function Leaderboard({ players }: LeaderboardProps) {
  if (players.length < 2) return null

  const [a, b] = players

  const convLeader = a.convRate >= b.convRate ? 0 : 1
  const apptLeader = a.apptRate >= b.apptRate ? 0 : 1
  const spinLeader = a.spinAvg >= b.spinAvg ? 0 : 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <GlassCard title="Head-to-Head">
        <div className="flex items-stretch gap-6">
          {/* Player A */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <h3 className="font-inter font-black text-xl uppercase tracking-wide text-white mb-4 text-center">
              {a.name}
            </h3>
            <KPIRow label="Answer to Conversation Rate" value={a.convRate} trend={a.convTrend} suffix="%" isLeading={convLeader === 0} delay={0.5} />
            <KPIRow label="Conversation to Appointment Rate" value={a.apptRate} trend={a.apptTrend} suffix="%" isLeading={apptLeader === 0} delay={0.6} />
            <KPIRow label="SPIN Average" value={a.spinAvg} trend={a.spinTrend} decimals={1} isLeading={spinLeader === 0} delay={0.7} />
          </motion.div>

          {/* VS — animated entrance with subtle pulse */}
          <motion.div
            className="flex items-center px-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: 'spring', stiffness: 200, damping: 12 }}
          >
            <style>{`
              @keyframes vs-glow {
                0%, 100% { text-shadow: 0 0 15px rgba(126,212,247,0.3); }
                50% { text-shadow: 0 0 30px rgba(126,212,247,0.6), 0 0 60px rgba(126,212,247,0.2); }
              }
              @media (prefers-reduced-motion: reduce) {
                .vs-text { animation: none !important; }
              }
            `}</style>
            <span
              className="vs-text font-inter font-black text-4xl text-[#7ed4f7]"
              style={{ animation: 'vs-glow 3s ease-in-out infinite' }}
            >
              VS
            </span>
          </motion.div>

          {/* Player B */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <h3 className="font-inter font-black text-xl uppercase tracking-wide text-white mb-4 text-center">
              {b.name}
            </h3>
            <KPIRow label="Answer to Conversation Rate" value={b.convRate} trend={b.convTrend} suffix="%" isLeading={convLeader === 1} delay={0.5} />
            <KPIRow label="Conversation to Appointment Rate" value={b.apptRate} trend={b.apptTrend} suffix="%" isLeading={apptLeader === 1} delay={0.6} />
            <KPIRow label="SPIN Average" value={b.spinAvg} trend={b.spinTrend} decimals={1} isLeading={spinLeader === 1} delay={0.7} />
          </motion.div>
        </div>

        <motion.p
          className="text-[10px] text-gray-600 font-inter text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          Week resets Monday
        </motion.p>
      </GlassCard>
    </motion.div>
  )
}
