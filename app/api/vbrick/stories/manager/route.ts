import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLevel } from '@/lib/vbrick/gamification'

export const runtime = 'nodejs'

const MANAGER_EMAILS = ['jeff@forgetime.ai', 'jeff@careermaniacs.com']

function isManager(email: string): boolean {
  return MANAGER_EMAILS.includes(email)
}

function displayName(email: string): string {
  return email
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  if (!isManager(email)) return NextResponse.json({ error: 'Manager access required' }, { status: 403 })

  const supabase = createAdminClient()

  // Fetch all gamification states
  const { data: allGam } = await supabase
    .from('bdr_gamification')
    .select('*')
    .order('xp_total', { ascending: false })

  if (!allGam || allGam.length === 0) {
    return NextResponse.json({
      reps: [],
      team_totals: { total_sessions_30d: 0, avg_composite: 0, active_reps: 0, best_streak: 0 },
      top_stories: [],
    })
  }

  const emails = allGam.map((g) => g.bdr_email)

  // Fetch all practice sessions in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: sessions30d } = await supabase
    .from('story_practice_sessions')
    .select('bdr_email, composite_score, created_at, story_draft_id')
    .in('bdr_email', emails)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  // Fetch sessions in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const sessions7d = (sessions30d || []).filter(
    (s) => new Date(s.created_at) >= sevenDaysAgo
  )

  // Last week (7-14 days ago)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const sessionsLastWeek = (sessions30d || []).filter(
    (s) => new Date(s.created_at) >= fourteenDaysAgo && new Date(s.created_at) < sevenDaysAgo
  )

  // Fetch drafts for story type info
  const draftIds = Array.from(new Set((sessions30d || []).map((s) => s.story_draft_id)))
  const { data: drafts } = await supabase
    .from('story_drafts')
    .select('id, story_type')
    .in('id', draftIds.length > 0 ? draftIds : ['none'])

  const draftTypeMap = new Map((drafts || []).map((d) => [d.id, d.story_type]))

  // Build per-rep data
  const reps = allGam.map((gam) => {
    const repSessions30d = (sessions30d || []).filter((s) => s.bdr_email === gam.bdr_email)
    const repSessions7d = sessions7d.filter((s) => s.bdr_email === gam.bdr_email)
    const repSessionsLastWeek = sessionsLastWeek.filter((s) => s.bdr_email === gam.bdr_email)

    // Avg scores by type
    const scoresByType: Record<string, number[]> = {
      elevator_pitch: [],
      feel_felt_found: [],
      abt_customer_story: [],
    }
    for (const s of repSessions30d) {
      const type = draftTypeMap.get(s.story_draft_id)
      if (type && scoresByType[type]) {
        scoresByType[type].push(s.composite_score || 0)
      }
    }

    const avgScores: Record<string, number> = {}
    for (const [type, scores] of Object.entries(scoresByType)) {
      avgScores[type] = scores.length > 0
        ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
        : 0
    }

    // This week vs last week delta
    const thisWeekAvg = repSessions7d.length > 0
      ? repSessions7d.reduce((a, s) => a + (s.composite_score || 0), 0) / repSessions7d.length
      : 0
    const lastWeekAvg = repSessionsLastWeek.length > 0
      ? repSessionsLastWeek.reduce((a, s) => a + (s.composite_score || 0), 0) / repSessionsLastWeek.length
      : 0
    const scoreDelta = thisWeekAvg > 0 && lastWeekAvg > 0
      ? Number((thisWeekAvg - lastWeekAvg).toFixed(1))
      : 0

    const level = getLevel(gam.xp_total)

    return {
      email: gam.bdr_email,
      name: displayName(gam.bdr_email),
      level: level.level,
      level_name: level.name,
      xp: gam.xp_total,
      streak: gam.current_streak,
      sessions_7d: repSessions7d.length,
      sessions_30d: repSessions30d.length,
      avg_scores: avgScores,
      score_delta_week: scoreDelta,
    }
  })

  // Team totals
  const allScores30d = (sessions30d || []).map((s) => s.composite_score || 0)
  const teamTotals = {
    total_sessions_30d: (sessions30d || []).length,
    avg_composite: allScores30d.length > 0
      ? Number((allScores30d.reduce((a, b) => a + b, 0) / allScores30d.length).toFixed(1))
      : 0,
    active_reps: new Set(sessions7d.map((s) => s.bdr_email)).size,
    best_streak: Math.max(...allGam.map((g) => g.current_streak), 0),
  }

  // Top 5 team stories
  const { data: topStories } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('shared_to_team', true)
    .order('composite_score', { ascending: false })
    .limit(5)

  return NextResponse.json({
    reps,
    team_totals: teamTotals,
    top_stories: topStories || [],
  })
}
