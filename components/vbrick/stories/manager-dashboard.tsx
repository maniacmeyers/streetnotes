'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Users, TrendingUp, Flame, AlertTriangle, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { NeuCard, NeuBadge } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'
import { VaultCard } from './vault-card'
import type { VaultEntry } from '@/lib/vbrick/story-types'

interface RepData {
  email: string
  name: string
  level: number
  level_name: string
  xp: number
  streak: number
  sessions_7d: number
  sessions_30d: number
  avg_scores: Record<string, number>
  score_delta_week: number
}

interface TeamTotals {
  total_sessions_30d: number
  avg_composite: number
  active_reps: number
  best_streak: number
}

interface ManagerData {
  reps: RepData[]
  team_totals: TeamTotals
  top_stories: VaultEntry[]
}

function scoreColor(score: number): string {
  if (score <= 3) return '#dc2626'
  if (score <= 6) return '#d97706'
  if (score <= 8) return '#6366f1'
  return '#16a34a'
}

interface ManagerDashboardProps {
  email: string
}

export function ManagerDashboard({ email }: ManagerDashboardProps) {
  const [data, setData] = useState<ManagerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'sessions_7d' | 'avg' | 'streak' | 'delta'>('sessions_7d')

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const res = await fetch(`/api/vbrick/stories/manager?email=${encodeURIComponent(email)}`)
        if (res.status === 403) {
          setError('Manager access required')
          return
        }
        if (!res.ok) throw new Error('Failed to load')
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [email])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl animate-pulse"
            style={{ background: neuTheme.colors.bg, boxShadow: neuTheme.shadows.raised }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <NeuCard variant="inset" className="text-center py-12">
        <AlertTriangle size={24} className="mx-auto mb-3" style={{ color: '#d97706' }} />
        <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>{error}</p>
      </NeuCard>
    )
  }

  if (!data) return null

  const { reps, team_totals, top_stories } = data

  // Sort reps
  const sortedReps = [...reps].sort((a, b) => {
    if (sortBy === 'sessions_7d') return b.sessions_7d - a.sessions_7d
    if (sortBy === 'streak') return b.streak - a.streak
    if (sortBy === 'delta') return b.score_delta_week - a.score_delta_week
    // avg
    const avgA = Object.values(a.avg_scores).filter(Boolean)
    const avgB = Object.values(b.avg_scores).filter(Boolean)
    const meanA = avgA.length > 0 ? avgA.reduce((x, y) => x + y, 0) / avgA.length : 0
    const meanB = avgB.length > 0 ? avgB.reduce((x, y) => x + y, 0) / avgB.length : 0
    return meanB - meanA
  })

  const statCards = [
    { label: 'Sessions (30d)', value: team_totals.total_sessions_30d, icon: <TrendingUp size={16} /> },
    { label: 'Avg Score', value: team_totals.avg_composite.toFixed(1), icon: <Trophy size={16} /> },
    { label: 'Active Reps', value: team_totals.active_reps, icon: <Users size={16} /> },
    { label: 'Best Streak', value: team_totals.best_streak, icon: <Flame size={16} /> },
  ]

  const sortOptions: { key: typeof sortBy; label: string }[] = [
    { key: 'sessions_7d', label: 'Activity' },
    { key: 'avg', label: 'Avg Score' },
    { key: 'streak', label: 'Streak' },
    { key: 'delta', label: 'Improvement' },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Team Stats */}
      <motion.div variants={cascadeIn} custom={0}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((card) => (
            <NeuCard key={card.label} padding="md" hover={false}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: neuTheme.colors.accent.primary }}>{card.icon}</span>
                <span
                  className="text-[10px] font-satoshi font-medium uppercase tracking-widest"
                  style={{ color: neuTheme.colors.text.muted }}
                >
                  {card.label}
                </span>
              </div>
              <span
                className="font-general-sans font-black text-2xl tabular-nums"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {card.value}
              </span>
            </NeuCard>
          ))}
        </div>
      </motion.div>

      {/* Sort Controls */}
      <motion.div variants={cascadeIn} custom={1}>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.muted }}>
            Sort by:
          </span>
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className="px-3 py-1.5 rounded-xl text-xs font-satoshi font-medium border-none cursor-pointer transition-all duration-150"
              style={{
                background: sortBy === opt.key ? neuTheme.colors.accent.primary : neuTheme.colors.bg,
                color: sortBy === opt.key ? '#fff' : neuTheme.colors.text.muted,
                boxShadow: sortBy === opt.key ? 'none' : neuTheme.shadows.raisedSm,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Rep Table */}
      <motion.div variants={cascadeIn} custom={2}>
        <div className="space-y-3">
          {sortedReps.map((rep) => {
            const needsEncouragement = rep.sessions_7d === 0

            return (
              <NeuCard
                key={rep.email}
                padding="md"
                hover={false}
                className={needsEncouragement ? 'relative' : ''}
              >
                {needsEncouragement && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ background: '#d97706' }}
                  />
                )}

                {/* Name + Level Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: neuTheme.colors.accent.primary,
                        boxShadow: neuTheme.shadows.raisedSm,
                      }}
                    >
                      <span className="font-general-sans font-bold text-white text-xs">
                        {rep.level}
                      </span>
                    </div>
                    <div>
                      <span className="font-general-sans font-bold text-sm" style={{ color: neuTheme.colors.text.heading }}>
                        {rep.name}
                      </span>
                      <span className="ml-2 text-xs font-satoshi" style={{ color: neuTheme.colors.text.subtle }}>
                        {rep.level_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Streak */}
                    <div className="flex items-center gap-1">
                      <Flame size={14} style={{ color: rep.streak > 0 ? '#f97316' : neuTheme.colors.text.subtle }} />
                      <span
                        className="font-general-sans font-bold text-sm tabular-nums"
                        style={{ color: rep.streak > 0 ? '#f97316' : neuTheme.colors.text.subtle }}
                      >
                        {rep.streak}
                      </span>
                    </div>

                    {/* Delta */}
                    {rep.score_delta_week !== 0 && (
                      <div className="flex items-center gap-0.5">
                        {rep.score_delta_week > 0 ? (
                          <ArrowUpRight size={14} style={{ color: '#16a34a' }} />
                        ) : (
                          <ArrowDownRight size={14} style={{ color: '#dc2626' }} />
                        )}
                        <span
                          className="text-xs font-general-sans font-bold tabular-nums"
                          style={{ color: rep.score_delta_week > 0 ? '#16a34a' : '#dc2626' }}
                        >
                          {Math.abs(rep.score_delta_week).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-satoshi uppercase tracking-widest" style={{ color: neuTheme.colors.text.subtle }}>
                      7d
                    </span>
                    <span
                      className="font-general-sans font-bold text-sm tabular-nums"
                      style={{ color: rep.sessions_7d > 0 ? neuTheme.colors.text.heading : neuTheme.colors.text.subtle }}
                    >
                      {rep.sessions_7d}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-satoshi uppercase tracking-widest" style={{ color: neuTheme.colors.text.subtle }}>
                      30d
                    </span>
                    <span
                      className="font-general-sans font-bold text-sm tabular-nums"
                      style={{ color: neuTheme.colors.text.heading }}
                    >
                      {rep.sessions_30d}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-satoshi uppercase tracking-widest" style={{ color: neuTheme.colors.text.subtle }}>
                      XP
                    </span>
                    <span
                      className="font-general-sans font-bold text-sm tabular-nums"
                      style={{ color: neuTheme.colors.text.heading }}
                    >
                      {rep.xp.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Score by Type */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {(['elevator_pitch', 'feel_felt_found', 'abt_customer_story'] as const).map((type) => {
                    const s = rep.avg_scores[type] || 0
                    return (
                      <NeuBadge key={type} variant={s > 0 ? 'accent' : 'default'} size="sm">
                        <span className="text-[10px]">
                          {type === 'elevator_pitch' ? 'EP' : type === 'feel_felt_found' ? 'FFF' : 'ABT'}
                        </span>
                        <span
                          className="ml-1 font-bold tabular-nums"
                          style={{ color: s > 0 ? scoreColor(s) : undefined }}
                        >
                          {s > 0 ? s.toFixed(1) : '—'}
                        </span>
                      </NeuBadge>
                    )
                  })}
                </div>

                {needsEncouragement && (
                  <p className="mt-2 text-[11px] font-satoshi" style={{ color: '#d97706' }}>
                    No practice sessions this week
                  </p>
                )}
              </NeuCard>
            )
          })}
        </div>
      </motion.div>

      {/* Top Team Stories */}
      {top_stories.length > 0 && (
        <motion.div variants={cascadeIn} custom={3}>
          <h3 className="font-general-sans font-bold text-lg mb-4" style={{ color: neuTheme.colors.text.heading }}>
            Top Team Stories
          </h3>
          <div className="space-y-3">
            {top_stories.map((entry) => (
              <VaultCard key={entry.id} entry={entry} showAuthor />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
