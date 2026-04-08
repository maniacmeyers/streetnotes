import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

interface TrendPoint {
  date: string
  story_type: string
  avg_score: number
  session_count: number
}

// GET: Fetch practice score trends over time for a BDR
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const daysParam = searchParams.get('days')
  const days = daysParam && [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30

  const supabase = await createClient()

  // Calculate date cutoff
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffISO = cutoff.toISOString()

  // Fetch all practice sessions in range, ordered by date
  const { data: sessions, error: sessionsError } = await supabase
    .from('story_practice_sessions')
    .select('id, story_draft_id, composite_score, created_at')
    .eq('bdr_email', email)
    .gte('created_at', cutoffISO)
    .order('created_at', { ascending: true })

  if (sessionsError) {
    return NextResponse.json({ error: sessionsError.message }, { status: 500 })
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ trends: [] })
  }

  // Collect unique draft IDs to fetch story_type
  const draftIds = Array.from(new Set(sessions.map((s) => s.story_draft_id)))

  const { data: drafts, error: draftsError } = await supabase
    .from('story_drafts')
    .select('id, story_type')
    .in('id', draftIds)

  if (draftsError) {
    return NextResponse.json({ error: draftsError.message }, { status: 500 })
  }

  const draftTypeMap = new Map((drafts || []).map((d) => [d.id, d.story_type]))

  // Group by (date, story_type) and calculate avg composite_score
  const grouped = new Map<string, { total: number; count: number }>()

  for (const session of sessions) {
    const storyType = draftTypeMap.get(session.story_draft_id) || 'elevator_pitch'
    const dateKey = session.created_at.slice(0, 10) // YYYY-MM-DD
    const key = `${dateKey}|${storyType}`

    const existing = grouped.get(key)
    if (existing) {
      existing.total += Number(session.composite_score) || 0
      existing.count += 1
    } else {
      grouped.set(key, {
        total: Number(session.composite_score) || 0,
        count: 1,
      })
    }
  }

  // Build response array
  const trends: TrendPoint[] = []

  for (const [key, { total, count }] of Array.from(grouped.entries())) {
    const [date, story_type] = key.split('|')
    trends.push({
      date,
      story_type,
      avg_score: Math.round((total / count) * 100) / 100,
      session_count: count,
    })
  }

  // Sort by date ascending, then story_type
  trends.sort((a, b) => a.date.localeCompare(b.date) || a.story_type.localeCompare(b.story_type))

  return NextResponse.json({ trends })
}
