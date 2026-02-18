# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** A sales rep finishes a meeting, talks into their phone for 60 seconds, reviews the structured output, hits confirm, and their CRM is updated — no manual data entry.
**Current focus:** Phase 1 — Auth Foundation

## Current Position

Phase: 1 of 6 (Auth Foundation)
Plan: 0 of 3 in current phase
Status: Ready to plan
Last activity: 2026-02-18 — Roadmap created, research complete, ready to begin Phase 1 planning

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Setup]: Use @supabase/ssr (not deprecated auth-helpers-nextjs) for Next.js 14 App Router
- [Setup]: Use getUser() not getSession() server-side — getSession() can be spoofed
- [Phase 2]: Negotiate MediaRecorder format at record-start with isTypeSupported() — Safari produces audio/mp4 not webm
- [Phase 4]: Use next-auth@5 beta for OAuth orchestration — has built-in Salesforce + HubSpot providers
- [Phase 4]: Encrypt CRM tokens with AES-256-GCM (or Supabase Vault) — RLS alone is insufficient
- [Phase 4]: Proactive token refresh at 5-min-before-expiry, not reactive 401 retry — prevents race conditions

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: jsforce v3 refresh event handling in stateless Route Handlers needs confirmation during Phase 4 planning
- [Phase 4]: Salesforce sandbox vs. production auth endpoint strategy needs explicit env variable plan
- [Phase 6]: HubSpot public app vs. private app decision affects OAuth scope requirements — decide before Phase 6 planning

## Session Continuity

Last session: 2026-02-18
Stopped at: Roadmap and state initialized. No plans written yet.
Resume file: None
