import { z } from 'zod'

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

  attendees: z.array(Attendee).optional(),
})

export type CRMNote = z.infer<typeof CRMNoteSchema>
