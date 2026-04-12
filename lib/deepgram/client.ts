/**
 * Deepgram utilities for real-time speech-to-text.
 *
 * The browser-side hook (use-streaming-stt.ts) connects directly to
 * Deepgram's WebSocket at wss://api.deepgram.com/v1/listen using a
 * temporary scoped key from the /api/vbrick/coaching/token endpoint.
 *
 * The real DEEPGRAM_API_KEY never leaves the server — the token route
 * uses Deepgram's key management API to mint a 30-second scoped key.
 */

export function getDeepgramProjectId(): string {
  const id = process.env.DEEPGRAM_PROJECT_ID
  if (!id) throw new Error('DEEPGRAM_PROJECT_ID is not set in environment variables')
  return id
}
