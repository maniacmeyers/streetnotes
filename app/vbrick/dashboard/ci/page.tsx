'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react'
import { NeuCard, NeuButton, NeuTabs } from '@/components/vbrick/neu'
import { SNFeed } from '@/components/vbrick/ci/sn-feed'
import { CompetitorTracker } from '@/components/vbrick/ci/competitor-tracker'
import { QuoteWall } from '@/components/vbrick/ci/quote-wall'
import { TrendChart } from '@/components/vbrick/ci/trend-chart'
import { SessionStatsBar } from '@/components/vbrick/ci/session-stats-bar'
import { IntelToast } from '@/components/vbrick/ci/intel-toast'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'
import type { QuoteFeedItem, ServiceNowCategory } from '@/lib/ci/types'

type CITab = 'servicenow' | 'competitors' | 'quotes' | 'trends'

interface WeeklyBrief {
  headline: string
  servicenow_watch: string
  competitor_movement: string
  rep_highlights: string
  suggested_actions: string[]
  stats: {
    totalMentions: number
    snMentions: number
    totalDials: number
    totalConversations: number
    totalMeetings: number
  }
}

export default function CIDashboardPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<CITab>('servicenow')
  const [loading, setLoading] = useState(true)

  // Data
  const [snMentions, setSNMentions] = useState<QuoteFeedItem[]>([])
  const [allMentions, setAllMentions] = useState<QuoteFeedItem[]>([])
  const [competitorData, setCompetitorData] = useState<Array<{ name: string; count: number; sentiment: { positive: number; negative: number; neutral: number } }>>([])
  const [trendData, setTrendData] = useState<Array<{ competitorName: string; trend: Array<{ weekLabel: string; count: number }> }>>([])
  const [sessionStats, setSessionStats] = useState({ dials: 0, conversations: 0, meetings: 0 })
  const [weeklyBrief, setWeeklyBrief] = useState<WeeklyBrief | null>(null)
  const [showBrief, setShowBrief] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; category: ServiceNowCategory; visible: boolean }>({ message: '', category: 'servicenow_adoption', visible: false })

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmail(stored)
  }, [])

  const fetchData = useCallback(async () => {
    if (!email) return
    setLoading(true)

    const enc = encodeURIComponent(email)

    const [snRes, mentionsRes, statsRes, trendsRes] = await Promise.all([
      fetch(`/api/ci/servicenow?email=${enc}&timeRange=30d`),
      fetch(`/api/ci/mentions?email=${enc}&timeRange=30d&limit=100`),
      fetch(`/api/ci/stats?email=${enc}&timeRange=30d`),
      fetch(`/api/ci/trends?email=${enc}&timeRange=90d`),
    ])

    if (snRes.ok) {
      const data = await snRes.json()
      setSNMentions((data.mentions || []).map((m: Record<string, unknown>) => ({
        id: m.id,
        competitorName: m.competitor_name_normalized,
        contextQuote: m.context_quote,
        sentiment: m.sentiment,
        mentionCategory: m.mention_category,
        repEmail: m.rep_email,
        repName: m.rep_name,
        companyName: m.company_name,
        dealStage: m.deal_stage,
        snCategory: m.sn_category,
        accountName: m.account_name,
        acknowledged: m.acknowledged ?? false,
        createdAt: m.created_at,
      })) as QuoteFeedItem[])
    }

    if (mentionsRes.ok) {
      const data = await mentionsRes.json()
      setAllMentions(data.mentions || [])

      // Build competitor tracker data
      const byCompetitor: Record<string, { count: number; sentiment: { positive: number; negative: number; neutral: number } }> = {}
      for (const m of (data.mentions || []) as QuoteFeedItem[]) {
        if (!byCompetitor[m.competitorName]) {
          byCompetitor[m.competitorName] = { count: 0, sentiment: { positive: 0, negative: 0, neutral: 0 } }
        }
        byCompetitor[m.competitorName].count++
        byCompetitor[m.competitorName].sentiment[m.sentiment]++
      }
      setCompetitorData(
        Object.entries(byCompetitor)
          .map(([name, d]) => ({ name, ...d }))
          .sort((a, b) => b.count - a.count)
      )
    }

    if (statsRes.ok) {
      const data = await statsRes.json()
      setSessionStats({
        dials: data.totalDials || 0,
        conversations: data.totalConversations || 0,
        meetings: data.totalMeetings || 0,
      })
    }

    if (trendsRes.ok) {
      const data = await trendsRes.json()
      setTrendData((data.trends || []).map((t: { competitorName: string; trend: Array<{ weekLabel: string; count: number }> }) => ({
        competitorName: t.competitorName,
        trend: t.trend,
      })))
    }

    setLoading(false)
  }, [email])

  useEffect(() => {
    if (email) fetchData()
  }, [email, fetchData])

  const handleAcknowledge = async (mentionId: string) => {
    const res = await fetch('/api/ci/servicenow', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentionId, acknowledgedBy: email }),
    })

    if (res.ok) {
      setSNMentions((prev) =>
        prev.map((m) => (m.id === mentionId ? { ...m, acknowledged: true } : m))
      )
      const mention = snMentions.find((m) => m.id === mentionId)
      if (mention?.snCategory) {
        setToast({
          message: `Intel captured: ${mention.accountName || mention.companyName || 'Unknown account'}`,
          category: mention.snCategory,
          visible: true,
        })
      }
    }
  }

  const handleGenerateBrief = async () => {
    if (!email) return
    const res = await fetch('/api/ci/weekly-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.brief?.brief_content) {
        setWeeklyBrief(data.brief.brief_content)
        setShowBrief(true)
      }
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: neuTheme.colors.bg }}>
        <NeuCard className="max-w-sm w-full text-center">
          <p className="font-satoshi text-sm mb-4" style={{ color: neuTheme.colors.text.body }}>
            Enter your email to access the CI Dashboard
          </p>
          <input
            type="email"
            className="w-full p-3 rounded-xl text-sm font-satoshi outline-none mb-4"
            style={{ background: neuTheme.colors.bg, boxShadow: neuTheme.shadows.inset, color: neuTheme.colors.text.body }}
            placeholder="you@company.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) { localStorage.setItem('vbrick_email', val); setEmail(val) }
              }
            }}
          />
        </NeuCard>
      </div>
    )
  }

  const tabs = [
    { id: 'servicenow' as const, label: 'ServiceNow Intel' },
    { id: 'competitors' as const, label: 'Competitors' },
    { id: 'quotes' as const, label: 'Quote Wall' },
    { id: 'trends' as const, label: 'Trends' },
  ]

  return (
    <div className="min-h-screen" style={{ background: neuTheme.colors.bg }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-general-sans font-bold" style={{ color: neuTheme.colors.text.heading }}>
              CI Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <NeuButton variant="raised" size="sm" onClick={handleGenerateBrief}>
                <FileText size={16} className="mr-2 inline" />
                Weekly Brief
              </NeuButton>
              <NeuButton variant="icon" onClick={fetchData}>
                <RefreshCw size={16} />
              </NeuButton>
              <a
                href="/vbrick/dashboard"
                className="flex items-center gap-2 font-satoshi text-sm"
                style={{ color: neuTheme.colors.text.muted }}
              >
                <ArrowLeft size={16} /> Dashboard
              </a>
            </div>
          </div>

          {/* Session Stats */}
          <SessionStatsBar
            dials={sessionStats.dials}
            conversations={sessionStats.conversations}
            meetings={sessionStats.meetings}
            loading={loading}
          />
        </motion.div>

        {/* Weekly Brief Modal */}
        {showBrief && weeklyBrief && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <NeuCard padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-general-sans font-bold text-lg" style={{ color: neuTheme.colors.text.heading }}>
                  Weekly Intelligence Brief
                </h2>
                <NeuButton variant="icon" onClick={() => setShowBrief(false)}>
                  &times;
                </NeuButton>
              </div>
              <p className="font-satoshi font-medium text-base mb-4" style={{ color: neuTheme.colors.accent.primary }}>
                {weeklyBrief.headline}
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-general-sans font-semibold text-sm mb-1" style={{ color: neuTheme.colors.text.heading }}>ServiceNow Watch</h3>
                  <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>{weeklyBrief.servicenow_watch}</p>
                </div>
                <div>
                  <h3 className="font-general-sans font-semibold text-sm mb-1" style={{ color: neuTheme.colors.text.heading }}>Competitor Movement</h3>
                  <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>{weeklyBrief.competitor_movement}</p>
                </div>
                <div>
                  <h3 className="font-general-sans font-semibold text-sm mb-1" style={{ color: neuTheme.colors.text.heading }}>Rep Highlights</h3>
                  <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>{weeklyBrief.rep_highlights}</p>
                </div>
                {weeklyBrief.suggested_actions?.length > 0 && (
                  <div>
                    <h3 className="font-general-sans font-semibold text-sm mb-1" style={{ color: neuTheme.colors.text.heading }}>Suggested Actions</h3>
                    <ul className="space-y-1">
                      {weeklyBrief.suggested_actions.map((action, i) => (
                        <li key={i} className="font-satoshi text-sm flex items-start gap-2" style={{ color: neuTheme.colors.text.body }}>
                          <span style={{ color: neuTheme.colors.accent.primary }}>-</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </NeuCard>
          </motion.div>
        )}

        {/* Tabs */}
        <NeuTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as CITab)}
          className="mb-6"
        />

        {/* Tab Content */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {activeTab === 'servicenow' && (
            <motion.div variants={cascadeIn} custom={0}>
              <SNFeed
                mentions={snMentions}
                onAcknowledge={handleAcknowledge}
                loading={loading}
              />
            </motion.div>
          )}

          {activeTab === 'competitors' && (
            <motion.div variants={cascadeIn} custom={0}>
              <CompetitorTracker data={competitorData} loading={loading} />
            </motion.div>
          )}

          {activeTab === 'quotes' && (
            <motion.div variants={cascadeIn} custom={0}>
              <QuoteWall mentions={allMentions} loading={loading} />
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div variants={cascadeIn} custom={0}>
              <TrendChart data={trendData} loading={loading} />
            </motion.div>
          )}
        </motion.div>
      </div>

      <IntelToast
        message={toast.message}
        category={toast.category}
        visible={toast.visible}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  )
}
