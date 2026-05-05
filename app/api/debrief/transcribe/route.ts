import { NextResponse } from 'next/server'
import {
  messageFromTranscriptionError,
  transcribeAudio,
  validateAudioFile,
} from '@/lib/openai/transcribe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError('Invalid form data', 400)
  }

  const sessionId = formData.get('sessionId')
  if (!sessionId || typeof sessionId !== 'string') {
    return jsonError('Missing sessionId', 400)
  }

  const audio = formData.get('audio')
  const validation = validateAudioFile(audio)
  if (!validation.ok) {
    return jsonError(validation.message, validation.status)
  }
  const audioFile = audio as File

  // Validate session exists
  const supabase = createAdminClient()
  const { data: session } = await supabase
    .from('debrief_sessions')
    .select('id')
    .eq('id', sessionId)
    .single()

  if (!session) return jsonError('Invalid session', 400)

  try {
    console.log('[debrief/transcribe] Audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    })

    const result = await transcribeAudio(audioFile)

    // Update session with transcript
    await supabase
      .from('debrief_sessions')
      .update({ raw_transcript: result.transcript })
      .eq('id', sessionId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[debrief/transcribe] Error:', error)

    const { message, status } = messageFromTranscriptionError(error)
    return jsonError(message, status)
  }
}
