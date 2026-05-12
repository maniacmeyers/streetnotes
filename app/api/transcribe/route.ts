import { NextResponse } from 'next/server'
import {
  messageFromTranscriptionError,
  transcribeAudio,
  validateAudioFile,
} from '@/lib/openai/transcribe'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60
const TRANSCRIBE_LIMIT = 30
const TRANSCRIBE_WINDOW_MS = 15 * 60 * 1000

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

  const key = `transcribe:${user.id}`
  if (isRateLimited(key, TRANSCRIBE_LIMIT, TRANSCRIBE_WINDOW_MS)) {
    return jsonError('Too many transcription requests. Please try again shortly.', 429)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError('Invalid multipart form data', 400)
  }

  const audio = formData.get('audio')
  const validation = validateAudioFile(audio)
  if (!validation.ok) {
    return jsonError(validation.message, validation.status)
  }
  const audioFile = audio as File

  try {
    const result = await transcribeAudio(audioFile)
    return NextResponse.json(result)
  } catch (error) {
    const { message, status } = messageFromTranscriptionError(error)
    return jsonError(message, status)
  }
}
