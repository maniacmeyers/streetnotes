---
phase: 01-auth-foundation
plan: 03
subsystem: database
tags: [supabase, postgres, sql, rls, row-level-security, migrations]

# Dependency graph
requires:
  - phase: 01-auth-foundation
    provides: Supabase project wiring and Next.js scaffold (plan 01-01)
provides:
  - Complete database schema SQL migration with notes, crm_connections, deal_stage_cache tables
  - RLS policies using optimized (select auth.uid()) subquery form on all tables
  - Performance indexes on all user_id foreign key columns
affects:
  - 02-audio-recording
  - 03-ai-processing
  - 04-crm-integration
  - 05-push-to-crm

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RLS policies use (select auth.uid()) subquery form — prevents re-evaluation per row, ~10x faster than bare auth.uid()"
    - "All user-owned tables follow: user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE"
    - "deal_stage_cache uses FOR ALL policy — acceptable when all operations share same condition"

key-files:
  created:
    - supabase/migrations/001_initial_schema.sql
  modified: []

key-decisions:
  - "Use (select auth.uid()) subquery form in RLS policies — not bare auth.uid() — for performance (evaluated once per query, not per row)"
  - "crm_connections has UNIQUE(user_id, crm_type) — one connection per CRM type per user"
  - "deal_stage_cache uses single FOR ALL policy — all four operations have identical conditions, no need to repeat"
  - "access_token and refresh_token are nullable TEXT — will be encrypted in Phase 4 with AES-256-GCM"

patterns-established:
  - "All tables reference auth.users(id) ON DELETE CASCADE — user deletion cascades to all user data"
  - "RLS enabled via ALTER TABLE before CREATE POLICY — order matters for Supabase"
  - "Indexes on every user_id column — supports efficient user-scoped queries"

# Metrics
duration: 1min
completed: 2026-02-18
---

# Phase 1 Plan 3: Database Schema Summary

**Three-table Supabase schema (notes, crm_connections, deal_stage_cache) with RLS using optimized (select auth.uid()) subquery pattern and user_id indexes**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-18T21:54:15Z
- **Completed:** 2026-02-18T21:54:51Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created complete SQL migration file ready to run against Supabase
- All three tables defined with proper UUID PKs, user_id FKs with cascade delete, and appropriate column types
- RLS enabled and policies configured with the optimized `(select auth.uid())` subquery form for all tables
- Performance indexes on all three user_id columns

## Task Commits

Each task was committed atomically:

1. **Task 1: Create database migration with tables, RLS, and indexes** - `5d5996f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `supabase/migrations/001_initial_schema.sql` - Complete schema: 3 tables, RLS enable, 9 policies, 3 indexes

## Decisions Made
- Used `(select auth.uid())` subquery form in all RLS USING/WITH CHECK clauses — Supabase best practice, evaluated once per query rather than once per row
- `deal_stage_cache` uses a single `FOR ALL` policy since SELECT/INSERT/UPDATE/DELETE all share the same user_id condition
- `access_token` and `refresh_token` stored as nullable TEXT with comment noting they'll be encrypted in Phase 4 with AES-256-GCM

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — the `supabase/migrations/` directory did not exist and was created as part of execution. This is expected for a new project.

## User Setup Required

To apply this migration to the Supabase database:

1. Open the Supabase dashboard for your project
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run in SQL Editor

OR, if the Supabase CLI is installed and linked:
```bash
supabase db push
```

## Next Phase Readiness
- Database schema is complete and ready for plan 01-02 (auth flow implementation)
- The `notes` table is ready for plan 02 (audio recording) — `raw_transcript` and `structured_output` fields exist
- The `crm_connections` table is ready for plan 04 (CRM integration)
- Blocker: `.env.local` with Supabase credentials still needed before auth flows can be tested

---
*Phase: 01-auth-foundation*
*Completed: 2026-02-18*
