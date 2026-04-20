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
        description: 'Would this persona have agreed to a follow-up meeting?'
      },
      meeting_likelihood: {
        type: 'number',
        description: 'Probability 0-100 that persona would take a meeting'
      }
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
      'meeting_likelihood'
    ]
  }
}

// The system prompt for the scoring AI
export const SPARRING_SCORER_PROMPT = `You are an expert sales coach evaluating a cold call practice session between a VBRICK BDR and an AI prospect persona.

VBRICK CONTEXT:
VBRICK is an enterprise video platform for secure video streaming, employee communications, training, and virtual events. Key value props:
- Enterprise-grade security and compliance
- Consolidates multiple video tools (Zoom, Vimeo, Kaltura, etc.) into one platform
- AI-powered search and transcription across video libraries
- Audit trails and governance for regulated industries
- Scales from 10 to 100,000+ concurrent viewers

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
