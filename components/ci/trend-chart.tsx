'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'motion/react'
import { TrendingUp } from 'lucide-react'

const LINE_COLORS = ['#00E676', '#7ed4f7', '#FF5252', '#FFB300', '#a78bfa']

interface TrendChartProps {
  trends: Array<{
    competitorName: string
    trend: Array<{ week: string; weekLabel: string; count: number }>
    totalMentions: number
    sentimentBreakdown: { positive: number; negative: number; neutral: number }
  }>
  loading?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; color: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-[#1a1a1a] border border-white/20 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300">{entry.dataKey}</span>
          <span className="text-white font-medium ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ trends, loading }: TrendChartProps) {
  const topCompetitors = useMemo(() => {
    if (!trends?.length) return []
    return [...trends]
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .slice(0, 5)
  }, [trends])

  const chartData = useMemo(() => {
    if (!topCompetitors.length) return []

    const weekMap = new Map<string, Record<string, number | string>>()

    for (const comp of topCompetitors) {
      for (const point of comp.trend) {
        if (!weekMap.has(point.week)) {
          weekMap.set(point.week, { week: point.weekLabel })
        }
        const entry = weekMap.get(point.week)!
        entry[comp.competitorName] = point.count
      }
    }

    return Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => data)
  }, [topCompetitors])

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border-2 border-white/10 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-3 w-56 bg-white/10 rounded" />
          <div className="h-[300px] bg-white/5 rounded mt-4" />
          <div className="flex gap-3 mt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 flex-1 bg-white/5 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!trends?.length) {
    return (
      <div className="bg-[#1a1a1a] border-2 border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <TrendingUp className="w-10 h-10 text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm max-w-xs">
          Not enough data yet. Competitive trends appear after multiple
          recordings over time.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-[#1a1a1a] border-2 border-white/10 rounded-lg p-4"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base">
          Competitor Trends
        </h3>
        <p className="text-gray-500 text-xs mt-0.5">
          Mention frequency by week
        </p>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto -mx-2">
        <div className="min-w-[480px] px-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#333' }}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#333' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }}
                iconType="circle"
                iconSize={8}
              />
              {topCompetitors.map((comp, i) => (
                <Line
                  key={comp.competitorName}
                  type="monotone"
                  dataKey={comp.competitorName}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend cards with sentiment bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-4">
        {topCompetitors.map((comp, i) => {
          const { positive, negative, neutral } = comp.sentimentBreakdown
          const total = positive + negative + neutral
          const pPct = total > 0 ? (positive / total) * 100 : 0
          const nPct = total > 0 ? (negative / total) * 100 : 0
          const uPct = total > 0 ? (neutral / total) * 100 : 0

          return (
            <div
              key={comp.competitorName}
              className="bg-white/5 rounded-lg p-2.5 space-y-1.5"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }}
                />
                <span className="text-white text-xs font-medium truncate">
                  {comp.competitorName}
                </span>
              </div>
              <p className="text-gray-500 text-[10px]">
                {comp.totalMentions} mention{comp.totalMentions !== 1 ? 's' : ''}
              </p>
              {total > 0 && (
                <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
                  {pPct > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${pPct}%`, backgroundColor: '#00E676' }}
                    />
                  )}
                  {uPct > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${uPct}%`, backgroundColor: '#9CA3AF' }}
                    />
                  )}
                  {nPct > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${nPct}%`, backgroundColor: '#FF5252' }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
