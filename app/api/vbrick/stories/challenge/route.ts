import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// POST: Create (or return existing) shareable challenge for a vault entry.
//
// The caller's effective email is the Supabase session email when one
// exists, otherwise the body email (for the vbrick public demo path).
// The caller must own the vault entry being challenged.
export async function POST(request: Request) {
  let body: { vault_entry_id?: string; email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { vault_entry_id } = body
  if (!vault_entry_id) {
    return NextResponse.json({ error: 'Missing vault_entry_id' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const effectiveEmail = user?.email || body.email
  if (!effectiveEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the caller owns the vault entry they're challenging with.
  const { data: entry, error: entryError } = await supabase
    .from('story_vault_entries')
    .select('bdr_email')
    .eq('id', vault_entry_id)
    .single()
  if (entryError || !entry) {
    return NextResponse.json({ error: 'Vault entry not found' }, { status: 404 })
  }
  if (entry.bdr_email !== effectiveEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: existing } = await supabase
    .from('story_challenges')
    .select('*')
    .eq('vault_entry_id', vault_entry_id)
    .single()

  if (existing) {
    const url = `${new URL(request.url).origin}/challenge/${existing.share_token}`
    return NextResponse.json({ challenge: existing, url })
  }

  const { data: challenge, error } = await supabase
    .from('story_challenges')
    .insert({
      vault_entry_id,
      created_by_email: effectiveEmail,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const url = `${new URL(request.url).origin}/challenge/${challenge.share_token}`
  return NextResponse.json({ challenge, url })
}
