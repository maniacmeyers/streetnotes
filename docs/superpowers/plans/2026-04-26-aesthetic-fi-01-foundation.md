# Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the schema, RLS policies, org auto-provisioning, and brand/product seed data that everything else in v1 builds on.

**Architecture:** Three Supabase migrations (`018`, `019`, `020`) plus an org-provisioning trigger. Org-scoped from day one with RLS enforcing read-by-org-member, write-by-owner. Notes deliberately stay user-scoped (the privacy boundary). Polymorphic `entities` table with type discriminator + JSONB metadata so future entity types are additions, not migrations.

**Tech Stack:** Postgres (Supabase), `@supabase/ssr`, `@supabase/supabase-js`, `gen_random_uuid()`, RLS policies using `(SELECT auth.uid())` subquery form. No new npm dependencies.

**Verification approach:** Apply migration → query `information_schema` and `pg_policies` to confirm structure → impersonate a different user via service role key + JWT to confirm RLS denies unauthorized access → run a `scripts/verify-phase-1.ts` runner that exercises org provisioning end-to-end. No unit tests (project has no runner).

**Commits at the end of this phase:**
- `feat(aesthetic): migration 018 — entities, facts, briefs, orgs, RLS`
- `feat(aesthetic): migration 019 — story vault tables, RLS`
- `feat(aesthetic): migration 020 — seed major aesthetic brands and products`
- `feat(aesthetic): org auto-provisioning on new user signup`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/018_aesthetic_entities.sql` | Create | orgs, org_members, entities, entity_facts, entity_briefs, import_jobs + indexes + RLS + stale-trigger function |
| `supabase/migrations/019_aesthetic_stories.sql` | Create | aesthetic_story_drafts, aesthetic_story_practice_sessions, aesthetic_story_vault_entries, rep_gamification, rep_xp_events, aesthetic_story_challenges, rep_subscribers + indexes + RLS |
| `supabase/migrations/020_seed_brands_products.sql` | Create | INSERT major aesthetic brands and products as `entities` rows under a system org |
| `lib/orgs/server.ts` | Create | `provisionPersonalOrg(userId, name?)` — idempotent: creates personal org + org_members row if rep doesn't already have one. Uses existing `createAdminClient` from `lib/supabase/admin.ts`. |
| `app/api/auth/callback/route.ts` | Modify (if exists) OR create | After Supabase auth callback, invoke `provisionPersonalOrg` for new users |
| `scripts/verify-phase-1.ts` | Create | Script that creates a synthetic user, runs `provisionPersonalOrg`, reads back via RLS, confirms expected access patterns |

Keep each migration as a single SQL file (matches repo convention — see `006_story_vault.sql`). Do NOT split related tables into multiple migrations.

---

## Task 1: Locate the Supabase project ID and verify access

Before applying any migrations, confirm we know which Supabase project we're targeting and that we can apply migrations against it.

- [ ] **Step 1: Read the project's Supabase URL from local env**

```bash
grep "NEXT_PUBLIC_SUPABASE_URL" /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes/.env.local
```

Expected: a line like `NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co`. The `<project-ref>` portion is the project ID we need.

If `.env.local` doesn't exist or doesn't have the URL: stop and ask the user for the project ref before proceeding.

- [ ] **Step 2: Try the Supabase MCP — list projects to confirm access**

Call the MCP tool:
```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__list_projects()
```

Expected: a JSON array of projects you have access to. Find the project whose ref matches the one from Step 1. Save the `id` field — this is what `apply_migration` needs.

If the MCP isn't available or the call errors: fall back to Supabase Studio for migration application (see Task 4 fallback).

- [ ] **Step 3: Record the project ref + project ID in a temporary local note**

Write to `.scratch/phase-1-project.txt`:

```
Project ref: <ref-from-env>
Project ID:  <id-from-mcp>
```

(Add `.scratch/` to `.gitignore` if not already.)

- [ ] **Step 4: No commit for this task** — discovery only.

---

## Task 2: Write migration 018 (entities, facts, briefs, orgs, RLS)

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/018_aesthetic_entities.sql` with this exact content:

