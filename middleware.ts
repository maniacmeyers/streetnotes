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

    // vbrick.streetnotes.ai/dashboard → command center
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      const url = request.nextUrl.clone()
      url.pathname = `/vbrick${pathname}`
      return NextResponse.rewrite(url)
    }

    // vbrick.streetnotes.ai/api/... → pass through (APIs needed by dashboard)
    if (pathname.startsWith('/api/')) {
      return await updateSession(request)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
