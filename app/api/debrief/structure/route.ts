import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNotification } from '@/lib/resend'
import {
  DEBRIEF_SYSTEM_PROMPT,
  DEBRIEF_USER_PROMPT_TEMPLATE,
} from '@/lib/debrief/prompts'
import type { DebriefOutput, DebriefStructuredOutput } from '@/lib/debrief/types'
import type { CIExtraction } from '@/lib/ci/types'
import { processCIMentions } from '@/lib/ci/pipeline'

export const runtime = 'nodejs'
export const maxDuration = 45

export async function POST(request: Request) {
  try {
    const { sessionId, transcript } = await request.json()

    if (!sessionId || !transcript) {
      return NextResponse.json(
        { error: 'Missing sessionId or transcript' },
        { status: 400 }
      )
    }

    // Validate session
    const supabase = createAdminClient()
    const { data: session } = await supabase
      .from('debrief_sessions')
      .select('id, email')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    const systemPrompt = DEBRIEF_SYSTEM_PROMPT
    const userPrompt = DEBRIEF_USER_PROMPT_TEMPLATE(transcript)

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
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

    let structured: DebriefOutput
    try {
      structured = JSON.parse(content) as DebriefOutput
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

    // Process CI mentions
    const dealData = structured as DebriefStructuredOutput
    const ciMentions = dealData.ciMentions as CIExtraction[] | undefined
    if (ciMentions && ciMentions.length > 0) {
      await processCIMentions(
        sessionId,
        ciMentions,
        {
          repEmail: session.email,
          companyName: dealData.dealSnapshot?.companyName,
          dealStage: dealData.dealSnapshot?.dealStage,
          dealSegment: dealData.dealSegment,
          sourceType: 'debrief',
        },
        supabase
      )
    }

    // Notify on completion
    const company = structured.dealSnapshot?.companyName || 'Unknown'
    const stage = structured.dealSnapshot?.dealStage || 'Unknown'
    const taskCount = structured.followUpTasks?.length || 0
    const attendeeCount = structured.attendees?.length || 0
    await sendNotification(
      `Brain Dump completed: ${session.email} — ${company} (${stage})`,
      [
        'Brain Dump completed!',
        '',
        `Email: ${session.email}`,
        `Company: ${company}`,
        `Deal Stage: ${stage}`,
        `Segment: ${structured.dealSegment || 'unknown'}`,
        `Est. Value: ${structured.dealSnapshot?.estimatedValue || 'Not mentioned'}`,
        `Attendees: ${attendeeCount}`,
        `Follow-Up Tasks: ${taskCount}`,
        `Risks: ${structured.risks?.length || 0}`,
        '',
        `Session: ${sessionId}`,
        `Time: ${new Date().toISOString()}`,
        ...(ciMentions && ciMentions.length > 0
          ? ['', `CI Intel: ${ciMentions.length} competitor mention(s) — ${ciMentions.map(m => m.competitorName).join(', ')}`]
          : []),
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
