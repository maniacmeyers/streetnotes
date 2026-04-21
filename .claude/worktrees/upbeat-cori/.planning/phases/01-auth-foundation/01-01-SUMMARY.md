---
phase: 01-auth-foundation
plan: 01
subsystem: auth
tags: [nextjs, tailwind, supabase, typescript, ssr, middleware, safe-area, ios]

# Dependency graph
requires: []
provides:
  - Next.js 14 App Router project scaffold with TypeScript and Tailwind CSS
  - Supabase browser client (createBrowserClient via @supabase/ssr)
  - Supabase server client (createServerClient with async cookies)
  - Supabase middleware utility (updateSession with dual cookie write)
  - Next.js root middleware wiring session refresh on every request
  - Mobile-first root layout with iOS safe-area viewport support
affects: [02-auth-ui, 03-voice-recording, 04-ai-processing, 05-crm-integration, 06-polish]

# Tech tracking
tech-stack:
  added:
    - next@14.2.35
    - react@18
    - "@supabase/supabase-js"
    - "@supabase/ssr"
    - tailwindcss@3.4.19
    - tailwindcss-safe-area@0.1.0
    - typescript
    - eslint
  patterns:
    - Supabase SSR pattern with dual cookie write in middleware (request + response)
    - getUser() not getSession() for server-side auth (spoofing protection)
    - Async cookies() pattern for server-side Supabase client
    - Mobile-first layout with max-w-md centered container

key-files:
  created:
    - lib/supabase/client.ts
    - lib/supabase/server.ts
    - lib/supabase/middleware.ts
    - middleware.ts
    - app/globals.css
    - app/page.tsx
    - app/layout.tsx
    - .env.local.example
    - .gitignore
    - package.json
    - tailwind.config.ts
    - tsconfig.json
    - next.config.mjs
    - postcss.config.mjs
  modified: []

key-decisions:
  - "Used tailwindcss-safe-area@0.1.0 (Tailwind v3 plugin) not v1.3.0 (Tailwind v4 CSS-only, incompatible)"
  - "Used require() not ESM import for tailwindcss-safe-area in tailwind.config.ts (no type declarations)"
  - "getUser() used in middleware (not getSession()) per locked project decision"
  - "Public routes: /login, /sign-up, /auth — all others redirect to /login when unauthenticated"

patterns-established:
  - "Pattern 1: lib/supabase/{client,server,middleware}.ts — three-file pattern for Supabase SSR utilities"
  - "Pattern 2: Dual cookie write in updateSession — cookies set on both request and supabaseResponse"
  - "Pattern 3: Root layout with viewport export — required for iOS env(safe-area-inset-*) CSS vars"

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 1 Plan 1: Project Scaffold and Supabase Wiring Summary

**Next.js 14 App Router scaffold with @supabase/ssr three-client pattern (browser/server/middleware) and iOS safe-area viewport, ready for auth UI implementation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T21:45:24Z
- **Completed:** 2026-02-18T21:50:09Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- Next.js 14 project scaffolded with TypeScript, Tailwind CSS v3, ESLint, and App Router
- All three Supabase SSR utilities created: browser client, async server client, middleware with dual cookie write
- Root middleware wires session refresh on every non-static request; unauthenticated users redirected to /login
- Root layout exports viewport with viewportFit: 'cover' enabling iOS safe-area CSS env() vars
- Tailwind safe-area plugin installed for padding/margin utilities in later mobile UI phases

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Next.js project and install all dependencies** - `a94070d` (feat)
2. **Task 2: Create Supabase client utilities, middleware, and root layout** - `b856296` (feat)

**Plan metadata:** (pending — docs commit after SUMMARY.md)

## Files Created/Modified

