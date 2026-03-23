'use client'

import { motion } from 'motion/react'
import { GlassCard } from './glass-card'
import { StatBar } from './stat-bar'

interface PerformanceCardsProps {
  spinAvg: number
  bestSpin: number
  personalBestSpin: number
  ghostSpinAvg: number
  ghostBestSpin: number
  convRate: number
  apptRate: number
  ghostConvRate: number
  ghostApptRate: number
  connectedCalls: number
  totalCalls: number
  appointments: number
  scoredCalls?: number
}

export function PerformanceCards({
  spinAvg,
  bestSpin,
  personalBestSpin,
  ghostSpinAvg,
  ghostBestSpin,
  convRate,
  apptRate,
  ghostConvRate,
  ghostApptRate,
  connectedCalls,
  totalCalls,
  appointments,
  scoredCalls,
}: PerformanceCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Call Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard title="Call Performance">
          <div className="space-y-6">
            <StatBar
              label="SPIN Composite"
              value={spinAvg}
              ghostValue={ghostSpinAvg}
              max={10}
              personalBest={personalBestSpin}
              size="prominent"
            />
            <StatBar
              label="Best Call This Week"
              value={bestSpin}
              ghostValue={ghostBestSpin}
              max={10}
            />
          </div>
          {scoredCalls !== undefined && (
            <p className="text-xs text-gray-500 font-fira-code mt-4">
              {scoredCalls} calls scored this week
            </p>
          )}
        </GlassCard>
      </motion.div>

      {/* Conversion Rates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard title="Conversion Rates">
          <div className="space-y-6">
            <StatBar
              label="Call → Conversation"
              value={convRate}
              ghostValue={ghostConvRate}
              max={100}
              detail={`${connectedCalls} of ${totalCalls} calls`}
              size="prominent"
            />
            <StatBar
              label="Conversation → Appointment"
              value={apptRate}
              ghostValue={ghostApptRate}
              max={100}
              detail={`${appointments} of ${connectedCalls} conversations`}
            />
          </div>
          <p className="text-xs text-gray-500 font-inter mt-4">
            Week resets Monday
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
