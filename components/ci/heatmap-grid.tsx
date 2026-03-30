'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Grid3X3 } from 'lucide-react'

interface HeatmapCell {
  competitor: string
  dimension: string
  count: number
  dominantSentiment: 'positive' | 'negative' | 'neutral'
}

interface HeatmapGridProps {
  cells: HeatmapCell[]
  competitors: string[]
  dimensions: string[]
  loading?: boolean
}

const SENTIMENT_COLORS = {
  negative: { r: 255, g: 82, b: 82 },
  positive: { r: 0, g: 230, b: 118 },
  neutral: { r: 156, g: 163, b: 175 },
} as const

function truncateDimension(dim: string): string {
  if (dim.includes('@')) return dim.split('@')[0]
  if (dim.length > 10) return dim.slice(0, 10)
  return dim
}

function sentimentDot(sentiment: 'positive' | 'negative' | 'neutral') {
  const colors = {
    positive: 'bg-green-400',
    negative: 'bg-red-400',
    neutral: 'bg-gray-400',
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[sentiment]}`} />
}

export default function HeatmapGrid({ cells, competitors, dimensions, loading }: HeatmapGridProps) {
  const [hover, setHover] = useState<{
    cell: HeatmapCell
    x: number
    y: number
  } | null>(null)

  const maxCount = Math.max(...cells.map((c) => c.count), 1)
  const getOpacity = (count: number) => 0.15 + (count / maxCount) * 0.75

  // Build a lookup map: `competitor::dimension` -> cell
  const cellMap = new Map<string, HeatmapCell>()
  for (const cell of cells) {
    cellMap.set(`${cell.competitor}::${cell.dimension}`, cell)
  }

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border-2 border-white/10 rounded-lg p-4">
        <div className="mb-4">
          <div className="h-5 w-48 bg-white/10 rounded animate-pulse mb-1" />
          <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(5, minmax(48px, 1fr))` }}>
          {/* Skeleton header row */}
          <div />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
          ))}
          {/* Skeleton data rows */}
          {Array.from({ length: 3 }).map((_, row) => (
            <>
              <div key={`label-${row}`} className="h-12 bg-white/5 rounded animate-pulse" />
              {Array.from({ length: 5 }).map((_, col) => (
                <div key={`cell-${row}-${col}`} className="h-12 bg-white/5 rounded animate-pulse" />
              ))}
            </>
          ))}
        </div>
      </div>
    )
  }

  if (cells.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#1a1a1a] border-2 border-white/10 rounded-lg p-8 flex flex-col items-center gap-3"
      >
        <Grid3X3 className="w-10 h-10 text-white/20" />
        <p className="text-sm text-white/40 text-center max-w-xs">
          No heatmap data yet. The heatmap populates as multiple reps record Brain Dumps.
        </p>
      </motion.div>
    )
  }

  const colCount = dimensions.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#1a1a1a] border-2 border-white/10 rounded-lg p-4 relative"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Competitive Heatmap</h3>
        <p className="text-[11px] text-white/40 mt-0.5">Mentions by rep</p>
      </div>

      {/* Grid container with horizontal scroll */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `120px repeat(${colCount}, minmax(48px, 1fr))`,
            minWidth: `${120 + colCount * 52}px`,
          }}
        >
          {/* Top-left empty corner */}
          <div />

          {/* Column headers (dimensions) */}
          {dimensions.map((dim) => (
            <div key={dim} className="h-16 flex items-end justify-center pb-1 overflow-hidden">
              <span
                className="text-[10px] text-white/50 font-medium whitespace-nowrap origin-bottom-left"
                style={{ transform: 'rotate(-45deg)', maxWidth: 80 }}
                title={dim}
              >
                {truncateDimension(dim)}
              </span>
            </div>
          ))}

          {/* Rows */}
          {competitors.map((comp, rowIdx) => (
            <>
              {/* Row label */}
              <div
                key={`label-${comp}`}
                className="flex items-center pr-2 min-h-[48px]"
              >
                <span className="text-xs text-white/70 font-medium truncate" title={comp}>
                  {comp}
                </span>
              </div>

              {/* Data cells */}
              {dimensions.map((dim) => {
                const cell = cellMap.get(`${comp}::${dim}`)
                const hasData = cell && cell.count > 0

                if (!hasData) {
                  return (
                    <div
                      key={`${comp}::${dim}`}
                      className="min-h-[48px] min-w-[48px] bg-white/5 rounded-sm"
                    />
                  )
                }

                const { r, g, b } = SENTIMENT_COLORS[cell.dominantSentiment]
                const opacity = getOpacity(cell.count)

                return (
                  <motion.div
                    key={`${comp}::${dim}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: rowIdx * 0.03, duration: 0.3 }}
                    className="min-h-[48px] min-w-[48px] rounded-sm flex items-center justify-center cursor-default relative"
                    style={{
                      backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const parent = e.currentTarget.closest('.relative')
                      const parentRect = parent?.getBoundingClientRect()
                      setHover({
                        cell,
                        x: rect.left - (parentRect?.left ?? 0) + rect.width / 2,
                        y: rect.top - (parentRect?.top ?? 0),
                      })
                    }}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="text-xs font-bold text-white tabular-nums">
                      {cell.count}
                    </span>
                  </motion.div>
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hover && (
        <div
          className="absolute z-50 pointer-events-none bg-[#111] border border-white/20 rounded-md px-3 py-2 shadow-xl"
          style={{
            left: hover.x,
            top: hover.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-[11px] text-white/90 space-y-1 whitespace-nowrap">
            <div>
              <span className="text-white/50">Competitor: </span>
              <span className="font-medium">{hover.cell.competitor}</span>
            </div>
            <div>
              <span className="text-white/50">Rep/Territory: </span>
              <span className="font-medium">{hover.cell.dimension}</span>
            </div>
            <div>
              <span className="text-white/50">Mentions: </span>
              <span className="font-bold">{hover.cell.count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/50">Sentiment: </span>
              {sentimentDot(hover.cell.dominantSentiment)}
              <span className="font-medium capitalize">{hover.cell.dominantSentiment}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
