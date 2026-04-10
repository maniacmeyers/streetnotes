import { NextResponse } from 'next/server'
import { MAX_AUDIO_BYTES } from '@/lib/audio/recording'
import { getOpenAIClient, SALES_WHISPER_PROMPT } from '@/lib/openai/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function statusFromProviderError(error: unknown): number | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status
  }
  return null
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
  if (!(audio instanceof File)) {
    return jsonError('Missing audio file', 400)
  }

  if (audio.size <= 0) {
    return jsonError('Audio file is empty', 400)
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    return jsonError('Audio file exceeds 25MB limit', 413)
  }

  if (audio.type && !audio.type.startsWith('audio/')) {
    return jsonError('Unsupported file type', 400)
  }

  try {
    const openai = getOpenAIClient()
    const transcription = await openai.audio.transcriptions.create({
      model: 'gpt-4o-transcribe',
      file: audio,
      prompt: SALES_WHISPER_PROMPT,
    })

    const transcript = transcription.text?.trim()
    if (!transcript) {
      return jsonError('Transcription returned empty text', 502)
    }

    return NextResponse.json({
      transcript,
      mimeType: audio.type || 'application/octet-stream',
      sizeBytes: audio.size,
    })
  } catch (error) {
    const providerStatus = statusFromProviderError(error)
    if (providerStatus === 401 || providerStatus === 403) {
      return jsonError('Transcription provider authentication failed', 502)
    }
    if (providerStatus === 413) {
      return jsonError('Transcription provider rejected file size', 413)
    }
    if (providerStatus && providerStatus >= 400 && providerStatus < 500) {
      return jsonError('Transcription request was rejected', 400)
    }
    return jsonError('Failed to transcribe audio', 502)
  }
}
