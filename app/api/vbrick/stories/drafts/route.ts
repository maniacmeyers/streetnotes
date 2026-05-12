import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isVbrickUser } from '@/lib/vbrick/config'

export const runtime = 'nodejs'

// GET: List all drafts for a BDR
export async function GET(request: Request) {
  const supabaseAuth = await createClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  const queryEmail = new URL(request.url).searchParams.get('email')?.toLowerCase() || null
  const email = user?.email?.toLowerCase() || queryEmail
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user && !isVbrickUser(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('story_drafts')
    .select('*')
    .eq('bdr_email', email)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ drafts: data })
}

// POST: Create a new draft
export async function POST(request: Request) {
  const supabaseAuth = await createClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  const body = await request.json()
  const { storyType, title, email: bodyEmail } = body

  if (!storyType) {
    return NextResponse.json({ error: 'Missing storyType' }, { status: 400 })
  }

  const sessionEmail = user?.email?.toLowerCase()
  const fallbackEmail = typeof bodyEmail === 'string' ? bodyEmail.toLowerCase() : null
  const email = sessionEmail || fallbackEmail

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!sessionEmail && !isVbrickUser(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (sessionEmail && fallbackEmail && fallbackEmail !== sessionEmail) {
    return NextResponse.json({ error: 'Email mismatch for authenticated user' }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('story_drafts')
    .insert({
      bdr_email: email,
      story_type: storyType,
      title: title || null,
      draft_content: '',
      ai_conversation: [],
      framework_metadata: {},
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ draft: data })
}
