import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Store in Supabase waitlist table
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert({ email: email.toLowerCase().trim() })

    if (dbError && dbError.code !== '23505') {
      // 23505 = unique violation (already signed up) — that's fine
      console.error('Waitlist DB error:', dbError)
    }

    // Send notification email via mailto fallback — use Supabase Edge Function or
    // a simple fetch to a webhook. For now, we'll use Resend if available,
    // otherwise just store in DB.
    const NOTIFY_EMAIL = 'jeff@forgetime.ai'

    // Try sending via Resend if API key exists
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'StreetNotes Waitlist <waitlist@streetnotes.ai>',
          to: NOTIFY_EMAIL,
          subject: `New waitlist signup: ${email}`,
          text: `New waitlist signup!\n\nEmail: ${email}\nTime: ${new Date().toISOString()}`,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
