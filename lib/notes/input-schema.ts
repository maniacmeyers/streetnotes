/**
 * JSON Schema for CRMNote — used as Claude tool input_schema.
 * Mirrors lib/notes/schema.ts (Zod) but avoids zod-to-json-schema version issues.
 */

const confidenceEnum = { type: 'string', enum: ['high', 'medium', 'low'] } as const

const attendeeSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    title: { type: 'string' },
    role: {
      type: 'string',
      enum: [
        'Decision Maker',
        'Champion',
        'Influencer',
        'End User',
        'Blocker',
        'Technical Evaluator',
        'Economic Buyer',
        'Legal / Procurement',
        'Unknown',
      ],
    },
    sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'unknown'] },
    confidence: confidenceEnum,
  },
  required: ['confidence'],
} as const

const followUpTaskSchema = {
  type: 'object',
  properties: {
    task: { type: 'string' },
    owner: { type: 'string', enum: ['rep', 'prospect'] },
    dueDate: { type: 'string' },
    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
    confidence: confidenceEnum,
  },
  required: ['task', 'owner', 'priority', 'confidence'],
} as const

export const CRM_NOTE_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    contactName: { type: 'string' },
    contactNameConfidence: confidenceEnum,

    company: { type: 'string' },
    companyConfidence: confidenceEnum,

    dealStage: {
      type: 'string',
      enum: [
        'Prospecting',
        'Discovery',
        'Demo / Evaluation',
        'Proposal / Pricing',
        'Negotiation',
        'Verbal Commit',
        'Closed Won',
        'Closed Lost',
      ],
    },
    dealStageConfidence: confidenceEnum,

    estimatedValue: { type: 'string' },
    estimatedValueConfidence: confidenceEnum,

    closeDate: { type: 'string' },
    closeDateConfidence: confidenceEnum,

    meetingSummary: { type: 'array', items: { type: 'string' } },

    nextSteps: { type: 'array', items: followUpTaskSchema },

    opportunityNotes: { type: 'string' },

    competitorsMentioned: { type: 'array', items: { type: 'string' } },
    productsDiscussed: { type: 'array', items: { type: 'string' } },
    painPoints: { type: 'array', items: { type: 'string' } },

    attendees: { type: 'array', items: attendeeSchema },
  },
} as const

const pushAssignmentSchema = {
  type: 'object' as const,
  properties: {
    sourceField: { type: 'string' },
    targetObject: { type: 'string', enum: ['contact', 'account', 'opportunity', 'activity'] },
    targetField: { type: 'string' },
    valuePreview: { type: 'string', maxLength: 240 },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reason: { type: 'string', maxLength: 240 },
    isCustomField: { type: 'boolean' },
  },
  required: ['sourceField', 'targetObject', 'targetField', 'valuePreview', 'confidence'],
}

const pushPlanSchema = {
  type: 'object' as const,
  properties: {
    crmType: { type: 'string', enum: ['salesforce', 'hubspot', 'none'] },
    assignments: { type: 'array', items: pushAssignmentSchema },
  },
  required: ['crmType', 'assignments'],
}

export const CRM_NOTE_WITH_PLAN_INPUT_SCHEMA = {
  type: 'object' as const,
  properties: {
    crmNote: CRM_NOTE_INPUT_SCHEMA,
    pushPlan: pushPlanSchema,
  },
  required: ['crmNote', 'pushPlan'],
}