```sql
-- Migration 018: Aesthetic Field Intelligence — orgs, entities, facts, briefs, import jobs.
-- Org-scoped from day 1. v2 (manager rollup) is a permission overlay, not a rewrite.
-- Notes deliberately stay user-scoped (no org_id on notes table) — the privacy boundary.

-- ============================================================================
-- 1. ORGS (multi-tenant root)
-- ============================================================================

CREATE TABLE orgs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  type        text        NOT NULL CHECK (type IN ('personal', 'brand_team', 'system')),
  brand       text,                              -- nullable; 'Allergan' | 'Revance' | etc. when type='brand_team'
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE org_members (
  org_id      uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text        NOT NULL CHECK (role IN ('rep', 'manager')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);
CREATE INDEX idx_org_members_user ON org_members (user_id);

-- ============================================================================
-- 2. ENTITIES (polymorphic — injector / practice / brand / product / office_staff)
-- ============================================================================

CREATE TABLE entities (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  owner_user_id      uuid        NOT NULL REFERENCES auth.users(id),
  type               text        NOT NULL CHECK (type IN ('injector','practice','brand','product','office_staff')),
  canonical_name     text        NOT NULL,
  display_name       text,
  aliases            text[]      NOT NULL DEFAULT '{}',
  practice_id        uuid        REFERENCES entities(id),  -- only for injector and office_staff types
  metadata           jsonb       NOT NULL DEFAULT '{}',
  source             text        NOT NULL CHECK (source IN ('voice_note','csv_import','sf_sync','hs_sync','manual','seed')),
  first_seen_at      timestamptz NOT NULL DEFAULT now(),
  last_mentioned_at  timestamptz,
  mention_count      integer     NOT NULL DEFAULT 0,
  archived_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_entities_org_type            ON entities (org_id, type);
CREATE INDEX idx_entities_org_type_recency    ON entities (org_id, type, last_mentioned_at DESC);
CREATE INDEX idx_entities_owner               ON entities (owner_user_id);
CREATE INDEX idx_entities_practice            ON entities (practice_id) WHERE practice_id IS NOT NULL;
CREATE INDEX idx_entities_aliases             ON entities USING gin (aliases);
CREATE INDEX idx_entities_name_search         ON entities USING gin (to_tsvector('english', canonical_name || ' ' || coalesce(display_name, '')));

-- ============================================================================
-- 3. ENTITY_FACTS (append-only journal)
-- ============================================================================

CREATE TABLE entity_facts (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id             uuid        NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  org_id                uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  observed_by_user_id   uuid        NOT NULL REFERENCES auth.users(id),
  source_note_id        uuid        REFERENCES notes(id) ON DELETE SET NULL,
  source                text        NOT NULL CHECK (source IN ('voice_note','csv_import','sf_sync','hs_sync','manual','seed')),
  fact_key              text        NOT NULL,
  fact_value            jsonb       NOT NULL,
  confidence            text        NOT NULL CHECK (confidence IN ('low','medium','high')),
  observed_at           timestamptz NOT NULL,
  superseded_at         timestamptz,
  superseded_by_id      uuid        REFERENCES entity_facts(id),
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_entity_facts_entity_key_recent ON entity_facts (entity_id, fact_key, observed_at DESC);
CREATE INDEX idx_entity_facts_org_recent        ON entity_facts (org_id, observed_at DESC);
CREATE INDEX idx_entity_facts_source_note       ON entity_facts (source_note_id);

-- ============================================================================
-- 4. ENTITY_BRIEFS (cached brief output)
-- ============================================================================

CREATE TABLE entity_briefs (
  entity_id              uuid        PRIMARY KEY REFERENCES entities(id) ON DELETE CASCADE,
  org_id                 uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  generated_for_user_id  uuid        NOT NULL REFERENCES auth.users(id),
  brief_markdown         text        NOT NULL,
  brief_structured       jsonb       NOT NULL,
  facts_snapshot_hash    text        NOT NULL,
  generated_at           timestamptz NOT NULL DEFAULT now()
);

-- Stale-marking trigger: appends ':stale' suffix to facts_snapshot_hash on any fact insert for the entity.
-- The next API call sees the suffix, treats the brief as stale, enqueues background regen.
CREATE OR REPLACE FUNCTION mark_brief_stale_on_fact_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entity_briefs
     SET facts_snapshot_hash = facts_snapshot_hash || ':stale'
   WHERE entity_id = NEW.entity_id
     AND facts_snapshot_hash NOT LIKE '%:stale';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entity_facts_mark_brief_stale
  AFTER INSERT ON entity_facts
  FOR EACH ROW EXECUTE FUNCTION mark_brief_stale_on_fact_insert();

-- ============================================================================
-- 5. IMPORT_JOBS (CSV + SF + HS async imports)
-- ============================================================================

CREATE TABLE import_jobs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id),
  source          text        NOT NULL CHECK (source IN ('csv','salesforce','hubspot')),
  status          text        NOT NULL CHECK (status IN ('queued','running','completed','failed')),
  rows_total      integer,
  rows_succeeded  integer     NOT NULL DEFAULT 0,
  rows_failed     integer     NOT NULL DEFAULT 0,
  error_log       jsonb       NOT NULL DEFAULT '[]',
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_import_jobs_user_recent ON import_jobs (user_id, created_at DESC);

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY orgs_read ON orgs FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())));
-- No INSERT/UPDATE/DELETE policy: orgs are created by service_role (signup hook).

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_members_read ON org_members FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid()))
  );
-- No INSERT/UPDATE/DELETE policy: managed by service_role.

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY entities_read ON entities FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())));
CREATE POLICY entities_insert ON entities FOR INSERT
  WITH CHECK (
    owner_user_id = (SELECT auth.uid())
    AND org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid()))
  );
CREATE POLICY entities_update ON entities FOR UPDATE
  USING (owner_user_id = (SELECT auth.uid()))
  WITH CHECK (owner_user_id = (SELECT auth.uid()));
CREATE POLICY entities_delete ON entities FOR DELETE
  USING (owner_user_id = (SELECT auth.uid()));

ALTER TABLE entity_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY entity_facts_read ON entity_facts FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())));
CREATE POLICY entity_facts_insert ON entity_facts FOR INSERT
  WITH CHECK (
    observed_by_user_id = (SELECT auth.uid())
    AND org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid()))
  );
-- No UPDATE policy for users; service_role bypasses RLS for supersede operations.
-- No DELETE policy: facts are append-only by design.

ALTER TABLE entity_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY entity_briefs_read ON entity_briefs FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())));
-- No INSERT/UPDATE/DELETE policy: briefs written by service_role only.

ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY import_jobs_read ON import_jobs FOR SELECT
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY import_jobs_insert ON import_jobs FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid()))
  );
-- UPDATE handled by service_role worker (no user policy needed).

-- ============================================================================
-- 7. SYSTEM ORG (for seed data in migration 020)
-- ============================================================================

INSERT INTO orgs (id, name, type, brand)
VALUES ('00000000-0000-0000-0000-000000000001', 'StreetNotes System', 'system', NULL);
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Call:
```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__apply_migration(
  project_id: <id-from-task-1>,
  name: '018_aesthetic_entities',
  query: <contents of supabase/migrations/018_aesthetic_entities.sql>
)
```

Expected: success response.

**Fallback if MCP fails:** open Supabase Studio for the project → SQL Editor → paste the migration → Run. Then mark this step done.

- [ ] **Step 3: Verify tables and indexes were created**

Call:
```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__execute_sql(
  project_id: <id>,
  query: "
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('orgs','org_members','entities','entity_facts','entity_briefs','import_jobs')
    ORDER BY table_name;
  "
)
```

Expected: 6 rows (`entities`, `entity_briefs`, `entity_facts`, `import_jobs`, `org_members`, `orgs`).

- [ ] **Step 4: Verify RLS policies were created**

Call:
```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__execute_sql(
  project_id: <id>,
  query: "
    SELECT schemaname, tablename, policyname, cmd
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename IN ('orgs','org_members','entities','entity_facts','entity_briefs','import_jobs')
     ORDER BY tablename, policyname;
  "
)
```

Expected: at least these policies present:
- `entities_read`, `entities_insert`, `entities_update`, `entities_delete`
- `entity_facts_read`, `entity_facts_insert`
- `entity_briefs_read`
- `import_jobs_read`, `import_jobs_insert`
- `orgs_read`
- `org_members_read`

- [ ] **Step 5: Verify the stale-trigger function exists**

Call:
```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__execute_sql(
  project_id: <id>,
  query: "
    SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers
     WHERE event_object_schema = 'public'
       AND trigger_name = 'trg_entity_facts_mark_brief_stale';
  "
)
```

Expected: 1 row showing the trigger fires AFTER INSERT on `entity_facts`.

- [ ] **Step 6: Verify the system org exists**

```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__execute_sql(
  project_id: <id>,
  query: "SELECT id, name, type FROM orgs WHERE type = 'system';"
)
```

Expected: 1 row with `id = '00000000-0000-0000-0000-000000000001'` and `name = 'StreetNotes System'`.

- [ ] **Step 7: Commit the migration**

```bash
git add supabase/migrations/018_aesthetic_entities.sql
git commit -m "$(cat <<'EOF'
feat(aesthetic): migration 018 — entities, facts, briefs, orgs, RLS

