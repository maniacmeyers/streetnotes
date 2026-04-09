'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, FileText, Radar } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { CompetitorTracker } from '@/components/vbrick/ci/competitor-tracker'
import { QuoteWall } from '@/components/vbrick/ci/quote-wall'
import { TrendChart } from '@/components/vbrick/ci/trend-chart'
import type { QuoteFeedItem } from '@/lib/ci/types'

const t = neuTheme

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
  const [competitorData, setCompetitorData] = useState<Array<{ name: string; count: number; sentiment: { positive: number; negative: number; neutral: number } }>>([])
  const [trendData, setTrendData] = useState<Array<{ competitorName: string; trend: Array<{ weekLabel: string; count: number }> }>>([])
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
    { id: 'competitors' as CITab, label: 'Tracked' },
    { id: 'quotes' as CITab, label: 'Quotes' },
    { id: 'trends' as CITab, label: 'Trends' },
  ]

  return (
    <div className="px-4 pt-safe pb-4">
      {/* Header */}
      <div className="h-16 flex items-center justify-between">
        <h1 className="font-inter font-bold text-lg" style={{ color: t.colors.text.heading }}>
          Competitive Intel
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={generateBrief}
            disabled={generatingBrief}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50"
            style={{ background: t.colors.bg, boxShadow: t.shadows.raisedSm }}
            aria-label="Generate weekly brief"
          >
            <FileText className="w-4 h-4" style={{ color: t.colors.accent.primary }} />
          </button>
          <button
            onClick={fetchData}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ background: t.colors.bg, boxShadow: t.shadows.raisedSm }}
            aria-label="Refresh data"
          >
            <RefreshCw className="w-4 h-4" style={{ color: t.colors.text.muted }} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: t.colors.bg, boxShadow: t.shadows.raisedSm }}
        >
          <p className="font-fira-code font-bold text-2xl" style={{ color: t.colors.accent.primary }}>
            {totalMentions}
          </p>
          <p className="font-inter text-[11px] uppercase tracking-[0.15em] mt-1" style={{ color: t.colors.text.muted }}>
            Mentions
          </p>
        </div>
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: t.colors.bg, boxShadow: t.shadows.raisedSm }}
        >
          <p className="font-inter font-bold text-sm truncate" style={{ color: t.colors.text.heading }}>
            {topCompetitor}
          </p>
          <p className="font-inter text-[11px] uppercase tracking-[0.15em] mt-1" style={{ color: t.colors.text.muted }}>
            Top Competitor
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 rounded-xl font-inter text-sm font-bold uppercase tracking-wider transition-all duration-200 min-h-[44px]"
              style={{
                background: t.colors.bg,
                boxShadow: isActive ? t.shadows.insetSm : t.shadows.raisedSm,
                color: isActive ? t.colors.accent.primary : t.colors.text.muted,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Radar className="w-8 h-8 animate-spin" style={{ color: t.colors.accent.primary }} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'competitors' && (
            <motion.div key="competitors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CompetitorTracker data={competitorData} />
            </motion.div>
          )}

          {activeTab === 'quotes' && (
            <motion.div key="quotes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <QuoteWall mentions={allMentions} />
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div key="trends" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TrendChart data={trendData} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Weekly Brief Modal */}
      <AnimatePresence>
        {showBrief && weeklyBrief && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowBrief(false)}
            />
            <motion.div
              className="relative w-full max-w-md rounded-t-3xl p-6 pb-safe max-h-[80vh] overflow-y-auto"
              style={{ background: t.colors.bg, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: t.colors.shadow }} />
              <h2 className="font-inter font-bold text-lg mb-1" style={{ color: t.colors.text.heading }}>
                Weekly Intel Brief
              </h2>
              <p className="font-inter text-sm mb-4" style={{ color: t.colors.accent.primary }}>
                {weeklyBrief.headline}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-inter font-bold text-[11px] uppercase tracking-[0.15em] mb-1" style={{ color: t.colors.text.muted }}>
                    Competitor Movement
                  </h3>
                  <p className="font-inter text-sm" style={{ color: t.colors.text.body }}>
                    {weeklyBrief.competitor_movement}
                  </p>
                </div>

                <div>
                  <h3 className="font-inter font-bold text-[11px] uppercase tracking-[0.15em] mb-1" style={{ color: t.colors.text.muted }}>
                    Rep Highlights
                  </h3>
                  <p className="font-inter text-sm" style={{ color: t.colors.text.body }}>
                    {weeklyBrief.rep_highlights}
                  </p>
                </div>

                {weeklyBrief.suggested_actions.length > 0 && (
                  <div>
                    <h3 className="font-inter font-bold text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: t.colors.text.muted }}>
                      Suggested Actions
                    </h3>
                    <ul className="space-y-1.5">
                      {weeklyBrief.suggested_actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: t.colors.accent.primary }} />
                          <span className="font-inter text-sm" style={{ color: t.colors.text.body }}>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowBrief(false)}
                className="w-full mt-6 py-3 rounded-xl font-inter font-bold text-sm uppercase tracking-wider min-h-[44px]"
                style={{ background: t.colors.accent.primary, color: '#fff' }}
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
