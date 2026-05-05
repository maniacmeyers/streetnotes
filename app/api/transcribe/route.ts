import { NextResponse } from 'next/server'
import {
  messageFromTranscriptionError,
  transcribeAudio,
  validateAudioFile,
} from '@/lib/openai/transcribe'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

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
