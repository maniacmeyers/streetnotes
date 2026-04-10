'use client'

import { motion } from 'motion/react'

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
      <div className="glass rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-28 bg-white/10 rounded" />
              <div className="flex-1 h-3 bg-white/10 rounded" />
              <div className="h-4 w-8 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.count - a.count)

  if (sorted.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-white/50">
          No competitor data yet.
        </p>
      </div>
    )
  }

  const maxCount = sorted[0]?.count || 1

  return (
    <div className="glass rounded-2xl p-6">
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
              <span className="font-bold text-sm text-white w-28 truncate flex-shrink-0 leading-none">
                {row.name}
              </span>

              <div className="flex-1">
                <motion.div
                  className="h-6 rounded-md overflow-hidden flex border border-white/15"
                  style={{
                    width: `${barWidth}%`,
                    minWidth: 24,
                    background: 'rgba(255,255,255,0.04)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.4)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ delay: idx * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  {posPct > 0 && (
                    <div
                      className="h-full"
                      style={{
                        width: `${posPct}%`,
                        background: SENTIMENT_COLORS.positive,
                        boxShadow: '0 0 12px rgba(0, 230, 118, 0.6)',
                      }}
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

              <span className="font-bold text-lg tabular-nums text-white w-10 text-right flex-shrink-0 leading-none">
                {row.count}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/10">
        {(['positive', 'negative', 'neutral'] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: SENTIMENT_COLORS[s],
                boxShadow: s === 'positive' ? '0 0 8px rgba(0, 230, 118, 0.6)' : undefined,
              }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/60">
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
