'use client'

import { motion } from 'motion/react'
import type { SPINScore } from '@/lib/debrief/types'

interface SpinStatCardProps {
  spin: SPINScore
}

function scoreColor(score: number): string {
  if (score <= 3) return '#EF4444'
  if (score <= 6) return '#F59E0B'
  if (score <= 8) return '#7ed4f7'
  return '#00E676'
}

const SPIN_LABELS: { key: keyof Pick<SPINScore, 'situation' | 'problem' | 'implication' | 'needPayoff'>; letter: string }[] = [
  { key: 'situation', letter: 'S' },
  { key: 'problem', letter: 'P' },
  { key: 'implication', letter: 'I' },
  { key: 'needPayoff', letter: 'N' },
]

export default function SpinStatCard({ spin }: SpinStatCardProps) {
  const compositeColor = scoreColor(spin.composite)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-3.5 bg-[#0d1e3a]">
        <span className="text-[11px] font-semibold text-[#7ed4f7] uppercase tracking-widest">
          Call Performance
        </span>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-4">
        {SPIN_LABELS.map(({ key, letter }) => {
          const detail = spin[key]
          const color = scoreColor(detail.score)
          const widthPercent = (detail.score / 10) * 100

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white w-8 flex-shrink-0">
                  {letter}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPercent}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-sm font-bold text-white w-10 text-right flex-shrink-0">
                  {detail.score.toFixed(1)}
                </span>
              </div>
              {detail.score >= 4 && detail.evidence.length > 0 ? (
                <p className="text-xs text-gray-400 pl-11">
                  {detail.evidence[0]}
                </p>
              ) : detail.score < 4 && detail.missed ? (
                <p className="text-xs text-gray-500 italic pl-11">
                  {detail.missed}
                </p>
              ) : null}
            </div>
          )
        })}

        {/* Divider */}
        <div className="border-t border-white/10 my-4" />

        {/* Composite */}
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-gray-500">
            Composite
          </span>
          <span
            className="text-2xl font-bold"
            style={{ color: compositeColor }}
          >
            {spin.composite.toFixed(1)}
          </span>
        </div>

        {/* Coaching note */}
        {spin.coachingNote && (
          <p className="text-sm text-gray-300 italic mt-3">
            &ldquo;{spin.coachingNote}&rdquo;
          </p>
        )}
      </div>
    </motion.div>
  )
}
