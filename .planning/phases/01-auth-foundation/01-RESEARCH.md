# Phase 1: Auth Foundation - Research

**Researched:** 2026-02-18
**Domain:** Supabase Auth + @supabase/ssr + Next.js 14 App Router + PostgreSQL RLS
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire auth system and project scaffold. The locked decisions are solid: `@supabase/ssr` v0.8 with `createBrowserClient`/`createServerClient` is the current correct approach for Next.js 14 App Router. The `auth-helpers-nextjs` package is deprecated and must not be used.

One significant finding: The original decision specified `getUser()` for server-side auth validation, but Supabase's current documentation (verified via official docs, February 2026) recommends `getClaims()` as the preferred approach. `getClaims()` validates the JWT signature against the project's published public keys without always hitting the Auth server, making it faster and equally secure for most cases. The locked decision to avoid `getSession()` remains 100% correct — `getSession()` is insecure server-side. The planner must decide: stick with `getUser()` (safe, always server-validated) or adopt `getClaims()` (faster, locally validated). Both are more secure than `getSession()`. This research recommends flagging the distinction but not overriding the user's explicit decision without their input.

A second finding: Supabase now uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (format: `sb_publishable_...`) rather than the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`. New projects created after November 2025 no longer have the anon key. The env variable name in code and docs has changed.

Google OAuth via Supabase Auth requires an `/auth/callback` route handler that exchanges the OAuth code for a session using `supabase.auth.exchangeCodeForSession(code)`. This is the PKCE flow — no custom JWT handling needed.

**Primary recommendation:** Scaffold with `@supabase/ssr` createServerClient in middleware + server components, createBrowserClient in client components, and the `/auth/callback` route handler for Google OAuth. Use `getUser()` per locked decision (revisit `getClaims()` with user if performance matters).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | v2.97.0 (latest as of 2026-02-18) | Supabase client | Official client library |
| `@supabase/ssr` | v0.8.0 | Cookie-based auth for SSR frameworks | Replaces deprecated auth-helpers; official Supabase recommendation |
| `next` | 14.x | App Router framework | Locked decision |
| `tailwindcss` | 3.x (v3 is stable; v4 available but ecosystem still maturing) | Utility-first CSS | Locked decision |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `typescript` | 5.x | Type safety | Always — included in Next.js scaffold |
| `tailwindcss-safe-area` | latest | iOS safe area inset utilities for Tailwind | Use for bottom nav/fixed elements near home indicator |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | auth-helpers is deprecated — do not use |
| Supabase Auth (Google OAuth) | next-auth for user login | next-auth is reserved for CRM OAuth (Phase 4) per project design |
| `getUser()` | `getClaims()` | `getClaims()` is faster (local JWT validation); `getUser()` always calls Auth server. Both are secure. User decided `getUser()` — see Open Questions. |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D tailwindcss-safe-area
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Email/password + Google OAuth sign-in
│   └── sign-up/
│       └── page.tsx          # New account creation
├── auth/
│   ├── callback/
│   │   └── route.ts          # OAuth callback — exchanges code for session
│   └── auth-code-error/
│       └── page.tsx          # OAuth error fallback
├── (protected)/
│   ├── layout.tsx            # Auth guard: redirects unauthenticated to /login
│   └── dashboard/
│       └── page.tsx          # Post-login landing page
├── layout.tsx                # Root layout with viewport meta (safe area)
└── globals.css               # Tailwind base styles

lib/
└── supabase/
    ├── client.ts             # createBrowserClient (Client Components)
    ├── server.ts             # createServerClient (Server Components, Route Handlers, Actions)
    └── middleware.ts         # updateSession — cookie token refresh logic

middleware.ts                 # Next.js middleware entry — calls updateSession
```

