/**
 * Deepgram utilities for real-time speech-to-text.
 *
 * The browser-side hook (use-streaming-stt.ts) connects directly to
 * Deepgram's WebSocket at wss://api.deepgram.com/v1/listen using a
 * temporary key from the /api/vbrick/coaching/token endpoint.
 *
 * For the MVP (2 BDRs), we pass the API key directly.
 * In production, use Deepgram's key management API to create
 * scoped temporary keys with limited TTL.
 */

export function getDeepgramApiKey(): string {
  const key = process.env.DEEPGRAM_API_KEY
  if (!key) throw new Error('DEEPGRAM_API_KEY is not set in environment variables')
  return key
}
