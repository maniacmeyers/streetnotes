import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { QuoteFeedItem, CIMention } from '@/lib/ci/types'

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
    const competitor = searchParams.get('competitor')
    const sentiment = searchParams.get('sentiment')
    const category = searchParams.get('category')
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email parameter required.' },
        { status: 400 }
      )
    }

    const domain = email.split('@')[1]
    const supabase = createAdminClient()

    // Time cutoff
    const days = TIME_RANGE_DAYS[timeRange]
    const cutoff = days
      ? new Date(Date.now() - days * 86_400_000).toISOString()
      : null

    // Count query -- build inline to keep Supabase generics happy
    let countBuilder = supabase
      .from('ci_mentions')
      .select('*', { count: 'exact', head: true })
      .like('rep_email', `%@${domain}`)

    if (cutoff) countBuilder = countBuilder.gte('created_at', cutoff)
    if (competitor) countBuilder = countBuilder.eq('competitor_name_normalized', competitor.toLowerCase())
    if (sentiment && sentiment !== 'all') countBuilder = countBuilder.eq('sentiment', sentiment)
    if (category && category !== 'all') countBuilder = countBuilder.eq('mention_category', category)

    const { count, error: countError } = await countBuilder

    if (countError) {
      console.error('CI mentions count error:', countError)
      return NextResponse.json(
        { error: 'Failed to fetch mentions count.' },
        { status: 500 }
      )
    }

    // Data query
    let dataBuilder = supabase
      .from('ci_mentions')
      .select('*')
      .like('rep_email', `%@${domain}`)

    if (cutoff) dataBuilder = dataBuilder.gte('created_at', cutoff)
    if (competitor) dataBuilder = dataBuilder.eq('competitor_name_normalized', competitor.toLowerCase())
    if (sentiment && sentiment !== 'all') dataBuilder = dataBuilder.eq('sentiment', sentiment)
    if (category && category !== 'all') dataBuilder = dataBuilder.eq('mention_category', category)

    const { data, error: dataError } = await dataBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (dataError) {
      console.error('CI mentions data error:', dataError)
      return NextResponse.json(
        { error: 'Failed to fetch mentions.' },
        { status: 500 }
      )
    }

    const rows = (data || []) as CIMention[]
    const total = count ?? 0

    const mentions: QuoteFeedItem[] = rows.map((row) => ({
      id: row.id,
      competitorName: row.competitor_name_normalized,
      contextQuote: row.context_quote,
      sentiment: row.sentiment,
      mentionCategory: row.mention_category,
      repEmail: row.rep_email,
      repName: row.rep_name,
      companyName: row.company_name,
      dealStage: row.deal_stage,
      snCategory: row.sn_category ?? null,
      accountName: row.account_name ?? null,
      acknowledged: row.acknowledged ?? false,
      createdAt: row.created_at,
    }))

    return NextResponse.json({
      mentions,
      total,
      hasMore: offset + limit < total,
    })
  } catch (err) {
    console.error('CI mentions error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
