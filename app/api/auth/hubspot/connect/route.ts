import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

const HUBSPOT_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.contacts.write',
  'crm.objects.deals.read',
  'crm.objects.deals.write',
  'crm.schemas.deals.read',
  'crm.objects.owners.read',
].join(' ')

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.HUBSPOT_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'HubSpot integration not configured' },
      { status: 500 }
    )
  }

  const state = randomBytes(32).toString('hex')
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri!,
    scope: HUBSPOT_SCOPES,
    state,
  })

  const authUrl = `https://app.hubspot.com/oauth/authorize?${params}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('hs_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
