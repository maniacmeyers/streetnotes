import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crm/encryption'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL('/settings?error=pipedrive_oauth_failed', request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings?error=pipedrive_oauth_invalid', request.url)
    )
  }

  // Verify state
  const storedState = request.cookies.get('pd_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/settings?error=pipedrive_oauth_csrf', request.url)
    )
  }

  const clientId = process.env.PIPEDRIVE_CLIENT_ID
  const clientSecret = process.env.PIPEDRIVE_CLIENT_SECRET
  const redirectUri = process.env.PIPEDRIVE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(
      new URL('/settings?error=pipedrive_config_missing', request.url)
    )
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth.pipedrive.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL('/settings?error=pipedrive_token_exchange_failed', request.url)
    )
  }

  const tokenData = await tokenRes.json()
  const { access_token, refresh_token, expires_in } = tokenData

  if (!access_token) {
    return NextResponse.redirect(
      new URL('/settings?error=pipedrive_token_missing', request.url)
    )
  }

  // Calculate expiry
  const expiresAt = expires_in
    ? new Date(Date.now() + expires_in * 1000).toISOString()
    : null

  // Encrypt tokens
  const encryptedAccess = encryptToken(access_token)
  const encryptedRefresh = refresh_token ? encryptToken(refresh_token) : null

  // Store in Supabase
  const { error: upsertError } = await supabase
    .from('crm_connections')
    .upsert(
      {
        user_id: user.id,
        crm_type: 'pipedrive',
        access_token: encryptedAccess,
        refresh_token: encryptedRefresh,
        token_expires_at: expiresAt,
      },
      { onConflict: 'user_id,crm_type' }
    )

  if (upsertError) {
    return NextResponse.redirect(
      new URL('/settings?error=pipedrive_storage_failed', request.url)
    )
  }

  // Clear state cookie and redirect to success
  const response = NextResponse.redirect(new URL('/settings?success=pipedrive_connected', request.url))
  response.cookies.set('pd_oauth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}