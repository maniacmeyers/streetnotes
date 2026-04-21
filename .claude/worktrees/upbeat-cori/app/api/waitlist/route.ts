import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/resend'

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

    // Notify — awaited so Vercel doesn't kill the request
    await sendNotification(
      `New waitlist signup: ${email}`,
      `New waitlist signup!\n\nEmail: ${email}\nTime: ${new Date().toISOString()}`
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
