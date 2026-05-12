-- Migration 014: Tighten RLS policies
-- Replaces permissive USING(true) / WITH CHECK(true) policies with deny-all.
-- All access to these tables now goes through API routes using the service role client.

-- ============================================================
-- debrief_sessions (was: anonymous insert/select/update)
-- ============================================================
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.debrief_sessions;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.debrief_sessions;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.debrief_sessions;

-- ============================================================
-- ci_mentions (was: allow all)
-- ============================================================
DROP POLICY IF EXISTS "Allow all ci_mentions" ON ci_mentions;

-- ============================================================
-- ci_competitor_aliases (was: allow all)
-- ============================================================
DROP POLICY IF EXISTS "Allow all ci_aliases" ON ci_competitor_aliases;

-- ============================================================
-- ci_team_config (was: allow all)
-- ============================================================
DROP POLICY IF EXISTS "Allow all ci_team_config" ON ci_team_config;

-- ============================================================
-- story_drafts (was: allow all)
-- ============================================================
DROP POLICY IF EXISTS "Allow all story_drafts" ON story_drafts;

-- ============================================================
-- story_practice_sessions (was: allow all)
-- ============================================================
DROP POLICY IF EXISTS "Allow all story_practice_sessions" ON story_practice_sessions;

-- ============================================================
-- story_vault_entries (was: allow all)
-- ============================================================
DROP POLICY IF EXISTS "Allow all story_vault_entries" ON story_vault_entries;

-- ============================================================
-- bdr_gamification (was: allow all)
-- ============================================================
DROP POLICY IF EXISTS "Allow all bdr_gamification" ON bdr_gamification;

-- ============================================================
-- bdr_xp_events (was: allow all)
-- ============================================================
DROP POLICY IF EXISTS "Allow all bdr_xp_events" ON bdr_xp_events;

-- story_challenges table does not exist yet in production;
-- its migration (012) will need updated RLS when applied.

-- With RLS enabled and no policies, the anon role has zero access.
-- The service role client used by API routes bypasses RLS entirely.
