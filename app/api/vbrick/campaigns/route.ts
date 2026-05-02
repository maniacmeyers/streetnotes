import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureK26Campaign } from '@/lib/vbrick/seeds/k26'

export const runtime = 'nodejs'

// GET: List campaigns (optionally filtered by status)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const email = searchParams.get('email')

  const supabase = createAdminClient()

  // Lazily seed the K26 campaign on first request so it's always
  // visible without manually POSTing /seed-k26. No-op when present.
  try {
    await ensureK26Campaign(supabase)
  } catch {
    // Non-fatal — fall through to whatever's already in the DB.
  }

  let query = supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status) query = query.eq('status', status)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // For non-Jeff users, only show approved/active campaigns (unless they created it)
  const isJeff = email === 'jeff@forgetime.ai'
  const filtered = isJeff
    ? data
    : data?.filter(c => c.status === 'active' || c.status === 'approved' || c.created_by === email) || []

  return NextResponse.json({ campaigns: filtered })
}

// POST: Create a new campaign
export async function POST(request: Request) {
  const body = await request.json()
  const { name, description, event_name, event_date, target_audience, email, frameworks } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Missing name or email' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name,
      description: description || null,
      event_name: event_name || null,
      event_date: event_date || null,
      target_audience: target_audience || null,
      created_by: email,
      status: 'draft',
      frameworks: frameworks || ['maniac_method'],
      metadata: {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaign: data })
}
