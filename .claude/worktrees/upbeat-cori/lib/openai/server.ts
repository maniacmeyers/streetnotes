import 'server-only'
import OpenAI from 'openai'

let openAIClient: OpenAI | null = null

export const SALES_WHISPER_PROMPT =
  'Sales meeting notes. Terms may include ARR, NRR, ACV, MEDDIC, BANT, discovery, proposal, renewal, upsell, Salesforce, HubSpot.'

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
