import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateActivityCSV, type SessionCall } from '@/lib/vbrick/csv-parser'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get completed queue items with debrief data
    const { data: items } = await supabase
      .from('vbrick_call_queue')
      .select('*, debrief_session_id')
      .eq('session_id', sessionId)
      .eq('status', 'completed')
      .order('queue_position', { ascending: true })

    if (!items || items.length === 0) {
      return new Response('No completed calls in this session', { status: 404 })
    }

    // Get debrief data
    const debriefIds = items.map(i => i.debrief_session_id).filter(Boolean)
    const debriefMap = new Map<string, Record<string, unknown>>()

    if (debriefIds.length > 0) {
      const { data: debriefs } = await supabase
        .from('debrief_sessions')
        .select('id, structured_output')
        .in('id', debriefIds)

      if (debriefs) {
        for (const d of debriefs) {
          debriefMap.set(d.id, d.structured_output as Record<string, unknown>)
        }
      }
    }

    const calls: SessionCall[] = items.map(item => {
      const output = item.debrief_session_id ? debriefMap.get(item.debrief_session_id) : null
      const contact = output?.contactSnapshot as Record<string, string> | undefined
      const spin = output?.spin as { composite?: number } | undefined
      const nextAction = output?.nextAction as { action?: string; when?: string } | undefined
      const objections = output?.objections as string[] | undefined

      return {
        date: item.completed_at ? new Date(item.completed_at).toLocaleDateString() : '',
        contactName: item.contact_name || '',
        title: item.contact_title || contact?.title || '',
        company: item.company || '',
        phone: item.phone || '',
        callDisposition: (output?.callDisposition as string) || '',
        prospectStatus: (output?.prospectStatus as string) || '',
        prospectStatusDetail: (output?.prospectStatusDetail as string) || '',
        currentSolution: (output?.currentSolution as string) || '',
        theTruth: (output?.theTruth as string) || '',
        spinComposite: spin?.composite ? String(spin.composite) : '',
        nextAction: nextAction?.action || '',
        nextActionWhen: nextAction?.when || '',
        aeBriefing: (output?.aeBriefing as string) || '',
        objections: objections?.join('; ') || '',
      }
    })

    const csv = generateActivityCSV(calls)
    const date = new Date().toISOString().split('T')[0]

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="vbrick-session-${date}.csv"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 })
  }
}