### Pattern 1: Browser Client (Client Components)
**What:** Creates a Supabase client that runs in the browser with cookie-based auth
**When to use:** Any `'use client'` component that needs Supabase

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### Pattern 2: Server Client (Server Components, Route Handlers, Server Actions)
**What:** Creates a Supabase client with cookie access from next/headers
**When to use:** Any server-side code that needs Supabase

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies directly.
            // The middleware handles this. The try/catch prevents errors.
          }
        },
      },
    }
  )
}
```

**Note:** In Next.js 14 App Router, `cookies()` from `next/headers` is async. Use `await cookies()`.

### Pattern 3: Middleware (Token Refresh + Route Protection)
**What:** Refreshes auth tokens on every request and protects routes
**When to use:** Always — this is required for SSR auth to work

```typescript
// Source: https://github.com/orgs/supabase/discussions/21468
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() triggers token refresh if needed
  // Per locked decision: use getUser() not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/sign-up') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

```typescript
// middleware.ts (root of project)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 4: Google OAuth Callback Route Handler
**What:** Exchanges OAuth authorization code for a Supabase session (PKCE flow)
**When to use:** Required for any OAuth provider — Google OAuth will redirect here

```typescript
// Source: https://supabase.com/docs/guides/auth/social-login/auth-google
// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'

  // Prevent open redirect attacks
  if (!next.startsWith('/')) next = '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      return NextResponse.redirect(
        isLocalEnv
          ? `${origin}${next}`
          : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`
      )
    }
  }

  // Return user to error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

### Pattern 5: Protected Route Layout (Server Component Auth Guard)
**What:** Server Component that checks auth and redirects unauthenticated users
**When to use:** `(protected)/layout.tsx` — wraps all authenticated pages

```typescript
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
```

### Pattern 6: Google OAuth Sign-In Trigger (Client Component)
**What:** Initiates Google OAuth PKCE flow from a button click
**When to use:** Login page OAuth button

```typescript
// Source: https://supabase.com/docs/guides/auth/social-login/auth-google
'use client'
import { createClient } from '@/lib/supabase/client'

export function GoogleSignInButton() {
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button onClick={handleGoogleSignIn} className="min-h-[44px] min-w-[44px] ...">
      Sign in with Google
    </button>
  )
}
```

### Pattern 7: Email/Password Auth (Server Action)
**What:** Sign-up and sign-in via email/password using Server Actions
**When to use:** Email/password forms in login and sign-up pages

```typescript
// app/(auth)/login/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    redirect('/sign-up?error=Could not create account')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

### Pattern 8: Root Layout with Mobile Viewport Meta
**What:** Sets up viewport for safe-area support on iOS notched devices
**When to use:** `app/layout.tsx` — required once

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // Required for safe-area-inset CSS env() to work on iOS
}
```

### Anti-Patterns to Avoid
- **Using `getSession()` server-side:** It's not guaranteed to revalidate the token — can return spoofed sessions. Always use `getUser()` or `getClaims()` server-side.
- **Importing `@supabase/auth-helpers-nextjs`:** Deprecated. Will not receive bug fixes. Use `@supabase/ssr`.
- **Creating Supabase client without cookie handling in middleware:** Without the cookie `setAll` in middleware, token refresh won't propagate to the browser. The middleware MUST write cookies to both request and response.
- **Using `NEXT_PUBLIC_SUPABASE_ANON_KEY` for new projects:** New Supabase projects (after Nov 2025) use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Check the Supabase dashboard for which key your project has.
- **Not wrapping `auth.uid()` in a subquery in RLS:** Call `(select auth.uid())` not `auth.uid()` directly — the subquery form lets Postgres cache the result per statement, giving up to 95% better performance on large tables.
- **Forgetting `CREATE INDEX` on `user_id` columns with RLS:** Without an index, `user_id = (select auth.uid())` does a sequential scan on every row. Add `CREATE INDEX ON table_name (user_id)`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token refresh in SSR | Custom cookie management | `@supabase/ssr` updateSession middleware | Race conditions, secure HttpOnly cookie requirements, edge cases with token expiry during requests |
| OAuth callback handling | Custom code exchange | `supabase.auth.exchangeCodeForSession(code)` | PKCE code verifier must match — manually implementing gets the flow wrong |
| Session persistence across tabs | Custom localStorage sync | Built-in `@supabase/supabase-js` | Library handles BroadcastChannel sync automatically |
| Auth state changes in UI | Custom polling | `supabase.auth.onAuthStateChange()` | Library fires events on sign in/out, token refresh |
| Password strength validation | Custom regex | Native HTML5 `minlength` + Supabase's own validation | Supabase enforces minimum 6 chars server-side; HTML attributes prevent bad UX |
| Row-level access control | Manual `WHERE user_id = ?` in every query | PostgreSQL RLS with `auth.uid()` | RLS enforces at DB level — survives any query path including direct API calls |

**Key insight:** Supabase Auth + `@supabase/ssr` handles the hardest parts of SSR auth (token refresh races, secure cookie handling, PKCE OAuth). The middleware pattern is non-negotiable for App Router — without it, Server Components get stale tokens.

## Database Schema

### Tables Required for Phase 1

```sql
-- Enable UUID extension (if not enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes table (Phase 1 schema — expanded in later phases)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT,
  raw_transcript TEXT,
  structured_output JSONB,
  status TEXT NOT NULL DEFAULT 'draft' -- 'draft', 'reviewed', 'pushed'
);

