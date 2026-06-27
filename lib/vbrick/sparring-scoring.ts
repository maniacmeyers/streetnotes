/**
 * Cold Call Scoring System
 *
 * Evaluates BDR performance across 6 dimensions:
 * 1. Opening (20%) - Hook quality, first 15 seconds
 * 2. Discovery (25%) - Question quality, listening skills
 * 3. Objection Handling (25%) - Response to pushback
 * 4. Value Articulation (15%) - VBRICK positioning
 * 5. Confidence/Flow (10%) - Delivery, filler words
 * 6. Close (5%) - Next steps, call control
 */

export interface CallScore {
  totalScore: number
  dimensions: DimensionScore[]
  transcription: string
  summary: string
  feedback: string[]
  strengths: string[]
  improvements: string[]
  sampleExchanges: ExchangeAnalysis[]
  inflectionPoints: InflectionPoint[]
  whatSealedIt: string[]
  appointmentSecured: boolean
}

/**
 * A moment the meeting was won or lost, with the verbatim line that should
 * have been said to garner the appointment. Powers the "what should have been
 * said" coaching shown after a call that didn't book a meeting.
 */
export interface InflectionPoint {
  /** Short label, e.g. "The objection", "Weak opener", "No-ask close". */
  moment: string
  /** Rough position in the call (turn index or timestamp-ish string). */
  sequence: string
  /** What the prospect said that the rep had to handle. */
  prospectLine: string
  /** Verbatim quote of what the rep actually said. */
  repSaid: string
  /** One line on why this lost the meeting. */
  whyItLost: string
  /** The verbatim winning line, grounded in real Vbrick facts. */
  shouldHaveSaid: string
}

export interface DimensionScore {
  name: string
  score: number // 0-100
  weight: number // e.g., 0.25 for 25%
  weightedScore: number
  details: string[]
}

export interface ExchangeAnalysis {
  speaker: 'bdr' | 'prospect'
  text: string
  feedback?: string
  score?: number
}

export interface ScoringInput {
  transcription: string
  durationSeconds: number
  personaId: string
  bdrName?: string
}

/**
 * Verified Vbrick 2026 facts. Shared by every scorer so the "what should have
 * been said" lines are accurate, not plausible-sounding. Keep claims to what
 * Vbrick publicly asserts.
 */
export const VBRICK_2026_CONTEXT = `VBRICK CONTEXT (2026) — use these verified facts; do not invent capabilities or numbers:

WHAT VBRICK IS: Vbrick Rev is a cloud-native, AI-driven Enterprise Video Platform — live webcasting at scale, a governed video CMS/portal, video creation, and an eCDN delivery layer. Positioning: "Turn video into enterprise intelligence."

SHARPEST 2026 DIFFERENTIATORS:
- AI is the flagship: semantic Smart Search, auto titles/summaries/chapters/tags, an Interactive Video Assistant, transcription/translation in 100+ languages, multimodal (reads what is said AND shown). Runs on AWS Bedrock with RAG and NEVER trains on customer data.
- The ONLY FedRAMP-certified enterprise video platform, and the ONLY FedRAMP-certified eCDN. Plus SOC 2 Type II, GDPR, encryption at rest and in transit, multi-layered RBAC.
- FIRST and ONLY EVP to achieve C2PA conformance (Feb 2026) — tamper-evident proof of a video's origin; flags AI-generated elements.
- The only vendor offering all THREE eCDN technologies (peer-to-peer, edge caching, multicast) from one vendor.
- Model Context Protocol (MCP) server — exposes video as a data layer to AI agents and systems (Copilot, ServiceNow Now Assist, Salesforce).
- The ONLY certified video app in the ServiceNow Store; powers Now Assist with video intelligence.
- 11-year Leader in the Aragon Research Globe for Enterprise Video (2026).

COMPETITIVE FACTS (verifiable, for objection handling):
- Microsoft Teams/Stream: Stream stores meeting recordings; it does not govern, search, or webcast at true scale. Teams town halls cap at ~20,000 attendees; Microsoft eCDN is gated behind Teams Premium licensing; without an eCDN large events need ~2 Mbps per viewer per site, which overwhelms corporate networks. Vbrick ENHANCES Teams (certified town-hall eCDN), not replaces it.
- Zoom/Webex: meeting tools, not a video CMS or distribution layer; a customer cut large-event Webex/internet costs by moving big broadcasts to Vbrick.
- Brightcove/Kaltura/Panopto: typically not FedRAMP-certified, not C2PA-conformant, not the certified ServiceNow video app, and resell a single eCDN approach.

PROOF POINTS: a financial-services customer runs ~100 webcasts/month for 115,000 users, largest single event ~14,255 viewers, migrated on-prem to cloud in one month; enterprise libraries exceeding 500 TB.`

/**
 * Reusable JSON-schema fragment for the inflection-point coaching, shared by
 * the text scorer (here) and the framework scorer (/api/vbrick/framework-spar).
 */
