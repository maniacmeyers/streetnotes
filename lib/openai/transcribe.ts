import { MAX_AUDIO_BYTES } from '@/lib/audio/recording'
import {
  AESTHETIC_TRANSCRIPTION_PROMPT,
  getOpenAIClient,
} from './server'

export type AudioValidationResult =
  | { ok: true }
  | { ok: false; message: string; status: number }

export interface TranscriptionResult {
  transcript: string
  mimeType: string
  sizeBytes: number
}

export function validateAudioFile(audio: unknown): AudioValidationResult {
  if (!(audio instanceof File)) {
    return { ok: false, message: 'Missing audio file', status: 400 }
  }
  if (audio.size <= 0) {
    return { ok: false, message: 'Audio file is empty', status: 400 }
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return { ok: false, message: 'Audio file exceeds 25MB limit', status: 413 }
  }
  if (audio.type && !audio.type.startsWith('audio/')) {
    return { ok: false, message: 'Unsupported file type', status: 400 }
  }
  return { ok: true }
}

export function statusFromProviderError(error: unknown): number | null {
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

export function messageFromTranscriptionError(error: unknown): {
  message: string
  status: number
} {
  const providerStatus = statusFromProviderError(error)
  const errMsg = error instanceof Error ? error.message : String(error)

  if (providerStatus === 401 || providerStatus === 403 || errMsg.includes('API key')) {
    return { message: 'Transcription provider authentication failed', status: 502 }
  }
  if (providerStatus === 413) {
    return { message: 'Transcription provider rejected file size', status: 413 }
  }
  if (providerStatus === 429) {
    return { message: 'Rate limited by transcription provider. Wait a moment and retry.', status: 429 }
  }
  if (providerStatus && providerStatus >= 400 && providerStatus < 500) {
    return { message: 'Transcription request was rejected', status: 400 }
  }
  if (
    errMsg.includes('timeout') ||
    errMsg.includes('ETIMEDOUT') ||
    errMsg.includes('ECONNABORTED') ||
    errMsg.includes('aborted')
  ) {
    return { message: 'Transcription timed out. Try a shorter recording.', status: 504 }
  }
  return { message: 'Failed to transcribe audio', status: 502 }
}

/**
 * Shared transcription utility — uses gpt-4o-transcribe for best-in-class
 * accuracy on sales audio (proper nouns, dollar amounts, accents, noise).
 */
export async function transcribeAudio(audio: File): Promise<TranscriptionResult> {
  const openai = getOpenAIClient()
  const transcription = await openai.audio.transcriptions.create({
    model: 'gpt-4o-transcribe',
    file: audio,
    prompt: AESTHETIC_TRANSCRIPTION_PROMPT,
  })
  const transcript = transcription.text?.trim()
  if (!transcript) throw new Error('Transcription returned empty')
  return {
    transcript,
    mimeType: audio.type || 'application/octet-stream',
    sizeBytes: audio.size,
  }
}