-- CRM connections table
CREATE TABLE crm_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_type TEXT NOT NULL, -- 'salesforce' | 'hubspot'
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, crm_type)
);

-- Deal stage cache table
CREATE TABLE deal_stage_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_type TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]',
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_cache ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own notes"
  ON notes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- CRM connections policies
CREATE POLICY "Users can view their own CRM connections"
  ON crm_connections FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own CRM connections"
  ON crm_connections FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own CRM connections"
  ON crm_connections FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own CRM connections"
  ON crm_connections FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- Deal stage cache policies
CREATE POLICY "Users can manage their own deal stage cache"
  ON deal_stage_cache FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Performance: indexes on user_id columns
CREATE INDEX notes_user_id_idx ON notes (user_id);
CREATE INDEX crm_connections_user_id_idx ON crm_connections (user_id);
CREATE INDEX deal_stage_cache_user_id_idx ON deal_stage_cache (user_id);
```

## Mobile-First Layout (UI-01)

### Thumb Zone Rules for Tailwind
```
iPhone 14 screen: 390px wide × 844px tall (logical pixels)
Thumb-friendly zone: bottom 60% of screen
Danger zone: top 15% (hard to reach one-handed)

Key Tailwind utilities:
- min-h-[44px] min-w-[44px]  — WCAG minimum tap target
- p-3 or p-4                  — padding to expand tap area without visual size change
- text-base or text-lg        — minimum readable size (16px+)
- pb-safe                     — safe area bottom padding (requires tailwindcss-safe-area plugin)
```

### Root Layout Tailwind Classes
```typescript
// Mobile shell: full-height, no scroll bounce, safe area padding
<body className="min-h-screen bg-white antialiased">
  <main className="max-w-md mx-auto min-h-screen flex flex-col">
    {children}
  </main>
</body>
```

### Viewport Meta (Required for iOS safe areas)
```typescript
// app/layout.tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}
```

### tailwindcss-safe-area Setup
```javascript
// tailwind.config.ts
import safeArea from 'tailwindcss-safe-area'

