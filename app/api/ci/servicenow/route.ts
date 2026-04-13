import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isVbrickUser } from '@/lib/vbrick/config'

export const runtime = 'nodejs'

// GET: Fetch ServiceNow-specific mentions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const timeRange = searchParams.get('timeRange') || '30d'
  const category = searchParams.get('category')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const domain = email.split('@')[1]
  const supabase = createAdminClient()

  const days: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
  const cutoff = days[timeRange]
    ? new Date(Date.now() - days[timeRange] * 86_400_000).toISOString()
    : null

  let query = supabase
    .from('ci_mentions')
    .select('*')
    .like('rep_email', `%@${domain}`)
    .not('sn_category', 'is', null)

  if (cutoff) query = query.gte('created_at', cutoff)
  if (category) query = query.eq('sn_category', category)

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ mentions: data || [] })
}

// PATCH: Acknowledge a ServiceNow mention (requires auth or vbrick identity)
export async function PATCH(request: Request) {
  const { mentionId, email } = await request.json()

  if (!mentionId) {
    return NextResponse.json({ error: 'Missing mentionId' }, { status: 400 })
  }

  // Derive identity from session or validated vbrick email
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const callerEmail = user?.email || email

  if (!callerEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!user && !isVbrickUser(callerEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('ci_mentions')
    .update({
      acknowledged: true,
      acknowledged_by: callerEmail,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', mentionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