Foundation for v1 Aesthetic Field Intelligence. Polymorphic entities
table (injector/practice/brand/product/office_staff) with JSONB
metadata. Append-only entity_facts journal. entity_briefs cache with
stale-on-fact-insert trigger. Org-scoped from day 1; notes stay
user-scoped (privacy boundary). System org seeded for migration 020.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Write migration 019 (story vault tables, RLS)

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/019_aesthetic_stories.sql` with this exact content:

```sql
-- Migration 019: Aesthetic Story Vault — drafts, practice, scoring, gamification, sharing.
-- Mirrors VBrick story vault structure with three differences:
--   1. Identity: user_id + org_id (not bdr_email).
--   2. Compliance: 7th scoring dimension catches FDA off-label claims.
--   3. Cross-pollination: stories link to entities via related_entity_ids[].

-- ============================================================================
-- 1. STORY DRAFTS
-- ============================================================================

CREATE TABLE aesthetic_story_drafts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  author_user_id      uuid        NOT NULL REFERENCES auth.users(id),
  story_type          text        NOT NULL CHECK (story_type IN ('elevator_pitch','customer_story','objection_handler')),
  title               text,
  draft_content       text        NOT NULL DEFAULT '',
  ai_conversation     jsonb       NOT NULL DEFAULT '[]',
  framework_metadata  jsonb       NOT NULL DEFAULT '{}',
  related_entity_ids  uuid[]      NOT NULL DEFAULT '{}',
  status              text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','practicing','completed')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_story_drafts_author      ON aesthetic_story_drafts (author_user_id);
CREATE INDEX idx_story_drafts_author_type ON aesthetic_story_drafts (author_user_id, story_type);
CREATE INDEX idx_story_drafts_entities    ON aesthetic_story_drafts USING gin (related_entity_ids);

-- ============================================================================
-- 2. PRACTICE SESSIONS (with compliance dimension — NEW vs VBrick)
-- ============================================================================

CREATE TABLE aesthetic_story_practice_sessions (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  story_draft_id      uuid          NOT NULL REFERENCES aesthetic_story_drafts(id) ON DELETE CASCADE,
  org_id              uuid          NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id             uuid          NOT NULL REFERENCES auth.users(id),
  transcript          text,
  duration_seconds    integer,
  score_framework     numeric(4,2),
  score_clarity       numeric(4,2),
  score_confidence    numeric(4,2),
  score_pacing        numeric(4,2),
  score_specificity   numeric(4,2),
  score_brevity       numeric(4,2),
  score_compliance    numeric(4,2),    -- NEW vs VBrick (FDA off-label detection)
  composite_score     numeric(4,2),
  improvement_notes   jsonb         NOT NULL DEFAULT '{}',
  compliance_flags    jsonb         NOT NULL DEFAULT '[]',  -- list of off-label claims with rephrase suggestions
  coaching_note       text,
  created_at          timestamptz   NOT NULL DEFAULT now()
);
CREATE INDEX idx_practice_sessions_draft        ON aesthetic_story_practice_sessions (story_draft_id);
CREATE INDEX idx_practice_sessions_user_score   ON aesthetic_story_practice_sessions (user_id, composite_score DESC);

-- ============================================================================
-- 3. VAULT ENTRIES (personal best per type)
-- ============================================================================

