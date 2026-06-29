import type { SupabaseClient } from '@supabase/supabase-js'

export const STANDARD_PITCH_DOMAINS = [
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

interface PitchScores {
  framework: number
  clarity: number
  confidence: number
  pacing: number
  specificity: number
  brevity: number
}

function calcComposite(s: PitchScores): number {
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

export const STANDARD_PITCHES = [
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
    } satisfies PitchScores,
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
    } satisfies PitchScores,
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
    } satisfies PitchScores,
    coaching_note:
      'The 1-minute standard. Frames the historical category (storage / town hall / training library) before pivoting to the AI opportunity. Use this in deeper discovery moments where the prospect wants to understand the strategic shift, not just the product.',
  },
  {
    title: 'Dublin Summit — Booth Pitch (Tacit Knowledge)',
    duration_label: '30 seconds',
    draft_content: `Everyone here's fighting the same battle.

Your best knowledge is tacit — it lives in your people's heads. When they walk out, it walks with them.

A document won't save it. Video will.

Capture your experts explaining the thing, then make every minute searchable — for your team, and your AI.

That's Vbrick. We turn tacit knowledge into something that outlives the person.

Got two minutes? I'll show you.`,
    scores: {
      framework: 9.5,
      clarity: 9.6,
      confidence: 9.5,
      pacing: 9.5,
      specificity: 9.2,
      brevity: 9.6,
    } satisfies PitchScores,
    coaching_note:
      'Knowledge Summit Dublin booth pitch. Built for a Knowledge Management crowd whose obsession is tacit knowledge — lead there, not with "video." One breath per line, hard stops; let "Video will." land. Close by asking for a next step, never a brochure.',
  },
  {
    title: 'Dublin Summit — Booth Pitch (Rugby)',
    duration_label: '30 seconds',
    draft_content: `I spent 15 years in pro rugby. Everything that made us better, we learned from the tape — not a manual.

Your world's the same. Your experts' best knowledge is tacit. When they leave, it's gone.

Vbrick captures it on video and makes it searchable — so your people and your AI can pull it back.

Knowledge that outlives the person.

Two minutes — want to see it?`,
    scores: {
      framework: 9.4,
      clarity: 9.5,
      confidence: 9.6,
      pacing: 9.4,
      specificity: 9.1,
      brevity: 9.5,
    } satisfies PitchScores,
    coaching_note:
      'Knowledge Summit Dublin booth pitch, personal-voice version. Use the rugby/"watching the tape" line only once and only with rapport — never open cold with it. Same payoff as the primary: tacit knowledge that outlives the person, then the two-minute ask.',
  },

  // ---------------------------------------------------------------------
  // 15-SECOND ELEVATOR PITCHES — capability + compliance set
  // Tight, one-breath-per-line. Grounded in verified Vbrick facts.
  // ---------------------------------------------------------------------

  {
    title: 'Vbrick AI — 15-Second Elevator Pitch',
    duration_label: '15 seconds',
    draft_content: `You're sitting on thousands of hours of video nobody can use.

Vbrick's AI reads all of it — what's said and what's shown — then writes the titles, summaries, chapters, and tags for you. In 100-plus languages.

It runs on AWS Bedrock and never trains on your data.

Dead archive, meet working knowledge.`,
    scores: {
      framework: 9.4,
      clarity: 9.6,
      confidence: 9.5,
      pacing: 9.5,
      specificity: 9.3,
      brevity: 9.6,
    } satisfies PitchScores,
    coaching_note:
      'The 15-second AI pitch. Lead with the trapped-archive pain, then the multimodal payoff (reads what is said AND shown) and the trust line that closes every AI conversation: runs on Bedrock, never trains on your data. End on the "dead archive, meet working knowledge" turn.',
  },
  {
    title: 'Vbrick MCP + CLI — 15-Second Elevator Pitch',
    duration_label: '15 seconds',
    draft_content: `Your AI agents are blind to everything trapped in your video.

Vbrick's MCP server and CLI fix that in one connection — pipe your whole library straight into Copilot, ServiceNow, Salesforce, or whatever you're building.

No custom pipeline. No data project.

Your agents finally see the 500 hours of decisions nobody wrote down.`,
    scores: {
      framework: 9.3,
      clarity: 9.4,
      confidence: 9.5,
      pacing: 9.4,
      specificity: 9.4,
      brevity: 9.5,
    } satisfies PitchScores,
    coaching_note:
      'The 15-second developer/agent pitch. For technical buyers: frame it as AI-readiness, not video. The hook is "one connection, no maintenance burden" feeding the tools they already run. Name Copilot/ServiceNow/Salesforce so it lands as real, not abstract.',
  },
  {
    title: 'Vbrick Smart Search — 15-Second Elevator Pitch',
    duration_label: '15 seconds',
    draft_content: `Stop scrubbing through a 90-minute town hall.

With Vbrick Smart Search you type what you mean — "the Q3 pricing change" — and land on the exact 40-second clip.

It reads the words and the screen, in 100-plus languages.

Find the moment, not the file.`,
    scores: {
      framework: 9.4,
      clarity: 9.6,
      confidence: 9.5,
      pacing: 9.6,
      specificity: 9.4,
      brevity: 9.7,
    } satisfies PitchScores,
    coaching_note:
      'The 15-second semantic-search pitch. Make it concrete: a real query landing on a real 40-second clip inside a 90-minute video. "Reads the words AND the screen" is the multimodal differentiator. Close on "find the moment, not the file."',
  },
  {
    title: 'Compliance — Government / FedRAMP — 15-Second Pitch',
    duration_label: '15 seconds',
    draft_content: `In government, an uncertified tool is a non-starter.

Vbrick is the only enterprise video platform that's FedRAMP-certified — and the only FedRAMP-certified eCDN.

Stop praying your vendor clears the authorization.

Get the one that already did.`,
    scores: {
      framework: 9.5,
      clarity: 9.6,
      confidence: 9.6,
      pacing: 9.5,
      specificity: 9.5,
      brevity: 9.6,
    } satisfies PitchScores,
    coaching_note:
      'The 15-second government pitch. FedRAMP is the whole leverage point — lead with it and be precise: "certified," not "ready." The standout is that the eCDN is FedRAMP-certified too, not just the platform. The "stop praying / already did" close reframes compliance as a settled bet, not a gamble.',
  },
  {
    title: 'Compliance — Financial Services — 15-Second Pitch',
    duration_label: '15 seconds',
    draft_content: `Regulators don't grade on effort.

Vbrick keeps every town hall and webcast governed, retained, and audit-ready — with tamper-evident proof of what's real.

SOC 2 Type II, encryption end to end, the recordkeeping FINRA and the SEC expect.

Don't bet your next audit on a maybe.`,
    scores: {
      framework: 9.4,
      clarity: 9.5,
      confidence: 9.6,
      pacing: 9.4,
      specificity: 9.4,
      brevity: 9.5,
    } satisfies PitchScores,
    coaching_note:
      'The 15-second financial-services pitch. Anchor on recordkeeping and audit-readiness (the FINRA/SEC world), with C2PA tamper-evident proof as the modern differentiator. "Don\'t bet your next audit on a maybe" keeps the no-gamble framing without overstating a specific certification.',
  },
  {
    title: 'Compliance — Healthcare — 15-Second Pitch',
    duration_label: '15 seconds',
    draft_content: `Healthcare video carries PHI, and "oops" isn't a compliance strategy.

Vbrick locks it down — role-based access, encryption at rest and in transit, retention, and full audit trails.

The same security rigor that clears FedRAMP, pointed at patient content.

Governed, searchable, safe.`,
    scores: {
      framework: 9.3,
      clarity: 9.5,
      confidence: 9.5,
      pacing: 9.4,
      specificity: 9.2,
      brevity: 9.5,
    } satisfies PitchScores,
    coaching_note:
      'The 15-second healthcare pitch. Lead with PHI sensitivity, then the control stack (RBAC, encryption, retention, audit trails). Position via "the same rigor that clears FedRAMP" rather than claiming a specific HIPAA seal — honest and still reassuring. Keep it about governance, not features.',
  },
  {
    title: 'Compliance — Any Regulated Org — 15-Second Pitch',
    duration_label: '15 seconds',
    draft_content: `If you're regulated, video is a liability — unless it's governed.

Vbrick is the only video platform that's FedRAMP-certified, SOC 2 Type II, GDPR-ready, and C2PA-conformant for tamper-evident proof.

One certified home for every recording.

Stop living on a prayer. Get the one auditors already trust.`,
    scores: {
      framework: 9.5,
      clarity: 9.5,
      confidence: 9.6,
      pacing: 9.5,
      specificity: 9.5,
      brevity: 9.5,
    } satisfies PitchScores,
    coaching_note:
      'The 15-second all-regulated-industries pitch. Stack the certifications (FedRAMP, SOC 2 Type II, GDPR, C2PA) as the proof no competitor can match, then collapse it to "one certified home for every recording." The "stop living on a prayer / the one auditors already trust" close is the dependable-neighbor framing — certainty over a gamble.',
  },
] as const

