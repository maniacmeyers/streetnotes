import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidTokens } from '@/lib/crm/token-refresh'
import { pushToSalesforce } from '@/lib/crm/push/salesforce'
import { pushToHubSpot } from '@/lib/crm/push/hubspot'
import { pushToPipedrive } from '@/lib/crm/push/pipedrive'
import type { CRMNote } from '@/lib/notes/schema'
import type { PushResult, CachedStage } from '@/lib/crm/push/types'
import type { PushPlan, CrmSchema } from '@/lib/crm/schema/types'
import { getCachedSchema } from '@/lib/crm/schema/cache'

/**
 * POST /api/crm/push
 * Push a structured note to the user's connected CRM.
 *
 * Body: {
 *   noteId: string
 *   crmType?: 'salesforce' | 'hubspot'   (required if both connected)
 *   existingContactId?: string
 *   existingDealId?: string
 *   dealStageCrmValue?: string
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    noteId?: string
    crmType?: 'salesforce' | 'hubspot' | 'pipedrive'
    existingContactId?: string
    existingDealId?: string
    dealStageCrmValue?: string
  } | null

  if (!body?.noteId) {
    return NextResponse.json({ error: 'noteId is required' }, { status: 400 })
  }

  // Load note and verify ownership
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('id, user_id, structured_output')
    .eq('id', body.noteId)
    .single()

  if (noteError || !note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  if (note.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // The structured_output may be the new { crmNote, pushPlan } shape or the legacy CRMNote shape
  let crmNote: CRMNote | null = null
  let pushPlan: PushPlan | undefined

  if (note.structured_output) {
    if ('crmNote' in (note.structured_output as Record<string, unknown>)) {
      const output = note.structured_output as { crmNote: CRMNote; pushPlan?: PushPlan }
      crmNote = output.crmNote
      pushPlan = output.pushPlan
    } else {
      crmNote = note.structured_output as CRMNote
    }
  }

  if (!crmNote) {
    return NextResponse.json({ error: 'Note has no structured output' }, { status: 400 })
  }

  // Determine CRM type
  let crmType = body.crmType
  if (!crmType) {
    const { data: connections } = await supabase
      .from('crm_connections')
      .select('crm_type')
      .eq('user_id', user.id)

    const types = connections?.map(c => c.crm_type) ?? []

    if (types.length === 0) {
      return NextResponse.json({ error: 'No CRM connected. Connect one in Settings.' }, { status: 400 })
    }
    if (types.length > 1) {
      return NextResponse.json({ error: 'Multiple CRMs connected. Specify crmType.' }, { status: 400 })
    }
    crmType = types[0] as 'salesforce' | 'hubspot'
  }

  if (!['salesforce', 'hubspot', 'pipedrive'].includes(crmType)) {
    return NextResponse.json({ error: 'Invalid CRM type' }, { status: 400 })
  }

  // Get valid tokens
  const tokens = await getValidTokens(supabase, user.id, crmType)
  if (!tokens) {
    return NextResponse.json({ error: 'CRM not connected or tokens expired. Reconnect in Settings.' }, { status: 400 })
  }

  // Load cached stages for stage mapping
  let cachedStages: CachedStage[] = []
  const { data: stageCache } = await supabase
    .from('deal_stage_cache')
    .select('stages')
    .eq('user_id', user.id)
    .eq('crm_type', crmType)
    .single()

  if (stageCache?.stages) {
    cachedStages = stageCache.stages as CachedStage[]
  }

  // Load CRM schema if pushPlan exists (needed for field metadata)
  let crmSchema: CrmSchema | null = null
  if (pushPlan && (crmType === 'salesforce' || crmType === 'hubspot')) {
    const cached = await getCachedSchema(supabase, user.id, crmType)
    if (cached) crmSchema = cached.schema
  }

  // Create pending push log entry
  const { data: logEntry, error: logError } = await supabase
    .from('crm_push_log')
    .insert({
      note_id: body.noteId,
      user_id: user.id,
      crm_type: crmType,
      status: 'pending',
    })
    .select('id')
    .single()

  if (logError) {
    console.error('Failed to create push log:', logError)
    return NextResponse.json({ error: 'Failed to start push' }, { status: 500 })
  }

  // Set note push_status to pending
  await supabase
    .from('notes')
    .update({ push_status: 'pending' })
    .eq('id', body.noteId)

  // Execute push
  let pushResult: PushResult

  try {
    if (crmType === 'salesforce') {
      pushResult = await pushToSalesforce(tokens, crmNote, {
        existingContactId: body.existingContactId,
        existingDealId: body.existingDealId,
        dealStageCrmValue: body.dealStageCrmValue,
        cachedStages,
      }, pushPlan, crmSchema)
    } else if (crmType === 'hubspot') {
      pushResult = await pushToHubSpot(tokens, crmNote, {
        existingContactId: body.existingContactId,
        existingDealId: body.existingDealId,
        dealStageCrmValue: body.dealStageCrmValue,
        cachedStages,
      }, pushPlan, crmSchema)
    } else if (crmType === 'pipedrive') {
      pushResult = await pushToPipedrive(tokens, crmNote, {
        existingContactId: body.existingContactId,
        existingDealId: body.existingDealId,
        dealStageCrmValue: body.dealStageCrmValue,
        cachedStages,
      })
    } else {
      throw new Error(`Unsupported CRM type: ${crmType}`)
    }
  } catch (err) {
    console.error(`CRM push error (${crmType}):`, err)
    const message = err instanceof Error ? err.message : 'Unknown error'

    // Update log and note status
    await supabase
      .from('crm_push_log')
      .update({
        status: 'failed',
        error_message: message,
        error_code: 'api_error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', logEntry.id)

    await supabase
      .from('notes')
      .update({ push_status: 'failed' })
      .eq('id', body.noteId)

    return NextResponse.json({ error: `CRM push failed: ${message}` }, { status: 502 })
  }

  // Update push log with result
  const logStatus = pushResult.success
    ? 'success'
    : pushResult.errorCode === 'needs_selection'
      ? 'pending'
      : 'failed'

  await supabase
    .from('crm_push_log')
    .update({
      status: logStatus,
      contact_id: pushResult.contactId ?? null,
      contact_created: pushResult.contactCreated ?? false,
      deal_id: pushResult.dealId ?? null,
      deal_created: pushResult.dealCreated ?? false,
      task_ids: pushResult.taskIds ?? [],
      note_crm_id: pushResult.noteCrmId ?? null,
      error_message: pushResult.error ?? null,
      error_code: pushResult.errorCode ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', logEntry.id)

  // Update note push_status (not for needs_selection — that's still pending)
  if (pushResult.success) {
    await supabase
      .from('notes')
      .update({ push_status: 'success' })
      .eq('id', body.noteId)
  } else if (pushResult.errorCode !== 'needs_selection') {
    await supabase
      .from('notes')
      .update({ push_status: 'failed' })
      .eq('id', body.noteId)
  }

  // Return result
  const status = pushResult.success ? 200 : pushResult.errorCode === 'needs_selection' ? 200 : 502
  return NextResponse.json({ ...pushResult, crmType }, { status })
}
