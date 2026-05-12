import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchSalesforceStages } from '@/lib/crm/salesforce'
import { fetchHubSpotStages } from '@/lib/crm/hubspot'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * GET /api/crm/stages?crm=salesforce — fetch deal stages from connected CRM.
 * Uses deal_stage_cache table with 24h TTL.
 * Pass ?refresh=true to force a fresh fetch.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const crmType = request.nextUrl.searchParams.get('crm') as 'salesforce' | 'hubspot'
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true'

  if (!crmType || !['salesforce', 'hubspot'].includes(crmType)) {
    return NextResponse.json({ error: 'Invalid CRM type' }, { status: 400 })
  }

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from('deal_stage_cache')
      .select('stages, cached_at')
      .eq('user_id', user.id)
      .eq('crm_type', crmType)
      .single()

    if (cached) {
      const cacheAge = Date.now() - new Date(cached.cached_at).getTime()
      if (cacheAge < CACHE_TTL_MS) {
        return NextResponse.json({ stages: cached.stages, cached: true })
      }
    }
  }

  // Fetch fresh stages from CRM
  try {
    const stages = crmType === 'salesforce'
      ? await fetchSalesforceStages(supabase, user.id)
      : await fetchHubSpotStages(supabase, user.id)

    // Upsert cache
    await supabase
      .from('deal_stage_cache')
      .upsert(
        {
          user_id: user.id,
          crm_type: crmType,
          stages,
          cached_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,crm_type', ignoreDuplicates: false }
      )

    return NextResponse.json({ stages, cached: false })
  } catch (err) {
    console.error(`Failed to fetch ${crmType} stages:`, err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to fetch stages: ${message}` },
      { status: 502 }
    )
  }
}
