import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body?.email

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const supabase = await createClient()

    // Rate limit: 3 per day per email
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString()

    const { count } = await supabase
      .from('debrief_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('email', cleanEmail)
      .gte('created_at', twentyFourHoursAgo)

    if (count !== null && count >= 3) {
      return NextResponse.json(
        {
          error:
            "You've hit the limit — 3 debriefs per day. Come back tomorrow.",
        },
        { status: 429 }
      )
    }

    // Create session
    const { data, error: dbError } = await supabase
      .from('debrief_sessions')
      .insert({ email: cleanEmail })
      .select('id')
      .single()

    if (dbError || !data) {
      console.error('Debrief session insert error:', dbError)
      return NextResponse.json(
        { error: 'Something went wrong.' },
        { status: 500 }
      )
    }

    // Also add to waitlist (ignore duplicate)
    await supabase
      .from('waitlist')
      .insert({ email: cleanEmail })
      .select()
      .maybeSingle()

    // Resend notification (non-blocking, fire-and-forget)
    if (process.env.RESEND_API_KEY) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'StreetNotes <debrief@streetnotes.ai>',
          to: 'jeff@forgetime.ai',
          subject: `Brain Dump started: ${cleanEmail}`,
          text: `New Brain Dump session\n\nEmail: ${cleanEmail}\nTime: ${new Date().toISOString()}`,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ sessionId: data.id })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
