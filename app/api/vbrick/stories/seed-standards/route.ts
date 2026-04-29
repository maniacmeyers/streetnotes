import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Seed the team vault with the three "standard" Vbrick elevator pitches —
 * the canonical 30s, 45s, and 60s versions every BDR should know.
 *
 * Visibility model: the team-vault query filters by email domain. To make
 * these pitches visible to every authorized user (vbrick.com + the two
 * personal-email exceptions), we insert one copy per authorized domain
 * under a sentinel `standard@<domain>` identity. The `standard@*` accounts
 * never log in — they exist only as a domain-scoped owner so the team-
 * vault query surfaces these for everyone on that domain.
 *
 * This endpoint is idempotent: it removes prior copies under the standard
 * identities before re-seeding, so re-running picks up content updates.
 */

const STANDARD_DOMAINS = [
  'vbrick.com',
  'forgetime.ai',
  'careermaniacs.com',
] as const

const SCORE_WEIGHTS = {
  framework: 0.25,
  clarity: 0.2,
  confidence: 0.2,
  pacing: 0.15,
  specificity: 0.1,
  brevity: 0.1,
} as const

function calcComposite(s: {
  framework: number
  clarity: number
  confidence: number
  pacing: number
  specificity: number
  brevity: number
}): number {
  return Number(
    (
      s.framework * SCORE_WEIGHTS.framework +
      s.clarity * SCORE_WEIGHTS.clarity +
      s.confidence * SCORE_WEIGHTS.confidence +
      s.pacing * SCORE_WEIGHTS.pacing +
      s.specificity * SCORE_WEIGHTS.specificity +
      s.brevity * SCORE_WEIGHTS.brevity
    ).toFixed(1),
  )
}

const STANDARD_PITCHES = [
  {
    title: 'Vbrick — 30-Second Standard Pitch',
    duration_label: '30 seconds',
    draft_content: `Vbrick is the enterprise video intelligence layer.

Most companies already have massive video libraries — town halls, trainings, meetings, support walkthroughs, even live operational streams — but that knowledge is trapped.

Vbrick turns that video into structured, searchable, governed data that feeds the AI agents they already use: Copilot, Claude, ServiceNow Now Assist, Agentforce, and more.

So video stops being passive storage and becomes a secure knowledge engine that helps people and agents find answers, make decisions, and trigger workflows.`,
    scores: {
      framework: 9.5,
      clarity: 9.5,
      confidence: 9.5,
      pacing: 9.5,
      specificity: 9.0,
      brevity: 9.5,
    },
    coaching_note:
      'The 30-second standard. Lead with the category claim ("enterprise video intelligence layer"), name the trapped-knowledge problem, then bridge to the AI-agent integration story. Use this when someone asks what Vbrick does and you have under a minute.',
  },
  {
    title: 'Vbrick — 45-Second Standard Pitch',
    duration_label: '45 seconds',
    draft_content: `Vbrick helps enterprises unlock the knowledge trapped in video.

Companies have thousands of hours of town halls, training, meetings, compliance content, customer support videos, and live operational streams — but most of that content just sits in a library.

Vbrick centralizes it, secures it, and enriches it with AI: transcripts, translations, summaries, chapters, tags, speaker context, and visual intelligence.

Then, through MCP and native integrations, that video data can feed tools like Copilot, Claude, ServiceNow Now Assist, and Salesforce Agentforce.

The result is not just a video platform. It is a governed intelligence layer that makes enterprise video searchable, actionable, and useful inside the workflows employees already use.`,
    scores: {
      framework: 9.5,
      clarity: 9.5,
      confidence: 9.5,
      pacing: 9.3,
      specificity: 9.5,
      brevity: 9.0,
    },
    coaching_note:
      'The 45-second standard. Adds the AI enrichment list (transcripts, translations, summaries, chapters, tags) and names the integration channel (MCP + native). Use this when the prospect leaned in on the 30s pitch and wants more depth.',
  },
  {
    title: 'Vbrick — 1-Minute Standard Pitch',
    duration_label: '1 minute',
    draft_content: `Vbrick is changing what enterprise video means.

Historically, companies bought video platforms to store recordings, stream town halls, and manage training libraries. That still matters — especially at enterprise scale, where video has to be secure, compliant, multilingual, and reliable for thousands of employees at once.

But the bigger opportunity now is AI.

Vbrick turns every live stream and recorded video into structured intelligence: what was said, who appeared, what was shown on screen, what topics were covered, what actions matter, and which moments are most relevant.

That intelligence can then flow securely into AI agents and business systems — Copilot, Claude, ServiceNow Now Assist, Salesforce Agentforce, and others — so video becomes part of how work gets done.

Instead of a passive storage layer, Vbrick becomes the trusted knowledge engine behind enterprise AI workflows.`,
    scores: {
      framework: 9.5,
      clarity: 9.5,
      confidence: 9.5,
      pacing: 9.2,
      specificity: 9.5,
      brevity: 8.5,
    },
    coaching_note:
      'The 1-minute standard. Frames the historical category (storage / town hall / training library) before pivoting to the AI opportunity. Use this in deeper discovery moments where the prospect wants to understand the strategic shift, not just the product.',
  },
]

