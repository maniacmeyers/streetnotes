import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Returns a short-lived, scoped Deepgram API key for browser-side WebSocket STT.
 *
 * Uses Deepgram's key management API to create a temporary key with:
 * - 30-second TTL (enough to open the WebSocket, then Deepgram extends for the session)
 * - Scoped to "usage:write" (can only send audio and receive transcripts)
 *
 * The real DEEPGRAM_API_KEY never leaves the server.
 */
export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY
  const projectId = process.env.DEEPGRAM_PROJECT_ID

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Deepgram API key not configured. Add DEEPGRAM_API_KEY to .env.local' },
      { status: 503 }
    )
  }

  if (!projectId) {
    return NextResponse.json(
      { error: 'Deepgram project ID not configured. Add DEEPGRAM_PROJECT_ID to .env.local' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: `streetnotes-temp-${Date.now()}`,
          scopes: ['usage:write'],
          time_to_live_in_seconds: 30,
        }),
      }
    )

    if (!res.ok) {
      const body = await res.text()
      console.error('[coaching/token] Deepgram key creation failed:', res.status, body)
      return NextResponse.json(
        { error: 'Failed to create temporary STT key' },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json({ key: data.key })
  } catch (err) {
    console.error('[coaching/token] Deepgram key creation error:', err)
    return NextResponse.json(
      { error: 'Failed to create temporary STT key' },
      { status: 502 }
    )
  }
}
