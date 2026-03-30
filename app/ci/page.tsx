'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Shield,
  TrendingUp,
  Quote,
  Map,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import type {
  CIDashboardStats,
  QuoteFeedItem,
  CompetitorTrendData,
  HeatmapCell,
  CITimeRange,
} from '@/lib/ci/types'
import QuoteFeed from '@/components/ci/quote-feed'
import TrendChart from '@/components/ci/trend-chart'
import HeatmapGrid from '@/components/ci/heatmap-grid'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = 'quotes' | 'trends' | 'heatmap'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sentimentColor(s: string) {
  if (s === 'positive') return 'text-[#00E676]'
  if (s === 'negative') return 'text-[#FF5252]'
  return 'text-[#FFB300]'
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmailGate({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handle(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid work email.')
      return
    }
    onSubmit(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/95 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-[#1a1a1a] border-3 border-[#00E676] rounded-xl p-8 shadow-[4px_4px_0px_#00E676]"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-7 h-7 text-[#00E676]" />
          <h1 className="font-display text-2xl text-white tracking-wide">
            StreetNotes CI
          </h1>
        </div>

        <p className="text-white/70 font-body text-sm leading-relaxed mb-6">
          Competitive intelligence pulled straight from your team&apos;s sales
          calls. Enter your work email to access the dashboard.
        </p>

        <form onSubmit={handle} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="you@company.com"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError('')
              }}
              className="w-full bg-[#121212] border-2 border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 font-body text-sm focus:outline-none focus:border-[#00E676] transition-colors"
            />
            {error && (
              <p className="text-[#FF5252] text-xs mt-1.5 font-body">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#00E676] text-black font-body font-bold text-sm py-3 rounded-lg border-3 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  )
}

function StatCard({
  label,
  children,
  icon: Icon,
  index,
}: {
  label: string
  children: React.ReactNode
  icon: React.ElementType
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#1a1a1a] border-2 border-white/10 rounded-lg p-4 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2 text-white/50 text-xs font-body uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-white font-body">{children}</div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIME_RANGES: { key: CITimeRange; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: 'all', label: 'All' },
]

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'quotes', label: 'Quote Feed', icon: Quote },
  { key: 'trends', label: 'Trends', icon: TrendingUp },
  { key: 'heatmap', label: 'Heatmap', icon: Map },
]

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CIDashboardPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [gateChecked, setGateChecked] = useState(false)

  const [timeRange, setTimeRange] = useState<CITimeRange>('30d')
  const [activeTab, setActiveTab] = useState<TabKey>('quotes')

  const [stats, setStats] = useState<CIDashboardStats | null>(null)
  const [mentions, setMentions] = useState<QuoteFeedItem[]>([])
  const [trends, setTrends] = useState<CompetitorTrendData[]>([])
  const [heatmapData, setHeatmapData] = useState<{
    cells: HeatmapCell[]
    competitors: string[]
    dimensions: string[]
  }>({ cells: [], competitors: [], dimensions: [] })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ci-email')
    if (stored) setEmail(stored)
    setGateChecked(true)
  }, [])

  function handleEmailSubmit(submittedEmail: string) {
    localStorage.setItem('ci-email', submittedEmail)
    setEmail(submittedEmail)
  }

  const fetchData = useCallback(async () => {
    if (!email) return
    setLoading(true)
    setFetchError(null)

    const params = new URLSearchParams({ email, timeRange })

    try {
      const [statsRes, mentionsRes, trendsRes, heatmapRes] =
        await Promise.allSettled([
          fetch(`/api/ci/stats?${params}`),
          fetch(`/api/ci/mentions?${params}`),
          fetch(`/api/ci/trends?${params}`),
          fetch(`/api/ci/heatmap?${params}`),
        ])

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json())
      }
      if (mentionsRes.status === 'fulfilled' && mentionsRes.value.ok) {
        const body = await mentionsRes.value.json()
        setMentions(body.mentions || [])
      }
      if (trendsRes.status === 'fulfilled' && trendsRes.value.ok) {
        const body = await trendsRes.value.json()
        setTrends(body.trends || [])
      }
      if (heatmapRes.status === 'fulfilled' && heatmapRes.value.ok) {
        setHeatmapData(await heatmapRes.value.json())
      }

      const allFailed = [statsRes, mentionsRes, trendsRes, heatmapRes].every(
        (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok)
      )
      if (allFailed) {
        setFetchError('Could not load dashboard data. Check that the database migration has been applied.')
      }
    } catch {
      setFetchError('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [email, timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!gateChecked) return null

  return (
    <>
      <AnimatePresence>
        {!email && <EmailGate onSubmit={handleEmailSubmit} />}
      </AnimatePresence>

      <div className="min-h-screen font-body">
        {/* Header */}
        <header className="border-b border-white/10 px-6 py-5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide">
                StreetNotes CI
              </h1>
              <p className="text-white/50 text-sm font-body mt-1">
                Competitive Intelligence Dashboard
              </p>
              <div className="h-1 w-16 bg-[#00E676] rounded-full mt-3" />
            </motion.div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex items-center gap-2"
          >
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.key}
                onClick={() => setTimeRange(tr.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-body font-semibold border-2 transition-all ${
                  timeRange === tr.key
                    ? 'bg-[#00E676] text-black border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </motion.div>

          {/* Error banner */}
          {fetchError && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-[#FF5252]/10 border border-[#FF5252]/30 rounded-lg p-4 text-sm font-body text-[#FF5252]"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {fetchError}
            </motion.div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Mentions" icon={BarChart3} index={0}>
              <span className="text-2xl font-bold tabular-nums">
                {loading ? '--' : (stats?.totalMentions ?? 0)}
              </span>
            </StatCard>

            <StatCard label="Unique Competitors" icon={Users} index={1}>
              <span className="text-2xl font-bold tabular-nums">
                {loading ? '--' : (stats?.uniqueCompetitors ?? 0)}
              </span>
            </StatCard>

            <StatCard label="Top Threat" icon={Zap} index={2}>
              {loading ? (
                <span className="text-lg font-bold">--</span>
              ) : stats?.topCompetitor ? (
                <div>
                  <span className="text-lg font-bold text-[#FF5252]">
                    {stats.topCompetitor.name}
                  </span>
                  <span className="text-white/40 text-xs ml-2">
                    {stats.topCompetitor.count} mentions
                  </span>
                </div>
              ) : (
                <span className="text-white/40 text-sm">None yet</span>
              )}
            </StatCard>

            <StatCard label="Sentiment Split" icon={TrendingUp} index={3}>
              {loading ? (
                <span className="text-lg font-bold">--</span>
              ) : stats?.sentimentBreakdown ? (
                <div className="flex items-center gap-3 text-sm font-mono">
                  <span className={sentimentColor('positive')}>
                    +{stats.sentimentBreakdown.positive}
                  </span>
                  <span className={sentimentColor('neutral')}>
                    ~{stats.sentimentBreakdown.neutral}
                  </span>
                  <span className={sentimentColor('negative')}>
                    -{stats.sentimentBreakdown.negative}
                  </span>
                </div>
              ) : (
                <span className="text-white/40 text-sm">No data</span>
              )}
            </StatCard>
          </div>

          {/* Tab navigation */}
          <div className="flex items-center gap-6 border-b border-white/10">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 pb-3 text-sm font-body font-semibold transition-colors ${
                    active ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {active && (
                    <motion.div
                      layoutId="ci-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E676] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'quotes' && (
                <QuoteFeed mentions={mentions} loading={loading} />
              )}
              {activeTab === 'trends' && (
                <TrendChart trends={trends} loading={loading} />
              )}
              {activeTab === 'heatmap' && (
                <HeatmapGrid
                  cells={heatmapData.cells}
                  competitors={heatmapData.competitors}
                  dimensions={heatmapData.dimensions}
                  loading={loading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}
