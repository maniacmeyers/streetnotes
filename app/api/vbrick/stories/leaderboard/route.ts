import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLevel } from '@/lib/vbrick/gamification'
import type { StoryType } from '@/lib/vbrick/story-types'

export const runtime = 'nodejs'

function displayName(email: string): string {
  const prefix = email.split('@')[0] || email
  return prefix
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function GET() {
  const supabase = await createClient()

  // Fetch all BDR gamification records
  const { data: allBdrs, error: bdrError } = await supabase
    .from('bdr_gamification')
    .select('bdr_email, xp_total, current_streak, level')

  if (bdrError) {
    return NextResponse.json({ error: bdrError.message }, { status: 500 })
  }

  if (!allBdrs || allBdrs.length === 0) {
    return NextResponse.json({ leaderboard: [] })
  }

  // Fetch personal-best vault entries for all BDRs
  const emails = allBdrs.map((b) => b.bdr_email)
  const { data: bestEntries, error: vaultError } = await supabase
    .from('story_vault_entries')
    .select('bdr_email, story_type, composite_score')
    .eq('is_personal_best', true)
    .in('bdr_email', emails)

  if (vaultError) {
    return NextResponse.json({ error: vaultError.message }, { status: 500 })
  }

  // Group best scores by BDR email
  const bestByBdr = new Map<string, Partial<Record<StoryType, number>>>()
  for (const entry of bestEntries || []) {
    if (!bestByBdr.has(entry.bdr_email)) {
      bestByBdr.set(entry.bdr_email, {})
    }
    const scores = bestByBdr.get(entry.bdr_email)!
    const storyType = entry.story_type as StoryType
    const existing = scores[storyType]
    if (existing === undefined || entry.composite_score > existing) {
      scores[storyType] = entry.composite_score
    }
  }

  // Build leaderboard entries
  const leaderboard = allBdrs.map((bdr) => {
    const bestScores = bestByBdr.get(bdr.bdr_email) || {}
    const scoreValues = Object.values(bestScores).filter(
      (v): v is number => v !== undefined
    )
    const overallAvg =
      scoreValues.length > 0
        ? Math.round(
            (scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length) *
              10
          ) / 10
        : 0

    const level = getLevel(bdr.xp_total || 0)

    return {
      bdr_email: bdr.bdr_email,
      display_name: displayName(bdr.bdr_email),
      level: level.level,
      level_name: level.name,
      xp_total: bdr.xp_total || 0,
      current_streak: bdr.current_streak || 0,
      best_scores: {
        elevator_pitch: bestScores.elevator_pitch,
        feel_felt_found: bestScores.feel_felt_found,
        abt_customer_story: bestScores.abt_customer_story,
      },
      overall_avg: overallAvg,
    }
  })

  // Sort by overall_avg descending, then XP as tiebreaker
  leaderboard.sort((a, b) => {
    if (b.overall_avg !== a.overall_avg) return b.overall_avg - a.overall_avg
    return b.xp_total - a.xp_total
  })

  return NextResponse.json({ leaderboard })
}
