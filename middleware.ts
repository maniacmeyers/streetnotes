import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const VBRICK_HOST = 'vbrick.streetnotes.ai'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // Route vbrick.streetnotes.ai to dedicated pages
  if (host === VBRICK_HOST || host.startsWith(VBRICK_HOST)) {
    const { pathname } = request.nextUrl

    // vbrick.streetnotes.ai/ → CRO landing page
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/vbrick-site'
      return NextResponse.rewrite(url)
    }

    // All other paths (dashboard, stories, intel, settings, playbook, api)
    // fall through to the regular StreetNotes app — the Vbrick tenant now
    // shares the same UI and includes Playbook as a bottom-nav tab.
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
