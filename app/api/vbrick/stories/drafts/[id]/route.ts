import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET: Fetch a single draft
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('story_drafts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  return NextResponse.json({ draft: data })
}

// PATCH: Update a draft
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('story_drafts')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ draft: data })
}

// DELETE: Remove a draft
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('story_drafts')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
