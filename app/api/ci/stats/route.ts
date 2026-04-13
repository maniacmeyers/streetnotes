import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CIDashboardStats, CIMention } from '@/lib/ci/types'

export const runtime = 'nodejs'

const TIME_RANGE_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const timeRange = searchParams.get('timeRange') || '30d'

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email parameter required.' },
        { status: 400 }
      )
    }

    const domain = email.split('@')[1]
    const supabase = createAdminClient()

    // Build current period query
    const days = TIME_RANGE_DAYS[timeRange]
    const now = Date.now()
    const cutoff = days
      ? new Date(now - days * 86_400_000).toISOString()
      : null

    let query = supabase
      .from('ci_mentions')
      .select('*')
      .like('rep_email', `%@${domain}`)

    if (cutoff) {
      query = query.gte('created_at', cutoff)
    }

    const { data: mentions, error } = await query

    if (error) {
      console.error('CI stats query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stats.' },
        { status: 500 }
      )
    }

    const rows = (mentions || []) as CIMention[]

    // Total mentions
    const totalMentions = rows.length

    // Unique competitors
    const competitorCounts = new Map<string, number>()
    for (const row of rows) {
      const name = row.competitor_name_normalized
      competitorCounts.set(name, (competitorCounts.get(name) || 0) + 1)
    }
    const uniqueCompetitors = competitorCounts.size

    // Top competitor
    let topCompetitor: CIDashboardStats['topCompetitor'] = null
    let maxCount = 0
    competitorCounts.forEach((count, name) => {
      if (count > maxCount) {
        maxCount = count
        topCompetitor = { name, count }
      }
    })

    // Sentiment breakdown
    const sentimentBreakdown = { positive: 0, negative: 0, neutral: 0 }
    for (const row of rows) {
      const s = row.sentiment
      if (s === 'positive' || s === 'negative' || s === 'neutral') {
        sentimentBreakdown[s]++
      }
    }

    // Recent trend: compare current period vs previous period of equal length
    let recentTrend: CIDashboardStats['recentTrend'] = 'flat'

    if (days) {
      const previousCutoff = new Date(now - days * 2 * 86_400_000).toISOString()
      const currentCutoffDate = new Date(now - days * 86_400_000)

      const { count: prevCount, error: prevError } = await supabase
        .from('ci_mentions')
        .select('*', { count: 'exact', head: true })
        .like('rep_email', `%@${domain}`)
        .gte('created_at', previousCutoff)
        .lt('created_at', currentCutoffDate.toISOString())

      if (!prevError && prevCount !== null) {
        const currentCount = totalMentions
        if (currentCount > prevCount) {
          recentTrend = 'up'
        } else if (currentCount < prevCount) {
          recentTrend = 'down'
        }
      }
    }

    const stats: CIDashboardStats = {
      totalMentions,
      uniqueCompetitors,
      topCompetitor,
      sentimentBreakdown,
      recentTrend,
    }

    return NextResponse.json(stats)
  } catch (err) {
    console.error('CI stats error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
