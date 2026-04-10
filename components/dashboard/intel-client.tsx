'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, FileText, Radar } from 'lucide-react'
import { CompetitorTracker, QuoteWall, TrendChart } from '@/components/streetnotes/ci'
import { GlassTabs } from '@/components/ui/glass-tabs'
import type { QuoteFeedItem } from '@/lib/ci/types'

type CITab = 'competitors' | 'quotes' | 'trends'

interface WeeklyBrief {
  headline: string
  competitor_movement: string
  rep_highlights: string
  suggested_actions: string[]
  stats: {
    totalMentions: number
    totalDials: number
    totalConversations: number
    totalMeetings: number
  }
}

export default function IntelClient({ userEmail }: { userEmail: string }) {
  const email = userEmail
  const [activeTab, setActiveTab] = useState<CITab>('competitors')
  const [loading, setLoading] = useState(true)

  const [allMentions, setAllMentions] = useState<QuoteFeedItem[]>([])
  const [competitorData, setCompetitorData] = useState<
    Array<{ name: string; count: number; sentiment: { positive: number; negative: number; neutral: number } }>
  >([])
  const [trendData, setTrendData] = useState<
    Array<{ competitorName: string; trend: Array<{ weekLabel: string; count: number }> }>
  >([])
  const [weeklyBrief, setWeeklyBrief] = useState<WeeklyBrief | null>(null)
  const [showBrief, setShowBrief] = useState(false)
  const [generatingBrief, setGeneratingBrief] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const enc = encodeURIComponent(email)

    const [mentionsRes, statsRes, trendsRes] = await Promise.allSettled([
      fetch(`/api/ci/mentions?email=${enc}&timeRange=30d&limit=50`),
      fetch(`/api/ci/stats?email=${enc}&timeRange=30d`),
      fetch(`/api/ci/trends?email=${enc}&timeRange=30d`),
    ])

    if (mentionsRes.status === 'fulfilled' && mentionsRes.value.ok) {
      const data = await mentionsRes.value.json()
      setAllMentions(data.mentions || [])
    }
    if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
      const data = await statsRes.value.json()
      setCompetitorData(data.competitors || [])
    }
    if (trendsRes.status === 'fulfilled' && trendsRes.value.ok) {
      const data = await trendsRes.value.json()
      setTrendData(data.trends || [])
    }

    setLoading(false)
  }, [email])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const generateBrief = async () => {
    setGeneratingBrief(true)
    const res = await fetch('/api/ci/weekly-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok) {
      const data = await res.json()
      setWeeklyBrief(data.brief)
      setShowBrief(true)
    }
    setGeneratingBrief(false)
  }

  const totalMentions = allMentions.length
  const topCompetitor = competitorData.length > 0 ? competitorData[0]?.name : 'None yet'

  const tabs = [
    { id: 'competitors', label: 'Tracked' },
    { id: 'quotes', label: 'Quotes' },
    { id: 'trends', label: 'Trends' },
  ]

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80">
            Competitive
          </p>
          <h1 className="font-bold text-3xl text-white leading-tight mt-1">
            Comp <span className="text-volt drop-shadow-[0_0_16px_rgba(0,230,118,0.4)]">Intel</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={generateBrief}
            disabled={generatingBrief}
            className="w-11 h-11 flex items-center justify-center rounded-xl glass cursor-pointer hover:border-volt/40 transition-all disabled:opacity-50"
            aria-label="Generate weekly brief"
          >
            <FileText className="w-4 h-4 text-volt" />
          </button>
          <button
            onClick={fetchData}
            className="w-11 h-11 flex items-center justify-center rounded-xl glass cursor-pointer hover:border-volt/40 transition-all"
            aria-label="Refresh data"
          >
            <RefreshCw className="w-4 h-4 text-volt" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-5 mt-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="glass-volt rounded-2xl p-5 text-center">
          <p className="font-bold text-4xl text-white leading-none tabular-nums drop-shadow-[0_0_12px_rgba(0,230,118,0.3)]">
            {totalMentions}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold mt-2 text-volt/80">
            Mentions
          </p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <p className="font-bold text-lg text-white truncate leading-tight">
            {topCompetitor}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold mt-2 text-white/50">
            Top Competitor
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-5">
        <GlassTabs items={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as CITab)} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Radar className="w-8 h-8 animate-spin text-volt" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'competitors' && (
            <motion.div
              key="competitors"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CompetitorTracker data={competitorData} />
            </motion.div>
          )}

          {activeTab === 'quotes' && (
            <motion.div
              key="quotes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <QuoteWall mentions={allMentions} />
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TrendChart data={trendData} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Weekly Brief Modal — glass bottom sheet */}
      <AnimatePresence>
        {showBrief && weeklyBrief && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowBrief(false)}
            />
            <motion.div
              className="relative w-full max-w-md glass rounded-t-3xl p-6 pb-safe max-h-[80vh] overflow-y-auto"
              style={{
                background:
                  'linear-gradient(180deg, rgba(10, 28, 48, 0.95) 0%, rgba(6, 18, 34, 0.98) 100%)',
                backdropFilter: 'blur(28px) saturate(160%)',
                WebkitBackdropFilter: 'blur(28px) saturate(160%)',
                borderTop: '1px solid rgba(0, 230, 118, 0.3)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.2), 0 -20px 60px -10px rgba(0, 230, 118, 0.15), 0 -40px 80px -20px rgba(0, 0, 0, 0.8)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />

              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80">
                This Week
              </p>
              <h2 className="font-bold text-2xl text-white leading-tight mt-1 mb-2">
                Weekly Brief
              </h2>
              <p className="font-body text-sm text-white/70 mb-6 leading-relaxed">
                {weeklyBrief.headline}
              </p>

              <div className="space-y-5">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt/70 mb-2">
                    Competitor Movement
                  </h3>
                  <p className="font-body text-sm text-white/80 leading-relaxed">
                    {weeklyBrief.competitor_movement}
                  </p>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt/70 mb-2">
                    Rep Highlights
                  </h3>
                  <p className="font-body text-sm text-white/80 leading-relaxed">
                    {weeklyBrief.rep_highlights}
                  </p>
                </div>

                {weeklyBrief.suggested_actions.length > 0 && (
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt/70 mb-2.5">
                      Suggested Actions
                    </h3>
                    <ul className="space-y-2">
                      {weeklyBrief.suggested_actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-volt mt-1.5 flex-shrink-0"
                            style={{ boxShadow: '0 0 6px rgba(0, 230, 118, 0.8)' }}
                          />
                          <span className="font-body text-sm text-white/80 leading-relaxed">
                            {action}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowBrief(false)}
                className="w-full mt-7 bg-volt text-black font-bold text-base py-4 rounded-xl uppercase tracking-wider shadow-glow-volt hover:shadow-glow-volt-lg transition-all cursor-pointer min-h-[44px]"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
