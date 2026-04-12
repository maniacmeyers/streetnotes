import type { CachedStage } from '../push/types'

export type CrmFieldType =
  | 'string'
  | 'textarea'
  | 'picklist'
  | 'multipicklist'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'email'
  | 'phone'
  | 'url'
  | 'reference'

export interface CrmField {
  name: string
  label: string
  type: CrmFieldType
  custom: boolean
  required: boolean
  readOnly: boolean
  maxLength?: number
  picklistValues?: PicklistValue[]
}

export interface PicklistValue {
  label: string
  value: string
  isClosed?: boolean
  isWon?: boolean
}

export interface CrmObjectSchema {
  objectName: string
  fields: CrmField[]
}

export interface CrmSchema {
  crmType: 'salesforce' | 'hubspot'
  contact: CrmObjectSchema
  account: CrmObjectSchema
  opportunity: CrmObjectSchema
  activity: CrmObjectSchema
  stages: CachedStage[]
  pipelines?: CrmPipeline[]
  fetchedAt: string
  hash: string
}

export interface CrmPipeline {
  id: string
  label: string
  stageIds: string[]
}

export type TargetObject = 'contact' | 'account' | 'opportunity' | 'activity'

export type SourceField =
  | 'contactName'
  | 'company'
  | 'dealStage'
  | 'estimatedValue'
  | 'closeDate'
  | 'meetingSummary'
  | 'opportunityNotes'
  | 'nextSteps'
  | 'painPoints'
  | 'competitorsMentioned'
  | 'productsDiscussed'
  | 'attendees'

export interface PushAssignment {
  sourceField: string
  targetObject: TargetObject
  targetField: string
  valuePreview: string
  confidence: 'high' | 'medium' | 'low'
  reason?: string
  isCustomField?: boolean
}

export interface PushPlan {
  crmType: 'salesforce' | 'hubspot' | 'none'
  assignments: PushAssignment[]
}

export interface StickyRule {
  id: string
  userId: string
  crmType: 'salesforce' | 'hubspot'
  sourceField: string
  targetObject: TargetObject
  targetField: string
  learnedFromNoteId?: string | null
  createdAt: string
  updatedAt: string
}

export interface StickyRuleInput {
  crmType: 'salesforce' | 'hubspot'
  sourceField: string
  targetObject: TargetObject
  targetField: string
}

export class CrmSchemaFetchError extends Error {
  constructor(
    message: string,
    public crmType: 'salesforce' | 'hubspot',
    public objectName?: string,
    public httpStatus?: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'CrmSchemaFetchError'
  }
}
