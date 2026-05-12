import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isVbrickUser } from '@/lib/vbrick/config'

export const runtime = 'nodejs'

// Resolve the caller's effective email. Prefer the authenticated Supabase
// session; fall back to a query-string email for the vbrick public tenant
// (which uses localStorage identity because /vbrick + /api are public at
// the middleware level).
async function resolveCallerEmail(request: Request): Promise<string | null> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (user?.email) return user.email.toLowerCase()

  const queryEmail = new URL(request.url).searchParams.get('email')
  if (queryEmail) return queryEmail.toLowerCase()

  return null
}

// DELETE: Remove a debrief session. Requires ownership.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const callerEmail = await resolveCallerEmail(request)
  if (!callerEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // If no Supabase session backed the call, restrict to known vbrick users.
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user && !isVbrickUser(callerEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('debrief_sessions')
    .select('email')
    .eq('id', params.id)
    .single()
  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if ((existing.email as string).toLowerCase() !== callerEmail) {
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
