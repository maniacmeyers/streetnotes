export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface DebriefStructuredOutput {
  dealSnapshot: {
    companyName: string
    contactName: string
    contactTitle: string
    dealStage: string
    estimatedValue: string
    timeline: string
    confidence: Record<string, ConfidenceLevel>
  }
  keyTakeaways: string[]
  objections: Array<{
    objection: string
    response: string
    resolved: boolean
  }>
  nextSteps: Array<{
    action: string
    owner: 'rep' | 'prospect' | 'other'
    dueDate: string
  }>
  decisionMakers: Array<{
    name: string
    role: string
    sentiment: 'positive' | 'neutral' | 'negative' | 'unknown'
  }>
  competitorsMentioned: string[]
  buyingSignals: string[]
  risks: string[]
  dealScore: number
  dealScoreRationale: string
  summary: string
  overallConfidence: ConfidenceLevel
}

export type DebriefStep = 'email' | 'record' | 'review' | 'processing' | 'results'

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
