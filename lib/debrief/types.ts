import type { CIExtraction } from '@/lib/ci/types'

export type DealSegment = 'smb' | 'mid-market' | 'enterprise' | 'partner-channel' | 'bdr-cold-call'

export type CallDisposition = 'connected' | 'voicemail' | 'gatekeeper' | 'no-answer'

export type ProspectStatus =
  | 'active-opportunity'
  | 'future-opportunity'
  | 'not-a-fit'
  | 'needs-more-info'
  | 'referred-elsewhere'

/* ─── AE / Deal Debrief Output ─── */

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

/* ─── BDR Cold Call Output ─── */

export interface BDRStructuredOutput {
  mode: 'bdr-cold-call'

  callDisposition: CallDisposition

  contactSnapshot: {
    name: string
    title: string
    company: string
    directLine: string
    email: string
  }

  currentSolution: string

  theTruth: string

  prospectStatus: ProspectStatus
  prospectStatusDetail: string

  objections: string[]

  referral: {
    referredTo: string
    reason: string
  } | null

  nextAction: {
    action: string
    when: string
  }

  aeBriefing: string | null
  ciMentions: CIExtraction[]
}

/* ─── SPIN Scoring (Vbrick) ─── */

export interface SPINScoreDetail {
  score: number
  evidence: string[]
  missed: string
}

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

/* ─── Union + Guard ─── */

export type DebriefOutput = DebriefStructuredOutput | BDRStructuredOutput | VbrickBDRStructuredOutput

export function isBDROutput(output: DebriefOutput): output is BDRStructuredOutput {
  return 'mode' in output && output.mode === 'bdr-cold-call'
}

export function isVbrickBDROutput(output: DebriefOutput): output is VbrickBDRStructuredOutput {
  return isBDROutput(output) && 'spin' in output
}

/* ─── Flow State ─── */

export type DebriefStep = 'email' | 'segment' | 'record' | 'import' | 'review' | 'processing' | 'results'

export interface DebriefSessionState {
  step: DebriefStep
  sessionId: string | null
  email: string | null
  segment: DealSegment | null
  audioBlob: Blob | null
  transcript: string | null
  editedTranscript: string | null
  structured: DebriefOutput | null
  error: string | null
  isLoading: boolean
}