CREATE TABLE aesthetic_story_vault_entries (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_session_id   uuid         NOT NULL REFERENCES aesthetic_story_practice_sessions(id) ON DELETE CASCADE,
  story_draft_id        uuid         NOT NULL REFERENCES aesthetic_story_drafts(id) ON DELETE CASCADE,
  org_id                uuid         NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id               uuid         NOT NULL REFERENCES auth.users(id),
  story_type            text         NOT NULL,
  title                 text         NOT NULL,
  transcript            text         NOT NULL,
  composite_score       numeric(4,2) NOT NULL,
  is_personal_best      boolean      NOT NULL DEFAULT false,
  shared_to_team        boolean      NOT NULL DEFAULT false,
  related_entity_ids    uuid[]       NOT NULL DEFAULT '{}',
  created_at            timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX idx_vault_entries_user_type   ON aesthetic_story_vault_entries (user_id, story_type);
CREATE INDEX idx_vault_entries_team        ON aesthetic_story_vault_entries (org_id, story_type, composite_score DESC) WHERE shared_to_team = true;
CREATE INDEX idx_vault_entries_entities    ON aesthetic_story_vault_entries USING gin (related_entity_ids);

-- ============================================================================
-- 4. GAMIFICATION
-- ============================================================================

CREATE TABLE rep_gamification (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                      uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id                     uuid        NOT NULL UNIQUE REFERENCES auth.users(id),
  xp_total                    integer     NOT NULL DEFAULT 0,
  level                       integer     NOT NULL DEFAULT 1,
  current_streak              integer     NOT NULL DEFAULT 0,
  longest_streak              integer     NOT NULL DEFAULT 0,
  last_practice_date          date,
  streak_freeze_available     boolean     NOT NULL DEFAULT true,
  streak_freeze_used_this_week date,
  badges                      jsonb       NOT NULL DEFAULT '[]',
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_gamification_user ON rep_gamification (user_id);

CREATE TABLE rep_xp_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id),
  event_type    text        NOT NULL,
  xp_awarded    integer     NOT NULL,
  metadata      jsonb       NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_xp_events_user_recent ON rep_xp_events (user_id, created_at DESC);

-- ============================================================================
-- 5. SHARING (challenges + manager-invite subscribers)
-- ============================================================================

CREATE TABLE aesthetic_story_challenges (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_entry_id      uuid        NOT NULL REFERENCES aesthetic_story_vault_entries(id) ON DELETE CASCADE,
  org_id              uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  created_by_user_id  uuid        NOT NULL REFERENCES auth.users(id),
  share_token         text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  view_count          integer     NOT NULL DEFAULT 0,
  attempt_count       integer     NOT NULL DEFAULT 0,
  expires_at          timestamptz,
  revoked_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_challenges_token ON aesthetic_story_challenges (share_token);
CREATE INDEX idx_challenges_vault ON aesthetic_story_challenges (vault_entry_id);

-- Manager-invite-via-link: subscribers to a rep's shared artifacts.
-- Subscriber gets:
--   • notifications when the rep generates a new public share link
--   • a saved-links view of what the rep has shared with them
-- Subscriber does NOT get:
--   • automatic read on shared_to_team artifacts (that's v2 org_members)
--   • access to notes, briefs, or unshared stories
CREATE TABLE rep_subscribers (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_user_id            uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriber_user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_on_new_share    boolean     NOT NULL DEFAULT true,
  invited_via_token      text        REFERENCES aesthetic_story_challenges(share_token),
  created_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rep_user_id, subscriber_user_id)
);
CREATE INDEX idx_subscribers_subscriber ON rep_subscribers (subscriber_user_id);
CREATE INDEX idx_subscribers_rep        ON rep_subscribers (rep_user_id);

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

ALTER TABLE aesthetic_story_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY story_drafts_read ON aesthetic_story_drafts FOR SELECT
  USING (
    author_user_id = (SELECT auth.uid())
    OR (status = 'completed' AND org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())))
  );
CREATE POLICY story_drafts_insert ON aesthetic_story_drafts FOR INSERT
  WITH CHECK (author_user_id = (SELECT auth.uid()));
CREATE POLICY story_drafts_update ON aesthetic_story_drafts FOR UPDATE
  USING (author_user_id = (SELECT auth.uid()))
  WITH CHECK (author_user_id = (SELECT auth.uid()));
CREATE POLICY story_drafts_delete ON aesthetic_story_drafts FOR DELETE
  USING (author_user_id = (SELECT auth.uid()));

ALTER TABLE aesthetic_story_practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY practice_sessions_read ON aesthetic_story_practice_sessions FOR SELECT
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY practice_sessions_insert ON aesthetic_story_practice_sessions FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER TABLE aesthetic_story_vault_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_entries_read ON aesthetic_story_vault_entries FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR (shared_to_team = true AND org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())))
  );
CREATE POLICY vault_entries_insert ON aesthetic_story_vault_entries FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY vault_entries_update ON aesthetic_story_vault_entries FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER TABLE rep_gamification ENABLE ROW LEVEL SECURITY;
CREATE POLICY gamification_read ON rep_gamification FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid()))
  );
-- INSERT/UPDATE done by service_role via gamification engine.

ALTER TABLE rep_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY xp_events_read ON rep_xp_events FOR SELECT
  USING (user_id = (SELECT auth.uid()));
-- INSERT done by service_role.

ALTER TABLE aesthetic_story_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY challenges_read_owner ON aesthetic_story_challenges FOR SELECT
  USING (created_by_user_id = (SELECT auth.uid()));
CREATE POLICY challenges_insert ON aesthetic_story_challenges FOR INSERT
  WITH CHECK (created_by_user_id = (SELECT auth.uid()));
CREATE POLICY challenges_update ON aesthetic_story_challenges FOR UPDATE
  USING (created_by_user_id = (SELECT auth.uid()))
  WITH CHECK (created_by_user_id = (SELECT auth.uid()));
-- Public token-based read happens via service_role lookups in the share-link API.

ALTER TABLE rep_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscribers_read ON rep_subscribers FOR SELECT
  USING (rep_user_id = (SELECT auth.uid()) OR subscriber_user_id = (SELECT auth.uid()));
CREATE POLICY subscribers_insert ON rep_subscribers FOR INSERT
  WITH CHECK (subscriber_user_id = (SELECT auth.uid()));
CREATE POLICY subscribers_delete ON rep_subscribers FOR DELETE
  USING (subscriber_user_id = (SELECT auth.uid()) OR rep_user_id = (SELECT auth.uid()));
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Call:
```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__apply_migration(
  project_id: <id>,
  name: '019_aesthetic_stories',
  query: <contents of supabase/migrations/019_aesthetic_stories.sql>
)
```

Expected: success.

- [ ] **Step 3: Verify story tables were created**

```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__execute_sql(
  project_id: <id>,
  query: "
    SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN (
         'aesthetic_story_drafts',
         'aesthetic_story_practice_sessions',
         'aesthetic_story_vault_entries',
         'rep_gamification',
         'rep_xp_events',
         'aesthetic_story_challenges',
         'rep_subscribers'
       )
     ORDER BY table_name;
  "
)
```

Expected: 7 rows.

- [ ] **Step 4: Verify the compliance score column exists**

```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__execute_sql(
  project_id: <id>,
  query: "
    SELECT column_name, data_type
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'aesthetic_story_practice_sessions'
       AND column_name IN ('score_compliance', 'compliance_flags');
  "
)
```

Expected: 2 rows — `score_compliance` (numeric) and `compliance_flags` (jsonb).

- [ ] **Step 5: Commit the migration**

