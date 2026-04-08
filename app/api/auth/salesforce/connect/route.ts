import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.SALESFORCE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'Salesforce integration not configured' },
      { status: 500 }
    )
  }

  const state = randomBytes(32).toString('hex')
  const authBase = process.env.SALESFORCE_AUTH_URL || 'https://login.salesforce.com'
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri!,
    scope: 'api refresh_token',
    state,
    prompt: 'consent',
  })

  const authUrl = `${authBase}/services/oauth2/authorize?${params}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('sf_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  return response
}
