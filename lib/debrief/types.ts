export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type DealSegment = 'smb' | 'mid-market' | 'enterprise' | 'partner-channel'

export type BANTStatus = 'confirmed' | 'implied' | 'missing'

export type NextStepsStatus = 'confirmed' | 'one-sided' | 'none'

export interface DealPattern {
  name: string
  description: string
  evidence: string[]
  gapAnalysis: {
    budget: BANTStatus
    authority: BANTStatus
    need: BANTStatus
    timeline: BANTStatus
  }
  recommendedActions: string[]
}

export interface MutualNextSteps {
  status: NextStepsStatus
  repActions: Array<{ action: string; dueDate?: string }>
  prospectActions: Array<{ action: string; dueDate?: string }>
  recoveryScript?: string
}

export interface CommitmentAnalysis {
  realCommitments: Array<{
    quote: string
    significance: string
  }>
  fillerSignals: Array<{
    quote: string
    meaning: string
    recoveryMove: string
  }>
}

export interface ObjectionDiagnostic {
  surfaceObjection: string
  realBlocker: string
  evidence: string[]
  recoveryPlay: string
}

export interface DebriefStructuredOutput {
  dealSegment: DealSegment
  dealPattern: DealPattern
  mutualNextSteps: MutualNextSteps
  commitmentAnalysis: CommitmentAnalysis
  objectionDiagnostics: ObjectionDiagnostic[]
  dealSnapshot: {
    companyName: string
    contactName: string
    contactTitle: string
    dealStage: string
    estimatedValue: string
    timeline: string
  }
  callSummary: string[]
  decisionMakers: Array<{
    name: string
    role: string
    sentiment: 'positive' | 'neutral' | 'negative' | 'unknown'
  }>
  competitorsMentioned: string[]
  buyingSignals: string[]
  risks: string[]
  overallConfidence: ConfidenceLevel
}

export type DebriefStep = 'email' | 'segment' | 'record' | 'review' | 'processing' | 'results'

export interface DebriefSessionState {
  step: DebriefStep
  sessionId: string | null
  email: string | null
  dealSegment: DealSegment | null
  audioBlob: Blob | null
  transcript: string | null
  editedTranscript: string | null
  structured: DebriefStructuredOutput | null
  error: string | null
  isLoading: boolean
}
