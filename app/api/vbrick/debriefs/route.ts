import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET: List past debrief sessions for a BDR. Returns the structured
// output along with the row so the dashboard can render the deal sheet
// without an extra fetch per click.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 50)

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('debrief_sessions')
    .select('id, created_at, structured_output')
    .eq('email', email.toLowerCase())
    .not('structured_output', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ debriefs: data || [] })
}
