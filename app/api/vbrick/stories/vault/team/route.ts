import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET: Fetch team vault (highest-scoring shared stories)
export async function GET() {
  const supabase = await createClient()

  // Get the top-scoring shared story per story type
  const { data, error } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('shared_to_team', true)
    .order('composite_score', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by story type, take the best per type
  const bestByType: Record<string, typeof data[0]> = {}
  for (const entry of data || []) {
    if (!bestByType[entry.story_type] || entry.composite_score > bestByType[entry.story_type].composite_score) {
      bestByType[entry.story_type] = entry
    }
  }

  return NextResponse.json({ vault: Object.values(bestByType) })
}
