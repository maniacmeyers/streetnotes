import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { HeatmapCell, CIMention, CISentiment } from '@/lib/ci/types'

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
    const dimension = searchParams.get('dimension') || 'rep'

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email parameter required.' },
        { status: 400 }
      )
    }

    if (dimension !== 'rep' && dimension !== 'territory') {
      return NextResponse.json(
        { error: 'Dimension must be "rep" or "territory".' },
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

    if (cutoff) {
      query = query.gte('created_at', cutoff)
    }

    const { data, error } = await query

    if (error) {
      console.error('CI heatmap query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch heatmap data.' },
        { status: 500 }
      )
    }

    const rows = (data || []) as CIMention[]

    // Aggregate by competitor + dimension value
    // Key: "competitor::dimensionValue"
    const cellMap = new Map<
      string,
      {
        competitor: string
        dimension: string
        count: number
        sentiments: { positive: number; negative: number; neutral: number }
      }
    >()

    const competitorSet = new Set<string>()
    const dimensionSet = new Set<string>()

    for (const row of rows) {
      const comp = row.competitor_name_normalized
      const dimValue =
        dimension === 'rep'
          ? row.rep_email
          : row.territory || 'Unknown'

      const key = `${comp}::${dimValue}`

      competitorSet.add(comp)
      dimensionSet.add(dimValue)

      if (!cellMap.has(key)) {
        cellMap.set(key, {
          competitor: comp,
          dimension: dimValue,
          count: 0,
          sentiments: { positive: 0, negative: 0, neutral: 0 },
        })
      }

      const cell = cellMap.get(key)!
      cell.count++

      const s = row.sentiment
      if (s === 'positive' || s === 'negative' || s === 'neutral') {
        cell.sentiments[s]++
      }
    }

    // Build cells with dominant sentiment
    const cells: HeatmapCell[] = Array.from(cellMap.values()).map((cell) => {
      const { sentiments } = cell
      let dominantSentiment: CISentiment = 'neutral'
      let maxSentimentCount = 0

      for (const s of ['positive', 'negative', 'neutral'] as CISentiment[]) {
        if (sentiments[s] > maxSentimentCount) {
          maxSentimentCount = sentiments[s]
          dominantSentiment = s
        }
      }

      return {
        competitor: cell.competitor,
        dimension: cell.dimension,
        count: cell.count,
        dominantSentiment,
      }
    })

    // Sort competitors by total mentions descending
    const competitorTotals = new Map<string, number>()
    for (const cell of cells) {
      competitorTotals.set(
        cell.competitor,
        (competitorTotals.get(cell.competitor) || 0) + cell.count
      )
    }
    const competitors = Array.from(competitorTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)

    const dimensions = Array.from(dimensionSet).sort()

    return NextResponse.json({ cells, competitors, dimensions })
  } catch (err) {
    console.error('CI heatmap error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
