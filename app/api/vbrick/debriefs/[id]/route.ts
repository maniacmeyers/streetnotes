import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isVbrickUser } from '@/lib/vbrick/config'

export const runtime = 'nodejs'

// Resolve the caller's effective email. Prefer the authenticated Supabase
// session; fall back to a query-string email for the vbrick public tenant
// (which uses localStorage identity because /vbrick + /api are public at
// the middleware level). DELETE requests carry no body, so a body-email
// fallback is intentionally omitted.
async function resolveCallerEmail(
  request: Request,
): Promise<{ email: string | null; isAuthenticated: boolean }> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (user?.email) {
    return { email: user.email.toLowerCase(), isAuthenticated: true }
  }

  const queryEmail = new URL(request.url).searchParams.get('email')
  return { email: queryEmail?.toLowerCase() ?? null, isAuthenticated: false }
}

// DELETE: Remove a debrief session. Requires ownership.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { email: callerEmail, isAuthenticated } = await resolveCallerEmail(request)
  if (!callerEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // If no Supabase session backed the call, restrict to known vbrick users.
  if (!isAuthenticated && !isVbrickUser(callerEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('debrief_sessions')
    .select('email')
    .eq('id', params.id)
    .single()
  if (fetchError) {
    console.error('Failed to fetch debrief session:', fetchError.message)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if ((existing.email ?? '').toLowerCase() !== callerEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: deleteError } = await supabase
    .from('debrief_sessions')
    .delete()
    .eq('id', params.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
