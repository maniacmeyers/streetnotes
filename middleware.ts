import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const VBRICK_HOST = 'vbrick.streetnotes.ai'

function isVbrickHost(host: string): boolean {
  if (host === VBRICK_HOST || host.startsWith(VBRICK_HOST + ':')) return true
  if (process.env.VERCEL_ENV === 'preview') return true
  if (host.startsWith('localhost') && process.env.FORCE_VBRICK === 'true') return true
  return false
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  if (isVbrickHost(host)) {
    const { pathname } = request.nextUrl

    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/vbrick-site'
      return NextResponse.rewrite(url)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
