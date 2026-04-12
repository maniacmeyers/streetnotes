import { SupabaseClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { getValidTokens } from './token-refresh'
import type { CrmSchema, CrmField, CrmFieldType, CrmObjectSchema } from './schema/types'
import { CrmSchemaFetchError } from './schema/types'

interface SalesforcePipelineStage {
  label: string
  value: string
  probability: number
  isClosed: boolean
  isWon: boolean
}

interface SalesforcePicklistValue {
  label: string
  value: string
  attributes?: { closed?: boolean; won?: boolean; probability?: number }
}

/**
 * Fetch deal/opportunity stages from the user's Salesforce org.
 * Uses the SObject describe API to get Opportunity.StageName picklist values.
 */
export async function fetchSalesforceStages(
  supabase: SupabaseClient,
  userId: string
): Promise<SalesforcePipelineStage[]> {
  const tokens = await getValidTokens(supabase, userId, 'salesforce')
  if (!tokens) throw new Error('No valid Salesforce connection')

  const res = await fetch(
    `${tokens.instanceUrl}/services/data/v59.0/sobjects/Opportunity/describe`,
    {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    }
  )

  if (!res.ok) {
    throw new Error(`Salesforce describe failed: ${res.status}`)
  }

  const describe = await res.json()
  const stageField = describe.fields.find(
    (f: { name: string }) => f.name === 'StageName'
  )

  if (!stageField?.picklistValues) {
    return []
  }

  return stageField.picklistValues
    .filter((v: { active: boolean }) => v.active)
    .map((v: SalesforcePicklistValue) => ({
      label: v.label,
      value: v.value,
      probability: v.attributes?.probability ?? 0,
      isClosed: v.attributes?.closed ?? false,
      isWon: v.attributes?.won ?? false,
    }))
}

const SF_TYPE_MAP: Record<string, CrmFieldType> = {
  string: 'string',
  textarea: 'textarea',
  picklist: 'picklist',
  multipicklist: 'multipicklist',
  double: 'number',
  currency: 'currency',
  int: 'number',
  date: 'date',
  datetime: 'datetime',
  boolean: 'boolean',
  email: 'email',
  phone: 'phone',
  url: 'url',
  reference: 'reference',
  id: 'string',
  percent: 'number',
}

function normalizeSfField(raw: Record<string, unknown>): CrmField | null {
  const createable = raw.createable as boolean
  const updateable = raw.updateable as boolean
  const calculated = raw.calculated as boolean
  if ((!createable && !updateable) || calculated) return null

  const sfType = raw.type as string
  const type: CrmFieldType = SF_TYPE_MAP[sfType] ?? 'string'
  const picklistValues =
    sfType === 'picklist' || sfType === 'multipicklist'
      ? (raw.picklistValues as Array<{ label: string; value: string; active: boolean }>)
          ?.filter((v) => v.active)
          .map((v) => ({ label: v.label, value: v.value }))
      : undefined

  return {
    name: raw.name as string,
    label: raw.label as string,
    type,
    custom: (raw.custom as boolean) ?? false,
    required: !(raw.nillable as boolean) && !raw.defaultedOnCreate,
    readOnly: !createable && !updateable,
    maxLength: (raw.length as number) || undefined,
    picklistValues: picklistValues?.length ? picklistValues : undefined,
  }
}

async function describeSfObject(
  instanceUrl: string,
  accessToken: string,
  objectName: string,
  signal?: AbortSignal
): Promise<CrmObjectSchema> {
  const timeoutSignal = AbortSignal.timeout(10_000)
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  const res = await fetch(
    `${instanceUrl}/services/data/v59.0/sobjects/${objectName}/describe`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: combinedSignal,
    }
  )

  if (!res.ok) {
    throw new CrmSchemaFetchError(
      `Salesforce describe ${objectName} failed: ${res.status}`,
      'salesforce',
      objectName,
      res.status
    )
  }

  const describe = await res.json()
  const fields = (describe.fields as Record<string, unknown>[])
    .map(normalizeSfField)
    .filter((f): f is CrmField => f !== null)

  return { objectName, fields }
}

export async function fetchSalesforceSchema(
  supabase: SupabaseClient,
  userId: string,
  signal?: AbortSignal
): Promise<CrmSchema> {
  const tokens = await getValidTokens(supabase, userId, 'salesforce')
  if (!tokens || !tokens.instanceUrl) {
    throw new CrmSchemaFetchError(
      'No valid Salesforce connection',
      'salesforce'
    )
  }

  const [contact, account, opportunity, task] = await Promise.all([
    describeSfObject(tokens.instanceUrl, tokens.accessToken, 'Contact', signal),
    describeSfObject(tokens.instanceUrl, tokens.accessToken, 'Account', signal),
    describeSfObject(tokens.instanceUrl, tokens.accessToken, 'Opportunity', signal),
    describeSfObject(tokens.instanceUrl, tokens.accessToken, 'Task', signal),
  ])

  const stageField = opportunity.fields.find((f) => f.name === 'StageName')
  const stages = (stageField?.picklistValues ?? []).map((v) => ({
    label: v.label,
    value: v.value,
  }))

  const schemaBody: CrmSchema = {
    crmType: 'salesforce',
    contact,
    account,
    opportunity,
    activity: task,
    stages,
    fetchedAt: new Date().toISOString(),
    hash: '',
  }
  const hash = createHash('sha256')
    .update(JSON.stringify({ contact, account, opportunity, activity: task, stages }))
    .digest('hex')
  schemaBody.hash = hash

  return schemaBody
}