export async function POST() {
  const supabase = createAdminClient()
  const removed: string[] = []
  const inserted: string[] = []
  const errors: string[] = []

  for (const domain of STANDARD_DOMAINS) {
    const standardEmail = `standard@${domain}`

    // 1. Remove any prior standard entries under this identity (idempotent).
    //    Cascades clean up draft/session via FK ON DELETE CASCADE? Actually
    //    the cascade direction is the other way — vault rows reference draft.
    //    Easiest: delete vault, session, draft for this email in turn.
    const { data: priorDrafts } = await supabase
      .from('story_drafts')
      .select('id')
      .eq('bdr_email', standardEmail)
      .eq('story_type', 'elevator_pitch')

    const priorDraftIds = (priorDrafts || []).map((d) => d.id)

    if (priorDraftIds.length > 0) {
      // Vault entries reference drafts via story_draft_id (ON DELETE CASCADE)
      // Sessions reference drafts via story_draft_id (ON DELETE CASCADE)
      // So deleting drafts cleans up everything.
      const { error: delErr } = await supabase
        .from('story_drafts')
        .delete()
        .in('id', priorDraftIds)
      if (delErr) {
        errors.push(`delete-prior ${standardEmail}: ${delErr.message}`)
        continue
      }
      removed.push(`${standardEmail}: removed ${priorDraftIds.length} prior draft(s)`)
    }

    // 2. Insert each pitch.
    for (const pitch of STANDARD_PITCHES) {
      const composite = calcComposite(pitch.scores)

      const { data: draft, error: draftErr } = await supabase
        .from('story_drafts')
        .insert({
          bdr_email: standardEmail,
          story_type: 'elevator_pitch',
          title: pitch.title,
          draft_content: pitch.draft_content,
          ai_conversation: [],
          framework_metadata: { duration_label: pitch.duration_label, is_standard: true },
          status: 'completed',
        })
        .select()
        .single()

      if (draftErr || !draft) {
        errors.push(`draft ${standardEmail} ${pitch.title}: ${draftErr?.message}`)
        continue
      }

      const { data: session, error: sessionErr } = await supabase
        .from('story_practice_sessions')
        .insert({
          story_draft_id: draft.id,
          bdr_email: standardEmail,
          transcript: pitch.draft_content,
          duration_seconds: Math.round(pitch.draft_content.length / 15),
          score_framework: pitch.scores.framework,
          score_clarity: pitch.scores.clarity,
          score_confidence: pitch.scores.confidence,
          score_pacing: pitch.scores.pacing,
          score_specificity: pitch.scores.specificity,
          score_brevity: pitch.scores.brevity,
          composite_score: composite,
          improvement_notes: {},
          coaching_note: pitch.coaching_note,
        })
        .select()
        .single()

      if (sessionErr || !session) {
        errors.push(`session ${standardEmail} ${pitch.title}: ${sessionErr?.message}`)
        continue
      }

      const { error: vaultErr } = await supabase.from('story_vault_entries').insert({
        practice_session_id: session.id,
        story_draft_id: draft.id,
        bdr_email: standardEmail,
        story_type: 'elevator_pitch',
        title: pitch.title,
        transcript: pitch.draft_content,
        composite_score: composite,
        is_personal_best: false, // not a real BDR — keep off the leaderboard
        shared_to_team: true,
      })

      if (vaultErr) {
        errors.push(`vault ${standardEmail} ${pitch.title}: ${vaultErr.message}`)
      } else {
        inserted.push(`${standardEmail}: ${pitch.title} (score ${composite})`)
      }
    }
  }

  return NextResponse.json({
    domains: STANDARD_DOMAINS,
    pitches: STANDARD_PITCHES.map((p) => p.title),
    removed,
    inserted_count: inserted.length,
    inserted,
    errors,
  })
}
