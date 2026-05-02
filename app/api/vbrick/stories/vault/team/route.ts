import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isVbrickUser } from '@/lib/vbrick/config'
import {
  ensureStandardPitchesForDomain,
  STANDARD_PITCH_DOMAINS,
} from '@/lib/vbrick/seeds/standard-pitches'

export const runtime = 'nodejs'

// "Team" is the caller's email domain. Two users at @acme.com are on the
// same team; a user at @gmail.com has no team (personal email providers
// are treated as "no team" and get an empty feed rather than a shared
// inbox of strangers' stories).
const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'pm.me',
  'gmx.com',
  'gmx.us',
  'zoho.com',
  'mail.com',
  'yandex.com',
  'yandex.ru',
  'fastmail.com',
  'hey.com',
  'tutanota.com',
  'tuta.io',
  'duck.com',
])

function extractDomain(email: string): string | null {
  const at = email.indexOf('@')
  if (at === -1 || at === email.length - 1) return null
  const domain = email.slice(at + 1).toLowerCase().trim()
  // Defensive: only allow standard DNS-label characters so this value is
  // safe to interpolate into an ILIKE pattern (Supabase parameterizes the
  // value too, but belt-and-braces).
  if (!/^[a-z0-9.-]+$/.test(domain)) return null
  return domain
}

// GET: Fetch team vault stories shared by peers on the caller's email
// domain, sorted by score.
export async function GET(request: Request) {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  const { searchParams } = new URL(request.url)
  const fallbackEmail = searchParams.get('email')
  const callerEmail = user?.email || fallbackEmail

  if (!callerEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // If identity came from querystring (no session), restrict to known vbrick users
  if (!user && !isVbrickUser(callerEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const domain = extractDomain(callerEmail)
  if (!domain || FREE_EMAIL_PROVIDERS.has(domain)) {
    // Personal / free email provider — no company team, empty feed.
    return NextResponse.json({ vault: [] })
  }

  const supabase = createAdminClient()

  // For authorized standard-pitch domains, lazily seed the 3 standard
  // elevator pitches if they're missing. Idempotent — no-op when already
  // seeded.
  if ((STANDARD_PITCH_DOMAINS as readonly string[]).includes(domain)) {
    try {
      await ensureStandardPitchesForDomain(supabase, domain)
    } catch {
      // Non-fatal — continue with whatever's already in the vault.
    }
  }

  const { data, error } = await supabase
    .from('story_vault_entries')
    .select('*')
    .eq('shared_to_team', true)
    .ilike('bdr_email', `%@${domain}`)
    .order('composite_score', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ vault: data || [] })
}
