'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, Sparkles, Radar } from 'lucide-react'
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
    <div className="fg-page">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="fg-eyebrow">
            Competitive
          </p>
          <h1 className="fg-title mt-3">
            Comp Intel
          </h1>
        </div>
        <button
          onClick={fetchData}
          className="fg-convex mt-1 flex h-12 w-12 items-center justify-center"
          aria-label="Refresh data"
        >
          <RefreshCw className="h-4 w-4 text-[#A8855A]" />
        </button>
      </div>

      {/* Generate brief CTA */}
      <button
        type="button"
        onClick={generateBrief}
        disabled={generatingBrief || totalMentions === 0}
        className="fg-action mt-5 flex items-center justify-center gap-2 disabled:opacity-50"
        aria-busy={generatingBrief}
      >
        {generatingBrief ? (
          <>
            <Radar className="h-4 w-4 animate-spin" />
            Generating brief...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate weekly brief
          </>
        )}
      </button>

      {/* Stats row */}
      <motion.div
        className="mb-5 mt-5 flex flex-col gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="fg-card p-[22px] text-center">
          <p className="text-4xl font-extrabold leading-none text-[#A8855A] tabular-nums">
            {totalMentions}
          </p>
          <p className="mt-2 text-sm font-extrabold text-[#8B6B40]">
            {totalMentions === 1 ? 'Mention captured' : 'Mentions captured'}
          </p>
        </div>
        {competitorData.length > 0 && (
          <div className="fg-card p-[22px] text-center">
            <p className="truncate text-lg font-extrabold leading-tight text-[#1A1410]">
              {topCompetitor}
            </p>
            <p className="mt-2 text-sm font-extrabold text-[#3D332A]">
              Top Competitor
            </p>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="mb-5">
        <GlassTabs items={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as CITab)} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Radar className="h-8 w-8 animate-spin text-[#A8855A]" />
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
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: 'rgba(26, 20, 16, 0.34)' }}
              onClick={() => setShowBrief(false)}
            />
            <motion.div
              className="relative max-h-[80vh] w-full max-w-[430px] overflow-y-auto rounded-t-[32px] bg-[#F2EBDF] p-6 pb-safe"
              style={{
                boxShadow:
                  '8px 8px 20px rgba(139, 107, 64, 0.22), -8px -8px 20px rgba(250, 246, 238, 0.95), 0 -16px 36px rgba(212, 162, 138, 0.24)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-[#A8855A]/30" />

              <p className="fg-eyebrow">
                This Week
              </p>
              <h2 className="mb-2 mt-3 text-2xl font-extrabold leading-tight text-[#1A1410]">
                Weekly Brief
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-[#3D332A]">
                {weeklyBrief.headline}
              </p>

              <div className="space-y-5">
                <div>
                  <h3 className="mb-2 text-sm font-extrabold text-[#8B6B40]">
                    Competitor Movement
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3D332A]">
                    {weeklyBrief.competitor_movement}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-extrabold text-[#8B6B40]">
                    Rep Highlights
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3D332A]">
                    {weeklyBrief.rep_highlights}
                  </p>
                </div>

                {weeklyBrief.suggested_actions.length > 0 && (
                  <div>
                    <h3 className="mb-2.5 text-sm font-extrabold text-[#8B6B40]">
                      Suggested Actions
                    </h3>
                    <ul className="space-y-2">
                      {weeklyBrief.suggested_actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#A8855A]"
                          />
                          <span className="text-sm leading-relaxed text-[#3D332A]">
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
                className="fg-action mt-7"
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
