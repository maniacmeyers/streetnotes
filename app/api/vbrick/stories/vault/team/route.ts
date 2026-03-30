import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET: Fetch all shared team vault stories, sorted by score
export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('shared_to_team', true)
    .order('composite_score', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ vault: data || [] })
}
