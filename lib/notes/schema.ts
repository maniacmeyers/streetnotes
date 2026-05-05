import { z } from 'zod'
import {
  AESTHETIC_CALL_SEGMENTS,
  AESTHETIC_DEAL_STAGES,
  AESTHETIC_MODALITIES,
} from '@/lib/voice-engine/ontology'

export const ConfidenceLevel = z.enum(['high', 'medium', 'low'])
export type ConfidenceLevel = z.infer<typeof ConfidenceLevel>

export const Attendee = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  role: z
    .enum([
      'Decision Maker',
      'Champion',
      'Influencer',
      'End User',
      'Blocker',
      'Gatekeeper',
      'Technical Evaluator',
      'Economic Buyer',
      'Legal / Procurement',
      'Unknown',
    ])
    .optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'unknown']).optional(),
  confidence: ConfidenceLevel,
})

export const FollowUpTask = z.object({
  task: z.string(),
  owner: z.enum(['rep', 'prospect']),
  dueDate: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  confidence: ConfidenceLevel,
})

export const CIMentionSchema = z.object({
  competitorName: z.string(),
  contextQuote: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  mentionCategory: z.enum([
    'pricing',
    'features',
    'switching',
    'satisfaction',
    'comparison',
    'contract',
    'migration',
    'general',
  ]),
})

export const SwitchingStorySchema = z.object({
  fromBrand: z.string().optional(),
  toBrand: z.string().optional(),
  reason: z.string(),
  evidence: z.string().optional(),
  confidence: ConfidenceLevel,
})

export const CRMNoteSchema = z.object({
  contactName: z.string().optional(),
  contactNameConfidence: ConfidenceLevel.optional(),

  company: z.string().optional(),
  companyConfidence: ConfidenceLevel.optional(),

  dealStage: z
    .enum([
      'Prospecting',
      'Discovery',
      'Demo / Evaluation',
      'Proposal / Pricing',
      'Negotiation',
      'Verbal Commit',
      'Closed Won',
      'Closed Lost',
    ])
    .optional(),
  dealStageConfidence: ConfidenceLevel.optional(),

  estimatedValue: z.string().optional(),
  estimatedValueConfidence: ConfidenceLevel.optional(),

  closeDate: z.string().optional(),
  closeDateConfidence: ConfidenceLevel.optional(),

  meetingSummary: z.array(z.string()).optional(),

  nextSteps: z.array(FollowUpTask).optional(),

  opportunityNotes: z.string().optional(),

  competitorsMentioned: z.array(z.string()).optional(),
  productsDiscussed: z.array(z.string()).optional(),
  painPoints: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),

  attendees: z.array(Attendee).optional(),

  dealSegment: z.enum(AESTHETIC_CALL_SEGMENTS).optional(),
  aestheticDealStage: z.enum(AESTHETIC_DEAL_STAGES).optional(),
  modality: z.enum(AESTHETIC_MODALITIES).optional(),
  unitVolume: z.string().optional(),
  syringeVolume: z.string().optional(),
  vialCount: z.string().optional(),
  buyingWindow: z.string().optional(),
  switchingStories: z.array(SwitchingStorySchema).optional(),
  ciMentions: z.array(CIMentionSchema).optional(),
})

export type CRMNote = z.infer<typeof CRMNoteSchema>

export const PushAssignmentSchema = z.object({
  sourceField: z.string(),
  targetObject: z.enum(['contact', 'account', 'opportunity', 'activity']),
  targetField: z.string(),
  valuePreview: z.string().max(240),
  confidence: z.enum(['high', 'medium', 'low']),
  reason: z.string().max(240).optional(),
  isCustomField: z.boolean().optional(),
})

export const PushPlanSchema = z.object({
  crmType: z.enum(['salesforce', 'hubspot', 'none']),
  assignments: z.array(PushAssignmentSchema),
})

export type PushPlanZod = z.infer<typeof PushPlanSchema>

export const StructuredOutputSchema = z.object({
  crmNote: CRMNoteSchema,
  pushPlan: PushPlanSchema.optional(),
})

export type StructuredOutput = z.infer<typeof StructuredOutputSchema>
