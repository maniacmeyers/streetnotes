import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RuleInputSchema = z.object({
  crmType: z.enum(['salesforce', 'hubspot']),
  rules: z.array(z.object({
    sourceField: z.string().min(1),
    targetObject: z.enum(['contact', 'account', 'opportunity', 'activity']),
    targetField: z.string().min(1),
    learnedFromNoteId: z.string().uuid().optional(),
  })),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const crmType = request.nextUrl.searchParams.get('crmType')
  if (!crmType || !['salesforce', 'hubspot'].includes(crmType)) {
    return NextResponse.json({ error: 'Invalid crmType' }, { status: 400 })
  }

  const { data: rules } = await supabase
    .from('crm_field_rules')
    .select('*')
    .eq('user_id', user.id)
    .eq('crm_type', crmType)
    .order('created_at', { ascending: true })

  return NextResponse.json({ rules: rules ?? [] })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RuleInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  // Rate limit: 30 writes/minute
  const { count } = await supabase
    .from('crm_field_rules')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('crm_type', parsed.data.crmType)
    .gte('updated_at', new Date(Date.now() - 60_000).toISOString())

  if ((count ?? 0) >= 30) {
    return NextResponse.json(
      { error: 'Rate limited. Max 30 rule updates per minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const rows = parsed.data.rules.map(rule => ({
    user_id: user.id,
    crm_type: parsed.data.crmType,
    source_field: rule.sourceField,
    target_object: rule.targetObject,
    target_field: rule.targetField,
    learned_from_note_id: rule.learnedFromNoteId ?? null,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('crm_field_rules')
    .upsert(rows, { onConflict: 'user_id,crm_type,source_field', ignoreDuplicates: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to save rules' }, { status: 500 })
  }

  return NextResponse.json({ saved: rows.length })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const crmType = request.nextUrl.searchParams.get('crmType')
  if (!crmType || !['salesforce', 'hubspot'].includes(crmType)) {
    return NextResponse.json({ error: 'Invalid crmType' }, { status: 400 })
  }

  const sourceField = request.nextUrl.searchParams.get('sourceField')

  let query = supabase
    .from('crm_field_rules')
    .delete()
    .eq('user_id', user.id)
    .eq('crm_type', crmType)

  if (sourceField) {
    query = query.eq('source_field', sourceField)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to delete rules' }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
