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
}

/* ─── Union + Guard ─── */

export type DebriefOutput = DebriefStructuredOutput | BDRStructuredOutput

export function isBDROutput(output: DebriefOutput): output is BDRStructuredOutput {
  return 'mode' in output && output.mode === 'bdr-cold-call'
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
