import { getOpenAIClient, SALES_WHISPER_PROMPT } from './server'

/**
 * Shared Whisper transcription utility.
 * Used by both the debrief transcribe route and story vault practice recording.
 */
export async function transcribeAudio(audio: File): Promise<string> {
  const openai = getOpenAIClient()
  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: audio,
    prompt: SALES_WHISPER_PROMPT,
  })
  const transcript = transcription.text?.trim()
  if (!transcript) throw new Error('Transcription returned empty')
  return transcript
}
