import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// POST: Create a shareable challenge from a vault entry
export async function POST(request: Request) {
  let body: { vault_entry_id: string; email: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { vault_entry_id, email } = body
  if (!vault_entry_id || !email) {
    return NextResponse.json({ error: 'Missing vault_entry_id or email' }, { status: 400 })
  }

  const supabase = await createClient()

  // Check if challenge already exists for this vault entry
  const { data: existing } = await supabase
    .from('story_challenges')
    .select('*')
    .eq('vault_entry_id', vault_entry_id)
    .single()

  if (existing) {
    const url = `${new URL(request.url).origin}/challenge/${existing.share_token}`
    return NextResponse.json({ challenge: existing, url })
  }

  // Create new challenge
  const { data: challenge, error } = await supabase
    .from('story_challenges')
    .insert({
      vault_entry_id,
      created_by_email: email,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const url = `${new URL(request.url).origin}/challenge/${challenge.share_token}`
  return NextResponse.json({ challenge, url })
}
