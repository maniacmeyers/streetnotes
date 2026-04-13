import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNotification } from '@/lib/resend'

// In-memory IP rate limiter: max 5 signups per IP per 15 minutes
const ipWindow = new Map<string, { count: number; resetAt: number }>()
const IP_LIMIT = 5
const IP_WINDOW_MS = 15 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipWindow.get(ip)
  if (!entry || now > entry.resetAt) {
    ipWindow.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > IP_LIMIT
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.ip ||
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Store in Supabase waitlist table
    const supabase = createAdminClient()
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert({ email: cleanEmail })

    if (dbError && dbError.code !== '23505') {
      // 23505 = unique violation (already signed up) — that's fine
      console.error('Waitlist DB error:', dbError)
    }

    // Notify — awaited so Vercel doesn't kill the request
    await sendNotification(
      `New waitlist signup: ${cleanEmail}`,
      `New waitlist signup!\n\nEmail: ${cleanEmail}\nTime: ${new Date().toISOString()}`
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
