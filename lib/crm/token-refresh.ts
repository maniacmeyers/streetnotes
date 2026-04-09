import { SupabaseClient } from '@supabase/supabase-js'
import { encryptToken, decryptToken } from './encryption'

const REFRESH_BUFFER_MS = 5 * 60 * 1000 // 5 minutes before expiry

interface CrmConnection {
  id: string
  user_id: string
  crm_type: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  instance_url: string | null
}

interface DecryptedTokens {
  accessToken: string
  refreshToken: string | null
  instanceUrl: string | null
}

/**
 * Get a valid access token for the user's CRM connection.
 * Proactively refreshes if the token expires within 5 minutes.
 * Returns null if no connection exists or refresh fails.
 */
export async function getValidTokens(
  supabase: SupabaseClient,
  userId: string,
  crmType: 'salesforce' | 'hubspot' | 'pipedrive'
): Promise<DecryptedTokens | null> {
  const { data: conn, error } = await supabase
    .from('crm_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('crm_type', crmType)
    .single()

  if (error || !conn) return null

  const connection = conn as CrmConnection
  const now = Date.now()
  const expiresAt = connection.token_expires_at
    ? new Date(connection.token_expires_at).getTime()
    : 0

  const needsRefresh = expiresAt - now < REFRESH_BUFFER_MS

  if (needsRefresh && connection.refresh_token) {
    const refreshed = crmType === 'salesforce'
      ? await refreshSalesforceToken(connection, supabase)
      : await refreshHubSpotToken(connection, supabase)

    if (refreshed) return refreshed
    // If refresh fails, try the existing token — it might still be valid
  }

  return {
    accessToken: decryptToken(connection.access_token),
    refreshToken: connection.refresh_token
      ? decryptToken(connection.refresh_token)
      : null,
    instanceUrl: connection.instance_url,
  }
}

async function refreshSalesforceToken(
  conn: CrmConnection,
  supabase: SupabaseClient
): Promise<DecryptedTokens | null> {
  const authBase = process.env.SALESFORCE_AUTH_URL || 'https://login.salesforce.com'

  const res = await fetch(`${authBase}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptToken(conn.refresh_token!),
      client_id: process.env.SALESFORCE_CLIENT_ID!,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) {
    console.error('Salesforce token refresh failed:', await res.text())
    return null
  }

  const tokens = await res.json()
  const newAccessToken = tokens.access_token
  // Salesforce doesn't return a new refresh token on refresh
  const expiresAt = new Date(
    parseInt(tokens.issued_at) + 2 * 60 * 60 * 1000
  ).toISOString()

  await supabase
    .from('crm_connections')
    .update({
      access_token: encryptToken(newAccessToken),
      token_expires_at: expiresAt,
      instance_url: tokens.instance_url || conn.instance_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conn.id)

  return {
    accessToken: newAccessToken,
    refreshToken: conn.refresh_token ? decryptToken(conn.refresh_token) : null,
    instanceUrl: tokens.instance_url || conn.instance_url,
  }
}

async function refreshHubSpotToken(
  conn: CrmConnection,
  supabase: SupabaseClient
): Promise<DecryptedTokens | null> {
  const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptToken(conn.refresh_token!),
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) {
    console.error('HubSpot token refresh failed:', await res.text())
    return null
  }

  const tokens = await res.json()
  const expiresAt = new Date(
    Date.now() + tokens.expires_in * 1000
  ).toISOString()

  const encryptedAccess = encryptToken(tokens.access_token)
  const encryptedRefresh = tokens.refresh_token
    ? encryptToken(tokens.refresh_token)
    : conn.refresh_token // HubSpot returns new refresh token

  await supabase
    .from('crm_connections')
    .update({
      access_token: encryptedAccess,
      refresh_token: encryptedRefresh,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conn.id)

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || (conn.refresh_token ? decryptToken(conn.refresh_token) : null),
    instanceUrl: null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function refreshPipedriveToken(
  conn: CrmConnection,
  supabase: SupabaseClient
): Promise<DecryptedTokens | null> {
  const res = await fetch('https://oauth.pipedrive.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptToken(conn.refresh_token!),
      client_id: process.env.PIPEDRIVE_CLIENT_ID!,
      client_secret: process.env.PIPEDRIVE_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) {
    console.error('Pipedrive token refresh failed:', await res.text())
    return null
  }

  const tokens = await res.json()
  const newAccessToken = tokens.access_token
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null

  await supabase
    .from('crm_connections')
    .update({
      access_token: encryptToken(newAccessToken),
      refresh_token: tokens.refresh_token ? encryptToken(tokens.refresh_token) : conn.refresh_token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conn.id)

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || (conn.refresh_token ? decryptToken(conn.refresh_token) : null),
    instanceUrl: null,
  }
}
