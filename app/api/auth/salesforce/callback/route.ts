import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crm/encryption'
import { fetchSalesforceSchema } from '@/lib/crm/salesforce'
import { storeCachedSchema } from '@/lib/crm/schema/cache'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')
  const storedState = request.cookies.get('sf_oauth_state')?.value

  // CSRF check
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL('/settings?error=csrf_mismatch', request.url)
    )
  }

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/settings?error=${error || 'no_code'}`, request.url)
    )
  }

  // Exchange authorization code for tokens
  const authBase = process.env.SALESFORCE_AUTH_URL || 'https://login.salesforce.com'
  const tokenRes = await fetch(`${authBase}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.SALESFORCE_CLIENT_ID!,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
      redirect_uri: process.env.SALESFORCE_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    console.error('Salesforce token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(
      new URL('/settings?error=token_exchange_failed', request.url)
    )
  }

  const tokens = await tokenRes.json()
  const { access_token, refresh_token, instance_url, issued_at } = tokens

  // Salesforce access tokens expire after the session timeout (default 2 hours)
  const expiresAt = new Date(
    parseInt(issued_at) + 2 * 60 * 60 * 1000
  ).toISOString()

  // Encrypt tokens and upsert into crm_connections
  const { error: dbError } = await supabase
    .from('crm_connections')
    .upsert(
      {
        user_id: user.id,
        crm_type: 'salesforce',
        access_token: encryptToken(access_token),
        refresh_token: refresh_token ? encryptToken(refresh_token) : null,
        token_expires_at: expiresAt,
        instance_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,crm_type' }
    )

  if (dbError) {
    console.error('Failed to store Salesforce tokens:', dbError)
    return NextResponse.redirect(
      new URL('/settings?error=db_save_failed', request.url)
    )
  }

  // Fire-and-forget schema warm — failures are caught and don't block the redirect
  void (async () => {
    try {
      const crmSchema = await fetchSalesforceSchema(supabase, user.id)
      await storeCachedSchema(supabase, user.id, 'salesforce', crmSchema)
    } catch (err) {
      console.error('Schema warm failed (non-blocking):', err)
    }
  })()

  const response = NextResponse.redirect(
    new URL('/settings?connected=salesforce', request.url)
  )
  response.cookies.delete('sf_oauth_state')

  return response
}