export const INFLECTION_SCHEMA_PROPERTIES = {
  appointment_secured: {
    type: 'boolean',
    description: 'Did the rep actually secure the appointment / meeting / warm transfer the scenario was aiming for?'
  },
  inflection_points: {
    type: 'array',
    description:
      'When the appointment was NOT secured, the 2-4 specific moments the meeting was lost. Empty array if the appointment WAS secured. Quote the rep verbatim and ground the better line in real Vbrick facts.',
    items: {
      type: 'object',
      properties: {
        moment: { type: 'string', description: 'Short label, e.g. "The objection", "Weak opener", "No-ask close"' },
        sequence: { type: 'string', description: 'Rough position in the call (turn or timestamp-ish)' },
        prospect_line: { type: 'string', description: 'What the prospect said that the rep had to handle' },
        rep_said: { type: 'string', description: 'Verbatim quote of what the rep actually said' },
        why_it_lost: { type: 'string', description: 'One line on why this lost the meeting' },
        should_have_said: { type: 'string', description: 'The verbatim winning line, grounded in real Vbrick facts' }
      },
      required: ['moment', 'prospect_line', 'rep_said', 'why_it_lost', 'should_have_said']
    }
  },
  what_sealed_it: {
    type: 'array',
    items: { type: 'string' },
    description:
      'When the appointment WAS secured, the 1-2 specific moves that won the meeting. Empty array if it was not secured.'
  }
} as const

// OpenAI function schema for structured scoring
export const SPARRING_SCORING_FUNCTION = {
  name: 'score_cold_call',
  description: 'Score a cold call practice session between a BDR and AI prospect',
  parameters: {
    type: 'object',
    properties: {
      total_score: {
        type: 'number',
        description: 'Overall score from 0-100, weighted across all dimensions'
      },
      dimensions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              enum: ['Opening', 'Discovery', 'Objection Handling', 'Value Articulation', 'Confidence/Flow', 'Close']
            },
            score: { type: 'number', description: 'Score 0-100 for this dimension' },
            weight: { type: 'number', description: 'Weight as decimal (e.g., 0.25)' },
            weighted_score: { type: 'number', description: 'score * weight' },
            details: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific observations and feedback for this dimension'
            }
          },
          required: ['name', 'score', 'weight', 'weighted_score', 'details']
        }
      },
      summary: {
        type: 'string',
        description: '2-3 sentence summary of the call performance'
      },
      key_strengths: {
        type: 'array',
        items: { type: 'string' },
        description: '3 specific things the BDR did well'
      },
      key_improvements: {
        type: 'array',
        items: { type: 'string' },
        description: '3 specific things to work on with actionable advice'
      },
      sample_exchanges: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            speaker: { type: 'string', enum: ['bdr', 'prospect'] },
            text: { type: 'string' },
            feedback: { type: 'string', description: 'Specific feedback on this exchange' },
            score: { type: 'number', description: 'Optional score for this specific exchange' }
          },
          required: ['speaker', 'text']
        },
        description: '5-8 key exchanges from the call with commentary'
      },
      persona_reaction: {
        type: 'string',
        description: 'How the prospect persona likely felt/reacted internally'
      },
      would_meet: {
        type: 'boolean',
        description: 'Would this persona have agreed to a follow-up meeting / the appointment?'
      },
      meeting_likelihood: {
        type: 'number',
        description: 'Probability 0-100 that persona would take a meeting'
      },
      ...INFLECTION_SCHEMA_PROPERTIES
    },
    required: [
      'total_score',
      'dimensions',
      'summary',
      'key_strengths',
      'key_improvements',
      'sample_exchanges',
      'persona_reaction',
      'would_meet',
      'meeting_likelihood',
      'inflection_points',
      'what_sealed_it'
    ]
  }
}

/** Map raw scorer inflection output to the InflectionPoint type. */
export function mapInflectionPoints(raw: unknown): InflectionPoint[] {
  if (!Array.isArray(raw)) return []
  return raw.map((p) => {
    const o = (p ?? {}) as Record<string, unknown>
    return {
      moment: String(o.moment ?? ''),
      sequence: String(o.sequence ?? ''),
      prospectLine: String(o.prospect_line ?? ''),
      repSaid: String(o.rep_said ?? ''),
      whyItLost: String(o.why_it_lost ?? ''),
      shouldHaveSaid: String(o.should_have_said ?? '')
    }
  })
}

