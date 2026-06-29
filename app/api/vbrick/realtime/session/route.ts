import { NextResponse } from 'next/server'
import { getPersonaById, type PersonaId, SPARRING_PERSONAS } from '@/lib/vbrick/sparring-personas'
import { getScenarioById, type BDRAccent } from '@/lib/vbrick/sparring-scenarios'
import { composeRealtimeInstructions } from '@/lib/vbrick/realtime-instructions'

export const runtime = 'nodejs'
export const maxDuration = 30

const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL ?? 'gpt-realtime'
const VALID_ACCENTS: readonly BDRAccent[] = ['irish', 'newZealand', 'general'] as const

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY missing on server' }, { status: 500 })
  }

  let body: {
    scenarioId?: string
    hardMode?: boolean
    personaId?: PersonaId
    bdrAccent?: BDRAccent
    difficulty?: 'easy' | 'intermediate' | 'hard'
  } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine — will fall through to defaults
  }

  const scenario = getScenarioById(body.scenarioId)
  const resolvedPersonaId: PersonaId =
    body.personaId ?? scenario?.defaultPersonaId ?? 'disinterested-it-manager'
  const persona = getPersonaById(resolvedPersonaId)
  if (!persona) {
    return NextResponse.json(
      { error: `Unknown personaId: ${resolvedPersonaId}` },
      { status: 400 },
    )
  }

  const resolvedAccent: BDRAccent =
    body.bdrAccent && VALID_ACCENTS.includes(body.bdrAccent)
      ? body.bdrAccent
      : scenario?.defaultAccent ?? 'general'

  const instructions = composeRealtimeInstructions(
    persona,
    scenario,
    body.hardMode ?? false,
    resolvedAccent,
    body.difficulty,
  )

  try {
    const resp = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: REALTIME_MODEL,
          instructions,
          audio: {
            input: {
              // gpt-4o-transcribe is materially more accurate than whisper-1 on
              // proper nouns / spoken names — the rep's first+last name in the
              // opening was being mis-heard, which broke name detection downstream.
              transcription: { model: 'gpt-4o-transcribe' },
              turn_detection: {
                type: 'server_vad',
                silence_duration_ms: 600,
                prefix_padding_ms: 300,
              },
            },
            output: {
              voice: persona.voice,
            },
          },
        },
      }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error('Realtime session mint failed:', resp.status, text)
      return NextResponse.json(
        { error: 'Failed to mint Realtime session', upstreamStatus: resp.status, upstreamBody: text },
        { status: 502 },
      )
    }

    // GA /v1/realtime/client_secrets response shape:
    //   { value: 'ek_...', expires_at: 1700000000, session: { id: 'sess_...', ... } }
    // Older legacy /v1/realtime/sessions shape (in case it ever falls back):
    //   { id: 'sess_...', client_secret: { value, expires_at } }
    type GaResponse = {
      value?: string
      expires_at?: number
      session?: { id?: string }
      client_secret?: { value?: string; expires_at?: number }
      id?: string
    }
    const session = (await resp.json()) as GaResponse
    const clientSecret = session.value ?? session.client_secret?.value
    const expiresAt = session.expires_at ?? session.client_secret?.expires_at
    const sessionId = session.session?.id ?? session.id ?? crypto.randomUUID()

    if (!clientSecret) {
      console.error('Realtime session mint: missing client secret', session)
      return NextResponse.json(
        { error: 'Realtime mint returned no client secret' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      sessionId,
      clientSecret,
      expiresAt,
      model: REALTIME_MODEL,
      voice: persona.voice,
      personaId: persona.id,
      personaName: persona.name,
      personaTitle: persona.title,
      bdrAccent: resolvedAccent,
    })
  } catch (err) {
    console.error('Realtime session error:', err)
    return NextResponse.json({ error: 'Realtime session request failed' }, { status: 500 })
  }
}

// Keep the full personas list exportable for the client via typed response consumers.
void SPARRING_PERSONAS
