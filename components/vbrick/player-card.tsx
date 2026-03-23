'use client'

import { motion } from 'motion/react'
import { Flame } from 'lucide-react'
import { scoreColorClass } from '@/lib/vbrick/colors'
import { CountUp } from './count-up'
import { LuminousDivider } from './luminous-divider'

interface PlayerCardProps {
  name: string
  title?: string
  streak: number
  todayCalls: number
  spinAvg: number
  compact?: boolean
  showStats?: boolean
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
  const streakMilestone = streak > 0 && (streak % 5 === 0)

  if (compact) {
    return (
      <motion.div
        className="rounded-xl border border-white/[0.12] bg-white/[0.06] p-4 border-l-4 border-l-[#7ed4f7]"
        style={{ backdropFilter: 'blur(16px) saturate(160%)' }}
        layout
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <span className="font-inter font-black text-lg uppercase tracking-wide text-white">
            {name}
          </span>
          <span className="font-fira-code text-sm text-gray-400">
            {todayCalls} calls today
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-xl border border-white/[0.12] bg-white/[0.06] p-6 border-l-4 border-l-[#7ed4f7]"
      style={{
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      }}
      layout
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-inter font-black text-2xl uppercase tracking-wide text-white">
        {name}
      </h2>
      <p className="text-gray-400 text-sm font-inter mt-0.5">{title}</p>

      {showStats && (
        <>
          <LuminousDivider className="my-4" />

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Streak */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <motion.div
                  animate={streakMilestone ? {
                    scale: [1, 1.3, 1],
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
                  } : {}}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <Flame
                    className={`w-4 h-4 ${streakActive ? 'text-[#7ed4f7]' : 'text-gray-600'}`}
                  />
                </motion.div>
                <span className="font-fira-code font-bold text-lg text-white">
                  <CountUp value={streak} />
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-inter">
                days
              </span>
            </div>

            {/* Today */}
            <div className="text-center">
              <div className="mb-1">
                <span className="font-fira-code font-bold text-lg text-white">
                  <CountUp value={todayCalls} />
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-inter">
                today
              </span>
            </div>

            {/* SPIN avg */}
            <div className="text-center">
              <div className="mb-1">
                <span className={`font-fira-code font-bold text-lg ${scoreColorClass(spinAvg)}`}>
                  <CountUp value={spinAvg} decimals={1} />
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-inter">
                SPIN
              </span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
