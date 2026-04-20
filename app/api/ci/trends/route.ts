import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CompetitorTrendData, CIMention } from '@/lib/ci/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TIME_RANGE_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

/**
 * Return the ISO week key (YYYY-WNN) and a human-readable label for a date.
 */
function getWeekKey(date: Date): { week: string; weekLabel: string } {
  // ISO week calculation
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)

  const year = d.getUTCFullYear()
  const week = `${year}-W${String(weekNum).padStart(2, '0')}`

  // Label: "Mar 17" format using the Monday of that week
  const monday = new Date(date)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const weekLabel = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return { week, weekLabel }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const timeRange = searchParams.get('timeRange') || '90d'

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email parameter required.' },
        { status: 400 }
      )
    }

    const domain = email.split('@')[1]
    const supabase = createAdminClient()

    const days = TIME_RANGE_DAYS[timeRange]
    const cutoff = days
      ? new Date(Date.now() - days * 86_400_000).toISOString()
      : null

    let query = supabase
      .from('ci_mentions')
      .select('*')
      .like('rep_email', `%@${domain}`)
      .order('created_at', { ascending: true })

    if (cutoff) {
      query = query.gte('created_at', cutoff)
    }

    const { data, error } = await query

    if (error) {
      console.error('CI trends query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trend data.' },
        { status: 500 }
      )
    }

    const rows = (data || []) as CIMention[]

    // Aggregate by competitor + week
    // Structure: competitorMap[normalized_name] = { weeks: Map<weekKey, { count, weekLabel, sentiments }>, totalMentions, sentimentBreakdown }
    const competitorMap = new Map<
      string,
      {
        weeks: Map<string, { weekLabel: string; count: number }>
        totalMentions: number
        sentimentBreakdown: { positive: number; negative: number; neutral: number }
      }
    >()

    for (const row of rows) {
      const name = row.competitor_name_normalized
      const createdAt = new Date(row.created_at)
      const { week, weekLabel } = getWeekKey(createdAt)

      if (!competitorMap.has(name)) {
        competitorMap.set(name, {
          weeks: new Map(),
          totalMentions: 0,
          sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
        })
      }

      const entry = competitorMap.get(name)!
      entry.totalMentions++

      const s = row.sentiment
      if (s === 'positive' || s === 'negative' || s === 'neutral') {
        entry.sentimentBreakdown[s]++
      }

      if (!entry.weeks.has(week)) {
        entry.weeks.set(week, { weekLabel, count: 0 })
      }
      entry.weeks.get(week)!.count++
    }

    // Build response sorted by total mentions descending
    const sortedCompetitors = Array.from(competitorMap.entries()).sort(
      (a, b) => b[1].totalMentions - a[1].totalMentions
    )

    const trends: CompetitorTrendData[] = sortedCompetitors.map(([name, entry]) => {
      // Sort weeks chronologically
      const sortedWeeks = Array.from(entry.weeks.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      )

      return {
        competitorName: name,
        trend: sortedWeeks.map(([week, weekData]) => ({
          week,
          weekLabel: weekData.weekLabel,
          count: weekData.count,
        })),
        totalMentions: entry.totalMentions,
        sentimentBreakdown: entry.sentimentBreakdown,
      }
    })

    const topCompetitors = sortedCompetitors.map(([name]) => name)

    return NextResponse.json({ trends, topCompetitors })
  } catch (err) {
    console.error('CI trends error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
