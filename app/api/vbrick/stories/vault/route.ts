import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET: Fetch all vault entries for a BDR, sorted by score
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('bdr_email', email)
    .order('composite_score', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vault: data || [] })
}
