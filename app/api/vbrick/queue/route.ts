import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const { queueItemId, status, debriefSessionId } = await request.json()

    if (!queueItemId || !status) {
      return NextResponse.json({ error: 'Missing queueItemId or status' }, { status: 400 })
    }

    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    }

    if (debriefSessionId) {
      updateData.debrief_session_id = debriefSessionId
    }

    const { error } = await supabase
      .from('vbrick_call_queue')
      .update(updateData)
      .eq('id', queueItemId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update session total_calls count
    const { data: item } = await supabase
      .from('vbrick_call_queue')
      .select('session_id')
      .eq('id', queueItemId)
      .single()

    if (item) {
      const { count } = await supabase
        .from('vbrick_call_queue')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', item.session_id)
        .eq('status', 'completed')

      await supabase
        .from('vbrick_calling_sessions')
        .update({ total_calls: count || 0 })
        .eq('id', item.session_id)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update queue item' }, { status: 500 })
  }
}
