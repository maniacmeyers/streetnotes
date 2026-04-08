import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/crm/connections — list connected CRMs (no tokens exposed) */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: connections, error } = await supabase
    .from('crm_connections')
    .select('crm_type, instance_url, token_expires_at, created_at, updated_at')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
  }

  return NextResponse.json({
    connections: (connections || []).map((c) => ({
      crmType: c.crm_type,
      instanceUrl: c.instance_url,
      connectedAt: c.created_at,
      lastRefreshed: c.updated_at,
      tokenExpiresAt: c.token_expires_at,
    })),
  })
}

/** DELETE /api/crm/connections?crm=salesforce — disconnect a CRM */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const crmType = url.searchParams.get('crm')

  if (!crmType || !['salesforce', 'hubspot', 'pipedrive'].includes(crmType)) {
    return NextResponse.json({ error: 'Invalid CRM type' }, { status: 400 })
  }

  const { error } = await supabase
    .from('crm_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('crm_type', crmType)

  if (error) {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }

  // Also clear cached stages
  await supabase
    .from('deal_stage_cache')
    .delete()
    .eq('user_id', user.id)
    .eq('crm_type', crmType)

  return NextResponse.json({ disconnected: crmType })
}
