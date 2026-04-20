import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { createClient } from '@/lib/supabase/server'
import {
  SPARRING_SCORING_FUNCTION,
  SPARRING_SCORER_PROMPT,
  type ScoringInput,
  type CallScore
} from '@/lib/vbrick/sparring-scoring'
import { getPersonaById, type PersonaId } from '@/lib/vbrick/sparring-personas'

export const runtime = 'nodejs'
export const maxDuration = 60

// Start a new sparring session
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { personaId, action, sessionId, bdrMessage, transcription } = body

    // Validate persona
    const persona = getPersonaById(personaId as PersonaId)
    if (!persona) {
      return NextResponse.json({ error: 'Invalid persona' }, { status: 400 })
    }

    // Initialize new session
    if (action === 'start') {
      const openai = getOpenAIClient()

      // Generate opening response from persona
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `${persona.systemPrompt}\n\nThis is a cold call practice session. The BDR (sales rep) is about to call you. You answer the phone. This is your first response.`
          },
          {
            role: 'user',
            content: 'The BDR is calling you. You answer the phone with a realistic first response based on your personality and current situation.'
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })

      const openingResponse = completion.choices[0].message.content || "Hello?"

      // Generate TTS for the opening
      const tts = await openai.audio.speech.create({
        model: 'tts-1',
        voice: persona.voice,
        input: openingResponse,
        speed: 1.0
      })

      const audioBuffer = Buffer.from(await tts.arrayBuffer())
      const audioBase64 = audioBuffer.toString('base64')

      // Create session record (optional - for persistence)
      // await supabase.from('sparring_sessions').insert({ ... })

      return NextResponse.json({
        sessionId: crypto.randomUUID(),
        persona,
        openingResponse,
        audioBase64,
        context: persona.openingContext
      })
    }

    // Continue conversation
    if (action === 'respond' && sessionId && bdrMessage) {
      const openai = getOpenAIClient()

      // Get conversation history from the request (simplified - in production, fetch from DB)
      const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> =
        body.conversationHistory || []

      // Generate persona response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `${persona.systemPrompt}\n\nCONVERSATION GUIDELINES:\n- Stay in character completely\n- Respond as this persona would realistically respond\n- Be appropriately challenging - don't make it too easy\n- If the BDR doesn't address your concerns, get more skeptical\n- If they handle objections well, you can soften\n- Never break character or acknowledge you're an AI\n- Keep responses realistic in length (1-3 sentences usually, occasionally longer)\n- You might hang up if they're pushy or not making sense`
          },
          ...conversationHistory,
          { role: 'user', content: bdrMessage }
        ],
        temperature: 0.75,
        max_tokens: 200
      })

      const response = completion.choices[0].message.content || "I'm going to have to go."

      // Generate TTS
      const tts = await openai.audio.speech.create({
        model: 'tts-1',
        voice: persona.voice,
        input: response,
        speed: 1.0
      })

      const audioBuffer = Buffer.from(await tts.arrayBuffer())
      const audioBase64 = audioBuffer.toString('base64')

      return NextResponse.json({
        response,
        audioBase64,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: bdrMessage },
          { role: 'assistant', content: response }
        ]
      })
    }

    // End session and score
    if (action === 'score' && sessionId && transcription) {
      const openai = getOpenAIClient()

      const scoringInput: ScoringInput = {
        transcription,
        durationSeconds: body.durationSeconds || 0,
        personaId,
        bdrName: body.bdrName
      }

      // Score the call
      const scoreCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SPARRING_SCORER_PROMPT },
          {
            role: 'user',
            content: `SCORING INPUT:
Persona: ${persona.name}, ${persona.title} at ${persona.company} (${persona.companySize}, ${persona.industry})
Persona Personality: ${persona.personality}

TRANSCRIPT:
${transcription}

Duration: ${scoringInput.durationSeconds} seconds

Provide detailed scoring and feedback.`
          }
        ],
        functions: [SPARRING_SCORING_FUNCTION],
        function_call: { name: 'score_cold_call' },
        temperature: 0.3
      })

      const functionCall = scoreCompletion.choices[0].message.function_call
      if (!functionCall?.arguments) {
        return NextResponse.json({ error: 'Failed to score call' }, { status: 500 })
      }

      const scoringResult = JSON.parse(functionCall.arguments)

      // Transform to CallScore format
      const callScore: CallScore = {
        totalScore: scoringResult.total_score,
        dimensions: scoringResult.dimensions.map((d: { name: string; score: number; weight: number; weighted_score: number; details: unknown }) => ({
          name: d.name,
          score: d.score,
          weight: d.weight,
          weightedScore: d.weighted_score,
          details: d.details
        })),
        transcription,
        summary: scoringResult.summary,
        feedback: [...scoringResult.key_strengths, ...scoringResult.key_improvements],
        strengths: scoringResult.key_strengths,
        improvements: scoringResult.key_improvements,
        sampleExchanges: scoringResult.sample_exchanges.map((ex: { speaker: string; text: string; feedback: string; score: number }) => ({
          speaker: ex.speaker,
          text: ex.text,
          feedback: ex.feedback,
          score: ex.score
        }))
      }

      // Store score in database
      await supabase.from('sparring_sessions').insert({
        user_id: user.id,
        persona_id: personaId,
        total_score: callScore.totalScore,
        dimensions: callScore.dimensions,
        transcription,
        duration_seconds: scoringInput.durationSeconds,
        would_meet: scoringResult.would_meet,
        meeting_likelihood: scoringResult.meeting_likelihood,
        summary: scoringResult.summary
      })

      return NextResponse.json({
        score: callScore,
        personaReaction: scoringResult.persona_reaction,
        wouldMeet: scoringResult.would_meet,
        meetingLikelihood: scoringResult.meeting_likelihood
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Sparring session error:', error)
    return NextResponse.json(
      { error: 'Failed to process sparring session' },
      { status: 500 }
    )
  }
}

// Get sparring history for a user
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data: sessions, error } = await supabase
      .from('sparring_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Get stats
    const { data: stats } = await supabase
      .from('sparring_sessions')
      .select('total_score, persona_id')
      .eq('user_id', user.id)

    const averageScore = stats?.length
      ? stats.reduce((sum, s) => sum + s.total_score, 0) / stats.length
      : 0

    const uniquePersonas = new Set(stats?.map((s) => s.persona_id) || []).size

    const bestScore = stats?.length
      ? Math.max(...stats.map((s) => s.total_score))
      : 0

    return NextResponse.json({
      sessions: sessions || [],
      stats: {
        totalSessions: sessions?.length || 0,
        averageScore: Math.round(averageScore),
        uniquePersonas,
        bestScore,
        currentStreak: calculateStreak(sessions || [])
      }
    })
  } catch (error) {
    console.error('Failed to fetch sparring history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}

// Calculate practice streak
function calculateStreak(
  sessions: Array<{ created_at: string }>
): number {
  if (!sessions.length) return 0

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Sort by date descending
  const sortedDates = sessions
    .map((s) => new Date(s.created_at))
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 0
  let checkDate = today

  for (const sessionDate of sortedDates) {
    const sessionDay = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    )

    if (sessionDay.getTime() === checkDate.getTime()) {
      streak++
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000)
    } else if (sessionDay.getTime() < checkDate.getTime()) {
      break
    }
  }

  return streak
}
