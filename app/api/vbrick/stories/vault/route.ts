import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET: Fetch personal vault entries for a BDR
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const supabase = await createClient()

  // Get personal best for each story type
  const { data, error } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('bdr_email', email)
    .eq('is_personal_best', true)
    .order('composite_score', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vault: data })
}
