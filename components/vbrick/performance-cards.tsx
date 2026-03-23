'use client'

import { motion } from 'motion/react'
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
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-blue-400 font-inter font-medium mb-3">
        {playerName}&apos;s Performance
      </h3>

      <div className="grid grid-cols-2 gap-5">
        {/* Call Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 0% 0%, rgba(59,130,246,0.03) 0%, transparent 50%)',
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-blue-400 font-inter font-medium">
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
                <p className="text-[10px] text-slate-500 font-fira-code mt-5">
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
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 100% 0%, rgba(34,197,94,0.03) 0%, transparent 50%)',
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-inter font-medium">
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
              <p className="text-[10px] text-slate-500 font-inter mt-5">
                Week resets Monday
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
