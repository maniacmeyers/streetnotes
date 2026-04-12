import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const PreferencesSchema = z.object({
  crmType: z.enum(['salesforce', 'hubspot']).nullable().optional(),
  pipelineId: z.string().nullable().optional(),
  pipelineLabel: z.string().nullable().optional(),
  timezone: z.string().min(1).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('crm_type, pipeline_id, pipeline_label, timezone')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    preferences: prefs ?? { crm_type: null, pipeline_id: null, pipeline_label: null, timezone: 'America/New_York' },
  })
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

  const parsed = PreferencesSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.crmType !== undefined) updates.crm_type = parsed.data.crmType
  if (parsed.data.pipelineId !== undefined) updates.pipeline_id = parsed.data.pipelineId
  if (parsed.data.pipelineLabel !== undefined) updates.pipeline_label = parsed.data.pipelineLabel
  if (parsed.data.timezone !== undefined) updates.timezone = parsed.data.timezone

  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      { user_id: user.id, ...updates },
      { onConflict: 'user_id', ignoreDuplicates: false }
    )

  if (error) {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }

  return NextResponse.json({ saved: true })
}
