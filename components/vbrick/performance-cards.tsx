'use client'

import { motion } from 'motion/react'
import { neuTheme } from '@/lib/vbrick/theme'
import { StatBar } from './stat-bar'
import { Activity, Target } from 'lucide-react'

interface PerformanceCardsProps {
  playerName: string
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
  playerName,
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
    <div>
      <h3
        className="text-[11px] uppercase tracking-[0.2em] font-inter font-medium mb-3"
        style={{ color: neuTheme.colors.accent.primary }}
      >
        {playerName}&apos;s Performance
      </h3>

      <div className="grid grid-cols-2 gap-5">
        {/* Call Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.raised,
            }}
          >
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4" style={{ color: neuTheme.colors.accent.primary }} />
                <span
                  className="text-[11px] uppercase tracking-[0.2em] font-inter font-medium"
                  style={{ color: neuTheme.colors.accent.primary }}
                >
                  Call Performance
                </span>
              </div>
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
                <p
                  className="text-[10px] font-fira-code mt-5"
                  style={{ color: neuTheme.colors.text.muted }}
                >
                  {scoredCalls} calls scored this week
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Conversion Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.raised,
            }}
          >
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <Target className="w-4 h-4" style={{ color: neuTheme.colors.score.green }} />
                <span
                  className="text-[11px] uppercase tracking-[0.2em] font-inter font-medium"
                  style={{ color: neuTheme.colors.score.green }}
                >
                  Conversion Rates
                </span>
              </div>
              <div className="space-y-6">
                <StatBar
                  label="Answer to Conversation"
                  value={convRate}
                  ghostValue={ghostConvRate}
                  max={100}
                  detail={`${connectedCalls} of ${totalCalls} calls`}
                  size="prominent"
                />
                <StatBar
                  label="Conversation to Appointment"
                  value={apptRate}
                  ghostValue={ghostApptRate}
                  max={100}
                  detail={`${appointments} of ${connectedCalls} conversations`}
                />
              </div>
              <p
                className="text-[10px] font-inter mt-5"
                style={{ color: neuTheme.colors.text.muted }}
              >
                Week resets Monday
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
