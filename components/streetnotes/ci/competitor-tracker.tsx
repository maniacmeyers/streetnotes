'use client'

import { motion } from 'motion/react'
import { BrutalCard } from '@/components/streetnotes/brutal'

interface CompetitorRow {
  name: string
  count: number
  sentiment: { positive: number; negative: number; neutral: number }
}

interface CompetitorTrackerProps {
  data: CompetitorRow[]
  loading?: boolean
}

const SENTIMENT_COLORS = {
  positive: '#00E676',
  negative: '#dc2626',
  neutral: '#9ca3af',
}

export function CompetitorTracker({ data, loading }: CompetitorTrackerProps) {
  if (loading) {
    return (
      <BrutalCard variant="white" padded>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-28 bg-gray-300" />
              <div className="flex-1 h-3 bg-gray-300" />
              <div className="h-4 w-8 bg-gray-300" />
            </div>
          ))}
        </div>
      </BrutalCard>
    )
  }

  const sorted = [...data].sort((a, b) => b.count - a.count)

  if (sorted.length === 0) {
    return (
      <BrutalCard variant="white" padded>
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-black/60 text-center">
          No competitor data yet.
        </p>
      </BrutalCard>
    )
  }

  const maxCount = sorted[0]?.count || 1

  return (
    <BrutalCard variant="white" padded>
      <div className="space-y-4">
        {sorted.map((row, idx) => {
          const total =
            row.sentiment.positive + row.sentiment.negative + row.sentiment.neutral
          const posPct = total > 0 ? (row.sentiment.positive / total) * 100 : 0
          const negPct = total > 0 ? (row.sentiment.negative / total) * 100 : 0
          const neuPct = total > 0 ? (row.sentiment.neutral / total) * 100 : 100
          const barWidth = (row.count / maxCount) * 100

          return (
            <div key={row.name} className="flex items-center gap-3">
              <span className="font-display uppercase text-sm text-black w-28 truncate flex-shrink-0 leading-none">
                {row.name}
              </span>

              <div className="flex-1">
                <motion.div
                  className="h-6 border-2 border-black overflow-hidden flex bg-white"
                  style={{
                    width: `${barWidth}%`,
                    minWidth: 24,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ delay: idx * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  {posPct > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${posPct}%`, background: SENTIMENT_COLORS.positive }}
                    />
                  )}
                  {negPct > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${negPct}%`, background: SENTIMENT_COLORS.negative }}
                    />
                  )}
                  {neuPct > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${neuPct}%`, background: SENTIMENT_COLORS.neutral }}
                    />
                  )}
                </motion.div>
              </div>

              <span className="font-display text-lg tabular-nums text-black w-10 text-right flex-shrink-0 leading-none">
                {row.count}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5 pt-3 border-t-2 border-black/20">
        {(['positive', 'negative', 'neutral'] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 border-2 border-black"
              style={{ background: SENTIMENT_COLORS[s] }}
            />
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-black">
              {s}
            </span>
          </div>
        ))}
      </div>
    </BrutalCard>
  )
}
