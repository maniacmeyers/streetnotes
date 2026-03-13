import { NextResponse } from 'next/server'
import { MAX_AUDIO_BYTES } from '@/lib/audio/recording'
import { getOpenAIClient, SALES_WHISPER_PROMPT } from '@/lib/openai/server'
import { createClient } from '@/lib/supabase/server'

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
  if (!(audio instanceof File)) {
    return jsonError('Missing audio file', 400)
  }
  if (audio.size <= 0) return jsonError('Audio file is empty', 400)
  if (audio.size > MAX_AUDIO_BYTES)
    return jsonError('Audio exceeds 25MB limit', 413)

  // Validate session exists
  const supabase = await createClient()
  const { data: session } = await supabase
    .from('debrief_sessions')
    .select('id')
    .eq('id', sessionId)
    .single()

  if (!session) return jsonError('Invalid session', 400)

  try {
    console.log('[debrief/transcribe] Audio file:', {
      name: audio.name,
      type: audio.type,
      size: audio.size,
    })

    const openai = getOpenAIClient()
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audio,
      prompt: SALES_WHISPER_PROMPT,
    })

    const transcript = transcription.text?.trim()
    if (!transcript) return jsonError('Transcription returned empty', 502)

    // Update session with transcript
    await supabase
      .from('debrief_sessions')
      .update({ raw_transcript: transcript })
      .eq('id', sessionId)

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('[debrief/transcribe] Error:', error)
    return jsonError('Failed to transcribe audio', 502)
  }
}
