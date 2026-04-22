import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/resend'

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
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const company = typeof body.company === 'string' ? body.company.trim() : ''
    const role = typeof body.role === 'string' ? body.role.trim() : ''
    const note = typeof body.note === 'string' ? body.note.trim() : ''

    if (!name || !company || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Name, company, and a valid email are required.' },
        { status: 400 }
      )
    }

    const lines = [
      'Brand-leader contact request',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company}`,
      role ? `Role: ${role}` : null,
      note ? `\nNote:\n${note}` : null,
      '',
      `IP: ${ip}`,
      `Time: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n')

    await sendNotification(
      `Brand-leader contact: ${name} — ${company}`,
      lines
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
