import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET: Fetch single campaign with files and channels
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const [campaignRes, filesRes, channelsRes] = await Promise.all([
    supabase.from('campaigns').select('*').eq('id', params.id).single(),
    supabase.from('campaign_files').select('*').eq('campaign_id', params.id).order('created_at', { ascending: true }),
    supabase.from('campaign_channels').select('*').eq('campaign_id', params.id).order('channel_type', { ascending: true }),
  ])

  if (campaignRes.error || !campaignRes.data) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  return NextResponse.json({
    campaign: campaignRes.data,
    files: filesRes.data || [],
    channels: channelsRes.data || [],
  })
}

// PATCH: Update campaign
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  const allowedFields = ['name', 'description', 'event_name', 'event_date', 'target_audience', 'status', 'frameworks', 'metadata']
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaign: data })
}

// DELETE: Delete campaign (cascades to files, channels, contact scripts)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
