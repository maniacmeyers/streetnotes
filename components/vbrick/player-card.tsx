'use client'

import { motion } from 'motion/react'
import { Flame } from 'lucide-react'
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
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
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
        className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4"
        style={{
          borderLeft: '3px solid #3B82F6',
          backdropFilter: 'blur(16px)',
        }}
        layout
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div className="flex-1 min-w-0">
            <span className="font-inter font-bold text-base text-white block truncate">
              {name}
            </span>
            <span className="font-fira-code text-xs text-slate-500">
              {todayCalls} calls today
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5"
      style={{
        borderLeft: '3px solid #3B82F6',
        backdropFilter: 'blur(16px)',
      }}
      layout
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={name} />
        <div>
          <h2 className="font-inter font-bold text-lg text-white">{name}</h2>
          <p className="text-slate-500 text-xs font-inter">{title}</p>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-3 gap-2">
          {/* Streak */}
          <div className="rounded-lg bg-white/[0.03] p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Flame
                className={`w-3.5 h-3.5 ${streakActive ? 'text-orange-400' : 'text-slate-600'}`}
              />
              <span className="font-fira-code font-bold text-base text-white">
                <CountUp value={streak} />
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-inter">
              days
            </span>
          </div>

          {/* Today */}
          <div className="rounded-lg bg-white/[0.03] p-3 text-center">
            <div className="mb-0.5">
              <span className="font-fira-code font-bold text-base text-white">
                <CountUp value={todayCalls} />
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-inter">
              today
            </span>
          </div>

          {/* SPIN avg */}
          <div className="rounded-lg bg-white/[0.03] p-3 text-center">
            <div className="mb-0.5">
              <span className={`font-fira-code font-bold text-base ${scoreColorClass(spinAvg)}`}>
                <CountUp value={spinAvg} decimals={1} />
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-inter">
              SPIN
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
