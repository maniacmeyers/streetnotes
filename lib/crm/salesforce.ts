import { SupabaseClient } from '@supabase/supabase-js'
import { getValidTokens } from './token-refresh'

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
