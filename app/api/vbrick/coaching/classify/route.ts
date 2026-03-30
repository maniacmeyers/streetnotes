import { NextResponse } from 'next/server'
import { classifyIntent } from '@/lib/vbrick/coaching-classifier'

export const runtime = 'nodejs'
export const maxDuration = 15

/**
 * POST: Classify a transcript segment and return a coaching prompt.
 * Target latency: <2 seconds.
 */
export async function POST(request: Request) {
  try {
    const { text, context } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 })
    }

    const result = await classifyIntent(text, context)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[coaching/classify] Error:', error)
    return NextResponse.json(
      { error: 'Classification failed' },
      { status: 500 }
    )
  }
}
