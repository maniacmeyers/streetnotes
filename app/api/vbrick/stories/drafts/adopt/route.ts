import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// POST: Adopt a story from the team vault into the user's own drafts
// Creates a new draft with the original story content so the user can practice it
export async function POST(request: Request) {
  const body = await request.json()
  const { vault_entry_id, email } = body

  if (!vault_entry_id || !email) {
    return NextResponse.json({ error: 'Missing vault_entry_id or email' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 1. Fetch the vault entry
  const { data: entry, error: entryErr } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('id', vault_entry_id)
    .single()

  if (entryErr || !entry) {
    return NextResponse.json({ error: 'Vault entry not found' }, { status: 404 })
  }

  // 2. Fetch the original draft to get draft_content (the prepared script)
  const { data: originalDraft } = await supabase
    .from('story_drafts')
    .select('draft_content, framework_metadata')
    .eq('id', entry.story_draft_id)
    .single()

  // Use draft_content if available, fall back to vault transcript
  const draftContent = originalDraft?.draft_content || entry.transcript

  // 3. Create a new draft for the adopting user
  const { data: newDraft, error: draftErr } = await supabase
    .from('story_drafts')
    .insert({
      bdr_email: email,
      story_type: entry.story_type,
      title: entry.title,
      draft_content: draftContent,
      ai_conversation: [],
      framework_metadata: originalDraft?.framework_metadata || {},
      status: 'practicing',
    })
    .select()
    .single()

  if (draftErr || !newDraft) {
    return NextResponse.json({ error: draftErr?.message || 'Failed to create draft' }, { status: 500 })
  }

  return NextResponse.json({ draft: newDraft })
}
