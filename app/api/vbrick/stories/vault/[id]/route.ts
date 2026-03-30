import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// PATCH: Toggle team sharing for a vault entry
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (typeof body.shared_to_team === 'boolean') {
    updateData.shared_to_team = body.shared_to_team
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('story_vault_entries')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}

// DELETE: Remove a vault entry and its associated practice session
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch the vault entry to get the practice_session_id before deleting
  const { data: entry, error: fetchError } = await supabase
    .from('story_vault_entries')
    .select('practice_session_id')
    .eq('id', params.id)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  // Delete the vault entry first
  const { error: deleteVaultError } = await supabase
    .from('story_vault_entries')
    .delete()
    .eq('id', params.id)

  if (deleteVaultError) return NextResponse.json({ error: deleteVaultError.message }, { status: 500 })

  // Delete the associated practice session
  if (entry.practice_session_id) {
    const { error: deletePracticeError } = await supabase
      .from('story_practice_sessions')
      .delete()
      .eq('id', entry.practice_session_id)

    if (deletePracticeError) {
      // Log but don't fail the request — vault entry is already deleted
      console.error('Failed to delete practice session:', deletePracticeError.message)
    }
  }

  return NextResponse.json({ success: true })
}
