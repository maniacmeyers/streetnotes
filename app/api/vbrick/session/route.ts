import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find active session (no ended_at)
    const { data: session } = await supabase
      .from('vbrick_calling_sessions')
      .select('*')
      .eq('bdr_email', email.toLowerCase())
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!session) {
      return NextResponse.json({ session: null, queue: [] })
    }

    // Get queue for this session
    const { data: queue } = await supabase
      .from('vbrick_call_queue')
      .select('*')
      .eq('session_id', session.id)
      .order('queue_position', { ascending: true })

    return NextResponse.json({ session, queue: queue || [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email, contacts } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const supabase = await createClient()

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('vbrick_calling_sessions')
      .insert({
        bdr_email: email.toLowerCase(),
        csv_imported: !!contacts && contacts.length > 0,
      })
      .select()
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError?.message || 'Failed to create session' }, { status: 500 })
    }

    // Insert queue contacts if provided
    if (contacts && contacts.length > 0) {
      const queueRows = contacts.map((c: {
        contactName: string
        contactTitle?: string
        company: string
        phone?: string
        salesforceNotes?: string
      }, i: number) => ({
        session_id: session.id,
        contact_name: c.contactName,
        contact_title: c.contactTitle || null,
        company: c.company,
        phone: c.phone || null,
        salesforce_notes: c.salesforceNotes || null,
        queue_position: i + 1,
        status: 'pending',
      }))

      const { error: queueError } = await supabase
        .from('vbrick_call_queue')
        .insert(queueRows)

      if (queueError) {
        return NextResponse.json({ error: queueError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ sessionId: session.id })
  } catch {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get queue stats for this session
    const { data: queue } = await supabase
      .from('vbrick_call_queue')
      .select('*, debrief_session_id')
      .eq('session_id', sessionId)
      .eq('status', 'completed')

    const totalCalls = queue?.length || 0
    let connectedCount = 0
    let appointmentsCount = 0
    let spinSum = 0
    let spinCount = 0
    let bestSpin = 0

    // Get debrief data for completed calls
    if (queue && queue.length > 0) {
      const debriefIds = queue
        .map(q => q.debrief_session_id)
        .filter(Boolean)

      if (debriefIds.length > 0) {
        const { data: debriefs } = await supabase
          .from('debrief_sessions')
          .select('structured_output')
          .in('id', debriefIds)

        if (debriefs) {
          for (const d of debriefs) {
            const output = d.structured_output as Record<string, unknown>
            if (!output) continue

            if (output.callDisposition === 'connected') connectedCount++
            if (output.prospectStatus === 'active-opportunity') appointmentsCount++

            const spin = output.spin as { composite?: number } | undefined
            if (spin?.composite) {
              spinSum += spin.composite
              spinCount++
              if (spin.composite > bestSpin) bestSpin = spin.composite
            }
          }
        }
      }
    }

    // End the session
    const { error } = await supabase
      .from('vbrick_calling_sessions')
      .update({
        ended_at: new Date().toISOString(),
        total_calls: totalCalls,
        connected_count: connectedCount,
        appointments_count: appointmentsCount,
        average_spin: spinCount > 0 ? Math.round((spinSum / spinCount) * 10) / 10 : 0,
        best_spin: Math.round(bestSpin * 10) / 10,
      })
      .eq('id', sessionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      totalCalls,
      connectedCount,
      appointmentsCount,
      averageSpin: spinCount > 0 ? Math.round((spinSum / spinCount) * 10) / 10 : 0,
      bestSpin: Math.round(bestSpin * 10) / 10,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
  }
}