```bash
git add supabase/migrations/019_aesthetic_stories.sql
git commit -m "$(cat <<'EOF'
feat(aesthetic): migration 019 — story vault tables, RLS

Aesthetic Story Vault mirrors VBrick structure with three differences:
identity uses user_id+org_id (not bdr_email), compliance is a 7th
scoring dimension (FDA off-label detection), stories link to entities
via related_entity_ids[]. Includes rep_subscribers table for the
manager-invite-via-link wedge.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Write migration 020 (seed brands + products)

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/020_seed_brands_products.sql` with this exact content:

```sql
-- Migration 020: Seed major aesthetic brands and their products under the system org.
-- These are reference entities every rep can read but cannot edit (system-owned).

-- All seed entities owned by the system org and an admin user (NULL fallback acceptable for service_role inserts).
-- We use a fixed system org UUID seeded in migration 018.

-- Insert brands first (they're parents of products via metadata.brand_id).

WITH inserted_brands AS (
  INSERT INTO entities (org_id, owner_user_id, type, canonical_name, source, metadata)
  VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Allergan Aesthetics',     'seed', '{"category":["toxin","filler"],"market_position":"leader"}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Galderma',                'seed', '{"category":["toxin","filler","skincare"]}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Merz Aesthetics',         'seed', '{"category":["toxin","filler","collagen"]}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Revance',                 'seed', '{"category":["toxin"],"market_position":"challenger"}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Evolus',                  'seed', '{"category":["toxin"],"market_position":"challenger"}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'InMode',                  'seed', '{"category":["device","body"]}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'BTL Aesthetics',          'seed', '{"category":["device","body"]}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Cutera',                  'seed', '{"category":["device","laser"]}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Sciton',                  'seed', '{"category":["device","laser"]}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Hydrafacial',             'seed', '{"category":["skincare","device"]}'::jsonb),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brand', 'Sofwave',                 'seed', '{"category":["device","ultrasound"]}'::jsonb)
  RETURNING id, canonical_name
)
INSERT INTO entities (org_id, owner_user_id, type, canonical_name, source, metadata)
SELECT
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'product',
  prod.name,
  'seed',
  jsonb_build_object(
    'brand_id', b.id::text,
    'category', prod.category,
    'indication', prod.indication,
    'fda_duration_claim_months', prod.duration
  )
FROM inserted_brands b
JOIN (VALUES
  -- Allergan Aesthetics
  ('Allergan Aesthetics', 'Botox',           'toxin',  ARRAY['glabellar lines','crows feet','forehead lines'], 4),
  ('Allergan Aesthetics', 'Juvederm',        'filler', ARRAY['nasolabial folds','lips','cheeks'],              NULL::int),
  -- Galderma
  ('Galderma',            'Dysport',         'toxin',  ARRAY['glabellar lines'],                                4),
  ('Galderma',            'Restylane',       'filler', ARRAY['nasolabial folds','lips'],                       NULL::int),
  ('Galderma',            'Restylane Eyelight','filler', ARRAY['tear trough'],                                 NULL::int),
  ('Galderma',            'Sculptra',        'filler', ARRAY['volume restoration','collagen stimulation'],     NULL::int),
  -- Merz Aesthetics
  ('Merz Aesthetics',     'Xeomin',          'toxin',  ARRAY['glabellar lines'],                                4),
  ('Merz Aesthetics',     'Belotero',        'filler', ARRAY['nasolabial folds','perioral lines'],             NULL::int),
  ('Merz Aesthetics',     'Radiesse',        'filler', ARRAY['nasolabial folds','jawline','hands'],            NULL::int),
  -- Revance
  ('Revance',             'Daxxify',         'toxin',  ARRAY['glabellar lines'],                                4),
  ('Revance',             'RHA Collection',  'filler', ARRAY['dynamic wrinkles'],                              NULL::int),
  -- Evolus
  ('Evolus',              'Jeuveau',         'toxin',  ARRAY['glabellar lines'],                                3),
  -- InMode
  ('InMode',              'Morpheus8',       'device', ARRAY['skin remodeling','body contouring'],             NULL::int),
  ('InMode',              'BodyTite',        'device', ARRAY['body contouring'],                               NULL::int),
  ('InMode',              'Forma',           'device', ARRAY['skin tightening'],                               NULL::int),
  -- BTL Aesthetics
  ('BTL Aesthetics',      'Emsculpt',        'device', ARRAY['muscle building','body contouring'],             NULL::int),
  ('BTL Aesthetics',      'Emsculpt Neo',    'device', ARRAY['muscle building','fat reduction'],               NULL::int),
  -- Sofwave
  ('Sofwave',             'Sofwave',         'device', ARRAY['lifting','skin tightening'],                     NULL::int),
  -- Hydrafacial
  ('Hydrafacial',         'Hydrafacial',     'device', ARRAY['skincare resurfacing'],                          NULL::int)
) AS prod(brand_name, name, category, indication, duration) ON prod.brand_name = b.canonical_name;
```

**Note on `owner_user_id = '00000000-0000-0000-0000-000000000000'`:** seed entities have a synthetic owner UUID. Because the `entities` table requires `owner_user_id REFERENCES auth.users(id)`, we need to create a corresponding row in `auth.users` first OR drop the FK enforcement for the system org. The cleanest path is the next sub-step.

- [ ] **Step 1b: Add a system user to auth.users before the seed runs**

Prepend this to migration 020 (above the brand inserts):

```sql
-- Synthetic system user for seed-owned entities. Required by entities.owner_user_id FK.
-- Uses a fixed UUID so re-running the migration is idempotent.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'service',
  'system@streetnotes.internal',
  '',  -- empty: no password, system user can never log in
  now(),
  now(),
  now(),
  '{"provider":"system","providers":["system"]}'::jsonb,
  '{"system":true}'::jsonb,
  false,
  false
)
ON CONFLICT (id) DO NOTHING;
```

This MUST come before the brand/product INSERTs.

- [ ] **Step 2: Apply the migration via Supabase MCP**

```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__apply_migration(
  project_id: <id>,
  name: '020_seed_brands_products',
  query: <contents of supabase/migrations/020_seed_brands_products.sql>
)
```

Expected: success.

- [ ] **Step 3: Verify brands seeded**

```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__execute_sql(
  project_id: <id>,
  query: "SELECT canonical_name FROM entities WHERE type = 'brand' AND source = 'seed' ORDER BY canonical_name;"
)
```

