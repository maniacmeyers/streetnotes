import 'server-only'
import OpenAI from 'openai'
import { AESTHETIC_TRANSCRIPTION_PROMPT } from '@/lib/voice-engine/ontology'

let openAIClient: OpenAI | null = null

export const SALES_WHISPER_PROMPT =
  'Sales meeting notes. Terms may include ARR, NRR, ACV, MEDDIC, BANT, discovery, proposal, renewal, upsell, Salesforce, HubSpot.'

export { AESTHETIC_TRANSCRIPTION_PROMPT }

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your .env.local file.')
  }

  if (!openAIClient) {
    openAIClient = new OpenAI({ apiKey })
  }

  return openAIClient
}
