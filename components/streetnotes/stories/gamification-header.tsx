'use client'

import { useEffect, useState } from 'react'
import { Flame, Target } from 'lucide-react'
import { BrutalCard } from '@/components/streetnotes/brutal'

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
    return <div className="h-20 bg-gray-900 border-4 border-black shadow-neo-sm animate-pulse" />
  }

  const { state, daily_challenge } = data
  const streakActive = state.current_streak > 0

  return (
    <div className="space-y-3">
      {/* Level + XP + Streak */}
      <BrutalCard variant="black" padded={false} className="p-4">
        <div className="flex items-center gap-4">
          {/* Level Badge */}
          <div className="w-12 h-12 bg-volt border-4 border-black flex items-center justify-center shrink-0">
            <span className="font-display text-xl text-black leading-none">{state.level}</span>
          </div>

          {/* Level Info + XP bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display uppercase text-sm text-white truncate leading-none">
                Lv.{state.level} {state.level_name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-volt tabular-nums shrink-0 font-bold">
                {state.xp_total.toLocaleString()} XP
              </span>
            </div>

            {/* Brutalist progress bar */}
            <div className="w-full h-3 bg-white border-2 border-white">
              <div
                className="h-full bg-volt transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, state.level_progress))}%` }}
              />
            </div>

            {state.next_level && (
              <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 mt-1.5">
                {state.next_level.xpRequired - state.xp_total} XP to {state.next_level.name}
              </p>
            )}
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center shrink-0 ml-1">
            <Flame
              size={22}
              className={streakActive ? 'text-orange-500' : 'text-gray-600'}
            />
            <span
              className={`font-display text-lg tabular-nums leading-none ${
                streakActive ? 'text-orange-500' : 'text-gray-600'
              }`}
            >
              {state.current_streak}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-gray-500">
              streak
            </span>
          </div>
        </div>
      </BrutalCard>

      {/* Daily Challenge */}
      <BrutalCard variant="volt" padded={false} className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black border-2 border-black flex items-center justify-center shrink-0">
            <Target size={16} className="text-volt" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-black">
              Daily Challenge
            </p>
            <p className="font-body text-sm text-black truncate">
              {daily_challenge.description}
            </p>
          </div>
        </div>
      </BrutalCard>
    </div>
  )
}