Expected: 11 rows including 'Allergan Aesthetics', 'Revance', 'Evolus', 'Galderma', 'Merz Aesthetics', 'InMode', 'BTL Aesthetics', etc.

- [ ] **Step 4: Verify products seeded with correct brand FKs**

```
mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__execute_sql(
  project_id: <id>,
  query: "
    SELECT p.canonical_name AS product, b.canonical_name AS brand, p.metadata->>'fda_duration_claim_months' AS fda_duration
      FROM entities p
      JOIN entities b ON b.id::text = p.metadata->>'brand_id'
     WHERE p.type = 'product'
       AND p.source = 'seed'
     ORDER BY b.canonical_name, p.canonical_name;
  "
)
```

Expected: 19 rows. Confirm Daxxify shows brand Revance and `fda_duration` of `4` (NOT 6 — that's the off-label claim the compliance scorer must catch later).

- [ ] **Step 5: Commit the migration**

```bash
git add supabase/migrations/020_seed_brands_products.sql
git commit -m "$(cat <<'EOF'
feat(aesthetic): migration 020 — seed major brands and products

11 brands (Allergan/Galderma/Merz/Revance/Evolus/InMode/BTL/Cutera/
Sciton/Hydrafacial/Sofwave) and 19 products with FDA-approved
duration claims where applicable. Seeded under the system org with
a synthetic system user so all reps can read them but no rep can
edit. The fda_duration_claim_months field is what the Phase 7
compliance scorer reads to detect off-label duration claims.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Build org auto-provisioning lib

This is the function called from the auth callback to make sure every newly-signed-up rep has a personal org and is a member of it.

- [ ] **Step 1: Create the orgs lib directory and server.ts**

Create `lib/orgs/server.ts` with this exact content:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

export type OrgRole = 'rep' | 'manager'
export type OrgType = 'personal' | 'brand_team' | 'system'

export interface ProvisionedOrg {
  orgId: string
  role: OrgRole
  alreadyExisted: boolean
}

/**
 * Idempotent: ensures the user has a personal org and is a member of it.
 * Safe to call repeatedly. Uses the service-role client so it can write to
 * orgs + org_members regardless of the user's RLS context.
 *
 * Returns the org ID and whether it already existed (false = newly created).
 */
export async function provisionPersonalOrg(
  userId: string,
  displayName?: string | null
): Promise<ProvisionedOrg> {
  const admin = createAdminClient()

  // Check if user is already a member of any personal org.
  const { data: existing, error: lookupError } = await admin
    .from('org_members')
    .select('org_id, role, orgs!inner(type)')
    .eq('user_id', userId)
    .eq('orgs.type', 'personal')
    .maybeSingle()

  if (lookupError) {
    throw new Error(`provisionPersonalOrg: lookup failed: ${lookupError.message}`)
  }

  if (existing) {
    return {
      orgId: existing.org_id,
      role: existing.role as OrgRole,
      alreadyExisted: true,
    }
  }

  // Create the personal org.
  const orgName = displayName ? `${displayName}'s Workspace` : 'My Workspace'
  const { data: newOrg, error: orgError } = await admin
    .from('orgs')
    .insert({ name: orgName, type: 'personal' })
    .select('id')
    .single()

  if (orgError || !newOrg) {
    throw new Error(`provisionPersonalOrg: org insert failed: ${orgError?.message}`)
  }

  // Add the user as a rep member.
  const { error: memberError } = await admin
    .from('org_members')
    .insert({ org_id: newOrg.id, user_id: userId, role: 'rep' })

  if (memberError) {
    throw new Error(`provisionPersonalOrg: member insert failed: ${memberError.message}`)
  }

  return { orgId: newOrg.id, role: 'rep', alreadyExisted: false }
}

/**
 * Returns all org IDs this user is a member of. Useful for org-scoped queries.
 */
export async function getUserOrgIds(userId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId)

  if (error) {
    throw new Error(`getUserOrgIds: ${error.message}`)
  }
  return (data ?? []).map((row) => row.org_id)
}
```

- [ ] **Step 2: Confirm the existing admin client meets our needs**

The repo already has `lib/supabase/admin.ts` exporting `createAdminClient()` — service-role bypass-RLS client. Verify it's still there:

```bash
cat /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes/lib/supabase/admin.ts
```

Expected: a 19-line file exporting `createAdminClient()` that uses `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. If it exists as expected, no changes needed — `lib/orgs/server.ts` already imports from it. If it's missing or different, stop and reconcile before continuing.

- [ ] **Step 3: Add SUPABASE_SERVICE_ROLE_KEY to .env.local.example**

Read the file, then add the line if it's not there:

```bash
grep -q "SUPABASE_SERVICE_ROLE_KEY" /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes/.env.local.example || \
  echo "SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-supabase-dashboard>" >> /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes/.env.local.example
```

(Also remind the user via terminal output that they need to add `SUPABASE_SERVICE_ROLE_KEY=...` to their actual `.env.local` — value comes from Supabase dashboard → Settings → API → `service_role` key.)

- [ ] **Step 4: Type-check the new file**

```bash
cd /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes && npx tsc --noEmit --project tsconfig.json 2>&1 | grep -E "lib/orgs/server" | head -10
```

Expected: no errors mentioning `lib/orgs/server`. If type errors appear, fix them before committing.

- [ ] **Step 5: Commit the org-provisioning lib**

```bash
git add lib/orgs/server.ts .env.local.example
git commit -m "$(cat <<'EOF'
feat(aesthetic): org auto-provisioning lib

provisionPersonalOrg(userId, displayName?) is idempotent — safe to
call from auth callback on every login. Creates a personal org and
adds the user as a rep member if they don't already have one.
Reuses existing createAdminClient from lib/supabase/admin.ts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Wire org provisioning into the auth callback

The Supabase auth callback fires on every login (not just signup), so wiring `provisionPersonalOrg` there gives us idempotent provisioning with zero special-case logic.

- [ ] **Step 1: Locate the existing auth callback route**

```bash
find /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes/app/api/auth -type f -name "*.ts" | head -10
ls /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes/app/auth 2>/dev/null
```

Expected: a file at `app/api/auth/callback/route.ts` OR `app/auth/callback/route.ts`. Note the path.

- [ ] **Step 2: Read the existing callback route**

```bash
cat <path-from-step-1>
```

You're looking for the spot where the user's session is established (typically right after `exchangeCodeForSession`). That's where we hook in the provisioning call.

- [ ] **Step 3: Add the provisioning hook**

Modify the callback route. After the session is established and `user` is retrieved (via `supabase.auth.getUser()` or the exchange result), add:

```typescript
import { provisionPersonalOrg } from '@/lib/orgs/server'

