import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  let body: { transcript: string; structured: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const { transcript, structured } = body
  if (!transcript || typeof transcript !== 'string') {
    return jsonError('Missing transcript', 400)
  }
  if (!structured || typeof structured !== 'object') {
    return jsonError('Missing structured output', 400)
  }

  const title =
    [structured.contactName, structured.company].filter(Boolean).join(' — ') ||
    transcript.slice(0, 60).trim()

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title,
      raw_transcript: transcript,
      structured_output: structured,
      status: 'draft',
    })
    .select('id, created_at')
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return jsonError('Failed to save note', 500)
  }

  return NextResponse.json({ id: data.id, createdAt: data.created_at })
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  const { data, error } = await supabase
    .from('notes')
    .select('id, title, status, created_at, structured_output')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Supabase select error:', error)
    return jsonError('Failed to fetch notes', 500)
  }

  return NextResponse.json({ notes: data })
}
