import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { createClient } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/resend'
import {
  DEBRIEF_SYSTEM_PROMPT,
  DEBRIEF_USER_PROMPT_TEMPLATE,
  BDR_SYSTEM_PROMPT,
  BDR_USER_PROMPT_TEMPLATE,
  VBRICK_BDR_SYSTEM_PROMPT,
  VBRICK_BDR_USER_PROMPT_TEMPLATE,
} from '@/lib/debrief/prompts'
import type { DebriefOutput, BDRStructuredOutput, DebriefStructuredOutput } from '@/lib/debrief/types'
import type { CIExtraction } from '@/lib/ci/types'
import { isBDROutput } from '@/lib/debrief/types'
import { isVbrickUser } from '@/lib/vbrick/config'
import { processCIMentions } from '@/lib/ci/pipeline'

export const runtime = 'nodejs'
export const maxDuration = 45

export async function POST(request: Request) {
  try {
    const { sessionId, transcript, segment, contactContext } = await request.json()

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

    const isVbrick = isVbrickUser(session.email)
    const isBDR = segment === 'bdr-cold-call'

    let systemPrompt: string
    let userPrompt: string

    // If contact context is provided (from dashboard queue), prepend to transcript
    let enrichedTranscript = transcript
    if (contactContext && isBDR) {
      const parts = [`BDR is calling ${contactContext.name}`]
      if (contactContext.title) parts[0] += `, ${contactContext.title}`
      if (contactContext.company) parts[0] += ` at ${contactContext.company}`
      parts[0] += '.'
      enrichedTranscript = parts[0] + '\n\n' + transcript
    }

    if (isBDR && isVbrick) {
      systemPrompt = VBRICK_BDR_SYSTEM_PROMPT
      userPrompt = VBRICK_BDR_USER_PROMPT_TEMPLATE(enrichedTranscript)
    } else if (isBDR) {
      systemPrompt = BDR_SYSTEM_PROMPT
      userPrompt = BDR_USER_PROMPT_TEMPLATE(enrichedTranscript)
    } else {
      systemPrompt = DEBRIEF_SYSTEM_PROMPT
      userPrompt = DEBRIEF_USER_PROMPT_TEMPLATE(transcript)
    }

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
    const rawCiMentions = (structured as { ciMentions?: { competitorName: string; contextQuote: string; sentiment: string; mentionCategory: string }[] }).ciMentions
    const ciMentions = rawCiMentions as CIExtraction[] | undefined
    if (ciMentions && ciMentions.length > 0) {
      const isBDRCall = isBDROutput(structured)
      const bdrData = structured as BDRStructuredOutput
      const dealData = structured as DebriefStructuredOutput

      await processCIMentions(
        sessionId,
        ciMentions,
        {
          repEmail: session.email,
          companyName: isBDRCall
            ? bdrData.contactSnapshot?.company
            : dealData.dealSnapshot?.companyName,
          dealStage: isBDRCall ? undefined : dealData.dealSnapshot?.dealStage,
          dealSegment: isBDRCall ? 'bdr-cold-call' : dealData.dealSegment,
          sourceType: isBDRCall ? 'bdr-call' : 'debrief',
        },
        supabase
      )
    }

    // Notify on completion
    if (isBDROutput(structured)) {
      const bdr = structured as BDRStructuredOutput
      const contact = bdr.contactSnapshot?.name || 'Unknown'
      const company = bdr.contactSnapshot?.company || 'Unknown'
      const status = bdr.prospectStatus || 'unknown'
      await sendNotification(
        `BDR Cold Call logged: ${session.email} — ${contact} at ${company} (${status})`,
        [
          'BDR Cold Call logged!',
          '',
          `Email: ${session.email}`,
          `Contact: ${contact}`,
          `Company: ${company}`,
          `Disposition: ${bdr.callDisposition || 'unknown'}`,
          `Status: ${status}`,
          `Current Solution: ${bdr.currentSolution || 'Not mentioned'}`,
          `AE Briefing: ${bdr.aeBriefing ? 'Yes' : 'No'}`,
          '',
          `Session: ${sessionId}`,
          `Time: ${new Date().toISOString()}`,
          ...(ciMentions && ciMentions.length > 0
            ? ['', `CI Intel: ${ciMentions.length} competitor mention(s) — ${ciMentions.map(m => m.competitorName).join(', ')}`]
            : []),
        ].join('\n')
      )
    } else {
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
    }

    return NextResponse.json({ structured })
  } catch {
    return NextResponse.json(
      { error: 'Failed to extract deal data' },
      { status: 502 }
    )
  }
}
