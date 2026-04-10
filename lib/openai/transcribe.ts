import { getOpenAIClient, SALES_WHISPER_PROMPT } from './server'

/**
 * Shared transcription utility — uses gpt-4o-transcribe for best-in-class
 * accuracy on sales audio (proper nouns, dollar amounts, accents, noise).
 */
export async function transcribeAudio(audio: File): Promise<string> {
  const openai = getOpenAIClient()
  const transcription = await openai.audio.transcriptions.create({
    model: 'gpt-4o-transcribe',
    file: audio,
    prompt: SALES_WHISPER_PROMPT,
  })
  const transcript = transcription.text?.trim()
  if (!transcript) throw new Error('Transcription returned empty')
  return transcript
}
