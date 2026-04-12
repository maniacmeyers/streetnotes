import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crm/encryption'
import { fetchHubspotSchema } from '@/lib/crm/hubspot'
import { storeCachedSchema } from '@/lib/crm/schema/cache'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const storedState = request.cookies.get('hs_oauth_state')?.value

  // CSRF check
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL('/settings?error=csrf_mismatch', request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=no_code', request.url)
    )
  }

  // Exchange authorization code for tokens
  const tokenRes = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: process.env.HUBSPOT_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    console.error('HubSpot token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(
      new URL('/settings?error=token_exchange_failed', request.url)
    )
  }

  const tokens = await tokenRes.json()
  const { access_token, refresh_token, expires_in } = tokens

  // HubSpot tokens expire in 30 minutes (1800 seconds)
  const expiresAt = new Date(
    Date.now() + expires_in * 1000
  ).toISOString()

  const { error: dbError } = await supabase
    .from('crm_connections')
    .upsert(
      {
        user_id: user.id,
        crm_type: 'hubspot',
        access_token: encryptToken(access_token),
        refresh_token: refresh_token ? encryptToken(refresh_token) : null,
        token_expires_at: expiresAt,
        instance_url: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,crm_type' }
    )

  if (dbError) {
    console.error('Failed to store HubSpot tokens:', dbError)
    return NextResponse.redirect(
      new URL('/settings?error=db_save_failed', request.url)
    )
  }

  // Fire-and-forget schema warm — failures are caught and don't block the redirect
  void (async () => {
    try {
      const crmSchema = await fetchHubspotSchema(supabase, user.id)
      await storeCachedSchema(supabase, user.id, 'hubspot', crmSchema)
    } catch (err) {
      console.error('Schema warm failed (non-blocking):', err)
    }
  })()

  const response = NextResponse.redirect(
    new URL('/settings?connected=hubspot', request.url)
  )
  response.cookies.delete('hs_oauth_state')

  return response
}
