import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCachedSchema, storeCachedSchema, canRefreshSchema } from '@/lib/crm/schema/cache'
import { fetchSalesforceSchema } from '@/lib/crm/salesforce'
import { fetchHubspotSchema } from '@/lib/crm/hubspot'
import { CrmSchemaFetchError } from '@/lib/crm/schema/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const crmType = request.nextUrl.searchParams.get('crmType') as 'salesforce' | 'hubspot' | null
  if (!crmType || !['salesforce', 'hubspot'].includes(crmType)) {
    return NextResponse.json({ error: 'Invalid crmType' }, { status: 400 })
  }

  const cached = await getCachedSchema(supabase, user.id, crmType)
  if (cached && !cached.stale) {
    return NextResponse.json({ schema: cached.schema, stale: false, error: cached.error })
  }

  try {
    const schema = crmType === 'salesforce'
      ? await fetchSalesforceSchema(supabase, user.id)
      : await fetchHubspotSchema(supabase, user.id)

    await storeCachedSchema(supabase, user.id, crmType, schema)
    return NextResponse.json({ schema, stale: false })
  } catch (err) {
    const message = err instanceof CrmSchemaFetchError
      ? err.message
      : err instanceof Error ? err.message : 'Unknown error'

    if (cached) {
      await storeCachedSchema(supabase, user.id, crmType, cached.schema, message)
      return NextResponse.json({ schema: cached.schema, stale: true, error: message })
    }

    return NextResponse.json({ error: `Failed to fetch schema: ${message}` }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { crmType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const crmType = body.crmType as 'salesforce' | 'hubspot' | undefined
  if (!crmType || !['salesforce', 'hubspot'].includes(crmType)) {
    return NextResponse.json({ error: 'Invalid crmType' }, { status: 400 })
  }

  const allowed = await canRefreshSchema(supabase, user.id, crmType)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limited. Try again in 1 minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  try {
    const schema = crmType === 'salesforce'
      ? await fetchSalesforceSchema(supabase, user.id)
      : await fetchHubspotSchema(supabase, user.id)

    await storeCachedSchema(supabase, user.id, crmType, schema)
    return NextResponse.json({ schema, stale: false })
  } catch (err) {
    const message = err instanceof CrmSchemaFetchError
      ? err.message
      : err instanceof Error ? err.message : 'Unknown error'

    const cached = await getCachedSchema(supabase, user.id, crmType)
    if (cached) {
      await storeCachedSchema(supabase, user.id, crmType, cached.schema, message)
    }

    return NextResponse.json({ error: `Schema refresh failed: ${message}` }, { status: 502 })
  }
}
