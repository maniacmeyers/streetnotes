import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  VBRICK_BDR_SYSTEM_PROMPT,
  VBRICK_BDR_USER_PROMPT_TEMPLATE,
} from '@/lib/vbrick/debrief/prompts'
import type { VbrickBDRStructuredOutput } from '@/lib/debrief/types'
import type { CIExtraction } from '@/lib/ci/types'
import { processCIMentions } from '@/lib/ci/pipeline'

export const runtime = 'nodejs'
export const maxDuration = 45

/**
 * VBrick BDR-mode debrief structure endpoint.
 *
 * Returns a VbrickBDRStructuredOutput (mode: 'bdr-cold-call') with SPIN
 * scoring + AE briefing — the shape the VBrick command center deal sheet
 * expects. The public /api/debrief/structure endpoint was repurposed for
 * the aesthetic vertical and no longer returns BDR shape.
 */

export async function POST(request: Request) {
  try {
    const { sessionId, transcript } = await request.json()

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

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: VBRICK_BDR_SYSTEM_PROMPT },
        { role: 'user', content: VBRICK_BDR_USER_PROMPT_TEMPLATE(transcript) },
      ],
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 502 })
    }

    let structured: VbrickBDRStructuredOutput
    try {
      structured = JSON.parse(content) as VbrickBDRStructuredOutput
    } catch {
      return NextResponse.json({ error: 'AI returned invalid data' }, { status: 502 })
    }

    // Force the mode tag so the client guard (`isBDROutput`) passes even if
    // the model omits it.
    if (structured && typeof structured === 'object') {
      structured.mode = 'bdr-cold-call'
    }

    await supabase
      .from('debrief_sessions')
      .update({ structured_output: structured as unknown as Record<string, unknown> })
      .eq('id', sessionId)

    const ciMentions = structured.ciMentions as CIExtraction[] | undefined
    if (ciMentions && ciMentions.length > 0) {
      try {
        await processCIMentions(
          sessionId,
          ciMentions,
          {
            repEmail: session.email,
            companyName: structured.contactSnapshot?.company,
            sourceType: 'bdr-call',
          },
          supabase,
        )
      } catch {
        // Non-fatal — CI pipeline failures should not block deal-sheet display.
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
