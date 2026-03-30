import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// POST: Start a coaching session
export async function POST(request: Request) {
  const { email, callingSessionId } = await request.json()

  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vbrick_coaching_sessions')
    .insert({
      bdr_email: email,
      calling_session_id: callingSessionId || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data })
}

// PATCH: End a coaching session with summary
export async function PATCH(request: Request) {
  const { sessionId, transcript, intentsDetected, talkTimeBdrPct } = await request.json()

  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const supabase = await createClient()

  // Generate post-call coaching summary
  let summary = null
  let qualityScore = null

  if (transcript && transcript.length > 50) {
    try {
      const openai = getOpenAIClient()
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a direct, peer-level sales coach. Analyze this call transcript and provide a coaching summary. Be specific — reference actual things said. No generic advice.

Return JSON:
{
  "talk_time_assessment": "1 sentence on talk-time ratio and what it means",
  "objections_handled": ["objection 1 summary", "objection 2 summary"],
  "competitors_mentioned": ["competitor1", "competitor2"],
  "strengths": ["specific thing BDR did well"],
  "improvements": ["specific, actionable improvement 1", "improvement 2", "improvement 3"],
  "quality_score": 0-10 overall call quality,
  "one_thing": "The single most impactful thing to do differently on the next call"
}`,
          },
          {
            role: 'user',
            content: `Call transcript:\n${transcript}\n\nBDR talk-time: ${talkTimeBdrPct ? Math.round(talkTimeBdrPct) + '%' : 'unknown'}\nIntents detected during call: ${JSON.stringify(intentsDetected || [])}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 600,
      })

      const raw = completion.choices[0]?.message?.content
      if (raw) {
        summary = JSON.parse(raw)
        qualityScore = summary.quality_score || null
      }
    } catch (err) {
      console.error('[coaching/session] Summary generation error:', err)
    }
  }

  const { data, error } = await supabase
    .from('vbrick_coaching_sessions')
    .update({
      ended_at: new Date().toISOString(),
      full_transcript: transcript || null,
      talk_time_bdr_pct: talkTimeBdrPct || null,
      intents_detected: intentsDetected || [],
      coaching_summary: summary,
      quality_score: qualityScore,
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data, summary })
}