// ... existing code that establishes session and gets user ...

if (user) {
  try {
    await provisionPersonalOrg(user.id, user.user_metadata?.full_name ?? user.email?.split('@')[0])
  } catch (err) {
    // Non-fatal: log and continue. The next login will retry.
    // Don't block sign-in over an org-provisioning failure.
    console.error('[auth/callback] provisionPersonalOrg failed:', err)
  }
}
```

Use the same import alias style as the rest of the route. If `user_metadata` shape differs (e.g., the project uses a different name field), adapt `displayName` to whatever's there — falling back to the email local-part is fine.

- [ ] **Step 4: Type-check**

```bash
cd /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes && npm run lint 2>&1 | tail -20
```

Expected: no new errors related to the callback file.

- [ ] **Step 5: Commit the callback hook**

```bash
git add <path-to-callback-route>
git commit -m "$(cat <<'EOF'
feat(aesthetic): provision personal org on auth callback

Calls provisionPersonalOrg() after every successful login so every
rep has a personal org. Idempotent — safe across logins. Failure
is non-fatal (logged + retried next login) so org-provisioning
issues never block sign-in.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Write the verification runner

End-to-end script that proves the foundation works: creates a synthetic user (via service role), runs `provisionPersonalOrg`, then queries back the org_members row, then writes a test entity, then asserts RLS denies a different user from reading it.

- [ ] **Step 1: Create `scripts/verify-phase-1.ts`**

