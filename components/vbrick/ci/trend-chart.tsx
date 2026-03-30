'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { NeuCard } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'

interface TrendPoint {
  weekLabel: string
  count: number
}

interface CompetitorTrend {
  competitorName: string
  trend: TrendPoint[]
}

interface TrendChartProps {
  data: CompetitorTrend[]
  loading?: boolean
}

const LINE_PALETTE = [
  neuTheme.colors.accent.primary,
  neuTheme.colors.status.success,
  neuTheme.colors.status.warning,
  neuTheme.colors.status.danger,
  '#0891b2',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
]

interface MergedPoint {
  weekLabel: string
  [competitor: string]: string | number
}

function mergeData(data: CompetitorTrend[]): MergedPoint[] {
  const weekMap = new Map<string, MergedPoint>()

  for (const series of data) {
    for (const pt of series.trend) {
      if (!weekMap.has(pt.weekLabel)) {
        weekMap.set(pt.weekLabel, { weekLabel: pt.weekLabel })
      }
      const row = weekMap.get(pt.weekLabel)!
      row[series.competitorName] = pt.count
    }
  }

  return Array.from(weekMap.values())
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
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
      <p className="font-semibold mb-1" style={{ color: neuTheme.colors.text.heading }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: neuTheme.colors.text.body }}>
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrendChart({ data, loading }: TrendChartProps) {
  if (loading) {
    return (
      <NeuCard hover={false} padding="md" radius="xl">
        <div className="animate-pulse h-64 rounded-xl" style={{ background: neuTheme.colors.shadow }} />
      </NeuCard>
    )
  }

  if (data.length === 0) {
    return (
      <NeuCard hover={false} padding="lg" radius="xl">
        <p className="font-satoshi text-sm text-center" style={{ color: neuTheme.colors.text.muted }}>
          No trend data yet.
        </p>
      </NeuCard>
    )
  }

  const merged = mergeData(data)

  return (
    <NeuCard hover={false} padding="md" radius="xl">
      {/* Legend */}
      <div className="flex items-center flex-wrap gap-3 mb-4">
        {data.map((series, i) => (
          <div key={series.competitorName} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: LINE_PALETTE[i % LINE_PALETTE.length] }}
            />
            <span className="font-satoshi text-xs font-medium" style={{ color: neuTheme.colors.text.body }}>
              {series.competitorName}
            </span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={merged} margin={{ top: 4, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" vertical={false} />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: '#636e72', fontFamily: 'var(--font-satoshi)' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#636e72', fontFamily: 'var(--font-satoshi)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          {data.map((series, i) => (
            <Line
              key={series.competitorName}
              type="monotone"
              dataKey={series.competitorName}
              stroke={LINE_PALETTE[i % LINE_PALETTE.length]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: LINE_PALETTE[i % LINE_PALETTE.length], strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: neuTheme.colors.bg }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </NeuCard>
  )
}
