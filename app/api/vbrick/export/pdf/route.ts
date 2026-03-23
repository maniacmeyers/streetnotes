import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { VbrickSessionPDF } from '@/lib/vbrick/session-pdf'
import { calculateConversionRate } from '@/lib/vbrick/stats'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get session
    const { data: session } = await supabase
      .from('vbrick_calling_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get queue items
    const { data: items } = await supabase
      .from('vbrick_call_queue')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'completed')
      .order('queue_position', { ascending: true })

    // Get debrief data
    const debriefIds = (items || []).map(i => i.debrief_session_id).filter(Boolean)
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

    const calls = (items || []).map(item => {
      const output = item.debrief_session_id ? debriefMap.get(item.debrief_session_id) : null
      const spin = output?.spin as { composite?: number } | undefined

      return {
        contactName: item.contact_name,
        company: item.company,
        disposition: (output?.callDisposition as string) || 'unknown',
        prospectStatus: (output?.prospectStatus as string) || 'unknown',
        spinScore: spin?.composite ? Math.round(spin.composite * 10) / 10 : null,
      }
    })

    const totalCalls = calls.length
    const connectedCount = calls.filter(c => c.disposition === 'connected').length
    const appointmentsCount = calls.filter(c => c.prospectStatus === 'active-opportunity').length
    const spinScores = calls.map(c => c.spinScore).filter((s): s is number => s !== null)
    const averageSpin = spinScores.length > 0 ? spinScores.reduce((a, b) => a + b, 0) / spinScores.length : 0
    const bestSpin = spinScores.length > 0 ? Math.max(...spinScores) : 0
    const bestSpinCall = calls.find(c => c.spinScore === bestSpin)

    const bdrName = session.bdr_email.split('@')[0]
    const displayName = bdrName.charAt(0).toUpperCase() + bdrName.slice(1)
    const date = new Date(session.started_at).toLocaleDateString()

    const startTime = new Date(session.started_at)
    const endTime = session.ended_at ? new Date(session.ended_at) : new Date()
    const durationMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
    const duration = durationMins >= 60
      ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
      : `${durationMins}m`

    const pdfBuffer = await renderToBuffer(
      VbrickSessionPDF({
        bdrName: displayName,
        date,
        duration,
        totalCalls,
        connectedCount,
        appointmentsCount,
        convRate: calculateConversionRate(connectedCount, totalCalls),
        apptRate: calculateConversionRate(appointmentsCount, connectedCount),
        averageSpin: Math.round(averageSpin * 10) / 10,
        bestSpin: Math.round(bestSpin * 10) / 10,
        bestSpinContact: bestSpinCall?.contactName || '',
        calls,
      })
    )

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vbrick-session-${date}.pdf"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
