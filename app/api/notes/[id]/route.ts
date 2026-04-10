import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invalidateUserMemory } from '@/lib/user-memory/server'

export const runtime = 'nodejs'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return jsonError('Unauthorized', 401)

  const { data: note, error } = await supabase
    .from('notes')
    .select('id, title, raw_transcript, structured_output, status, push_status, created_at')
    .eq('id', id)
    .single()

  if (error || !note) return jsonError('Note not found', 404)

  // Load push log entries for this note
  const { data: pushLog } = await supabase
    .from('crm_push_log')
    .select('id, crm_type, status, contact_id, contact_created, deal_id, deal_created, task_ids, error_message, created_at, updated_at')
    .eq('note_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ note, pushLog: pushLog ?? [] })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return jsonError('Unauthorized', 401)

  let body: { structured_output?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  if (!body.structured_output || typeof body.structured_output !== 'object') {
    return jsonError('Missing structured_output', 400)
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('notes')
    .select('id')
    .eq('id', id)
    .single()

  if (!existing) return jsonError('Note not found', 404)

  const title =
    [body.structured_output.contactName, body.structured_output.company]
      .filter(Boolean)
      .join(' — ') || undefined

  const { error } = await supabase
    .from('notes')
    .update({
      structured_output: body.structured_output,
      ...(title ? { title } : {}),
    })
    .eq('id', id)

  if (error) {
    console.error('Supabase update error:', error)
    return jsonError('Failed to update note', 500)
  }

  invalidateUserMemory(user.id)

  return NextResponse.json({ success: true })
}
