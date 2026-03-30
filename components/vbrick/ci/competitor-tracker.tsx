'use client'

import { motion } from 'motion/react'
import { NeuCard } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'

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
  positive: neuTheme.colors.status.success,
  negative: neuTheme.colors.status.danger,
  neutral: neuTheme.colors.text.subtle,
}

export function CompetitorTracker({ data, loading }: CompetitorTrackerProps) {
  if (loading) {
    return (
      <NeuCard hover={false} padding="md" radius="xl">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 rounded-full w-28" style={{ background: neuTheme.colors.shadow }} />
              <div className="flex-1 h-3 rounded-full" style={{ background: neuTheme.colors.shadow }} />
              <div className="h-4 rounded-full w-8" style={{ background: neuTheme.colors.shadow }} />
            </div>
          ))}
        </div>
      </NeuCard>
    )
  }

  const sorted = [...data].sort((a, b) => b.count - a.count)

  if (sorted.length === 0) {
    return (
      <NeuCard hover={false} padding="lg" radius="xl">
        <p className="font-satoshi text-sm text-center" style={{ color: neuTheme.colors.text.muted }}>
          No competitor data yet.
        </p>
      </NeuCard>
    )
  }

  const maxCount = sorted[0]?.count || 1

  return (
    <NeuCard hover={false} padding="md" radius="xl">
      <div className="space-y-4">
        {sorted.map((row, idx) => {
          const total = row.sentiment.positive + row.sentiment.negative + row.sentiment.neutral
          const posPct = total > 0 ? (row.sentiment.positive / total) * 100 : 0
          const negPct = total > 0 ? (row.sentiment.negative / total) * 100 : 0
          const neuPct = total > 0 ? (row.sentiment.neutral / total) * 100 : 100
          const barWidth = (row.count / maxCount) * 100

          return (
            <div key={row.name} className="flex items-center gap-3">
              {/* Name */}
              <span
                className="font-general-sans font-semibold text-sm w-28 truncate flex-shrink-0"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {row.name}
              </span>

              {/* Stacked bar */}
              <div className="flex-1">
                <motion.div
                  className="h-5 rounded-full overflow-hidden flex"
                  style={{
                    width: `${barWidth}%`,
                    minWidth: 24,
                    boxShadow: neuTheme.shadows.insetSm,
                    background: neuTheme.colors.bg,
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

              {/* Count */}
              <span
                className="font-satoshi font-bold text-sm tabular-nums w-8 text-right flex-shrink-0"
                style={{ color: neuTheme.colors.text.body }}
              >
                {row.count}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: `1px solid ${neuTheme.colors.shadow}33` }}>
        {(['positive', 'negative', 'neutral'] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: SENTIMENT_COLORS[s] }} />
            <span className="font-satoshi text-[11px] capitalize" style={{ color: neuTheme.colors.text.muted }}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </NeuCard>
  )
}
