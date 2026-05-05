import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  VBRICK_BDR_SYSTEM_PROMPT,
  VBRICK_BDR_USER_PROMPT_TEMPLATE,
} from '@/lib/vbrick/debrief/prompts'
import {
  VBRICK_EVENT_SYSTEM_PROMPT,
  VBRICK_EVENT_USER_PROMPT_TEMPLATE,
} from '@/lib/vbrick/debrief/event-prompts'
import type { VbrickBDRStructuredOutput, EventConversationOutput } from '@/lib/debrief/types'
import type { CIExtraction } from '@/lib/ci/types'
import { processCIMentions } from '@/lib/ci/pipeline'
import { activeDebriefMode, type DebriefMode } from '@/lib/vbrick/config'

export const runtime = 'nodejs'
export const maxDuration = 45

/**
 * VBrick debrief structure endpoint.
 *
 * Routes to one of two prompts based on the `mode` field in the request
 * body. Both shapes get persisted to debrief_sessions.structured_output;
 * `structured_output.mode` is the discriminator the UI keys off of.
 *
 *  - 'bdr-cold-call'        → VBRICK_BDR_SYSTEM_PROMPT (cold-call shape)
 *  - 'event-conversation'   → VBRICK_EVENT_SYSTEM_PROMPT (K26 booth shape)
 *
 * If the client doesn't send `mode`, we default to whatever
 * `activeDebriefMode()` returns based on the K26 window — keeps callers
 * that haven't been updated to send mode still working correctly.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, transcript } = body
    const requestedMode = (body.mode as DebriefMode | undefined) ?? activeDebriefMode()

    if (!sessionId || !transcript) {
      return NextResponse.json(
        { error: 'Missing sessionId or transcript' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: session } = await supabase
      .from('debrief_sessions')
      .select('id, email')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    const isEventMode = requestedMode === 'event-conversation'
    const systemPrompt = isEventMode ? VBRICK_EVENT_SYSTEM_PROMPT : VBRICK_BDR_SYSTEM_PROMPT
    const userPrompt = isEventMode
      ? VBRICK_EVENT_USER_PROMPT_TEMPLATE(transcript)
      : VBRICK_BDR_USER_PROMPT_TEMPLATE(transcript)

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
      return NextResponse.json({ error: 'No response from AI' }, { status: 502 })
    }

    let structured: VbrickBDRStructuredOutput | EventConversationOutput
    try {
      structured = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid data' }, { status: 502 })
    }

    // Force the mode tag so client guards (`isBDROutput` / `isEventOutput`)
    // pass even if the model omits it.
    if (structured && typeof structured === 'object') {
      ;(structured as { mode: string }).mode = isEventMode
        ? 'vbrick-event-conversation'
        : 'bdr-cold-call'
    }

    await supabase
      .from('debrief_sessions')
      .update({ structured_output: structured as unknown as Record<string, unknown> })
      .eq('id', sessionId)

    const ciMentions = (structured as { ciMentions?: CIExtraction[] }).ciMentions
    if (ciMentions && ciMentions.length > 0) {
      try {
        await processCIMentions(
          sessionId,
          ciMentions,
          {
            repEmail: session.email,
            companyName: structured.contactSnapshot?.company,
            sourceType: isEventMode ? 'debrief' : 'bdr-call',
          },
          supabase,
        )
      } catch {
        // Non-fatal — CI pipeline failures should not block result display.
      }
    }

    return NextResponse.json({ structured })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to extract' },
      { status: 500 }
    )
  }
}
