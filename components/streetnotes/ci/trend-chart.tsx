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
  '#f87171', // red
  '#818cf8', // indigo
  '#f472b6', // pink
  '#fb923c', // orange
  '#22d3ee', // cyan
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
      className="glass rounded-xl p-3 font-mono text-xs"
      style={{
        background: 'rgba(6, 18, 34, 0.9)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <p className="font-bold mb-1.5 uppercase tracking-[0.15em] text-volt">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mt-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}60` }}
          />
          <span className="text-white/80">
            {entry.name}: <span className="text-white font-bold">{entry.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrendChart({ data, loading }: TrendChartProps) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="animate-pulse h-64 bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-white/50">
          No trend data yet.
        </p>
      </div>
    )
  }

  const merged = mergeData(data)

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      {/* Legend */}
      <div className="flex items-center flex-wrap gap-3 mb-4">
        {data.map((series, i) => (
          <div key={series.competitorName} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: LINE_PALETTE[i % LINE_PALETTE.length],
                boxShadow:
                  i === 0 ? '0 0 8px rgba(0, 230, 118, 0.6)' : undefined,
              }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/70">
              {series.competitorName}
            </span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={merged} margin={{ top: 4, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(0,230,118,0.3)', strokeWidth: 1 }} />
          {data.map((series, i) => (
            <Line
              key={series.competitorName}
              type="monotone"
              dataKey={series.competitorName}
              stroke={LINE_PALETTE[i % LINE_PALETTE.length]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: LINE_PALETTE[i % LINE_PALETTE.length], strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'rgba(6, 18, 34, 1)' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
