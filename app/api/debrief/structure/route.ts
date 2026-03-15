import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { createClient } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/resend'
import {
  DEBRIEF_SYSTEM_PROMPT,
  DEBRIEF_USER_PROMPT_TEMPLATE,
} from '@/lib/debrief/prompts'
import type { DebriefStructuredOutput } from '@/lib/debrief/types'

export const runtime = 'nodejs'
export const maxDuration = 45

export async function POST(request: Request) {
  try {
    const { sessionId, transcript, dealSegment } = await request.json()

    if (!sessionId || !transcript) {
      return NextResponse.json(
        { error: 'Missing sessionId or transcript' },
        { status: 400 }
      )
    }

    // Validate session
    const supabase = await createClient()
    const { data: session } = await supabase
      .from('debrief_sessions')
      .select('id, email')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    const segment = dealSegment || 'smb'

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: DEBRIEF_SYSTEM_PROMPT },
        {
          role: 'user',
          content: DEBRIEF_USER_PROMPT_TEMPLATE(transcript, segment),
        },
      ],
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 502 }
      )
    }

    let structured: DebriefStructuredOutput
    try {
      structured = JSON.parse(content) as DebriefStructuredOutput
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid data' },
        { status: 502 }
      )
    }

    // Save to session
    await supabase
      .from('debrief_sessions')
      .update({ structured_output: structured as unknown as Record<string, unknown> })
      .eq('id', sessionId)

    // Notify on completion — awaited so Vercel doesn't kill it
    const company = structured.dealSnapshot?.companyName || 'Unknown'
    const pattern = structured.dealPattern?.name || 'Unknown'
    const nextStepsStatus = structured.mutualNextSteps?.status || 'unknown'
    await sendNotification(
      `Brain Dump completed: ${session.email} — ${company} (${pattern})`,
      [
        'Brain Dump completed!',
        '',
        `Email: ${session.email}`,
        `Company: ${company}`,
        `Deal Pattern: ${pattern}`,
        `Segment: ${segment}`,
        `Next Steps Status: ${nextStepsStatus}`,
        `Contact: ${structured.dealSnapshot?.contactName || 'Not mentioned'}`,
        `Objection Diagnostics: ${structured.objectionDiagnostics?.length || 0}`,
        `Real Commitments: ${structured.commitmentAnalysis?.realCommitments?.length || 0}`,
        `Filler Signals: ${structured.commitmentAnalysis?.fillerSignals?.length || 0}`,
        '',
        `Session: ${sessionId}`,
        `Time: ${new Date().toISOString()}`,
      ].join('\n')
    )

    return NextResponse.json({ structured })
  } catch {
    return NextResponse.json(
      { error: 'Failed to extract deal data' },
      { status: 502 }
    )
  }
}
