import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Resolve the caller's effective email. Prefer the Supabase session (the
// authenticated StreetNotes app), fall back to an email supplied by the
// caller (the vbrick public demo, which uses localStorage-based identity
// because /vbrick and /api are public at the middleware level).
async function resolveCallerEmail(
  request: Request,
  bodyEmail?: string | null,
): Promise<string | null> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (user?.email) return user.email

  if (bodyEmail) return bodyEmail

  const url = new URL(request.url)
  const queryEmail = url.searchParams.get('email')
  if (queryEmail) return queryEmail

  return null
}

// PATCH: Toggle team sharing for a vault entry. Requires ownership.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  let body: { shared_to_team?: boolean; email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const callerEmail = await resolveCallerEmail(request, body.email)
  if (!callerEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('story_vault_entries')
    .select('bdr_email')
    .eq('id', params.id)
    .single()
  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (existing.bdr_email !== callerEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

// DELETE: Remove a vault entry (and its practice session). Requires ownership.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createAdminClient()
  const callerEmail = await resolveCallerEmail(request, null)
  if (!callerEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: entry, error: fetchError } = await supabase
    .from('story_vault_entries')
    .select('practice_session_id, bdr_email')
    .eq('id', params.id)
    .single()
  if (fetchError || !entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (entry.bdr_email !== callerEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: deleteVaultError } = await supabase
    .from('story_vault_entries')
    .delete()
    .eq('id', params.id)

  if (deleteVaultError) {
    return NextResponse.json({ error: deleteVaultError.message }, { status: 500 })
  }

  if (entry.practice_session_id) {
    const { error: deletePracticeError } = await supabase
      .from('story_practice_sessions')
      .delete()
      .eq('id', entry.practice_session_id)

    if (deletePracticeError) {
      // Log but don't fail — the vault entry is already gone.
      console.error('Failed to delete practice session:', deletePracticeError.message)
    }
  }

  return NextResponse.json({ success: true })
}
