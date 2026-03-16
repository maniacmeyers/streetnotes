export type DealSegment = 'smb' | 'mid-market' | 'enterprise' | 'partner-channel'

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

export type DebriefStep = 'email' | 'record' | 'import' | 'review' | 'processing' | 'results'

export interface DebriefSessionState {
  step: DebriefStep
  sessionId: string | null
  email: string | null
  audioBlob: Blob | null
  transcript: string | null
  editedTranscript: string | null
  structured: DebriefStructuredOutput | null
  error: string | null
  isLoading: boolean
}
