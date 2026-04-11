import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET: Fetch all shared team vault stories, sorted by score.
//
// This endpoint acts as a global feed — any entry with shared_to_team = true
// is visible. Per-team scoping would require an org/team id on
// story_vault_entries, which is TODO. Until then, we at least require that
// the caller identify themselves (authenticated Supabase session, or an
// email in the query string for the vbrick public demo path).
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const fallbackEmail = searchParams.get('email')

  if (!user?.email && !fallbackEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('shared_to_team', true)
    .order('composite_score', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ vault: data || [] })
}
