import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// PATCH: Approve or reject campaign channels
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { action, email, channel_ids } = body as {
    action: 'approve_all' | 'approve_channel' | 'reject_channel' | 'activate'
    email: string
    channel_ids?: string[]
  }

  if (!action || !email) {
    return NextResponse.json({ error: 'Missing action or email' }, { status: 400 })
  }

  // Only Jeff can approve
  if (email !== 'jeff@forgetime.ai') {
    return NextResponse.json({ error: 'Only Jeff can approve campaigns' }, { status: 403 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  if (action === 'approve_all') {
    // Approve all draft channels for this campaign
    await supabase
      .from('campaign_channels')
      .update({ status: 'approved', approved_by: email, approved_at: now, updated_at: now })
      .eq('campaign_id', params.id)
      .eq('status', 'draft')

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ status: 'approved', approved_by: email, approved_at: now, updated_at: now })
      .eq('id', params.id)

    return NextResponse.json({ success: true, action: 'approved_all' })
  }

  if (action === 'approve_channel' && channel_ids?.length) {
    await supabase
      .from('campaign_channels')
      .update({ status: 'approved', approved_by: email, approved_at: now, updated_at: now })
      .in('id', channel_ids)

    return NextResponse.json({ success: true, action: 'approved_channels', count: channel_ids.length })
  }

  if (action === 'reject_channel' && channel_ids?.length) {
    await supabase
      .from('campaign_channels')
      .update({ status: 'rejected', updated_at: now })
      .in('id', channel_ids)

    return NextResponse.json({ success: true, action: 'rejected_channels', count: channel_ids.length })
  }

  if (action === 'activate') {
    // Check all channels are approved
    const { data: draftChannels } = await supabase
      .from('campaign_channels')
      .select('id')
      .eq('campaign_id', params.id)
      .eq('status', 'draft')

    if (draftChannels && draftChannels.length > 0) {
      return NextResponse.json({ error: `${draftChannels.length} channels still pending approval` }, { status: 400 })
    }

    // Archive any currently active campaigns
    await supabase
      .from('campaigns')
      .update({ status: 'archived', updated_at: now })
      .eq('status', 'active')

    // Activate this campaign
    await supabase
      .from('campaigns')
      .update({ status: 'active', updated_at: now })
      .eq('id', params.id)

    return NextResponse.json({ success: true, action: 'activated' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
