export interface PushOptions {
  existingContactId?: string
  existingDealId?: string
  dealStageCrmValue?: string
  cachedStages?: CachedStage[]
  pipelineId?: string
}

export interface PushResult {
  success: boolean
  contactId?: string
  contactCreated?: boolean
  dealId?: string
  dealCreated?: boolean
  taskIds?: string[]
  noteCrmId?: string
  unmappedStage?: boolean
  error?: string
  errorCode?: 'auth_failed' | 'rate_limited' | 'api_error' | 'validation_error' | 'needs_selection'
  candidates?: CrmCandidate[]
}

export interface CrmCandidate {
  id: string
  name: string
  type: 'contact' | 'deal'
  detail?: string
}

export interface CachedStage {
  label: string
  value: string
  probability?: number
  isClosed?: boolean
  isWon?: boolean
  stageId?: string
  displayOrder?: number
}

export interface DecryptedTokens {
  accessToken: string
  refreshToken: string | null
  instanceUrl: string | null
}
