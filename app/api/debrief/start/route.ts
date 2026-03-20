import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/resend'

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
    const isVbrick = cleanEmail.endsWith('@vbrick.com')

    // Rate limit: 3 per day per email (skip for Vbrick)
    if (!isVbrick) {
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
    const { error: waitlistError } = await supabase
      .from('waitlist')
      .insert({ email: cleanEmail })

    if (waitlistError && waitlistError.code !== '23505') {
      // 23505 = unique violation (already on waitlist) — that's fine
      console.error('Debrief waitlist sync error:', waitlistError)
    }

    // Notify — awaited so Vercel doesn't kill the request
    await sendNotification(
      `Brain Dump started: ${cleanEmail}`,
      `New Brain Dump session\n\nEmail: ${cleanEmail}\nSession: ${data.id}\nTime: ${new Date().toISOString()}`
    )

    return NextResponse.json({ sessionId: data.id })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
