import type { CRMNote } from '@/lib/notes/schema'
import type {
  PushPlan,
  PushAssignment,
  TargetObject,
  CrmSchema,
  CrmField,
  CrmObjectSchema,
} from '@/lib/crm/schema/types'
import type { CachedStage } from './types'
import { mapDealStage, parseEstimatedValue, parseName } from './stage-mapper'

type SourceValueResolver = (note: CRMNote) => string | string[] | number | null | undefined

const SOURCE_RESOLVERS: Record<string, SourceValueResolver> = {
  contactName: (n) => n.contactName,
  company: (n) => n.company,
  dealStage: (n) => n.dealStage,
  estimatedValue: (n) => n.estimatedValue ? parseEstimatedValue(n.estimatedValue) : null,
  closeDate: (n) => n.closeDate,
  meetingSummary: (n) => n.meetingSummary,
  opportunityNotes: (n) => n.opportunityNotes,
  nextSteps: (n) => n.nextSteps?.map(s => s.task),
  painPoints: (n) => n.painPoints,
  competitorsMentioned: (n) => n.competitorsMentioned,
  productsDiscussed: (n) => n.productsDiscussed,
  attendees: (n) => n.attendees?.map(a => [a.name, a.title].filter(Boolean).join(' - ')),
}

function resolveSourceValue(sourceField: string, note: CRMNote): unknown {
  const resolver = SOURCE_RESOLVERS[sourceField]
  if (!resolver) return undefined
  return resolver(note)
}

function coerceValue(
  raw: unknown,
  targetField: CrmField | undefined,
  maxLength?: number
): string | number | null {
  if (raw === null || raw === undefined) return null

  if (Array.isArray(raw)) {
    const joined = raw.filter(Boolean).join(' / ')
    const limit = maxLength ?? targetField?.maxLength ?? 32767
    return joined.length > limit ? joined.slice(0, limit - 3) + '...' : joined
  }

  if (typeof raw === 'number') return raw

  const str = String(raw)
  const limit = maxLength ?? targetField?.maxLength ?? 32767
  return str.length > limit ? str.slice(0, limit - 3) + '...' : str
}

function getObjectSchema(schema: CrmSchema, object: TargetObject): CrmObjectSchema | null {
  switch (object) {
    case 'contact': return schema.contact
    case 'account': return schema.account
    case 'opportunity': return schema.opportunity
    case 'activity': return schema.activity
    default: return null
  }
}

function isFieldReadOnly(schema: CrmSchema | null, object: TargetObject, fieldName: string): boolean {
  if (!schema) return false
  const objectSchema = getObjectSchema(schema, object)
  const field = objectSchema?.fields.find(f => f.name === fieldName)
  return field?.readOnly ?? false
}

export interface ResolvedProps {
  [fieldName: string]: string | number | null
}

export function buildObjectProps(
  plan: PushPlan,
  targetObject: TargetObject,
  note: CRMNote,
  schema: CrmSchema | null
): ResolvedProps {
  const assignments = plan.assignments.filter(a => a.targetObject === targetObject)
  const props: ResolvedProps = {}

  for (const assignment of assignments) {
    if (isFieldReadOnly(schema, targetObject, assignment.targetField)) continue

    const raw = resolveSourceValue(assignment.sourceField, note)
    if (raw === undefined || raw === null) continue

    const objectSchema = schema ? getObjectSchema(schema, targetObject) : null
    const fieldMeta = objectSchema?.fields.find(f => f.name === assignment.targetField)
    const value = coerceValue(raw, fieldMeta)
    if (value !== null) {
      props[assignment.targetField] = value
    }
  }

  return props
}

export function buildContactNames(
  plan: PushPlan,
  note: CRMNote
): { firstName: string; lastName: string } | null {
  const contactAssignment = plan.assignments.find(
    a => a.targetObject === 'contact' && a.sourceField === 'contactName'
  )
  if (!contactAssignment || !note.contactName) return null
  return parseName(note.contactName)
}

export function resolveStageValue(
  plan: PushPlan,
  note: CRMNote,
  cachedStages: CachedStage[],
  crmType: 'salesforce' | 'hubspot'
): { value: string; label: string } | null {
  if (!note.dealStage) return null
  const stageAssignment = plan.assignments.find(
    a => a.sourceField === 'dealStage' && a.targetObject === 'opportunity'
  )
  if (!stageAssignment) return null
  return mapDealStage(note.dealStage, cachedStages, crmType)
}

export function getActivityAssignments(plan: PushPlan): PushAssignment[] {
  return plan.assignments.filter(a => a.targetObject === 'activity')
}

export function buildActivityBody(
  plan: PushPlan,
  note: CRMNote,
  schema: CrmSchema | null // reserved for future field-level truncation
): string {
  void schema
  const activityAssignments = plan.assignments.filter(
    a => a.targetObject === 'activity' &&
    (a.targetField.includes('Description') || a.targetField.includes('body') || a.targetField.includes('hs_note_body'))
  )

  const parts: string[] = []
  for (const assignment of activityAssignments) {
    const raw = resolveSourceValue(assignment.sourceField, note)
    if (!raw) continue
    const value = coerceValue(raw, undefined)
    if (value && typeof value === 'string') parts.push(value)
  }

  return parts.join('\n\n')
}

export function shouldCreateTasks(plan: PushPlan): boolean {
  return plan.assignments.some(
    a => a.targetObject === 'activity' && a.sourceField === 'nextSteps'
  )
}
