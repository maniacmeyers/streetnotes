# AGENTS.md

## Cursor Cloud specific instructions

### Services overview

This is a Next.js 14 (App Router) monorepo — the single `npm run dev` process serves both frontend and all API routes on port 3000. There is no separate backend service to start.

### Required secrets

All secrets must be configured as Cursor Cloud Secrets (injected as environment variables). The `.env.local` file is generated at setup time from these env vars. The critical secrets are:

- `NEXT_PUBLIC_SUPABASE_URL` — must be a real Supabase project URL (e.g. `https://xxxxx.supabase.co`), not a placeholder
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the Supabase anon/publishable key
- `OPENAI_API_KEY` — for Whisper transcription and GPT-4o debrief structuring
- `ANTHROPIC_API_KEY` — for Claude transcript structuring (core app pipeline)
- `CRM_ENCRYPTION_KEY` — 64-char hex string for AES-256-GCM token encryption

Optional (for CRM integration testing): `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, `SALESFORCE_REDIRECT_URI`, `SALESFORCE_AUTH_URL`, `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET`, `HUBSPOT_REDIRECT_URI`.

### Key gotchas

- **Middleware runs on every route** (`middleware.ts`): It creates a Supabase client for session refresh. If `NEXT_PUBLIC_SUPABASE_URL` is a placeholder string (not a valid URL), all pages return 500. The dev server itself starts fine — the error only appears when a page is requested.
- **Public routes** do not require authentication: `/`, `/login`, `/sign-up`, `/auth/*`, `/api/*`, `/debrief/*`, `/vbrick/*`, `/ci`, `/sw.js`, `/manifest.webmanifest`. All other routes redirect to `/login` if unauthenticated.
- **No Docker, no local database**: The app uses hosted Supabase (no local Supabase CLI config). Migrations are in `supabase/migrations/` but are applied to the hosted project.
- **`tailwindcss-safe-area` must stay at v0.1.0** — v1.3.0 breaks webpack in Next.js 14 (documented in CLAUDE.md).

### Development commands

Standard commands from `package.json`:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm start` | Start production server |

### Testing

The project includes `playwright` as a devDependency but no test configuration or test files are committed. There is no `test` script in `package.json`. Lint (`npm run lint`) and build (`npm run build`) are the primary automated checks.