export default {
  plugins: [safeArea],
}
// Usage: pb-safe, pt-safe, px-safe for safe area padding
```

## Common Pitfalls

### Pitfall 1: Using `NEXT_PUBLIC_SUPABASE_ANON_KEY` on New Projects
**What goes wrong:** Environment variable not found; Supabase client initializes with undefined key; auth fails silently
**Why it happens:** Supabase changed to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for new projects after Nov 2025
**How to avoid:** Check the Supabase dashboard API settings to confirm which key format your project uses. If `sb_publishable_...`, use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
**Warning signs:** Supabase client returns 401 on all requests; `getUser()` returns null immediately

### Pitfall 2: Forgetting `await cookies()` in Next.js 14
**What goes wrong:** TypeScript error or runtime error because `cookies()` returns a Promise in Next.js 14
**Why it happens:** `cookies()` from `next/headers` became async in Next.js 14 App Router
**How to avoid:** Always `await cookies()` before using it in server.ts
**Warning signs:** Type error: "Property 'getAll' does not exist on type 'Promise'"

### Pitfall 3: Not Writing Cookies to Both Request and Response in Middleware
**What goes wrong:** Token refreshes in middleware but Server Components still see the old token. User appears logged out on server components after token refresh.
**Why it happens:** The middleware must pass refreshed tokens both forward (to Server Components via `request.cookies.set`) and back (to browser via `response.cookies.set`)
**How to avoid:** Use the exact cookie pattern shown in Pattern 3 — it recreates `supabaseResponse` and sets cookies on both sides.
**Warning signs:** Infinite redirect loops; user gets logged out intermittently on token expiry

### Pitfall 4: Wrong Google OAuth Redirect URI
**What goes wrong:** Google OAuth returns error; "redirect_uri_mismatch"
**Why it happens:** The redirect URI in Google Cloud Console must exactly match the Supabase callback URL and what's passed to `signInWithOAuth`
**How to avoid:** In Google Cloud Console, add exactly the URI from the Supabase Dashboard Google provider page. For local dev: `http://127.0.0.1:54321/auth/v1/callback`. For production: your Supabase project's callback URL.
**Warning signs:** OAuth flow completes at Google but redirects to error page; "redirect_uri_mismatch" in URL

### Pitfall 5: RLS Without Indexes on `user_id`
**What goes wrong:** Queries work correctly but become extremely slow as data grows; timeouts on large tables
**Why it happens:** `user_id = (select auth.uid())` without an index causes full table scans on every query
**How to avoid:** Add `CREATE INDEX ON table_name (user_id)` for every RLS-protected table
**Warning signs:** Queries fast in development (small data) but slow in production

### Pitfall 6: Missing `/auth/callback` Route for Google OAuth
**What goes wrong:** After Google authentication, user lands on an error page or the code exchange never happens
**Why it happens:** Google OAuth PKCE flow requires a callback route to exchange the authorization code for a session
**How to avoid:** Create `app/auth/callback/route.ts` with `exchangeCodeForSession(code)` exactly as shown in Pattern 4
**Warning signs:** Google sign-in button redirects to Google successfully but never completes sign-in

### Pitfall 7: Redirect After Sign-In Loops Back to Login
**What goes wrong:** User signs in, gets redirected to `/dashboard`, middleware detects no session, redirects back to `/login`
**Why it happens:** The cookie set during sign-in hasn't been processed by the middleware yet; or middleware matcher includes the auth callback route
**How to avoid:** Ensure `/auth` paths are excluded from the redirect-to-login logic in middleware. Use `revalidatePath('/', 'layout')` after sign-in server actions.
**Warning signs:** Sign-in appears to succeed but user immediately ends up back at login

## Code Examples

### Sign Out from Any Page (Server Action)
```typescript
// Source: Supabase official docs pattern
// Can be called from a form in any layout component
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

### Get Current User in Server Component
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <div>Hello {user.email}</div>
}
```

