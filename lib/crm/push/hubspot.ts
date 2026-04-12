import type { CRMNote } from '@/lib/notes/schema'
import type { DecryptedTokens, PushResult, PushOptions, CrmCandidate } from './types'
import type { PushPlan, CrmSchema } from '@/lib/crm/schema/types'
import { mapDealStage, parseEstimatedValue, parseName } from './stage-mapper'
import { buildObjectProps, resolveStageValue, buildActivityBody, shouldCreateTasks } from './plan-applier'

const HS_API = 'https://api.hubapi.com'

/**
 * Fetch wrapper with retry on 429 rate limits.
 * Respects Retry-After header, up to 3 retries.
 */
async function hsFetch(
  tokens: DecryptedTokens,
  path: string,
  init: RequestInit = {},
  retries = 3
): Promise<Response> {
  const res = await fetch(`${HS_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  if (res.status === 429 && retries > 0) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10)
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
    return hsFetch(tokens, path, init, retries - 1)
  }

  return res
}

function hsError(res: Response, body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    return (body as { message: string }).message
  }
  return `HubSpot API error ${res.status}`
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

async function searchContacts(
  tokens: DecryptedTokens,
  name: string
): Promise<{ found: CrmCandidate[]; error?: string }> {
  const { firstName, lastName } = parseName(name)

  const filters: Array<{ propertyName: string; operator: string; value: string }> = []
  if (lastName) filters.push({ propertyName: 'lastname', operator: 'CONTAINS_TOKEN', value: lastName })
  if (firstName) filters.push({ propertyName: 'firstname', operator: 'CONTAINS_TOKEN', value: firstName })

  if (filters.length === 0) return { found: [] }

  const res = await hsFetch(tokens, '/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters }],
      properties: ['firstname', 'lastname', 'email', 'company'],
      limit: 10,
    }),
  })

  if (res.status === 401) return { found: [], error: 'auth_failed' }
  if (!res.ok) return { found: [], error: `Search failed: ${res.status}` }

  const data = (await res.json()) as { results?: Array<{
    id: string; properties: { firstname?: string; lastname?: string; email?: string; company?: string }
  }> }

  return {
    found: (data.results ?? []).map(r => ({
      id: r.id,
      name: [r.properties.firstname, r.properties.lastname].filter(Boolean).join(' ') || 'Unknown',
      type: 'contact' as const,
      detail: r.properties.company || r.properties.email || undefined,
    })),
  }
}

async function createContact(
  tokens: DecryptedTokens,
  name: string,
  company?: string
): Promise<{ id: string } | { error: string }> {
  const { firstName, lastName } = parseName(name)
  const properties: Record<string, string> = { lastname: lastName }
  if (firstName) properties.firstname = firstName
  if (company) properties.company = company

  const res = await hsFetch(tokens, '/crm/v3/objects/contacts', {
    method: 'POST',
    body: JSON.stringify({ properties }),
  })

  if (res.ok || res.status === 201) {
    const data = (await res.json()) as { id: string }
    return { id: data.id }
  }

  // 409 = contact already exists (by email). Extract existing ID.
  if (res.status === 409) {
    const errBody = (await res.json().catch(() => null)) as { message?: string } | null
    const idMatch = errBody?.message?.match(/Existing ID: (\d+)/)
    if (idMatch) return { id: idMatch[1] }
  }

  const errBody = await res.json().catch(() => null)
  return { error: hsError(res, errBody) }
}

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

async function findOrCreateCompany(
  tokens: DecryptedTokens,
  companyName: string
): Promise<string | null> {
  // Search by name
  const res = await hsFetch(tokens, '/crm/v3/objects/companies/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{
        filters: [{ propertyName: 'name', operator: 'EQ', value: companyName }],
      }],
      properties: ['name'],
      limit: 1,
    }),
  })

  if (res.ok) {
    const data = (await res.json()) as { results?: Array<{ id: string }> }
    if (data.results && data.results.length > 0) return data.results[0].id
  }

  // Create
  const createRes = await hsFetch(tokens, '/crm/v3/objects/companies', {
    method: 'POST',
    body: JSON.stringify({ properties: { name: companyName } }),
  })

  if (createRes.ok || createRes.status === 201) {
    const data = (await createRes.json()) as { id: string }
    return data.id
  }

  return null
}

// ---------------------------------------------------------------------------
// Associations
// ---------------------------------------------------------------------------

async function associate(
  tokens: DecryptedTokens,
  fromType: string,
  fromId: string,
  toType: string,
  toId: string
): Promise<void> {
  await hsFetch(
    tokens,
    `/crm/v4/objects/${fromType}/${fromId}/associations/${toType}/${toId}`,
    {
      method: 'PUT',
      body: JSON.stringify([{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: getAssociationTypeId(fromType, toType) }]),
    }
  )
}

/**
 * Standard HubSpot association type IDs.
 * See: https://developers.hubspot.com/docs/api/crm/associations
 */
function getAssociationTypeId(fromType: string, toType: string): number {
  const key = `${fromType}_to_${toType}`
  const map: Record<string, number> = {
    contact_to_company: 1,
    deal_to_contact: 3,
    deal_to_company: 5,
    note_to_contact: 202,
    note_to_deal: 214,
    task_to_contact: 204,
    task_to_deal: 216,
  }
  return map[key] ?? 0
}

// ---------------------------------------------------------------------------
// Deal
// ---------------------------------------------------------------------------

async function searchDeals(
  tokens: DecryptedTokens,
  searchTerm: string
): Promise<CrmCandidate[]> {
  const res = await hsFetch(tokens, '/crm/v3/objects/deals/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{
        filters: [{ propertyName: 'dealname', operator: 'CONTAINS_TOKEN', value: searchTerm }],
      }],
      properties: ['dealname', 'dealstage', 'amount'],
      limit: 10,
    }),
  })

  if (!res.ok) return []

  const data = (await res.json()) as { results?: Array<{
    id: string; properties: { dealname?: string; dealstage?: string; amount?: string }
  }> }

  return (data.results ?? []).map(r => ({
    id: r.id,
    name: r.properties.dealname || 'Unnamed Deal',
    type: 'deal' as const,
    detail: r.properties.dealstage || undefined,
  }))
}

// ---------------------------------------------------------------------------
// Main push function
// ---------------------------------------------------------------------------

export async function pushToHubSpot(
  tokens: DecryptedTokens,
  structured: CRMNote,
  options: PushOptions,
  pushPlan?: PushPlan,
  schema?: CrmSchema | null
): Promise<PushResult> {
  const result: PushResult = { success: false }

  // ---- Step 1: Contact ----
  let contactId = options.existingContactId ?? null

  if (!contactId && structured.contactName) {
    const search = await searchContacts(tokens, structured.contactName)

    if (search.error === 'auth_failed') {
      return { success: false, errorCode: 'auth_failed', error: 'HubSpot session expired. Reconnect in Settings.' }
    }

    if (search.found.length === 1) {
      contactId = search.found[0].id
      result.contactCreated = false
    } else if (search.found.length > 1) {
      return {
        success: false,
        errorCode: 'needs_selection',
        error: 'Multiple contacts found. Select one.',
        candidates: search.found,
      }
    } else {
      const created = await createContact(tokens, structured.contactName, structured.company)
      if ('error' in created) {
        return { success: false, errorCode: 'api_error', error: `Contact creation failed: ${created.error}` }
      }
      contactId = created.id
      result.contactCreated = true
    }
  }

  if (contactId) result.contactId = contactId

  // ---- Step 2: Company ----
  let companyId: string | null = null

  if (structured.company) {
    companyId = await findOrCreateCompany(tokens, structured.company)

    // Associate contact with company
    if (companyId && contactId) {
      await associate(tokens, 'contact', contactId, 'company', companyId)
    }
  }

  // ---- Step 3: Deal ----
  let dealId = options.existingDealId ?? null

  if (dealId) {
    // Update existing deal
    const properties: Record<string, string> = {}

    if (pushPlan) {
      const dealProps = buildObjectProps(pushPlan, 'opportunity', structured, schema ?? null)
      // Handle stage separately since it needs fuzzy matching
      if (options.dealStageCrmValue) {
        dealProps.dealstage = options.dealStageCrmValue
      } else {
        const stageResult = resolveStageValue(pushPlan, structured, options.cachedStages ?? [], 'hubspot')
        if (stageResult) dealProps.dealstage = stageResult.value
        else if (structured.dealStage) result.unmappedStage = true
      }
      for (const [k, v] of Object.entries(dealProps)) {
        if (v !== null) properties[k] = String(v)
      }
    } else {
      if (options.dealStageCrmValue) {
        properties.dealstage = options.dealStageCrmValue
      } else if (structured.dealStage && options.cachedStages) {
        const mapped = mapDealStage(structured.dealStage, options.cachedStages, 'hubspot')
        if (mapped) properties.dealstage = mapped.value
        else result.unmappedStage = true
      }

      const amount = structured.estimatedValue ? parseEstimatedValue(structured.estimatedValue) : null
      if (amount !== null) properties.amount = amount.toString()
      if (structured.closeDate) properties.closedate = structured.closeDate
      if (structured.opportunityNotes) properties.description = structured.opportunityNotes
    }

    if (Object.keys(properties).length > 0) {
      const res = await hsFetch(tokens, `/crm/v3/objects/deals/${dealId}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        return { ...result, success: false, errorCode: 'api_error', error: `Deal update failed: ${hsError(res, errBody)}` }
      }
    }

    result.dealCreated = false
  } else {
    // Search or create
    const searchTerm = structured.company || structured.contactName
    if (searchTerm) {
      const dealCandidates = await searchDeals(tokens, searchTerm)

      if (dealCandidates.length === 1) {
        dealId = dealCandidates[0].id
        result.dealCreated = false
      } else if (dealCandidates.length > 1) {
        return {
          ...result,
          success: false,
          errorCode: 'needs_selection',
          error: 'Multiple deals found. Select one.',
          candidates: dealCandidates,
        }
      }
    }

    if (!dealId) {
      // Create new deal
      const properties: Record<string, string> = {}

      properties.dealname = [structured.company, structured.contactName].filter(Boolean).join(' - ') || 'New Deal'

      if (pushPlan) {
        const dealProps = buildObjectProps(pushPlan, 'opportunity', structured, schema ?? null)
        // Handle stage separately since it needs fuzzy matching
        if (options.dealStageCrmValue) {
          dealProps.dealstage = options.dealStageCrmValue
        } else {
          const stageResult = resolveStageValue(pushPlan, structured, options.cachedStages ?? [], 'hubspot')
          if (stageResult) dealProps.dealstage = stageResult.value
          else if (structured.dealStage) result.unmappedStage = true
        }
        // Default to first stage if nothing mapped
        if (!dealProps.dealstage && options.cachedStages && options.cachedStages.length > 0) {
          const first = options.cachedStages[0]
          dealProps.dealstage = first.stageId ?? first.value
        }
        if (options.pipelineId) dealProps.pipeline = options.pipelineId
        // Override dealname if plan provided one
        if (dealProps.dealname && typeof dealProps.dealname === 'string') {
          properties.dealname = dealProps.dealname
          delete dealProps.dealname
        }
        for (const [k, v] of Object.entries(dealProps)) {
          if (v !== null) properties[k] = String(v)
        }
      } else {
        if (options.dealStageCrmValue) {
          properties.dealstage = options.dealStageCrmValue
        } else if (structured.dealStage && options.cachedStages) {
          const mapped = mapDealStage(structured.dealStage, options.cachedStages, 'hubspot')
          if (mapped) properties.dealstage = mapped.value
          else result.unmappedStage = true
        }

        // Default to first stage if nothing mapped
        if (!properties.dealstage && options.cachedStages && options.cachedStages.length > 0) {
          const first = options.cachedStages[0]
          properties.dealstage = first.stageId ?? first.value
        }

        if (options.pipelineId) properties.pipeline = options.pipelineId

        const amount = structured.estimatedValue ? parseEstimatedValue(structured.estimatedValue) : null
        if (amount !== null) properties.amount = amount.toString()
        if (structured.closeDate) properties.closedate = structured.closeDate
        if (structured.opportunityNotes) properties.description = structured.opportunityNotes
      }

      const createRes = await hsFetch(tokens, '/crm/v3/objects/deals', {
        method: 'POST',
        body: JSON.stringify({ properties }),
      })

      if (!createRes.ok && createRes.status !== 201) {
        const errBody = await createRes.json().catch(() => null)
        return { ...result, success: false, errorCode: 'api_error', error: `Deal creation failed: ${hsError(createRes, errBody)}` }
      }

      const created = (await createRes.json()) as { id: string }
      dealId = created.id
      result.dealCreated = true
    }

    // Associate deal with contact and company
    if (dealId && contactId) {
      await associate(tokens, 'deal', dealId, 'contact', contactId)
    }
    if (dealId && companyId) {
      await associate(tokens, 'deal', dealId, 'company', companyId)
    }
  }

  if (dealId) result.dealId = dealId

  // ---- Step 4: Note (meeting summary) ----
  let noteBody: string | null = null

  if (pushPlan) {
    const body = buildActivityBody(pushPlan, structured, schema ?? null)
    if (body) noteBody = body
  } else {
    const noteParts: string[] = []
    if (structured.meetingSummary) {
      noteParts.push('<strong>Meeting Summary</strong><br/>', ...structured.meetingSummary.map(s => `- ${s}<br/>`))
    }
    if (structured.opportunityNotes) {
      noteParts.push('<br/><strong>Opportunity Notes</strong><br/>', structured.opportunityNotes)
    }
    if (structured.painPoints && structured.painPoints.length > 0) {
      noteParts.push('<br/><strong>Pain Points</strong><br/>', ...structured.painPoints.map(p => `- ${p}<br/>`))
    }
    if (noteParts.length > 0) noteBody = noteParts.join('\n')
  }

  if (noteBody) {
    const noteRes = await hsFetch(tokens, '/crm/v3/objects/notes', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          hs_timestamp: new Date().toISOString(),
          hs_note_body: noteBody,
        },
      }),
    })

    if (noteRes.ok || noteRes.status === 201) {
      const noteData = (await noteRes.json()) as { id: string }
      result.noteCrmId = noteData.id

      // Associate note with contact and deal
      if (contactId) await associate(tokens, 'note', noteData.id, 'contact', contactId)
      if (dealId) await associate(tokens, 'note', noteData.id, 'deal', dealId)
    }
  }

  // ---- Step 5: Tasks from nextSteps ----
  const taskIds: string[] = []

  const createTasks = pushPlan ? shouldCreateTasks(pushPlan) : !!structured.nextSteps

  if (createTasks && structured.nextSteps) {
    for (const step of structured.nextSteps) {
      if (step.owner !== 'rep') continue

      const priorityMap: Record<string, string> = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' }

      const taskRes = await hsFetch(tokens, '/crm/v3/objects/tasks', {
        method: 'POST',
        body: JSON.stringify({
          properties: {
            hs_task_subject: step.task,
            hs_task_body: 'Created by StreetNotes',
            hs_task_status: 'NOT_STARTED',
            hs_task_priority: priorityMap[step.priority] ?? 'MEDIUM',
            hs_timestamp: new Date().toISOString(),
            ...(step.dueDate ? { hs_task_due_date: step.dueDate } : {}),
          },
        }),
      })

      if (taskRes.ok || taskRes.status === 201) {
        const taskData = (await taskRes.json()) as { id: string }
        taskIds.push(taskData.id)

        if (contactId) await associate(tokens, 'task', taskData.id, 'contact', contactId)
        if (dealId) await associate(tokens, 'task', taskData.id, 'deal', dealId)
      }
    }
  }

  if (taskIds.length > 0) result.taskIds = taskIds

  result.success = true
  return result
}
