import { NextResponse } from 'next/server'
import { getPersonaById, type PersonaId, SPARRING_PERSONAS } from '@/lib/vbrick/sparring-personas'
import { getScenarioById } from '@/lib/vbrick/sparring-scenarios'
import { composeRealtimeInstructions } from '@/lib/vbrick/realtime-instructions'

export const runtime = 'nodejs'
export const maxDuration = 30

const REALTIME_MODEL = 'gpt-4o-realtime-preview-2024-12-17'

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY missing on server' }, { status: 500 })
  }

  let body: { scenarioId?: string; hardMode?: boolean; personaId?: PersonaId } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine — will fall through to defaults
  }

  const scenario = getScenarioById(body.scenarioId)
  const resolvedPersonaId: PersonaId =
    body.personaId ?? scenario?.personaId ?? 'bending-spoons-vp'
  const persona = getPersonaById(resolvedPersonaId)
  if (!persona) {
    return NextResponse.json(
      { error: `Unknown personaId: ${resolvedPersonaId}` },
      { status: 400 },
    )
  }

  const instructions = composeRealtimeInstructions(persona, scenario, body.hardMode ?? false)

  try {
    const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: REALTIME_MODEL,
        voice: persona.voice,
        instructions,
        modalities: ['audio', 'text'],
        temperature: 0.8,
        turn_detection: {
          type: 'server_vad',
          silence_duration_ms: 600,
          prefix_padding_ms: 300,
        },
        input_audio_transcription: { model: 'whisper-1' },
      }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error('Realtime session mint failed:', resp.status, text)
      return NextResponse.json(
        { error: 'Failed to mint Realtime session' },
        { status: 502 },
      )
    }

    const session = (await resp.json()) as {
      id: string
      client_secret: { value: string; expires_at: number }
    }

    return NextResponse.json({
      sessionId: session.id,
      clientSecret: session.client_secret.value,
      expiresAt: session.client_secret.expires_at,
      model: REALTIME_MODEL,
      voice: persona.voice,
      personaId: persona.id,
      personaName: persona.name,
      personaTitle: persona.title,
    })
  } catch (err) {
    console.error('Realtime session error:', err)
    return NextResponse.json({ error: 'Realtime session request failed' }, { status: 500 })
  }
}

// Keep the full personas list exportable for the client via typed response consumers.
void SPARRING_PERSONAS
