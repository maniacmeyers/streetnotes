'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Flame, Target } from 'lucide-react'
import { NeuCard } from '@/components/vbrick/neu'
import { NeuProgress } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'

interface GamificationData {
  state: {
    xp_total: number
    level: number
    level_name: string
    level_progress: number
    next_level: { level: number; name: string; xpRequired: number } | null
    current_streak: number
    longest_streak: number
    badges: { id: string; name: string; icon: string }[]
  }
  daily_challenge: {
    type: string
    description: string
    storyType?: string
    targetScore?: number
  }
}

interface GamificationHeaderProps {
  email: string
}

export function GamificationHeader({ email }: GamificationHeaderProps) {
  const [data, setData] = useState<GamificationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchGamification() {
      try {
        const res = await fetch(`/api/vbrick/stories/gamification?email=${encodeURIComponent(email)}`)
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        // silent — gamification is non-critical
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchGamification()
    return () => { cancelled = true }
  }, [email])

  if (loading || !data) {
    return (
      <div
        className="h-20 rounded-2xl animate-pulse"
        style={{ background: neuTheme.colors.bg, boxShadow: neuTheme.shadows.raised, borderRadius: neuTheme.radii.xl }}
      />
    )
  }

  const { state, daily_challenge } = data
  const streakActive = state.current_streak > 0

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Level + XP + Streak Row */}
      <motion.div variants={cascadeIn} custom={0}>
        <NeuCard padding="md" hover={false}>
          <div className="flex items-center gap-4">
            {/* Level Badge */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: neuTheme.colors.accent.primary,
                boxShadow: neuTheme.shadows.raisedSm,
              }}
            >
              <span className="font-general-sans font-black text-white text-sm">
                {state.level}
              </span>
            </div>

            {/* Level Info + XP bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-general-sans font-bold text-sm truncate"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  Lv.{state.level} {state.level_name}
                </span>
                <span
                  className="font-satoshi text-xs tabular-nums shrink-0"
                  style={{ color: neuTheme.colors.text.muted }}
                >
                  {state.xp_total.toLocaleString()} XP
                </span>
              </div>

              <NeuProgress
                value={state.level_progress}
                color={neuTheme.colors.accent.primary}
                height={8}
              />

              {state.next_level && (
                <p
                  className="font-satoshi text-[11px] mt-1"
                  style={{ color: neuTheme.colors.text.subtle }}
                >
                  {state.next_level.xpRequired - state.xp_total} XP to {state.next_level.name}
                </p>
              )}
            </div>

            {/* Streak */}
            <div className="flex flex-col items-center shrink-0 ml-2">
              <Flame
                size={22}
                style={{
                  color: streakActive ? '#f97316' : neuTheme.colors.text.subtle,
                }}
              />
              <span
                className="font-general-sans font-bold text-sm tabular-nums"
                style={{ color: streakActive ? '#f97316' : neuTheme.colors.text.subtle }}
              >
                {state.current_streak}
              </span>
              <span
                className="text-[9px] uppercase tracking-widest font-satoshi"
                style={{ color: neuTheme.colors.text.subtle }}
              >
                streak
              </span>
            </div>
          </div>
        </NeuCard>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div variants={cascadeIn} custom={1}>
        <NeuCard variant="inset" padding="sm" hover={false}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raisedSm,
              }}
            >
              <Target size={16} style={{ color: neuTheme.colors.accent.primary }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[10px] font-satoshi font-medium uppercase tracking-widest"
                style={{ color: neuTheme.colors.accent.primary }}
              >
                Daily Challenge
              </p>
              <p
                className="font-satoshi text-sm leading-snug break-words line-clamp-3"
                style={{ color: neuTheme.colors.text.body }}
              >
                {daily_challenge.description}
              </p>
            </div>
          </div>
        </NeuCard>
      </motion.div>
    </motion.div>
  )
}
