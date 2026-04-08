'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { NeuCard, NeuButton } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'

// --- Types ---

interface TrendPoint {
  date: string
  story_type: string
  avg_score: number
  session_count: number
}

interface ChartRow {
  date: string
  elevator_pitch?: number
  feel_felt_found?: number
  abt_customer_story?: number
}

interface PerformanceTrendsProps {
  email: string
}

type TimeRange = 7 | 30 | 90

// --- Story type config ---

const STORY_LINES = [
  { key: 'elevator_pitch', label: 'Elevator Pitch', color: '#6366f1' },
  { key: 'feel_felt_found', label: 'Feel Felt Found', color: '#16a34a' },
  { key: 'abt_customer_story', label: 'ABT Customer Story', color: '#d97706' },
] as const

// --- Helpers ---

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`
}

function transformToChartData(trends: TrendPoint[]): ChartRow[] {
  const dateMap = new Map<string, ChartRow>()

  for (const point of trends) {
    if (!dateMap.has(point.date)) {
      dateMap.set(point.date, { date: formatDateLabel(point.date) })
    }
    const row = dateMap.get(point.date)!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(row as any)[point.story_type] = point.avg_score
  }

  return Array.from(dateMap.values())
}

// --- Custom tooltip ---

interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div
      className="font-satoshi text-xs p-3"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raised,
        borderRadius: neuTheme.radii.sm,
      }}
    >
      <p
        className="font-semibold mb-1"
        style={{ color: neuTheme.colors.text.heading }}
      >
        {label}
      </p>
      {payload.map((entry) => {
        const config = STORY_LINES.find((l) => l.key === entry.name)
        return (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span style={{ color: neuTheme.colors.text.body }}>
              {config?.label || entry.name}: {entry.value.toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// --- Main component ---

export function PerformanceTrends({ email }: PerformanceTrendsProps) {
  const [trends, setTrends] = useState<TrendPoint[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<TimeRange>(30)

  const fetchTrends = useCallback(async (days: TimeRange) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/vbrick/stories/trends?email=${encodeURIComponent(email)}&days=${days}`
      )
      if (!res.ok) return
      const json = await res.json()
      setTrends(json.trends ?? [])
    } catch {
      // non-critical — trends are supplementary
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => {
    fetchTrends(range)
  }, [range, fetchTrends])

  const handleRangeChange = (days: TimeRange) => {
    setRange(days)
  }

  // Loading skeleton
  if (loading) {
    return (
      <NeuCard hover={false} padding="md" radius="xl">
        <div className="space-y-3">
          <div
            className="h-5 w-40 rounded-lg animate-pulse"
            style={{ background: `${neuTheme.colors.shadow}40` }}
          />
          <div
            className="h-64 rounded-xl animate-pulse"
            style={{ background: `${neuTheme.colors.shadow}30` }}
          />
        </div>
      </NeuCard>
    )
  }

  // Empty state
  if (!trends || trends.length === 0) {
    return (
      <NeuCard variant="inset" hover={false} padding="lg" radius="xl">
        <p
          className="font-satoshi text-sm text-center"
          style={{ color: neuTheme.colors.text.muted }}
        >
          Practice more to see your trends
        </p>
      </NeuCard>
    )
  }

  const chartData = transformToChartData(trends)

  // Detect which story types have data so we only render those lines
  const activeTypes = new Set(trends.map((t) => t.story_type))

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header row: title + time range toggle */}
      <motion.div variants={cascadeIn} custom={0}>
        <div className="flex items-center justify-between">
          <h3
            className="font-general-sans font-bold text-base"
            style={{ color: neuTheme.colors.text.heading }}
          >
            Performance Trends
          </h3>

          <div className="flex gap-2">
            {([7, 30, 90] as TimeRange[]).map((days) => (
              <NeuButton
                key={days}
                variant={range === days ? 'accent' : 'raised'}
                size="sm"
                onClick={() => handleRangeChange(days)}
                style={{
                  minHeight: '36px',
                  padding: '6px 14px',
                  fontSize: '13px',
                }}
              >
                {days}d
              </NeuButton>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={cascadeIn} custom={1}>
        <NeuCard hover={false} padding="md" radius="xl">
          {/* Legend */}
          <div className="flex items-center flex-wrap gap-3 mb-4">
            {STORY_LINES.filter((l) => activeTypes.has(l.key)).map((line) => (
              <div key={line.key} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: line.color }}
                />
                <span
                  className="font-satoshi text-xs font-medium"
                  style={{ color: neuTheme.colors.text.body }}
                >
                  {line.label}
                </span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: -8 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={`${neuTheme.colors.text.subtle}20`}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: neuTheme.colors.text.muted, fontFamily: 'var(--font-satoshi)' }}
                axisLine={{ stroke: `${neuTheme.colors.text.subtle}40` }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 11, fill: neuTheme.colors.text.muted, fontFamily: 'var(--font-satoshi)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              {STORY_LINES.filter((l) => activeTypes.has(l.key)).map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: line.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: neuTheme.colors.bg }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </NeuCard>
      </motion.div>
    </motion.div>
  )
}
