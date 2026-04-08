import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.PIPEDRIVE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'Pipedrive integration not configured' },
      { status: 500 }
    )
  }

  const state = randomBytes(32).toString('hex')
  const redirectUri = process.env.PIPEDRIVE_REDIRECT_URI

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri!,
    response_type: 'code',
    state,
  })

  const authUrl = `https://oauth.pipedrive.com/oauth/authorize?${params}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('pd_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  return response
}