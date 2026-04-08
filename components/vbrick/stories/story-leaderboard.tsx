'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Trophy, Flame, Rocket, Shield, BookOpen } from 'lucide-react'
import { NeuCard, NeuBadge } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'

/* ─── Types ─── */

interface BestScores {
  elevator_pitch?: number
  feel_felt_found?: number
  abt_customer_story?: number
}

interface LeaderboardEntry {
  bdr_email: string
  display_name: string
  level: number
  level_name: string
  xp_total: number
  current_streak: number
  best_scores: BestScores
  overall_avg: number
}

interface StoryLeaderboardProps {
  currentEmail: string
}

/* ─── Score Color ─── */

function scoreColor(score: number): string {
  if (score <= 3) return '#dc2626'
  if (score <= 6) return '#d97706'
  if (score <= 8) return '#6366f1'
  return '#16a34a'
}

/* ─── Rank Icon ─── */

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Trophy size={20} style={{ color: '#f59e0b' }} />
  }
  if (rank === 2) {
    return <Trophy size={20} style={{ color: '#9ca3af' }} />
  }
  if (rank === 3) {
    return <Trophy size={20} style={{ color: '#d97706' }} />
  }
  return (
    <span
      className="font-general-sans font-bold text-sm tabular-nums w-5 text-center"
      style={{ color: neuTheme.colors.text.muted }}
    >
      {rank}
    </span>
  )
}

/* ─── Mini Score Badge ─── */

function ScoreBadge({
  label,
  icon: Icon,
  score,
}: {
  label: string
  icon: typeof Rocket
  score?: number
}) {
  if (score === undefined) {
    return (
      <NeuBadge size="sm">
        <Icon size={10} className="mr-1" style={{ color: neuTheme.colors.text.subtle }} />
        <span style={{ color: neuTheme.colors.text.subtle }}>{label} —</span>
      </NeuBadge>
    )
  }

  const color = scoreColor(score)

  return (
    <span
      className="inline-flex items-center font-satoshi font-medium px-2.5 py-0.5 text-[11px]"
      style={{
        background: `${color}18`,
        color,
        borderRadius: neuTheme.radii.full,
        letterSpacing: '0.05em',
      }}
    >
      <Icon size={10} className="mr-1" />
      {label} {score.toFixed(1)}
    </span>
  )
}

/* ─── Skeleton ─── */

function LeaderboardSkeleton() {
  return (
    <NeuCard padding="md" hover={false}>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 rounded-2xl animate-pulse"
            style={{
              background: neuTheme.colors.bgLight,
              boxShadow: neuTheme.shadows.insetSm,
              borderRadius: neuTheme.radii.lg,
            }}
          />
        ))}
      </div>
    </NeuCard>
  )
}

/* ─── Main Component ─── */

export function StoryLeaderboard({ currentEmail }: StoryLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/vbrick/stories/leaderboard')
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) setEntries(json.leaderboard || [])
      } catch {
        // silent — leaderboard is non-critical
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLeaderboard()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <LeaderboardSkeleton />

  if (entries.length === 0) {
    return (
      <NeuCard padding="lg" hover={false}>
        <div className="text-center py-6">
          <Trophy
            size={32}
            className="mx-auto mb-3"
            style={{ color: neuTheme.colors.text.subtle }}
          />
          <p
            className="font-satoshi text-sm"
            style={{ color: neuTheme.colors.text.muted }}
          >
            No one has practiced yet. Be the first to record a story.
          </p>
        </div>
      </NeuCard>
    )
  }

  return (
    <NeuCard padding="md" hover={false}>
      <h3
        className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium mb-4"
        style={{ color: neuTheme.colors.accent.primary }}
      >
        Story Vault Leaderboard
      </h3>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {entries.map((entry, idx) => {
          const rank = idx + 1
          const isCurrentUser =
            entry.bdr_email.toLowerCase() === currentEmail.toLowerCase()
          const streakActive = entry.current_streak > 0

          return (
            <motion.div key={entry.bdr_email} variants={cascadeIn} custom={idx}>
              <NeuCard
                variant="inset"
                padding="sm"
                hover={false}
                radius="lg"
                style={
                  isCurrentUser
                    ? {
                        borderLeft: `3px solid ${neuTheme.colors.accent.primary}`,
                      }
                    : undefined
                }
              >
                {/* Desktop row */}
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-6 flex justify-center shrink-0">
                    <RankDisplay rank={rank} />
                  </div>

                  {/* Level badge */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: neuTheme.colors.accent.primary,
                      boxShadow: neuTheme.shadows.raisedSm,
                    }}
                  >
                    <span className="font-general-sans font-black text-white text-xs">
                      {entry.level}
                    </span>
                  </div>

                  {/* Name + XP */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-general-sans font-bold text-sm truncate"
                      style={{ color: neuTheme.colors.text.heading }}
                    >
                      {entry.display_name}
                    </p>
                    <p
                      className="font-satoshi text-[11px]"
                      style={{ color: neuTheme.colors.text.muted }}
                    >
                      {entry.xp_total.toLocaleString()} XP
                    </p>
                  </div>

                  {/* Score badges — hidden on mobile, shown on md+ */}
                  <div className="hidden md:flex items-center gap-1.5 shrink-0">
                    <ScoreBadge
                      label="EP"
                      icon={Rocket}
                      score={entry.best_scores.elevator_pitch}
                    />
                    <ScoreBadge
                      label="FFF"
                      icon={Shield}
                      score={entry.best_scores.feel_felt_found}
                    />
                    <ScoreBadge
                      label="ABT"
                      icon={BookOpen}
                      score={entry.best_scores.abt_customer_story}
                    />
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Flame
                      size={16}
                      style={{
                        color: streakActive
                          ? '#f97316'
                          : neuTheme.colors.text.subtle,
                      }}
                    />
                    <span
                      className="font-general-sans font-bold text-xs tabular-nums"
                      style={{
                        color: streakActive
                          ? '#f97316'
                          : neuTheme.colors.text.subtle,
                      }}
                    >
                      {entry.current_streak}
                    </span>
                  </div>
                </div>

                {/* Mobile scores — shown below name on small screens */}
                <div className="flex items-center gap-1.5 mt-2 md:hidden">
                  <ScoreBadge
                    label="EP"
                    icon={Rocket}
                    score={entry.best_scores.elevator_pitch}
                  />
                  <ScoreBadge
                    label="FFF"
                    icon={Shield}
                    score={entry.best_scores.feel_felt_found}
                  />
                  <ScoreBadge
                    label="ABT"
                    icon={BookOpen}
                    score={entry.best_scores.abt_customer_story}
                  />
                </div>
              </NeuCard>
            </motion.div>
          )
        })}
      </motion.div>
    </NeuCard>
  )
}
