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
import { BrutalCard } from '@/components/streetnotes/brutal'

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
  '#00E676', // volt
  '#FFFFFF', // white
  '#FFB800', // amber
  '#dc2626', // red
  '#6366f1',
  '#ec4899',
  '#f97316',
  '#06b6d4',
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
    <div className="bg-black border-4 border-volt p-3 font-mono text-xs">
      <p className="font-bold mb-1 uppercase tracking-wider text-volt">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 border border-white" style={{ background: entry.color }} />
          <span className="text-white">
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
      <BrutalCard variant="black" padded>
        <div className="animate-pulse h-64 bg-gray-800" />
      </BrutalCard>
    )
  }

  if (data.length === 0) {
    return (
      <BrutalCard variant="white" padded>
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-black/60 text-center">
          No trend data yet.
        </p>
      </BrutalCard>
    )
  }

  const merged = mergeData(data)

  return (
    <BrutalCard variant="black" padded>
      {/* Legend */}
      <div className="flex items-center flex-wrap gap-3 mb-4">
        {data.map((series, i) => (
          <div key={series.competitorName} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 border-2 border-white"
              style={{ background: LINE_PALETTE[i % LINE_PALETTE.length] }}
            />
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-white">
              {series.competitorName}
            </span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={merged} margin={{ top: 4, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF20" vertical={false} />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: '#FFFFFF80', fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: '#FFFFFF30' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#FFFFFF80', fontFamily: 'var(--font-mono)' }}
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
              strokeWidth={3}
              dot={{ r: 3, fill: LINE_PALETTE[i % LINE_PALETTE.length], strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#000000' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </BrutalCard>
  )
}