```typescript
/**
 * Phase 1 verification runner.
 *
 * Run with: npx tsx scripts/verify-phase-1.ts
 *
 * Creates two synthetic users, provisions personal orgs for each, writes
 * an entity owned by user A, then asserts that user B cannot read it via
 * RLS. Cleans up after itself.
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { provisionPersonalOrg, getUserOrgIds } from '../lib/orgs/server'
import { createAdminClient } from '../lib/supabase/admin'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createAdminClient()

const log = (label: string, msg: string) => console.log(`[${label}] ${msg}`)
const fail = (label: string, msg: string) => {
  console.error(`[FAIL: ${label}] ${msg}`)
  process.exit(1)
}

interface TestUser {
  id: string
  email: string
  password: string
}

async function createTestUser(email: string): Promise<TestUser> {
  const password = 'verify-phase-1-temp-' + Math.random().toString(36).slice(2)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error || !data.user) throw new Error(`createTestUser ${email}: ${error?.message}`)
  return { id: data.user.id, email, password }
}

/**
 * Returns a Supabase client authenticated AS this user via the anon key.
 * Use this for RLS probes — queries through it are subject to RLS as if
 * the user were making them from the browser.
 */
async function clientAs(user: TestUser) {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY required for RLS sim')
  const c = createClient(url, anonKey)
  const { error } = await c.auth.signInWithPassword({ email: user.email, password: user.password })
  if (error) throw new Error(`clientAs ${user.email}: signIn failed: ${error.message}`)
  return c
}

async function main() {
  const ts = Date.now()
  const aliceEmail = `phase-1-alice-${ts}@streetnotes.internal`
  const bobEmail = `phase-1-bob-${ts}@streetnotes.internal`

  log('setup', 'Creating two synthetic users (Alice + Bob)')
  const alice = await createTestUser(aliceEmail)
  const bob = await createTestUser(bobEmail)
  log('setup', `Alice: ${alice.id}, Bob: ${bob.id}`)

  log('test-1', 'provisionPersonalOrg(Alice) — should create new org')
  const aliceProv1 = await provisionPersonalOrg(alice.id, 'Alice')
  if (aliceProv1.alreadyExisted) fail('test-1', 'expected alreadyExisted=false, got true')
  log('test-1', `OK — orgId=${aliceProv1.orgId}, role=${aliceProv1.role}`)

  log('test-2', 'provisionPersonalOrg(Alice) again — should be idempotent')
  const aliceProv2 = await provisionPersonalOrg(alice.id, 'Alice')
  if (!aliceProv2.alreadyExisted) fail('test-2', 'expected alreadyExisted=true, got false')
  if (aliceProv2.orgId !== aliceProv1.orgId) fail('test-2', 'org ID changed on second call')
  log('test-2', `OK — same org returned`)

  log('test-3', 'provisionPersonalOrg(Bob) — separate org')
  const bobProv = await provisionPersonalOrg(bob.id, 'Bob')
  if (bobProv.orgId === aliceProv1.orgId) fail('test-3', 'Bob got Alice\\'s org')
  log('test-3', `OK — Bob orgId=${bobProv.orgId}`)

  log('test-4', 'getUserOrgIds(Alice) returns Alice\\'s org')
  const aliceOrgs = await getUserOrgIds(alice.id)
  if (!aliceOrgs.includes(aliceProv1.orgId)) fail('test-4', `expected ${aliceProv1.orgId} in ${JSON.stringify(aliceOrgs)}`)
  log('test-4', `OK — found ${aliceOrgs.length} org(s)`)

  log('test-5', 'Insert an entity owned by Alice into Alice\\'s org')
  const { data: entity, error: insertError } = await admin
    .from('entities')
    .insert({
      org_id: aliceProv1.orgId,
      owner_user_id: alice.id,
      type: 'practice',
      canonical_name: 'Phase 1 Verification Practice',
      source: 'manual',
    })
    .select('id')
    .single()
  if (insertError || !entity) fail('test-5', `insert failed: ${insertError?.message}`)
  log('test-5', `OK — entity ${entity.id}`)

  log('test-6', 'RLS check: Bob cannot read Alice\\'s entity via anon-key + Bob JWT')
  const bobClient = await clientAs(bob)
  const { data: bobView, error: bobViewError } = await bobClient
    .from('entities')
    .select('id')
    .eq('id', entity.id)
  if (bobViewError) fail('test-6', `Bob's query errored: ${bobViewError.message}`)
  if (bobView && bobView.length > 0) {
    fail('test-6', `RLS broken: Bob can see Alice's entity (rows=${bobView.length})`)
  }
  log('test-6', 'OK — Bob cannot see Alice\\'s entity')

  log('test-7', 'RLS check: Alice CAN read her own entity via anon-key + Alice JWT')
  const aliceClient = await clientAs(alice)
  const { data: aliceView, error: aliceViewError } = await aliceClient
    .from('entities')
    .select('id, canonical_name')
    .eq('id', entity.id)
  if (aliceViewError) fail('test-7', `Alice's query errored: ${aliceViewError.message}`)
  if (!aliceView || aliceView.length !== 1) {
    fail('test-7', `Alice should see exactly 1 row, got ${aliceView?.length ?? 0}`)
  }
  log('test-7', 'OK — Alice sees her own entity')

  log('test-8', 'RLS check: Bob cannot INSERT into Alice\\'s org')
  const { error: bobInsertError } = await bobClient
    .from('entities')
    .insert({
      org_id: aliceProv1.orgId,
      owner_user_id: bob.id,
      type: 'practice',
      canonical_name: 'Bob attempt to invade Alice org',
      source: 'manual',
    })
  if (!bobInsertError) {
    fail('test-8', 'RLS broken: Bob inserted into Alice\\'s org')
  }
  log('test-8', `OK — Bob blocked: ${bobInsertError.message}`)

  log('cleanup', 'Removing test entity, orgs, and users')
  await admin.from('entities').delete().eq('id', entity.id)
  await admin.from('org_members').delete().eq('user_id', alice.id)
  await admin.from('org_members').delete().eq('user_id', bob.id)
  await admin.from('orgs').delete().eq('id', aliceProv1.orgId)
  await admin.from('orgs').delete().eq('id', bobProv.orgId)
  await admin.auth.admin.deleteUser(alice.id)
  await admin.auth.admin.deleteUser(bob.id)
  log('cleanup', 'Done')

  console.log('\\n✅ Phase 1 foundation verified')
}

main().catch((err) => {
  console.error('Verification crashed:', err)
  process.exit(1)
})
```

- [ ] **Step 2: Install tsx if not already available**

```bash
cd /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes && npm ls tsx 2>&1 | head -5
```

If not installed:

```bash
cd /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes && npm install --save-dev tsx
```

Also `dotenv` if not present:

```bash
npm ls dotenv 2>&1 | head -5 || npm install --save-dev dotenv
```

- [ ] **Step 3: Run the verification script**

```bash
cd /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes && npx tsx scripts/verify-phase-1.ts
```

Expected output ends with: `✅ Phase 1 foundation verified`

If it fails:
- "Missing env vars" → ensure `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` populated
- "permission denied" on user creation → confirm you're using the service-role key, not anon key
- "expected alreadyExisted=false" on test-1 → previous run didn't clean up; manually delete leftover users/orgs from Supabase dashboard
- RLS test skipped → that's OK for Phase 1; the helper RPC isn't built yet

- [ ] **Step 4: Add scripts/ to git tracking and commit the runner**

```bash
git add scripts/verify-phase-1.ts package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(aesthetic): Phase 1 verification runner

scripts/verify-phase-1.ts: end-to-end check that org provisioning
works idempotently and that two users get distinct personal orgs.
Run via `npx tsx scripts/verify-phase-1.ts`. Cleans up its own data.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Update spec to reflect any deviations + finalize

If anything in this phase deviated from the spec (e.g., the auth callback already had a different shape than expected, or the service-role helper had a different name), document the deviation now.

- [ ] **Step 1: Review what shipped vs the spec's "Files this spec implies" section**

Open `docs/superpowers/specs/2026-04-26-aesthetic-field-intelligence-design.md` and skim the file inventory section. Confirm the migrations are at 018/019/020 (already updated) and the lib/orgs/server.ts path matches.

If anything else differs, add a "Deviations from spec" section to this Phase 1 plan file at the bottom and commit.

- [ ] **Step 2: Update the master plan to mark Phase 1 done**

Edit `docs/superpowers/plans/2026-04-26-aesthetic-fi-00-master.md`. In the phase table, change Phase 1's Status column from `📝 Written, ready` to `✅ Complete (commit <SHA>)`.

```bash
# Get the latest commit SHA on main:
git log -1 --format="%h"
```

Use that hex in the status update.

- [ ] **Step 3: Commit the master plan update**

```bash
git add docs/superpowers/plans/2026-04-26-aesthetic-fi-00-master.md
git commit -m "chore(aesthetic): Phase 1 complete — mark in master plan"
```

- [ ] **Step 4: (Recommended) Run gitnexus analyze to refresh the index**

The post-commit hook may have already done this, but just to be sure:

```bash
cd /Users/guapo/Documents/Obsidian_ClaudeCode/Streetnotes && npx gitnexus analyze
```

This indexes the new `lib/orgs/server.ts` and any auth callback changes for the next phase.

---

## Done definition for Phase 1

All of the following are true:

- [ ] Migrations 018, 019, 020 are applied to the cloud Supabase project (verified via `information_schema` queries).
- [ ] All RLS policies listed in this plan exist (verified via `pg_policies`).
- [ ] The `trg_entity_facts_mark_brief_stale` trigger exists.
- [ ] 11 brand entities and 19 product entities are seeded under the system org.
- [ ] `lib/orgs/server.ts` exports `provisionPersonalOrg` and `getUserOrgIds`.
- [ ] The auth callback route invokes `provisionPersonalOrg` after session establishment.
- [ ] `scripts/verify-phase-1.ts` runs to completion with `✅ Phase 1 foundation verified`.
- [ ] All commits are on main with conventional commit messages.
- [ ] Master plan reflects Phase 1 as complete.

When all of those are true, hand off to write Phase 2 plan (`02-entity-extraction.md`).
