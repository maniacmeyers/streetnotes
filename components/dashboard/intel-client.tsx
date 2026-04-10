'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, FileText, Radar } from 'lucide-react'
import { CompetitorTracker, QuoteWall, TrendChart } from '@/components/streetnotes/ci'
import { BrutalCard, BrutalButton, BrutalTabs } from '@/components/streetnotes/brutal'
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
    <div className="px-4 pt-safe pb-4">
      {/* Header */}
      <div className="h-20 flex items-end justify-between pb-2 gap-3">
        <h1
          className="font-display uppercase text-2xl sm:text-3xl text-white leading-[0.85]"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          Comp <span className="text-volt">Intel</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={generateBrief}
            disabled={generatingBrief}
            className="w-11 h-11 flex items-center justify-center bg-black border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-transform duration-100 disabled:opacity-50"
            aria-label="Generate weekly brief"
          >
            <FileText className="w-4 h-4 text-volt" />
          </button>
          <button
            onClick={fetchData}
            className="w-11 h-11 flex items-center justify-center bg-black border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-transform duration-100"
            aria-label="Refresh data"
          >
            <RefreshCw className="w-4 h-4 text-volt" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-5 mt-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <BrutalCard variant="volt" padded={false} className="p-4 text-center">
          <p className="font-display text-4xl text-black leading-none">{totalMentions}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold mt-2 text-black">
            Mentions
          </p>
        </BrutalCard>
        <BrutalCard variant="white" padded={false} className="p-4 text-center">
          <p className="font-display uppercase text-lg text-black truncate leading-none">
            {topCompetitor}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold mt-2 text-black">
            Top Competitor
          </p>
        </BrutalCard>
      </motion.div>

      {/* Tabs */}
      <div className="mb-5">
        <BrutalTabs items={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as CITab)} />
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

      {/* Weekly Brief Modal */}
      <AnimatePresence>
        {showBrief && weeklyBrief && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowBrief(false)} />
            <motion.div
              className="relative w-full max-w-md bg-white border-t-8 border-x-4 border-black p-6 pb-safe max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-16 h-1 bg-black mx-auto mb-4" />
              <h2 className="font-display uppercase text-2xl text-black leading-none mb-1">
                Weekly Brief
              </h2>
              <p className="font-body italic text-sm text-black/70 mb-5">
                {weeklyBrief.headline}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-black/60 mb-1">
                    Competitor Movement
                  </h3>
                  <p className="font-body text-sm text-black">{weeklyBrief.competitor_movement}</p>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-black/60 mb-1">
                    Rep Highlights
                  </h3>
                  <p className="font-body text-sm text-black">{weeklyBrief.rep_highlights}</p>
                </div>

                {weeklyBrief.suggested_actions.length > 0 && (
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-black/60 mb-2">
                      Suggested Actions
                    </h3>
                    <ul className="space-y-1.5">
                      {weeklyBrief.suggested_actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-volt border border-black mt-1.5 flex-shrink-0" />
                          <span className="font-body text-sm text-black">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <BrutalButton
                onClick={() => setShowBrief(false)}
                variant="volt"
                size="md"
                className="w-full mt-6"
              >
                Done
              </BrutalButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
