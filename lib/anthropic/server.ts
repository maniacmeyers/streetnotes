import 'server-only'
import Anthropic from '@anthropic-ai/sdk'

let anthropicClient: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY. Add it to your .env.local file.')
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey })
  }

  return anthropicClient
}
