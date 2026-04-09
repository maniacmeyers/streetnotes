import type { CIExtraction } from '@/lib/ci/types'

export type DealSegment = 'smb' | 'mid-market' | 'enterprise' | 'partner-channel'

/* ─── Structured Debrief Output ─── */

export interface DebriefStructuredOutput {
  dealSegment: DealSegment

  dealSnapshot: {
    companyName: string
    dealStage: string
    estimatedValue: string
    closeDate: string
    nextStep: string
  }

  attendees: Array<{
    name: string
    title: string
    role: string
    sentiment: 'positive' | 'neutral' | 'negative' | 'unknown'
  }>

  callSummary: string[]

  followUpTasks: Array<{
    task: string
    owner: 'rep' | 'prospect'
    dueDate: string
    priority: 'high' | 'medium' | 'low'
  }>

  opportunityNotes: string
  competitorsMentioned: string[]
  productsDiscussed: string[]
  painPoints: string[]
  risks: string[]
  ciMentions: CIExtraction[]
}

export type DebriefOutput = DebriefStructuredOutput

/* ─── BDR Types (used by Vbrick dashboard — not part of core debrief) ─── */

export type CallDisposition = 'connected' | 'voicemail' | 'gatekeeper' | 'no-answer'

export type ProspectStatus =
  | 'active-opportunity'
  | 'future-opportunity'
  | 'not-a-fit'
  | 'needs-more-info'
  | 'referred-elsewhere'

export interface BDRStructuredOutput {
  mode: 'bdr-cold-call'
  callDisposition: CallDisposition
  contactSnapshot: { name: string; title: string; company: string; directLine: string; email: string }
  currentSolution: string
  theTruth: string
  prospectStatus: ProspectStatus
  prospectStatusDetail: string
  objections: string[]
  referral: { referredTo: string; reason: string } | null
  nextAction: { action: string; when: string }
  aeBriefing: string | null
  ciMentions: CIExtraction[]
}

export interface SPINScoreDetail { score: number; evidence: string[]; missed: string }

export interface SPINScore {
  situation: SPINScoreDetail
  problem: SPINScoreDetail
  implication: SPINScoreDetail
  needPayoff: SPINScoreDetail
  composite: number
  coachingNote: string
}

export interface VbrickBDRStructuredOutput extends BDRStructuredOutput {
  spin: SPINScore
}

export function isBDROutput(output: unknown): output is BDRStructuredOutput {
  return typeof output === 'object' && output !== null && 'mode' in output && (output as BDRStructuredOutput).mode === 'bdr-cold-call'
}

export function isVbrickBDROutput(output: unknown): output is VbrickBDRStructuredOutput {
  return isBDROutput(output) && 'spin' in output
}

/* ─── Flow State ─── */

export type DebriefStep = 'email' | 'record' | 'import' | 'review' | 'processing' | 'results'

export interface DebriefSessionState {
  step: DebriefStep
  sessionId: string | null
  email: string | null
  audioBlob: Blob | null
  transcript: string | null
  editedTranscript: string | null
  structured: DebriefOutput | null
  error: string | null
  isLoading: boolean
}