// The system prompt for the scoring AI
export const SPARRING_SCORER_PROMPT = `You are an expert sales coach evaluating a cold call practice session between a VBRICK BDR and an AI prospect persona.

${VBRICK_2026_CONTEXT}

SCORING CRITERIA:

1. OPENING (20% weight)
- Did they get permission to continue? ("Did I catch you at a bad time?")
- Was the opener relevant to the persona's role/industry?
- Did they state value in first 15 seconds?
- Did they avoid generic "how are you today" openings?

2. DISCOVERY (25% weight)
- Asked open-ended questions about current situation
- Listened and flowed with responses (not just following script)
- Uncovered specific pain points related to video
- Explored budget/timeline/authority appropriately

3. OBJECTION HANDLING (25% weight)
- Acknowledged objections before answering
- Didn't just pitch over pushback
- Turned objections into discovery ("What specifically...")
- Maintained composure when pressed

4. VALUE ARTICULATION (15% weight)
- Positioned VBRICK specifically (not generic video platform)
- Connected features to prospect's stated pain points
- Used proof points or customer examples
- Avoided feature dumping

5. CONFIDENCE/FLOW (10% weight)
- Minimal filler words (um, uh, like)
- Natural pace (not rushed or too slow)
- Professional but conversational tone
- Controlled the call without being pushy

6. CLOSE (5% weight)
- Asked for specific next step
- Got agreement on timeline
- Didn't end with "I'll send an email"
- Created urgency appropriately

SCORING GUIDELINES:
- 90-100: Exceptional - would definitely take a meeting
- 80-89: Strong - professional cold call, minor improvements
- 70-79: Good - solid foundation, specific areas to improve
- 60-69: Fair - missed key elements, needs coaching
- Below 60: Poor - major gaps in approach

IMPORTANT:
- Be specific in feedback - quote actual phrases from the transcript
- Consider the persona's personality (e.g., harder to engage with skeptical CISO)
- Weight the difficulty - handling "send me an email" from a disinterested IT manager is harder than getting time from an enthusiast
- Focus on actionable advice, not generic platitudes

WHAT-SHOULD-HAVE-BEEN-SAID COACHING (the most important output):
- Set "appointment_secured" to whether the rep actually earned the meeting/appointment/warm transfer this scenario was aiming for. This should track "would_meet".
- If the appointment was NOT secured: populate "inflection_points" with the 2-4 specific moments the meeting was lost. For each, quote what the rep ACTUALLY said ("rep_said"), say in one line why it lost the meeting ("why_it_lost"), and give the VERBATIM line they should have said ("should_have_said") to garner the appointment. Ground every "should_have_said" line in the real Vbrick facts above — cite the specific differentiator that fits the moment (FedRAMP, C2PA, the Teams 20K cap / eCDN-behind-Premium, never-trains-on-your-data, the certified ServiceNow app, etc.). Make the lines sound like a sharp human rep, not a brochure. Leave "what_sealed_it" empty.
- If the appointment WAS secured: leave "inflection_points" empty and populate "what_sealed_it" with the 1-2 moves that won the meeting.
- When a scenario's WINNING PATH and ground-truth lines are provided in the user message, use them as the basis for the "should_have_said" rewrites.
`

// Achievement badges for sparring practice
export const SPARRING_BADGES = {
  'first-call': {
    id: 'first-call',
    name: 'First Round',
    description: 'Completed your first sparring session',
    icon: '🥊'
  },
  'streak-7': {
    id: 'streak-7',
    name: 'Training Montage',
    description: 'Practiced 7 days in a row',
    icon: '🔥'
  },
  'streak-30': {
    id: 'streak-30',
    name: 'Iron BDR',
    description: 'Practiced 30 days in a row',
    icon: '⚡'
  },
  'all-personas': {
    id: 'all-personas',
    name: 'Master of Disguises',
    description: 'Practiced against all 8 prospect personas',
    icon: '🎭'
  },
  'score-90': {
    id: 'score-90',
    name: 'Perfect Game',
    description: 'Scored 90+ on any sparring session',
    icon: '🎯'
  },
  'comeback-kid': {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Improved by 15+ points from previous session',
    icon: '📈'
  },
  'objection-master': {
    id: 'objection-master',
    name: 'Objection Slayer',
    description: 'Scored 90+ on Objection Handling dimension',
    icon: '🛡️'
  },
  'hard-persona': {
    id: 'hard-persona',
    name: 'Clutch Performer',
    description: 'Scored 80+ against a "hard" difficulty persona',
    icon: '🏆'
  },
  'meeting-booked': {
    id: 'meeting-booked',
    name: 'Closer',
    description: 'Got the AI to agree to a meeting (meeting_likelihood > 75)',
    icon: '🤝'
  },
  'hundred-club': {
    id: 'hundred-club',
    name: 'Century Club',
    description: 'Completed 100 sparring sessions',
    icon: '💯'
  }
}

// Helper to calculate weighted score
export function calculateWeightedScore(dimensions: DimensionScore[]): number {
  return dimensions.reduce((sum, dim) => sum + dim.weightedScore, 0)
}

// Get feedback level based on score
export function getFeedbackLevel(score: number): 'exceptional' | 'strong' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'exceptional'
  if (score >= 80) return 'strong'
  if (score >= 70) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}

// Get recommended focus areas based on lowest dimensions
export function getFocusAreas(dimensions: DimensionScore[]): string[] {
  return dimensions
    .filter(d => d.score < 75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(d => d.name)
}