- `lib/supabase/client.ts` - createBrowserClient for Client Components
- `lib/supabase/server.ts` - async createServerClient with cookie handlers for Server Components and Route Handlers
- `lib/supabase/middleware.ts` - updateSession with dual cookie write and route protection
- `middleware.ts` - Root Next.js middleware calling updateSession with static asset exclusion matcher
- `app/layout.tsx` - Inter font, viewport export with viewportFit cover, mobile-first max-w-md container
- `app/page.tsx` - Simple redirect to /login
- `app/globals.css` - Tailwind directives only
- `tailwind.config.ts` - Safe-area plugin, corrected content paths for app/ and lib/
- `tsconfig.json` - Path alias corrected from ./src/* to ./*
- `.env.local.example` - Documents NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- `.gitignore` - Standard Next.js gitignore
- `package.json` - All project dependencies

## Decisions Made

- Used `tailwindcss-safe-area@0.1.0` not `@1.3.0` — v1.3.0 is CSS-only (Tailwind v4 style), fails in Next.js 14 webpack
- Used `require()` not ESM `import` for safe-area plugin in tailwind.config.ts to avoid TypeScript "no declaration file" error
- Followed locked decision: `getUser()` not `getSession()` in middleware — getSession() can be spoofed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] tailwindcss-safe-area@1.3.0 incompatible with Tailwind v3/Next.js 14**
- **Found during:** Task 1 (build verification)
- **Issue:** v1.3.0 is CSS-only package designed for Tailwind v4; webpack tried to `require()` a CSS file as JS, causing `SyntaxError: Unexpected token ':'`
- **Fix:** Downgraded to `tailwindcss-safe-area@0.1.0` which is a proper Tailwind v3 plugin with `module.exports`
- **Files modified:** package.json, package-lock.json, tailwind.config.ts
- **Verification:** `npm run build` passes cleanly after fix
- **Committed in:** a94070d (Task 1 commit)

**2. [Rule 1 - Bug] TypeScript error on tailwindcss-safe-area import (no type declarations)**
- **Found during:** Task 1 (build verification)
- **Issue:** `import safeArea from 'tailwindcss-safe-area'` caused TS error "Could not find a declaration file" with strict mode
- **Fix:** Switched to `require()` with eslint-disable comment, which TypeScript accepts for CJS-only packages
- **Files modified:** tailwind.config.ts
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** a94070d (Task 1 commit)

**3. [Rule 1 - Bug] tsconfig.json path alias pointed to ./src/* (scaffold created with src/ dir)**
- **Found during:** Task 1 (scaffold review)
- **Issue:** create-next-app created project with `src/` directory despite `--src-dir=false` flag; path alias `@/*` was `./src/*`
- **Fix:** Corrected to `./*` to match actual project structure (app/ at root)
- **Files modified:** tsconfig.json
- **Verification:** `npx tsc --noEmit` and middleware imports resolve correctly
- **Committed in:** a94070d (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 1 - bugs from scaffold/package compatibility)
**Impact on plan:** All fixes necessary for build to succeed. No scope creep. Plugin still provides same safe-area utilities.

## Issues Encountered

- `create-next-app@14` ignored `--src-dir=false` flag and created `src/` directory; resolved by copying from `src/app/` to `app/` at project root before moving scaffold files

## User Setup Required

**External services require manual configuration.**

To complete the Supabase connection, add a `.env.local` file (copy from `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=<from Supabase Dashboard -> Project Settings -> API -> Project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from Supabase Dashboard -> Project Settings -> API -> publishable key>
```

The dev server will start without these vars but all routes will fail to authenticate.

## Next Phase Readiness

- Next.js scaffold is fully functional — `npm run dev` starts on localhost:3000
- Supabase client utilities are in place and TypeScript-verified
- Middleware protects all routes (redirects to /login if unauthenticated)
- Plan 02 (auth UI — login/signup pages) can proceed immediately
- Plan 03 (auth actions — server actions for email/password) can proceed after Plan 02

---
*Phase: 01-auth-foundation*
*Completed: 2026-02-18*
