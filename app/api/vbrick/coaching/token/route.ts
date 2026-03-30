import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Returns a short-lived Deepgram API key for browser-side WebSocket connections.
 *
 * In production, this would use Deepgram's key management API to create
 * scoped temporary keys. For now, we return the project key directly
 * (acceptable for internal VBRICK use with 2 BDRs).
 */
export async function GET() {
  const key = process.env.DEEPGRAM_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'Deepgram API key not configured. Add DEEPGRAM_API_KEY to .env.local' },
      { status: 503 }
    )
  }

  return NextResponse.json({ key })
}
