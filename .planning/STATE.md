# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** A sales rep finishes a meeting, talks into their phone for 60 seconds, reviews the structured output, hits confirm, and their CRM is updated — no manual data entry.
**Current focus:** Phase 2 — Voice Capture + Transcription

## Current Position

Phase: 2 of 6 (Voice Capture + Transcription)
Plan: 0 of 3 in current phase
Status: Planning complete (ready to execute)
Last activity: 2026-03-07 — Created 02-01/02-02/02-03 execution plans

Progress: [█░░░░░░░░░] ~17% (3 of ~18 total plans estimated)

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: ~2 min
- Total execution time: ~0.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-auth-foundation | 3/3 | ~6 min | ~2 min |
| 02-voice-capture-transcription | 0/3 | 0 min | - |

**Recent Trend:**
- Last 5 plans: ~2 min avg
- Trend: Fast (schema/config tasks complete quickly)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Setup]: Use @supabase/ssr (not deprecated auth-helpers-nextjs) for Next.js 14 App Router
- [Setup]: Use getUser() not getSession() server-side — getSession() can be spoofed
- [01-01]: tailwindcss-safe-area@0.1.0 required (not 1.3.0) — v1.3.0 is Tailwind v4 CSS-only, breaks webpack in Next.js 14
- [01-01]: Three Supabase utility files established: lib/supabase/{client,server,middleware}.ts — follow this pattern in all phases
- [01-01]: Public routes list: /login, /sign-up, /auth — all others require auth via middleware
- [01-03]: RLS policies use (select auth.uid()) subquery form — evaluated once per query, not per row — ~10x faster
- [01-03]: crm_connections has UNIQUE(user_id, crm_type) — one OAuth connection per CRM type per user
- [01-03]: access_token/refresh_token stored as nullable TEXT in crm_connections — will encrypt with AES-256-GCM in Phase 4
- [Phase 2]: Negotiate MediaRecorder format at record-start with isTypeSupported() — Safari produces audio/mp4 not webm
- [Phase 2]: Use a custom `useVoiceRecorder` hook first, then integrate `/api/transcribe` in a second step for cleaner debugging
- [Phase 2]: Keep transcription in standalone `/api/transcribe` route (not merged with structuring) for retry isolation
- [Phase 2]: Require authenticated access for transcription endpoint and enforce 25MB limit client/server side
- [Phase 4]: Use next-auth@5 beta for OAuth orchestration — has built-in Salesforce + HubSpot providers
- [Phase 4]: Encrypt CRM tokens with AES-256-GCM (or Supabase Vault) — RLS alone is insufficient
- [Phase 4]: Proactive token refresh at 5-min-before-expiry, not reactive 401 retry — prevents race conditions

### Pending Todos

- User must create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` before protected routes and API auth checks can run
- User must add `OPENAI_API_KEY` in `.env.local` before `/api/transcribe` can function
- User must run `001_initial_schema.sql` in Supabase SQL Editor (or `supabase db push`) before any note persistence operations

### Blockers/Concerns

- [Phase 2]: OpenAI API key not yet configured for local transcription testing
- [Phase 2]: iOS Safari recording QA still required on real device (simulator is insufficient)
- [Phase 2]: Hosting timeout constraints may affect long audio transcription; route plan sets `maxDuration = 60`
- [Phase 4]: jsforce v3 refresh event handling in stateless Route Handlers needs confirmation during Phase 4 planning
- [Phase 4]: Salesforce sandbox vs. production auth endpoint strategy needs explicit env variable plan
- [Phase 6]: HubSpot public app vs. private app decision affects OAuth scope requirements — decide before Phase 6 planning

## Session Continuity

Last session: 2026-03-07T23:00:00Z
Stopped at: Phase 2 planning refresh complete; execution not started
Resume file: .planning/phases/02-voice-capture-transcription/02-01-PLAN.md
