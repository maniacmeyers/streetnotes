import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isVbrickUser } from '@/lib/vbrick/config'

export const runtime = 'nodejs'

// GET: Fetch all vault entries for a BDR, sorted by score
export async function GET(request: Request) {
  // Prefer authenticated session; fall back to email param for vbrick demo only
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const { searchParams } = new URL(request.url)
  const queryEmail = searchParams.get('email')
  const email = user?.email || queryEmail

  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // If identity came from querystring (no session), restrict to known vbrick users
  if (!user && !isVbrickUser(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('bdr_email', email)
    .order('composite_score', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vault: data || [] })
}
