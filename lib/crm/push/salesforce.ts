import type { CRMNote } from '@/lib/notes/schema'
import type { DecryptedTokens, PushResult, PushOptions, CrmCandidate } from './types'
import { mapDealStage, parseEstimatedValue, parseName } from './stage-mapper'

const API_VERSION = 'v59.0'

function apiUrl(tokens: DecryptedTokens, path: string): string {
  return `${tokens.instanceUrl}/services/data/${API_VERSION}${path}`
}

async function sfFetch(
  tokens: DecryptedTokens,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(apiUrl(tokens, path), {
    ...init,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

function sfError(res: Response, body: unknown): string {
  if (Array.isArray(body) && body[0]?.message) {
    return body[0].message
  }
  return `Salesforce API error ${res.status}`
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

async function searchContacts(
  tokens: DecryptedTokens,
  name: string,
  company?: string
): Promise<{ found: CrmCandidate[]; error?: string }> {
  const escaped = name.replace(/['"\\]/g, '')
  const sosl = encodeURIComponent(
    `FIND {${escaped}} IN NAME FIELDS RETURNING Contact(Id, Name, Email, Account.Name) LIMIT 10`
  )
  const res = await sfFetch(tokens, `/search/?q=${sosl}`)

  if (res.status === 401) return { found: [], error: 'auth_failed' }
  if (!res.ok) return { found: [], error: `Search failed: ${res.status}` }

  const data = (await res.json()) as { searchRecords?: Array<{
    Id: string; Name: string; Email?: string; Account?: { Name?: string }
  }> }

  let records = data.searchRecords ?? []

  // Filter by company if provided
  if (company && records.length > 1) {
    const companyLower = company.toLowerCase()
    const filtered = records.filter(
      r => r.Account?.Name?.toLowerCase().includes(companyLower)
    )
    if (filtered.length > 0) records = filtered
  }

  return {
    found: records.map(r => ({
      id: r.Id,
      name: r.Name,
      type: 'contact' as const,
      detail: r.Account?.Name || r.Email || undefined,
    })),
  }
}

async function findOrCreateAccount(
  tokens: DecryptedTokens,
  companyName: string
): Promise<string | null> {
  const escaped = companyName.replace(/'/g, "\\'")
  const soql = encodeURIComponent(`SELECT Id FROM Account WHERE Name = '${escaped}' LIMIT 1`)
  const res = await sfFetch(tokens, `/query/?q=${soql}`)

  if (res.ok) {
    const data = (await res.json()) as { records?: Array<{ Id: string }> }
    if (data.records && data.records.length > 0) return data.records[0].Id
  }

  // Create new account
  const createRes = await sfFetch(tokens, '/sobjects/Account', {
    method: 'POST',
    body: JSON.stringify({ Name: companyName }),
  })

  if (createRes.ok || createRes.status === 201) {
    const created = (await createRes.json()) as { id: string }
    return created.id
  }

  return null
}

async function createContact(
  tokens: DecryptedTokens,
  name: string,
  accountId: string | null
): Promise<{ id: string } | { error: string }> {
  const { firstName, lastName } = parseName(name)
  const body: Record<string, string> = { LastName: lastName }
  if (firstName) body.FirstName = firstName
  if (accountId) body.AccountId = accountId

  const res = await sfFetch(tokens, '/sobjects/Contact', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (res.ok || res.status === 201) {
    const data = (await res.json()) as { id: string }
    return { id: data.id }
  }

  const errBody = await res.json().catch(() => null)
  return { error: sfError(res, errBody) }
}

// ---------------------------------------------------------------------------
// Opportunity
// ---------------------------------------------------------------------------

async function searchOpportunities(
  tokens: DecryptedTokens,
  searchTerm: string
): Promise<CrmCandidate[]> {
  const escaped = searchTerm.replace(/['"\\]/g, '')
  const sosl = encodeURIComponent(
    `FIND {${escaped}} IN NAME FIELDS RETURNING Opportunity(Id, Name, StageName, Amount) LIMIT 10`
  )
  const res = await sfFetch(tokens, `/search/?q=${sosl}`)

  if (!res.ok) return []

  const data = (await res.json()) as { searchRecords?: Array<{
    Id: string; Name: string; StageName?: string; Amount?: number
  }> }

  return (data.searchRecords ?? []).map(r => ({
    id: r.Id,
    name: r.Name,
    type: 'deal' as const,
    detail: r.StageName || undefined,
  }))
}

interface OppFields {
  Name: string
  StageName?: string
  Amount?: number
  CloseDate: string
  Description?: string
  AccountId?: string
}

async function createOpportunity(
  tokens: DecryptedTokens,
  fields: OppFields
): Promise<{ id: string } | { error: string }> {
  const res = await sfFetch(tokens, '/sobjects/Opportunity', {
    method: 'POST',
    body: JSON.stringify(fields),
  })

  if (res.ok || res.status === 201) {
    const data = (await res.json()) as { id: string }
    return { id: data.id }
  }

  const errBody = await res.json().catch(() => null)
  return { error: sfError(res, errBody) }
}

async function updateOpportunity(
  tokens: DecryptedTokens,
  id: string,
  fields: Partial<OppFields>
): Promise<{ error?: string }> {
  const res = await sfFetch(tokens, `/sobjects/Opportunity/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })

  // Salesforce returns 204 No Content on success
  if (res.ok || res.status === 204) return {}

  const errBody = await res.json().catch(() => null)
  return { error: sfError(res, errBody) }
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------

async function createTask(
  tokens: DecryptedTokens,
  fields: Record<string, string | null>
): Promise<string | null> {
  const res = await sfFetch(tokens, '/sobjects/Task', {
    method: 'POST',
    body: JSON.stringify(fields),
  })

  if (res.ok || res.status === 201) {
    const data = (await res.json()) as { id: string }
    return data.id
  }

  return null
}

// ---------------------------------------------------------------------------
// Main push function
// ---------------------------------------------------------------------------

export async function pushToSalesforce(
  tokens: DecryptedTokens,
  structured: CRMNote,
  options: PushOptions
): Promise<PushResult> {
  const result: PushResult = { success: false }

  // ---- Step 1: Contact ----
  let contactId = options.existingContactId ?? null

  if (!contactId && structured.contactName) {
    const search = await searchContacts(tokens, structured.contactName, structured.company)

    if (search.error === 'auth_failed') {
      return { success: false, errorCode: 'auth_failed', error: 'Salesforce session expired. Reconnect in Settings.' }
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
      // Create new contact
      let accountId: string | null = null
      if (structured.company) {
        accountId = await findOrCreateAccount(tokens, structured.company)
      }

      const created = await createContact(tokens, structured.contactName, accountId)
      if ('error' in created) {
        return { success: false, errorCode: 'api_error', error: `Contact creation failed: ${created.error}` }
      }

      contactId = created.id
      result.contactCreated = true
    }
  }

  if (contactId) result.contactId = contactId

  // ---- Step 2: Opportunity ----
  let dealId = options.existingDealId ?? null

  if (dealId) {
    // Update existing opportunity
    const updateFields: Partial<OppFields> = {}

    if (options.dealStageCrmValue) {
      updateFields.StageName = options.dealStageCrmValue
    } else if (structured.dealStage && options.cachedStages) {
      const mapped = mapDealStage(structured.dealStage, options.cachedStages, 'salesforce')
      if (mapped) updateFields.StageName = mapped.value
      else result.unmappedStage = true
    }

    const amount = structured.estimatedValue ? parseEstimatedValue(structured.estimatedValue) : null
    if (amount !== null) updateFields.Amount = amount

    if (structured.opportunityNotes) updateFields.Description = structured.opportunityNotes
    if (structured.closeDate) updateFields.CloseDate = structured.closeDate

    if (Object.keys(updateFields).length > 0) {
      const updateResult = await updateOpportunity(tokens, dealId, updateFields)
      if (updateResult.error) {
        return { ...result, success: false, errorCode: 'api_error', error: `Opportunity update failed: ${updateResult.error}` }
      }
    }

    result.dealCreated = false
  } else {
    // Search or create new opportunity
    const searchTerm = structured.company || structured.contactName
    if (searchTerm) {
      const oppCandidates = await searchOpportunities(tokens, searchTerm)

      if (oppCandidates.length === 1) {
        dealId = oppCandidates[0].id
        result.dealCreated = false
      } else if (oppCandidates.length > 1) {
        return {
          ...result,
          success: false,
          errorCode: 'needs_selection',
          error: 'Multiple opportunities found. Select one.',
          candidates: oppCandidates,
        }
      }
    }

    if (!dealId) {
      // Create new opportunity
      let stageName: string | undefined
      if (options.dealStageCrmValue) {
        stageName = options.dealStageCrmValue
      } else if (structured.dealStage && options.cachedStages) {
        const mapped = mapDealStage(structured.dealStage, options.cachedStages, 'salesforce')
        if (mapped) stageName = mapped.value
        else result.unmappedStage = true
      }

      // Salesforce requires StageName — fall back to first non-closed stage
      if (!stageName && options.cachedStages && options.cachedStages.length > 0) {
        const open = options.cachedStages.find(s => !s.isClosed)
        stageName = open?.value ?? options.cachedStages[0].value
      }

      const amount = structured.estimatedValue ? parseEstimatedValue(structured.estimatedValue) : null

      // Salesforce requires CloseDate — default 90 days out
      const closeDate = structured.closeDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const oppName = [structured.company, structured.contactName].filter(Boolean).join(' - ') || 'New Opportunity'

      const oppFields: OppFields = {
        Name: oppName,
        CloseDate: closeDate,
      }
      if (stageName) oppFields.StageName = stageName
      if (amount !== null) oppFields.Amount = amount
      if (structured.opportunityNotes) oppFields.Description = structured.opportunityNotes

      // Link to account if we found/created one via contact
      if (contactId && structured.company) {
        const accountId = await findOrCreateAccount(tokens, structured.company)
        if (accountId) oppFields.AccountId = accountId
      }

      const created = await createOpportunity(tokens, oppFields)
      if ('error' in created) {
        return { ...result, success: false, errorCode: 'api_error', error: `Opportunity creation failed: ${created.error}` }
      }

      dealId = created.id
      result.dealCreated = true
    }
  }

  if (dealId) result.dealId = dealId

  // ---- Step 3: Tasks from nextSteps ----
  const taskIds: string[] = []

  if (structured.nextSteps) {
    for (const step of structured.nextSteps) {
      if (step.owner !== 'rep') continue

      const priorityMap: Record<string, string> = { high: 'High', medium: 'Normal', low: 'Low' }

      const taskFields: Record<string, string | null> = {
        Subject: step.task,
        Status: 'Not Started',
        Priority: priorityMap[step.priority] ?? 'Normal',
        WhoId: contactId ?? null,
        WhatId: dealId ?? null,
        ActivityDate: step.dueDate ?? null,
        Description: 'Created by StreetNotes',
      }

      const taskId = await createTask(tokens, taskFields)
      if (taskId) taskIds.push(taskId)
    }
  }

  if (taskIds.length > 0) result.taskIds = taskIds

  // ---- Step 4: Activity log (completed task with meeting notes) ----
  const summaryParts: string[] = []
  if (structured.meetingSummary) {
    summaryParts.push('Meeting Summary:', ...structured.meetingSummary.map(s => `- ${s}`))
  }
  if (structured.opportunityNotes) {
    summaryParts.push('', 'Opportunity Notes:', structured.opportunityNotes)
  }
  if (structured.painPoints && structured.painPoints.length > 0) {
    summaryParts.push('', 'Pain Points:', ...structured.painPoints.map(p => `- ${p}`))
  }

  if (summaryParts.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    const subject = `Meeting Notes - ${structured.contactName || 'Unknown'} - ${today}`

    const noteId = await createTask(tokens, {
      Subject: subject,
      Description: summaryParts.join('\n'),
      Status: 'Completed',
      Priority: 'Normal',
      WhoId: contactId ?? null,
      WhatId: dealId ?? null,
      ActivityDate: today,
    })

    if (noteId) result.noteCrmId = noteId
  }

  result.success = true
  return result
}