interface SeedResult {
  domain: string
  inserted: number
  errors: string[]
}

/**
 * Seed (or re-seed) the standard Vbrick pitches for one domain.
 *
 * The team-vault query filters by email domain. We surface these pitches
 * to every authorized BDR by inserting one copy per authorized domain
 * under a sentinel `standard@<domain>` identity. The sentinel never logs
 * in — it exists so the existing domain-scoped query surfaces these for
 * everyone on that domain.
 *
 * Idempotent: removes prior copies under the standard identity before
 * re-inserting, so re-running picks up content updates.
 */
export async function seedStandardPitchesForDomain(
  supabase: SupabaseClient,
  domain: string,
): Promise<SeedResult> {
  const standardEmail = `standard@${domain}`
  const errors: string[] = []
  let inserted = 0

  const { data: priorDrafts } = await supabase
    .from('story_drafts')
    .select('id')
    .eq('bdr_email', standardEmail)
    .eq('story_type', 'elevator_pitch')

  const priorDraftIds = (priorDrafts || []).map((d) => d.id)

  if (priorDraftIds.length > 0) {
    const { error: delErr } = await supabase
      .from('story_drafts')
      .delete()
      .in('id', priorDraftIds)
    if (delErr) {
      errors.push(`delete-prior ${standardEmail}: ${delErr.message}`)
      return { domain, inserted, errors }
    }
  }

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
      errors.push(`draft ${pitch.title}: ${draftErr?.message}`)
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
      errors.push(`session ${pitch.title}: ${sessionErr?.message}`)
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
      is_personal_best: false,
      shared_to_team: true,
    })

    if (vaultErr) {
      errors.push(`vault ${pitch.title}: ${vaultErr.message}`)
    } else {
      inserted++
    }
  }

  return { domain, inserted, errors }
}

/**
 * Ensure the standard pitches exist in the team vault for the given
 * domain. If any standard pitches are already present, this is a no-op.
 */
/**
 * Make sure all standard pitches exist in the team vault for the given
 * domain. Re-seeds if fewer than STANDARD_PITCHES.length are present
 * (handles partial inserts from a prior failed run, and picks up newly
 * added standard pitches).
 */
export async function ensureStandardPitchesForDomain(
  supabase: SupabaseClient,
  domain: string,
): Promise<void> {
  const standardEmail = `standard@${domain}`
  const { data, error } = await supabase
    .from('story_vault_entries')
    .select('id')
    .eq('bdr_email', standardEmail)
    .eq('shared_to_team', true)

  if (error) return
  if (data && data.length >= STANDARD_PITCHES.length) return

  await seedStandardPitchesForDomain(supabase, domain)
}
