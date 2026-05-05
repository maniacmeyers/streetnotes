import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNotification } from '@/lib/resend'
import { processCIMentions } from '@/lib/ci/pipeline'
import {
  structureTranscript,
  StructureProviderAuthError,
  StructureValidationError,
} from '@/lib/voice-engine/structure'
import { getDebriefMemory, invalidateDebriefMemory } from '@/lib/user-memory/server'
import { EMPTY_USER_MEMORY } from '@/lib/user-memory/scoring'
import { crmNoteToDebriefOutput } from '@/lib/debrief/adapter'

export const runtime = 'nodejs'
export const maxDuration = 60

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  try {
    const { sessionId, transcript } = await request.json()

    if (!sessionId || !transcript) {
      return jsonError('Missing sessionId or transcript', 400)
    }

    const supabase = createAdminClient()
    const { data: session } = await supabase
      .from('debrief_sessions')
      .select('id, email')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return jsonError('Invalid session', 400)
    }

    let memory = EMPTY_USER_MEMORY
    try {
      memory = await getDebriefMemory(session.email)
    } catch (err) {
      if (process.env.DEBUG_USER_MEMORY) {
        console.error('[debrief/structure] memory load failed, continuing without:', err)
      }
    }

    const { crmNote } = await structureTranscript({
      transcript,
      memory,
    })
    const structured = crmNoteToDebriefOutput(crmNote)

    await supabase
      .from('debrief_sessions')
      .update({ structured_output: structured as unknown as Record<string, unknown> })
      .eq('id', sessionId)

    invalidateDebriefMemory(session.email)

    const ciMentions = structured.ciMentions
    if (ciMentions && ciMentions.length > 0) {
      await processCIMentions(
        sessionId,
        ciMentions,
        {
          repEmail: session.email,
          companyName: structured.dealSnapshot.companyName,
          dealStage: structured.dealSnapshot.dealStage,
          dealSegment: structured.dealSegment,
          sourceType: 'debrief',
        },
        supabase
      )
    }

    const company = structured.dealSnapshot.companyName || 'Unknown'
    const stage = structured.dealSnapshot.dealStage || 'Unknown'
    const taskCount = structured.followUpTasks.length
    const attendeeCount = structured.attendees.length
    await sendNotification(
      `Brain Dump completed: ${session.email} — ${company} (${stage})`,
      [
        'Brain Dump completed!',
        '',
        `Email: ${session.email}`,
        `Company: ${company}`,
        `Deal Stage: ${stage}`,
        `Segment: ${structured.dealSegment || 'unknown'}`,
        `Est. Value: ${structured.dealSnapshot.estimatedValue || 'Not mentioned'}`,
        `Attendees: ${attendeeCount}`,
        `Follow-Up Tasks: ${taskCount}`,
        `Risks: ${structured.risks.length}`,
        '',
        `Session: ${sessionId}`,
        `Time: ${new Date().toISOString()}`,
        ...(ciMentions && ciMentions.length > 0
          ? ['', `CI Intel: ${ciMentions.length} competitor mention(s) — ${ciMentions.map(m => m.competitorName).join(', ')}`]
          : []),
      ].join('\n')
    )

    return NextResponse.json({ structured })
  } catch (error) {
    console.error('[debrief/structure] Error:', error)
    if (error instanceof StructureProviderAuthError) {
      return jsonError('AI provider authentication failed', 502)
    }
    if (error instanceof StructureValidationError) {
      return jsonError(error.message, 502)
    }
    return jsonError('Failed to extract deal data', 502)
  }
}
