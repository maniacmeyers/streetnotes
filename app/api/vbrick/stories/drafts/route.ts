import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET: List all drafts for a BDR
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

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
  const body = await request.json()
  const { email, storyType, title } = body

  if (!email || !storyType) {
    return NextResponse.json({ error: 'Missing email or storyType' }, { status: 400 })
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
