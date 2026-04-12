import { SupabaseClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { getValidTokens } from './token-refresh'
import type { CrmSchema, CrmField, CrmFieldType, CrmObjectSchema } from './schema/types'
import { CrmSchemaFetchError } from './schema/types'

interface HubSpotPipelineStage {
  label: string
  stageId: string
  displayOrder: number
  probability: number
  isClosed: boolean
}

interface HubSpotPipeline {
  pipelineId: string
  label: string
  stages: HubSpotPipelineStage[]
}

/**
 * Fetch deal pipelines and stages from the user's HubSpot account.
 * Returns all pipelines with their stages.
 */
export async function fetchHubSpotStages(
  supabase: SupabaseClient,
  userId: string
): Promise<HubSpotPipeline[]> {
  const tokens = await getValidTokens(supabase, userId, 'hubspot')
  if (!tokens) throw new Error('No valid HubSpot connection')

  const res = await fetch(
    'https://api.hubapi.com/crm/v3/pipelines/deals',
    {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    }
  )

  if (!res.ok) {
    throw new Error(`HubSpot pipelines fetch failed: ${res.status}`)
  }

  const data = await res.json()

  return data.results.map(
    (pipeline: {
      id: string
      label: string
      stages: Array<{
        id: string
        label: string
        displayOrder: number
        metadata: { probability?: string; isClosed?: string }
      }>
    }) => ({
      pipelineId: pipeline.id,
      label: pipeline.label,
      stages: pipeline.stages
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((stage) => ({
          label: stage.label,
          stageId: stage.id,
          displayOrder: stage.displayOrder,
          probability: parseFloat(stage.metadata?.probability || '0'),
          isClosed: stage.metadata?.isClosed === 'true',
        })),
    })
  )
}

const HS_TYPE_MAP: Record<string, CrmFieldType> = {
  string: 'string',
  number: 'number',
  date: 'date',
  datetime: 'datetime',
  enumeration: 'picklist',
  bool: 'boolean',
  phone_number: 'phone',
}

function normalizeHsProperty(raw: Record<string, unknown>): CrmField | null {
  const modMeta = raw.modificationMetadata as Record<string, unknown> | undefined
  if (modMeta?.readOnlyValue === true) return null
  if (raw.hidden === true) return null

  const fieldType = raw.fieldType as string
  const type: CrmFieldType = HS_TYPE_MAP[raw.type as string] ?? 'string'

  const picklistValues =
    fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox'
      ? (raw.options as Array<{ label: string; value: string; hidden: boolean }>)
          ?.filter((o) => !o.hidden)
          .map((o) => ({ label: o.label, value: o.value }))
      : undefined

  return {
    name: raw.name as string,
    label: raw.label as string,
    type: picklistValues ? 'picklist' : type,
    custom: !(raw.hubspotDefined as boolean),
    required: false,
    readOnly: modMeta?.readOnlyValue === true,
    picklistValues: picklistValues?.length ? picklistValues : undefined,
  }
}

async function fetchHsProperties(
  accessToken: string,
  objectType: string,
  signal?: AbortSignal
): Promise<CrmObjectSchema> {
  const timeoutSignal = AbortSignal.timeout(10_000)
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  const res = await fetch(
    `https://api.hubapi.com/crm/v3/properties/${objectType}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: combinedSignal,
    }
  )

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('retry-after') ?? '5', 10)
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    return fetchHsProperties(accessToken, objectType, signal)
  }

  if (!res.ok) {
    throw new CrmSchemaFetchError(
      `HubSpot properties ${objectType} failed: ${res.status}`,
      'hubspot',
      objectType,
      res.status
    )
  }

  const data = await res.json()
  const fields = (data.results as Record<string, unknown>[])
    .map(normalizeHsProperty)
    .filter((f): f is CrmField => f !== null)

  return { objectName: objectType, fields }
}

export async function fetchHubspotSchema(
  supabase: SupabaseClient,
  userId: string,
  signal?: AbortSignal
): Promise<CrmSchema> {
  const tokens = await getValidTokens(supabase, userId, 'hubspot')
  if (!tokens) {
    throw new CrmSchemaFetchError('No valid HubSpot connection', 'hubspot')
  }

  const [contact, company, deal, pipelinesRes] = await Promise.all([
    fetchHsProperties(tokens.accessToken, 'contacts', signal),
    fetchHsProperties(tokens.accessToken, 'companies', signal),
    fetchHsProperties(tokens.accessToken, 'deals', signal),
    fetchHubSpotStages(supabase, userId),
  ])

  const pipelines = pipelinesRes.map((p) => ({
    id: p.pipelineId,
    label: p.label,
    stageIds: p.stages.map((s) => s.stageId),
  }))

  const firstPipeline = pipelinesRes[0]
  const stages = firstPipeline
    ? firstPipeline.stages.map((s) => ({
        label: s.label,
        value: s.stageId,
        stageId: s.stageId,
        probability: s.probability,
        isClosed: s.isClosed,
        displayOrder: s.displayOrder,
      }))
    : []

  const activity: CrmObjectSchema = {
    objectName: 'engagements',
    fields: [
      { name: 'hs_note_body', label: 'Note Body', type: 'textarea', custom: false, required: false, readOnly: false },
      { name: 'hs_task_subject', label: 'Task Subject', type: 'string', custom: false, required: false, readOnly: false },
      { name: 'hs_task_body', label: 'Task Body', type: 'textarea', custom: false, required: false, readOnly: false },
      { name: 'hs_task_status', label: 'Task Status', type: 'picklist', custom: false, required: false, readOnly: false, picklistValues: [{ label: 'Not started', value: 'NOT_STARTED' }, { label: 'In progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }] },
      { name: 'hs_timestamp', label: 'Activity Date', type: 'datetime', custom: false, required: true, readOnly: false },
    ],
  }

  const schemaBody: CrmSchema = {
    crmType: 'hubspot',
    contact,
    account: company,
    opportunity: deal,
    activity,
    stages,
    pipelines,
    fetchedAt: new Date().toISOString(),
    hash: '',
  }
  const hash = createHash('sha256')
    .update(JSON.stringify({ contact, account: company, opportunity: deal, activity, stages }))
    .digest('hex')
  schemaBody.hash = hash

  return schemaBody
}
