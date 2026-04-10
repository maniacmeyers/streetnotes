'use client'

import { useEffect, useState } from 'react'
import { Flame, Target } from 'lucide-react'

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
        /* silent */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchGamification()
    return () => {
      cancelled = true
    }
  }, [email])

  if (loading || !data) {
    return <div className="h-20 glass rounded-2xl animate-pulse" />
  }

  const { state, daily_challenge } = data
  const streakActive = state.current_streak > 0

  return (
    <div className="space-y-3">
      {/* Level + XP + Streak */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-4">
          {/* Level Badge */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, rgba(0, 255, 140, 0.35) 0%, rgba(10, 20, 15, 0.95) 60%, #000 100%)',
              border: '1.5px solid rgba(0, 230, 118, 0.5)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 20px rgba(0, 230, 118, 0.3)',
            }}
          >
            <span className="font-bold text-2xl text-volt leading-none drop-shadow-[0_0_6px_rgba(0,230,118,0.6)]">
              {state.level}
            </span>
          </div>

          {/* Level Info + XP bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white truncate leading-none">
                Lv.{state.level} {state.level_name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-volt tabular-nums shrink-0 font-bold">
                {state.xp_total.toLocaleString()} XP
              </span>
            </div>

            {/* Glass progress bar */}
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, state.level_progress))}%`,
                  background: 'linear-gradient(90deg, #00E676 0%, #7dff9f 100%)',
                  boxShadow: '0 0 8px rgba(0, 230, 118, 0.6)',
                }}
              />
            </div>

            {state.next_level && (
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40 mt-1.5">
                {state.next_level.xpRequired - state.xp_total} XP to {state.next_level.name}
              </p>
            )}
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center shrink-0 ml-1">
            <Flame
              size={22}
              className={streakActive ? 'text-volt' : 'text-white/20'}
              style={
                streakActive
                  ? { filter: 'drop-shadow(0 0 6px rgba(0, 230, 118, 0.6))' }
                  : undefined
              }
            />
            <span
              className={`font-display text-2xl tabular-nums leading-none ${
                streakActive ? 'text-volt drop-shadow-[0_0_6px_rgba(0,230,118,0.6)]' : 'text-white/20'
              }`}
            >
              {state.current_streak}
            </span>
            <span className="text-[9px] uppercase tracking-[0.15em] font-mono font-bold text-white/40 mt-0.5">
              streak
            </span>
          </div>
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="glass-volt rounded-2xl p-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl glass-inset flex items-center justify-center shrink-0"
            style={{
              boxShadow:
                'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.1), 0 0 12px rgba(0,230,118,0.2)',
            }}
          >
            <Target size={16} className="text-volt drop-shadow-[0_0_4px_rgba(0,230,118,0.6)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt">
              Daily Challenge
            </p>
            <p className="font-body text-sm text-white truncate mt-0.5">
              {daily_challenge.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