### Checking Auth State in a Client Component
```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  return user ? <span>Signed in</span> : <span>Signed out</span>
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023, fully deprecated by 2024 | Auth helpers won't get updates; SSR package is the supported path |
| `getSession()` server-side | `getUser()` or `getClaims()` | 2024 | `getSession()` is insecure server-side; can be spoofed |
| `getUser()` everywhere | `getClaims()` preferred, `getUser()` for sensitive ops | Early 2025 | `getClaims()` uses local JWT validation — faster, less Auth server load |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Nov 2025 | New projects only get publishable key format |
| `auth.uid()` directly in RLS | `(select auth.uid())` subquery | Ongoing | Subquery form caches result per-statement, 95% perf improvement |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated. Do not import. Use `@supabase/ssr`.
- `createMiddlewareClient` / `createServerComponentClient` / `createClientComponentClient`: All deprecated imports from auth-helpers. Use `createServerClient` / `createBrowserClient` from `@supabase/ssr`.
- `cookies().get()` / `cookies().set()` (non-async): In Next.js 14, `cookies()` is async — use `await cookies()` first, then call `.getAll()` / `.set()`.

## Open Questions

1. **`getUser()` vs `getClaims()` — Should the locked decision be revisited?**
   - What we know: The locked decision is `getUser()`. However, Supabase's current official docs (Feb 2026) now recommend `getClaims()` as the preferred server-side method. `getClaims()` validates JWT locally (using the project's JWKS endpoint, often cached). `getUser()` always hits the Auth server, adding latency.
   - What's unclear: Whether the project uses asymmetric JWT signing keys (if not, `getClaims()` falls back to server call anyway, matching `getUser()` behavior).
   - Recommendation: Flag to user. `getUser()` is safe and correct per locked decision. `getClaims()` is a performance optimization. For MVP with low traffic, `getUser()` is fine. Planner should use `getUser()` per locked decision but add a comment noting `getClaims()` as a future optimization.

2. **Supabase local development setup — Supabase CLI vs hosted project?**
   - What we know: The project uses Supabase (hosted). No indication of Supabase CLI / local dev setup in requirements.
   - What's unclear: Whether the team wants `supabase/migrations` in the repo and a local Supabase instance for dev, or to use the hosted dashboard directly.
   - Recommendation: For MVP, use the hosted Supabase project. Planner should note this choice. If the team wants migrations in the repo, add `supabase init` and `supabase db push` steps.

3. **Email confirmation flow for sign-up**
   - What we know: Supabase by default sends a confirmation email before allowing sign-in with email/password.
   - What's unclear: Whether the project wants email confirmation enabled or disabled for MVP.
   - Recommendation: For fastest MVP iteration, disable email confirmation in Supabase Auth settings (Authentication > Email Templates > Confirm Email toggle). Can be re-enabled before production.

## Sources

### Primary (HIGH confidence)
- `https://supabase.com/docs/guides/auth/server-side/nextjs` - Complete SSR setup guide, createServerClient, createBrowserClient, middleware pattern
- `https://supabase.com/docs/guides/auth/server-side/creating-a-client` - Server/browser client creation code
- `https://supabase.com/docs/guides/auth/social-login/auth-google` - Google OAuth callback route, PKCE flow, Google Cloud Console setup
- `https://supabase.com/docs/guides/database/postgres/row-level-security` - RLS policy patterns, auth.uid() subquery optimization, indexing
- `https://supabase.com/docs/reference/javascript/auth-getclaims` - getClaims() API reference, comparison with getUser()

### Secondary (MEDIUM confidence)
- `https://github.com/orgs/supabase/discussions/21468` - updateSession function pattern (community discussion, matches official docs patterns)
- `https://github.com/supabase/supabase/issues/40985` - getClaims vs getUser clarification (official Supabase team participated)
- `https://github.com/orgs/supabase/discussions/29260` - PUBLISHABLE_KEY vs ANON_KEY migration details

### Tertiary (LOW confidence)
- WebSearch results for Tailwind mobile safe area patterns — verified that `viewport-fit=cover` is required and `tailwindcss-safe-area` package exists, but specific usage patterns not verified against official Tailwind docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against GitHub releases (supabase-js v2.97.0 confirmed Feb 18, 2026); @supabase/ssr v0.8 confirmed in project context
- Architecture: HIGH — code patterns verified against official Supabase documentation
- Pitfalls: HIGH — sourced from official docs, GitHub issues with Supabase team participation
- RLS policies: HIGH — directly from official Supabase RLS documentation
- Mobile/Tailwind: MEDIUM — safe area patterns verified via web search + MDN/community sources, not Tailwind Context7

**Research date:** 2026-02-18
**Valid until:** 2026-03-20 (30 days — @supabase/ssr is active development but stable API)
