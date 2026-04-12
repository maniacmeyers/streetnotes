import { SupabaseClient } from '@supabase/supabase-js'
import type { CrmSchema, StickyRule } from './types'

export async function getCachedSchema(
  supabase: SupabaseClient,
  userId: string,
  crmType: 'salesforce' | 'hubspot'
): Promise<{ schema: CrmSchema; stale: boolean; error?: string } | null> {
  const { data } = await supabase
    .from('crm_schema_cache')
    .select('schema, schema_hash, fetched_at, stale_at, fetch_error')
    .eq('user_id', userId)
    .eq('crm_type', crmType)
    .single()

  if (!data) return null

  const stale = new Date(data.stale_at).getTime() < Date.now()
  return {
    schema: data.schema as CrmSchema,
    stale,
    error: data.fetch_error ?? undefined,
  }
}

export async function storeCachedSchema(
  supabase: SupabaseClient,
  userId: string,
  crmType: 'salesforce' | 'hubspot',
  schema: CrmSchema,
  error?: string
): Promise<void> {
  await supabase
    .from('crm_schema_cache')
    .upsert(
      {
        user_id: userId,
        crm_type: crmType,
        schema: schema as unknown as Record<string, unknown>,
        schema_hash: schema.hash,
        fetched_at: new Date().toISOString(),
        stale_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fetch_error: error ?? null,
      },
      { onConflict: 'user_id,crm_type', ignoreDuplicates: false }
    )
}

export async function getPreferredCrm(
  supabase: SupabaseClient,
  userId: string
): Promise<'salesforce' | 'hubspot' | null> {
  // Check user preferences first (explicit user choice)
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('crm_type')
    .eq('user_id', userId)
    .single()

  if (prefs?.crm_type) {
    return prefs.crm_type as 'salesforce' | 'hubspot'
  }

  // Fall back to most recently connected CRM
  const { data } = await supabase
    .from('crm_connections')
    .select('crm_type, created_at')
    .eq('user_id', userId)
    .in('crm_type', ['salesforce', 'hubspot'])
    .order('created_at', { ascending: false })
    .limit(1)

  if (!data || data.length === 0) return null
  return data[0].crm_type as 'salesforce' | 'hubspot'
}

export async function getStickyRules(
  supabase: SupabaseClient,
  userId: string,
  crmType: 'salesforce' | 'hubspot'
): Promise<StickyRule[]> {
  const { data } = await supabase
    .from('crm_field_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('crm_type', crmType)

  if (!data) return []

  return data.map((r) => ({
    id: r.id,
    userId: r.user_id,
    crmType: r.crm_type,
    sourceField: r.source_field,
    targetObject: r.target_object,
    targetField: r.target_field,
    learnedFromNoteId: r.learned_from_note_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}

export async function canRefreshSchema(
  supabase: SupabaseClient,
  userId: string,
  crmType: 'salesforce' | 'hubspot'
): Promise<boolean> {
  const { data } = await supabase
    .from('crm_schema_cache')
    .select('fetched_at')
    .eq('user_id', userId)
    .eq('crm_type', crmType)
    .single()

  if (!data) return true
  const elapsed = Date.now() - new Date(data.fetched_at).getTime()
  return elapsed >= 60_000
}
