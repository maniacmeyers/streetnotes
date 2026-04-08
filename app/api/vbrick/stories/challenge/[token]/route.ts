import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET: Fetch challenge data by share token (public)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const supabase = await createClient()

  // Fetch challenge
  const { data: challenge, error } = await supabase
    .from('story_challenges')
    .select('*')
    .eq('share_token', token)
    .single()

  if (error || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // Fetch associated vault entry
  const { data: vaultEntry } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('id', challenge.vault_entry_id)
    .single()

  if (!vaultEntry) {
    return NextResponse.json({ error: 'Vault entry not found' }, { status: 404 })
  }

  // Increment view count (fire and forget)
  supabase
    .from('story_challenges')
    .update({ view_count: (challenge.view_count || 0) + 1 })
    .eq('id', challenge.id)
    .then()

  // Derive display name from email
  const displayName = challenge.created_by_email
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())

  return NextResponse.json({
    challenge: {
      ...challenge,
      display_name: displayName,
    },
    vault_entry: {
      story_type: vaultEntry.story_type,
      title: vaultEntry.title,
      composite_score: vaultEntry.composite_score,
    },
  })
}
