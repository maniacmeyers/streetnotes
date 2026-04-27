# Aesthetic Field Intelligence — v1 Design Spec

**Date:** 2026-04-26
**Status:** Approved for planning
**Owner:** Jeff Meyers (StreetNotes)
**Testing approach:** Verification-first (apply → probe → commit), not TDD with unit tests. Project has no test runner; following established convention. Adding a test framework is explicitly out-of-scope for v1.
**Target ship:** End of Phase 9 + a half-phase ship buffer. Cadence assumption is ~1 phase/day with Claude as co-developer (not 1 phase/week). Earlier "9 weeks" framing is superseded — phases are sized as discrete bodies of work, not calendar units.

---

## Summary

A self-learning rep-facing layer for StreetNotes, built for the aesthetics vertical (injectable + device sales reps). Two paired surfaces:

1. **Field Intelligence** — accumulated voice notes are extracted into rich, aesthetic-specific entity profiles (injectors, practices, brands, products, office staff). On-demand "Brief Me" gives the rep a 30-second pre-visit briefing for any account in their territory.

2. **Aesthetic Story Vault** — full parity with the existing VBrick Story Vault (drafting, practice, scoring, gamification, sharing), but with three aesthetic-specific differences: aesthetic story types (elevator pitch, customer story, objection handler), an FDA-compliance scoring dimension that catches off-label claims, and cross-pollination with the entity model (stories link to injectors/practices/brands; the brief surfaces relevant stories).

The two surfaces cross-pollinate to become one product: the more the rep uses voice capture, the smarter both the briefs and the story library get. This is the differentiator that turns "voice-to-CRM" into the "Field Intelligence Platform for Aesthetic Sales Reps" positioning.

v1 is single-rep (every rep in a personal org). The schema is org-scoped from day one so v2 can layer on team / manager / brand-deal infrastructure without a rewrite.

## Goals

- **Make self-learning visible.** Today's `lib/user-memory` silently improves extraction. v1 surfaces accumulated intelligence to the rep through the Brief Me modal and entity profile pages.
- **Earn the "Field Intelligence" positioning.** Build the aesthetic-specific entity model that no generic CRM has — Loyalty Status, Volume Tier, Decision Authority, GPO membership, Office Staff as a first-class entity.
- **Compound brand value with the Story Vault + compliance dimension.** A rep-facing tool that flags off-label claims is something brand legal/marketing teams will actively want their reps to use. This is the wedge that justifies brand-deal pricing.
- **Set up v2 (team / manager rollup) as a permission overlay, not a rewrite.** Org tables, RLS policies, and the privacy boundary all land in v1.

## Non-goals (v1)

- Calendar integration (Google / Outlook)
- Push notifications
- Background geo-fencing
- Multi-rep team UI (manager dashboards, leaderboards across reps, account sharing between reps)
- Cross-tenant / app-wide intelligence
- Native mobile shell (PWA only)

These are deferred to v2 or beyond. Schema decisions in v1 deliberately do NOT prevent any of them.

---

## Architecture

### System shape

```
CAPTURE (existing)
  Voice → Whisper → Claude structuring → notes table
        │
        ▼
EXTRACT (new)
  lib/aesthetic-entities/extractor.ts
  Claude tool_use with aesthetic schema
  Emits: Injectors, Practices, Brands, Products, Office Staff
        │
        ▼
RECONCILE (new)
  lib/aesthetic-entities/reconcile.ts
  Match new mentions to existing entities (fuzzy + Claude tiebreaker)
  Append facts to entity_facts journal (append-only)
  Mark old facts superseded when contradicted
        │
        ▼
STORE (new)
  Entity tables, org-scoped, RLS-enforced.
  Notes stay user-private; entity facts aggregate to org.
        │
        ▼
CONSUME (new)
  • Brief generator (on-demand, hybrid cache)
  • Profile pages (Injector, Practice, Office Staff)
  • Home "Brief Me" search
  • Accounts tab (territory browser)
  • Aesthetic Story Vault (full VBrick parity + compliance)
```

### Five new subsystems

| Subsystem | File path | Single responsibility |
|---|---|---|
| Extractor | `lib/aesthetic-entities/extractor.ts` | Claude tool_use call producing typed entities + attribute candidates |
| Reconciler | `lib/aesthetic-entities/reconcile.ts` | Match new mentions to existing entities; append facts; supersede contradictions |
| Brief generator | `lib/aesthetic-entities/brief.ts` | Assemble inputs, call Claude, store cached brief, manage staleness |
| Story Vault | `lib/aesthetic-stories/*` | Drafting, practice, scoring (with compliance), gamification, sharing |
| Onboarding importers | `lib/aesthetic-entities/import/{csv,salesforce,hubspot}.ts` | CSV / SF / HS → entity rows |

### Polymorphic entities pattern

A single `entities` table with a type discriminator (`injector | practice | brand | product | office_staff`) and a `metadata` JSONB column for type-specific attributes. Adding a new entity type later is a Zod schema addition + extractor update, not a migration.

### `lib/user-memory` deprecation

Existing `lib/user-memory/server.ts` is superseded. The new entity tables are the source of truth. `/api/structure` reads from `entities` + latest `entity_facts` to prime the extraction prompt. Existing `user-memory` aggregations migrate into the new tables during Phase 2.

---

## Data Model

### Migrations

- `018_aesthetic_entities.sql` — orgs, org_members, entities, entity_facts, entity_briefs, import_jobs
- `019_aesthetic_stories.sql` — story drafts, practice sessions, vault entries, gamification, xp events, challenges
- `020_seed_brands_products.sql` — system-seeded major aesthetic brands and products

### `orgs`

```sql
CREATE TABLE orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('personal', 'brand_team')),
  brand text,
  created_at timestamptz DEFAULT now()
);
```

Every v1 rep is auto-provisioned with a `personal` org on signup. `brand_team` orgs are created in v2 only.

### `org_members`

```sql
CREATE TABLE org_members (
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('rep', 'manager')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);
CREATE INDEX ON org_members (user_id);
```

v1 only ever inserts `role = 'rep'`. The `manager` role exists in the enum so v2 can assign it without a schema change.

### `entities`

```sql
CREATE TABLE entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('injector','practice','brand','product','office_staff')),
  canonical_name text NOT NULL,
  display_name text,
  aliases text[] DEFAULT '{}',
  practice_id uuid REFERENCES entities(id),  -- only for injector and office_staff types
  metadata jsonb NOT NULL DEFAULT '{}',
  source text NOT NULL CHECK (source IN ('voice_note','csv_import','sf_sync','hs_sync','manual')),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_mentioned_at timestamptz,
  mention_count int NOT NULL DEFAULT 0,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX ON entities (org_id, type);
CREATE INDEX ON entities (org_id, type, last_mentioned_at DESC);
CREATE INDEX ON entities (owner_user_id);
CREATE INDEX ON entities (practice_id) WHERE practice_id IS NOT NULL;
CREATE INDEX ON entities USING gin (aliases);
CREATE INDEX ON entities USING gin (to_tsvector('english', canonical_name || ' ' || coalesce(display_name, '')));
```

### Metadata schemas (Zod-validated at write time)

| Type | Schema |
|---|---|
| `injector` | `{ credential, specialty[], patient_volume_per_week?, products_used[], loyalty_status?, decision_authority?, schedule_preferences_text?, personal_notes? }` (`schedule_preferences_text` is free-text in v1; structured slots deferred) |
| `practice` | `{ address, ownership_model, volume_tier?, gpo_membership?, exclusive_contracts[], patient_demographics? }` |
| `brand` | `{ category[], market_position?, current_promotions[], rep_contact? }` |
| `product` | `{ brand_id, category, indication[], competitor_product_ids[] }` |
| `office_staff` | `{ role, gatekeeper, contact_preference?, personal_notes? }` |

### `entity_facts` (append-only journal)

```sql
CREATE TABLE entity_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  observed_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  source_note_id uuid REFERENCES notes(id) ON DELETE SET NULL,
  source text NOT NULL CHECK (source IN ('voice_note','csv_import','sf_sync','hs_sync','manual')),
  fact_key text NOT NULL,
  fact_value jsonb NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('low','medium','high')),
  observed_at timestamptz NOT NULL,
  superseded_at timestamptz,
  superseded_by_id uuid REFERENCES entity_facts(id),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON entity_facts (entity_id, fact_key, observed_at DESC);
CREATE INDEX ON entity_facts (org_id, observed_at DESC);
CREATE INDEX ON entity_facts (source_note_id);
```

Append-only by policy (no UPDATE except for `superseded_at` set by the system role). Briefs read the latest non-superseded fact per `(entity_id, fact_key)`. The journal is the audit trail that makes self-learning observable and enables v2 manager visibility into "how did our knowledge of this account evolve."

### `entity_briefs`

```sql
CREATE TABLE entity_briefs (
  entity_id uuid PRIMARY KEY REFERENCES entities(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  generated_for_user_id uuid NOT NULL REFERENCES auth.users(id),
  brief_markdown text NOT NULL,
  brief_structured jsonb NOT NULL,
  facts_snapshot_hash text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now()
);
```

Stale-marking via trigger on `entity_facts` insert (appends `:stale` suffix to `facts_snapshot_hash`). The next API call sees the suffix, returns the cached brief, and enqueues background regeneration.

### `import_jobs`

```sql
CREATE TABLE import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  source text NOT NULL CHECK (source IN ('csv','salesforce','hubspot')),
  status text NOT NULL CHECK (status IN ('queued','running','completed','failed')),
  rows_total int,
  rows_succeeded int DEFAULT 0,
  rows_failed int DEFAULT 0,
  error_log jsonb DEFAULT '[]',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### Story Vault tables (`019_aesthetic_stories.sql`)

```sql
CREATE TABLE aesthetic_story_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES auth.users(id),
  story_type text NOT NULL CHECK (story_type IN ('elevator_pitch','customer_story','objection_handler')),
  title text,
  draft_content text NOT NULL DEFAULT '',
  ai_conversation jsonb DEFAULT '[]',
  framework_metadata jsonb DEFAULT '{}',
  related_entity_ids uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','practicing','completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE aesthetic_story_practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_draft_id uuid NOT NULL REFERENCES aesthetic_story_drafts(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  transcript text,
  duration_seconds int,
  score_framework decimal(4,2),
  score_clarity decimal(4,2),
  score_confidence decimal(4,2),
  score_pacing decimal(4,2),
  score_specificity decimal(4,2),
  score_brevity decimal(4,2),
  score_compliance decimal(4,2),  -- NEW vs VBrick
  composite_score decimal(4,2),
  improvement_notes jsonb DEFAULT '{}',
  compliance_flags jsonb DEFAULT '[]',  -- NEW: list of off-label claims detected
  coaching_note text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE aesthetic_story_vault_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_session_id uuid NOT NULL REFERENCES aesthetic_story_practice_sessions(id) ON DELETE CASCADE,
  story_draft_id uuid NOT NULL REFERENCES aesthetic_story_drafts(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  story_type text NOT NULL,
  title text NOT NULL,
  transcript text NOT NULL,
  composite_score decimal(4,2) NOT NULL,
  is_personal_best boolean DEFAULT false,
  shared_to_team boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE rep_gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  xp_total int DEFAULT 0,
  level int DEFAULT 1,
  current_streak int DEFAULT 0,
  longest_streak int DEFAULT 0,
  last_practice_date date,
  streak_freeze_available boolean DEFAULT true,
  streak_freeze_used_this_week date,
  badges jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE rep_xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  event_type text NOT NULL,
  xp_awarded int NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE aesthetic_story_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_entry_id uuid NOT NULL REFERENCES aesthetic_story_vault_entries(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  share_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  view_count int DEFAULT 0,
  attempt_count int DEFAULT 0,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON aesthetic_story_challenges (share_token);

-- Manager-invite-via-link: subscribers to a rep's shared artifacts.
-- A subscriber gets:
--   • notifications when the rep generates a new public share link
--   • a "Saved Links" view of all share-link tokens the rep has explicitly shared with them
-- A subscriber does NOT get:
--   • automatic read on all shared_to_team artifacts (that's v2 org_members)
--   • access to the rep's notes, briefs, or unshared stories
CREATE TABLE rep_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriber_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_on_new_share boolean NOT NULL DEFAULT true,
  invited_via_token text REFERENCES aesthetic_story_challenges(share_token),  -- the link that invited them
  created_at timestamptz DEFAULT now(),
  UNIQUE (rep_user_id, subscriber_user_id)
);
CREATE INDEX ON rep_subscribers (subscriber_user_id);
CREATE INDEX ON rep_subscribers (rep_user_id);
```

### RLS policies

```sql
-- entities: read by org members, write by owner
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY entities_read ON entities FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())));
CREATE POLICY entities_insert ON entities FOR INSERT
  WITH CHECK (owner_user_id = (SELECT auth.uid()) AND org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())));
CREATE POLICY entities_update ON entities FOR UPDATE
  USING (owner_user_id = (SELECT auth.uid()));

-- entity_facts: read by org members, write by observer (system role for supersede updates)
ALTER TABLE entity_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY entity_facts_read ON entity_facts FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())));
CREATE POLICY entity_facts_insert ON entity_facts FOR INSERT
  WITH CHECK (observed_by_user_id = (SELECT auth.uid()));
-- No UPDATE policy for users; service_role bypasses RLS for supersede operations

-- entity_briefs: read by org members; only service_role writes
ALTER TABLE entity_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY entity_briefs_read ON entity_briefs FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = (SELECT auth.uid())));

-- Story tables follow the same pattern: read by org_members, write by author.
-- Vault entries with shared_to_team = true are visible to other org members in v2.
```

`notes` table is **unchanged** — still scoped to `user_id` only. This is the privacy boundary: extracted facts roll up to the org; raw transcripts never leave the rep.

---

## Cold-Start Onboarding

Goal: rep completes onboarding with a non-empty Accounts tab and at least one usable brief in under 5 minutes.

### Three paths

**Path A: CSV territory import (default)**
- Downloadable template with pre-filled headers and 2 example rows.
- Columns: Practice Name, City, State, Practice Type, Owner Name, Owner Credential, Other Injectors, Volume Tier, Loyalty Status, Notes.
- Client-side parse with PapaParse — supports paste-from-spreadsheet without upload.
- Column auto-mapper guesses headers → schema fields, rep confirms.
- Preview screen shows first 10 rows with detected entities, conflict flags, validation warnings.
- `POST /api/aesthetic/import/csv` enqueues `import_jobs` row.
- Worker creates Practice + Injector entities, FK'd. Free-text Notes column → Claude extractor → seeds `entity_facts` with `confidence = 'low'`.
- Edge cases: duplicate practice names (offer merge), missing owner (skip injector + flag), unparseable rows (log + show "fix these N rows" prompt).

**Path B: Salesforce / HubSpot opt-in sync**
- Reuses existing OAuth infrastructure (`app/api/auth/salesforce/connect/`, `app/api/auth/hubspot/connect/`).
- Filter screen: "Contacts I've touched in last 90 days" (default), "All contacts," or "Only contacts on open opportunities." Account types: Med-Spa / Dermatology / Plastic Surgery / Other.
- SF mapping: Account → Practice; Contact (filtered for MD/NP/RN/PA) → Injector; Contact (filtered for Office Manager / Coordinator) → Office Staff; Opportunity → entity_fact on practice.
- Activity history (Tasks/Events) NOT pulled in v1 — too messy, low signal.
- Unmapped contacts surfaced as "Review N unmapped contacts" prompt; rep can ignore or work through.
- Disconnect-safe: synced entities stay if rep later disconnects SF; future syncs reconcile by name + practice.

**Path C: Skip / organic**
- Empty Accounts tab with CTA: *"Record a voice note about a visit and your first injector profile will appear here."*
- First voice note triggers extractor which writes to new entity tables.

### Brand & product seeding

System-seeded migration `020_seed_brands_products.sql` creates the major aesthetic brands and products as `entities` rows owned by a system org. Reps don't need to import these. The seed list:

- Brands: Allergan (AbbVie), Galderma, Merz, Revance, Evolus, InMode, BTL, Cutera, Sciton, Hydrafacial, Sofwave
- Products (sampled): Botox, Daxxify, Dysport, Xeomin, Juvederm, Restylane, Belotero, RHA Collection, Sculptra, Radiesse, Emsculpt, Morpheus8, Forma, BodyTite, Sofwave, Hydrafacial signature

---

## Aesthetic Story Vault (full VBrick parity + compliance)

### Mirroring VBrick

The structure mirrors the existing VBrick Story Vault (`006_story_vault.sql`, `012_story_challenges.sql`) with three deliberate differences:

1. **Identity model** — uses `user_id` + `org_id` instead of `bdr_email`. Real RLS, ties into team-sharing infrastructure.
2. **Compliance dimension** — adds a 7th scoring dimension that detects FDA off-label claims, unapproved indications, and comparative efficacy claims without head-to-head data.
3. **Entity cross-pollination** — stories reference Injector / Practice / Brand / Product entities via `related_entity_ids[]`.

### Story types

| Type | Framework | Target duration |
|---|---|---|
| `elevator_pitch` | Problem → Solution → Proof → Ask | 60s |
| `customer_story` | Status Quo → Trigger → Trial → Outcome → Adoption (aesthetic-tuned ABT) | 90s |
| `objection_handler` | Acknowledge → Reframe → Evidence → Trial Close (aesthetic-tuned F-F-F) | 75s |

### Drafting wizard

Conversational chat with AI (mirrors VBrick `DRAFTING_ASSISTANT_SYSTEM_PROMPT` pattern), aesthetic-flavored peer voice. Slot-question flow with entity picker that prefills from injector / practice profile data. AI assembles draft on completion via `getDraftAssemblyPrompt`-style call.

### Practice + scoring

- Practice recorder reuses existing voice capture infrastructure.
- Whisper transcription.
- Claude scoring engine with 7-dimension prompt (6 standard from VBrick + compliance).
- Compliance scoring details:
  - Reads from product entity metadata to know FDA-approved indications and duration claims.
  - Flags off-label claims, unapproved indications, comparative efficacy without head-to-head data.
  - Returns `score_compliance` (0–10) + `compliance_flags[]` (list of specific claims with rephrase suggestions).
- Score card UI: 7 dimensions inline + a yellow alert panel below for compliance flags + coaching note. Reuse existing VBrick score visualization patterns (`ScoreBadge`, `getScoreColor`, `getScoreBg`, `BestScores` — see `components/vbrick/stories/story-leaderboard.tsx`, `components/vbrick/sparring-dashboard.tsx`) — extract to a shared `components/scoring/*` library during implementation.
- **Compliance is a score, not a hard block.** v1 does NOT prevent saving low-compliance stories to the vault. (Hard block deferred until a brand-deal customer explicitly requests it as a guardrail.)
- **Personal-best logic on save:** when a vault entry is created with `composite_score` higher than the existing personal-best for `(user_id, story_type)`, the new row is inserted with `is_personal_best = true` and the previous personal-best row's flag is cleared in the same transaction. Awards a "Personal Best" XP event.

### Gamification

XP/level/streak/badge mechanics mirror VBrick. Aesthetic-themed badges:

- First Pitch / First Customer Story / First Objection Handler
- Daxxify Specialist (5 stories tagged with Daxxify product entity)
- Objection Crusher (5 objection handlers scored ≥80 composite)
- Customer Champion (3 customer stories scored ≥85 composite)
- Compliance Pro (10 stories scored 10/10 on compliance)
- ~~Conference Closer~~ — **deferred**, requires events UI not in v1 scope
- Streak: 7 / 30 / 90 days
- Personal Best (new high score on any story type)

Gamification header always visible at top of Stories tab.

### Sharing model in v1

Three behaviors that meet the spirit of "team sharing" given v1 has no real teams:

1. **Tokenized share links** — port of VBrick `story_challenges` mechanic. Rep generates a link for any vault entry. Public read-only view + optional "beat the score" challenge.
2. **`shared_to_team` boolean** on vault entries (already in schema). v1 no-op (no teammates). v2 auto-activates when team orgs ship.
3. **Manager-invite-via-link wedge** — when rep generates a share link, an option: "Send to my manager." Manager opens link → magic-link signup → read-only account scoped to *only the rep's shared artifacts*. Not a full org membership. The wedge that turns "individual rep using app" into "rep's manager logged in once" — the brand-deal sales signal.

---

## Brief Generation Pipeline

### End-to-end flow

```
Rep taps entity → GET /api/aesthetic/brief/[entity_id]
  → cache check on entity_briefs
    → cache hit: return immediately
    → cache miss / stale: assemble inputs → Claude → store + return
  → if cache hit: parallel staleness recheck → enqueue background regen if hash differs
```

### Inputs assembled per brief

1. **Entity profile** — `entities` row + parsed metadata. For an injector, also include their practice's profile.
2. **Latest facts** — most recent non-superseded fact per `fact_key` from `entity_facts`, with timestamps.
3. **Recent notes (last 5)** — full transcripts of the rep's most recent voice notes that mention this entity. "Mention" = at least one row in `entity_facts` for this entity has `source_note_id` pointing to the note. Ordered by `notes.created_at DESC`, capped at 5.
4. **Outstanding promises** — `entity_facts` where `fact_key = 'promised_followup'` with no later resolution fact.
5. **Related entities** — for an injector, the practice + other injectors there + office staff. For a practice, the full roster.
6. **Relevant stories** — `aesthetic_story_vault_entries` where `related_entity_ids[]` contains this entity OR any related entity. Top 3 by composite score.

Total input size: typically 8K–20K tokens. Comfortable in Sonnet's window.

### Output schema (Claude tool_use)

```typescript
{
  headline_signal: string,
  status_summary: { loyalty: string, volume: string, decision_authority: string },
  recent_arc: string[],
  visit_history: VisitSummary[],
  likely_topics: string[],
  outstanding_promises: Promise[],
  warnings: string[],  // includes off-label claim flags
  relevant_stories: StoryRef[],
  staleness_warnings: string[]
}
```

### Caching strategy: hybrid (instant + background freshness)

- First tap on a new entity → cache miss → generate fresh (~2s) → store + return.
- Subsequent taps → cache hit returns instantly. Parallel staleness recheck. If facts hash differs, enqueue background regen.
- Background regeneration via Vercel cron (60s interval), batched, idempotent. **Regen scope:** only briefs with stale hash AND `entities.last_mentioned_at` within the last 14 days (i.e., active entities). Inactive-entity briefs regenerate lazily on next user tap. Prevents background work for thousands of dormant entities.
- Stale-flagging via trigger on `entity_facts` insert: appends `:stale` suffix to `facts_snapshot_hash`.

### Cost envelope

Per active rep: ~50 actively-engaged entities, ~5 brief views/day, ~70% cache hit rate → ~7.5 fresh generations/day → ~$0.11/day → ~$3.30/month. Against $199 ARPU, that's ~1.7%. Alarm threshold per rep: $20/month.

### Failure modes

| Failure | Handling |
|---|---|
| Claude timeout / 5xx | Return cached brief with `degraded: true` flag; UI shows "couldn't refresh" banner. Background retry. |
| Claude returns invalid tool_use | Zod validation fails → return previous cache or minimal raw-profile fallback. |
| No data on entity (cold-start) | Stub brief from entity row + practice context only, with explicit "no call notes yet" framing. |
| RLS denied (different org) | 403 with "this entity isn't in your territory" message. |
| Outstanding promise extraction unreliable | Confidence-rank: only `confidence = 'high'` promises surface in brief. Lower-confidence ones go to profile page. |

---

## UI Surfaces

Existing app visual language preserved throughout. All decisions below are functional/layout, not visual redesign.

### Bottom navigation

Four tabs: **Home** · **Accounts** *(new)* · **Stories** · **Settings**. The Stories tab already exists at `app/(protected)/stories`; we extend its contents.

### Home dashboard

Layout (top to bottom):

1. Existing top header (unchanged)
2. Existing greeting / date (unchanged)
3. **NEW: Brief Me block** (search input + Recent entities list, top 5 sorted by `last_mentioned_at`)
4. Existing voice-capture card (unchanged, retains visual weight)
5. Existing Recent Notes list (unchanged)

Brief Me sits **above** voice capture — pre-visit moment is the more time-pressured one. Risk: if voice-note recording volume drops > 20% vs. baseline in first 2–3 weeks, swap to put voice capture above.

### Brief modal

Bottom-sheet overlay on mobile (full-screen on small viewports, ~80vh sheet on larger). If the existing app already has a modal/sheet primitive (check `components/ui/` and `components/streetnotes/brutal/` during implementation), reuse it. Otherwise establish using `@radix-ui/react-dialog` (already a transitive dep via shadcn-style patterns elsewhere in the repo). Single scroll. Sections in priority order:

1. Entity name + type tag
2. Headline signal (one-sentence "what matters most right now")
3. Status chips (Loyalty / Volume / Decision Authority)
4. Outstanding promises (red marker if any)
5. Compliance warnings (yellow marker if any)
6. Likely topics today
7. Recent arc
8. Visit history (last 3, tap to open original note)
9. Relevant stories (cards from Story Vault)
10. Staleness flags
11. Footer: generation timestamp + refresh action

**Smart-collapse:** sections with no content do not render at all. Sections with content are always expanded. No manual taps required to see anything.

### Accounts tab

- Search input (filter by name)
- Filter chips (multi-select, horizontal scroll): All · Injectors · Practices · Office Staff · Loyalty: Loyal · Loyalty: Trialing · Volume: High · Decision: Owner
- Sort: **Recency of last mention (default)** · Volume tier · Alphabetical
- List rows show entity name, type, key context (practice / loyalty / volume), last-mentioned date

### Injector profile page

Tabbed: **Overview** · **Notes (count)** · **Stories (count)** · **Edit**

- Header: name, credential, practice link, "created N weeks ago from voice note"
- Brief Me button at top
- Overview tab sections: Status / Practice / Recent Facts (live append-only journal) / Related (other injectors at practice + office staff)
- Notes tab: chronological list of all voice notes mentioning this injector, tap to view
- Stories tab: stories tagged with this injector via `related_entity_ids[]`
- Edit tab: dedicated manual-override surface. Edits create new `entity_fact` rows with `source = 'manual'`, `confidence = 'high'`. Old extracted fact superseded but stays in journal. Surfaces in Recent Facts as "You corrected X to Y on [date]"

### Practice profile page

Same 4-tab structure as Injector. Three structural differences:
- Roster section (injectors + office staff at this practice, each linking to their profile)
- Practice metadata block (ownership model, GPO membership, exclusive contracts, address)
- Notes tab shows all notes mentioning the practice OR any injector at the practice (rolled up)

### Stories tab

- Gamification header (always visible): Level / XP / streak / badge count
- Sub-tabs: **My Stories (count)** · **Shared with Me (count)** · **Vault** (filtered view of `aesthetic_story_vault_entries` showing only `is_personal_best = true` rows — the rep's best score per `story_type`)
- Type filter row: All · Elevator Pitch · Customer Story · Objection Handler
- Story rows show title, type, score, personal-best badge, linked entities

### Drafting wizard

- Type picker (3 chips)
- Related entities picker (optional but encouraged)
- Conversational AI flow: slot questions delivered as chat, AI pushes for specifics
- "Assemble Draft" CTA at end → AI assembles polished draft via separate Claude call

### Practice recorder + score card

- Read assembled draft, then record attempt
- Reuses voice capture infrastructure
- Whisper transcription
- Score card: 6 standard dimensions inline + 7th compliance dimension highlighted + yellow compliance alert panel below + coaching note + XP earned
- Actions: Save to Vault · Share

---

## Team v2 Prep

What v1 ships specifically to make v2 a permission overlay:

- `orgs` table with `personal` / `brand_team` types (only `personal` used in v1)
- `org_members` table with `rep` / `manager` roles (only `rep` assigned in v1)
- `org_id` on every entity-related and story-related table
- `org_id` deliberately **NOT** on `notes` (privacy boundary)
- RLS policies use org-membership reads and owner-restricted writes — v2 manager joining the org instantly gains read access without code changes
- Manager-invite-via-link wedge: read-only access to a rep's shared artifacts via magic-link signup

### What v2 enables without schema changes

- Manager rollup view (read entities + entity_facts for all reps in their org)
- Team leaderboard (aggregate `rep_gamification` by org_id)
- Account ownership transfer (UPDATE `entities.owner_user_id` when a rep leaves)
- Shared story library (`shared_to_team = true` becomes meaningful)
- Brand-tagged community library (Path 2 — adds new visibility level + cross-org RLS, no schema change)

### What v1 deliberately does NOT prepare for

- Account-level sharing between reps (would need `entity_shares` junction — defer to v2.5)
- Multi-org membership (PK supports it, no UI in v1 — defer to v3)
- Inter-org access (hard wall via RLS — never)

### Privacy boundary (architectural promise)

- **Raw voice-note transcripts** stay in `notes` (`user_id`-scoped). Manager never reads these, even in v2.
- **Extracted entity facts** roll up to `org_id`. Manager reads these in v2.
- **Stories** marked `shared_to_team` (default false) become visible to org members in v2.
- **Gamification stats** roll up to org for leaderboards in v2.
- **Briefs** are generated per-rep — even when two reps share an entity, each gets their own brief tailored to their own note history.

This is the line that makes the brand-deal sale possible. Rep complaints about Dr. Patel's mood, the AC being broken, the office manager being grumpy — all stay in the rep's notes, never in extracted facts, never visible to the manager.

---

## Phasing — Phase by Phase

Cadence is approximately one phase per day with Claude as co-developer. Phases are units of work, not calendar units.

| Phase | Track | Output | Milestone |
|---|---|---|---|
| 1 | Foundation | Schema migrations (014/015/016), RLS policies, org auto-provisioning, brand/product seeds | |
| 2 | Field Intelligence | Aesthetic entity extractor, reconciler, hook into `/api/structure`, backfill `user-memory` | |
| 3 | Field Intelligence | Brief generator lib, `/api/aesthetic/brief/[id]`, hybrid cache + stale trigger, background regen cron | 🎯 Brief works end-to-end on test data → demo to Michael |
| 4 | UI | Bottom nav with Accounts tab, Home Brief Me block, Accounts list, Brief modal, Injector + Practice profile pages | |
| 5 | Onboarding | CSV importer (template, parser, preview, async job, error UI), SF/HS opt-in sync, Path C empty state | 🎯 Full onboarding → brief works for real test rep → first brand-prospect demo |
| 6 | Story Vault | Story tables migration, aesthetic frameworks, drafting prompts (with compliance), drafting wizard UI | |
| 7 | Story Vault | Practice recorder, Whisper integration, scoring engine (6 + compliance), score card UI, vault promotion | **Compliance prompt review with aesthetic regulatory contact (Michael's network)** |
| 8 | Story Vault | XP engine, streak tracking, aesthetic-themed badges, challenge sharing, manager-invite wedge, Stories tab shell | 🎯 Story Vault end-to-end → second brand-prospect demo |
| 9 | Cross-pollination + alpha | Brief surfaces relevant stories, story drafting prefills from entity profile, internal demo, concierge alpha with first 3–5 reps, bug fixing | |
| Ship | — | Final QA, production deploy, concierge full launch with first 20 reps, monitoring dashboards live | 🚀 v1 GA |

### Non-engineering dependencies

- **Before Phase 1:** Michael lines up 2 brand-prospect calls for the Phase 5 demo (Revance, Evolus, or Merz). Even with daily phase cadence these need real lead time — start scheduling now.
- **Before Phase 7:** schedule 1-hour compliance prompt review with aesthetic medical-affairs or regulatory contact. **Block on completion before locking compliance prompt.**

---

## Risks

1. **Compliance prompt quality.** The compliance dimension is what makes the brand-deal pitch work. Over-flagging (false positives) annoys reps; under-flagging misses real off-label claims. Mitigation: 1-hour review with an actual aesthetic medical-affairs or regulatory contact before locking the prompt. Calendar overhead is worth it.

2. **CSV import data quality.** Reps' spreadsheets are messy. Edge-case handling could expand by 1–2 days. Mitigation: ship with a self-serve error-log UI, not a support ticket workflow.

3. **SF entity matching ambiguity.** Salesforce Contact data is dirty. "Sarah P, MD" → "Dr. Sarah Patel" requires fuzzy matching that may misfire. Mitigation: SF sync requires user confirmation on each ambiguous match. Conservative defaults.

4. **Whisper cost on Story Vault practice.** Practice recordings are 60–90s but reps may attempt many times. Budget envelope: ~$0.006/attempt → $1.50/rep/month at 250 attempts. Negligible at $199 ARPU. Alarm: $10/rep/month.

5. **Big-bang launch risk.** Even at daily-phase cadence, the rep-facing surface lands all at once at Phase 9. Mitigated by internal demos at end of Phases 3 / 5 / 8 and the Phase 9 concierge alpha with 5 reps before full launch.

6. **Voice-note recording volume regression.** New Brief Me block sits above voice capture. If recording volume drops > 20% vs. baseline in first 2–3 weeks, swap layout to put voice capture above Brief Me. Required metric: weekly notes-per-active-rep with pre-launch baseline.

---

## Success Metrics

Instrumented from v1 launch:

| Metric | Target | Alarm threshold |
|---|---|---|
| Time-to-first-brief on signup | < 5 min | > 10 min |
| Brief views per active rep per week | ≥ 10 | < 3 |
| Brief cache hit rate | ≥ 70% | < 50% |
| Brief generation cost per rep per month | ≤ $4 | > $20 |
| Voice notes per active rep per week (vs. pre-launch baseline) | ≥ 100% | < 80% |
| Story Vault practice attempts per active rep per week | ≥ 3 | < 1 |
| Compliance flag rate (% of practice attempts with at least one flag) | 10–30% | < 5% (under-flagging) or > 50% (over-flagging) |
| Manager-invite-via-link conversions (links opened by recipient) | ≥ 30% | < 10% |
| CSV import completion rate (started → completed) | ≥ 80% | < 60% |
| SF/HS sync opt-in rate (reps connected to SF/HS who use the sync) | ≥ 50% | < 25% |

---

## Open Questions / Out-of-Scope (deferred)

- **Calendar integration** (Google / Outlook). Deferred until rep feedback says "I wish it just knew who was next."
- **Push notifications.** Requires native shell — deferred until conversion to true mobile app.
- **Background geo-fencing.** Same constraint.
- **Manager dashboards / leaderboards / team views.** v2.
- **Brand-tagged community library** (cross-rep within brand). Worth reconsidering once we have ~10+ reps per brand on the platform.
- **Hard block on low compliance scores** preventing vault save. Defer until a brand-deal customer explicitly requests it as a guardrail.
- **App-wide cross-tenant intelligence.** Defer until ~100+ reps live.
- **Account-level sharing between reps** (vacation coverage, handoff). v2.5 if needed.
- **Multi-org membership** (rep at two brands). v3.

---

## Files this spec implies (forward reference for the implementation plan)

### Migrations

- `supabase/migrations/018_aesthetic_entities.sql`
- `supabase/migrations/019_aesthetic_stories.sql`
- `supabase/migrations/020_seed_brands_products.sql`

### New libs

- `lib/aesthetic-entities/extractor.ts`
- `lib/aesthetic-entities/reconcile.ts`
- `lib/aesthetic-entities/brief.ts`
- `lib/aesthetic-entities/schema.ts` (Zod metadata schemas per entity type)
- `lib/aesthetic-entities/import/csv.ts`
- `lib/aesthetic-entities/import/salesforce.ts`
- `lib/aesthetic-entities/import/hubspot.ts`
- `lib/aesthetic-stories/frameworks.ts`
- `lib/aesthetic-stories/prompts.ts` (drafting, scoring with compliance, assistant)
- `lib/aesthetic-stories/scoring.ts`
- `lib/aesthetic-stories/gamification.ts`
- `lib/orgs/server.ts` (org provisioning, membership)

### New API routes

- `app/api/aesthetic/brief/[entity_id]/route.ts`
- `app/api/aesthetic/entities/route.ts` (list with filters)
- `app/api/aesthetic/entities/[id]/route.ts` (get, update)
- `app/api/aesthetic/entities/[id]/facts/route.ts`
- `app/api/aesthetic/import/csv/route.ts`
- `app/api/aesthetic/import/salesforce/route.ts`
- `app/api/aesthetic/import/hubspot/route.ts`
- `app/api/aesthetic/stories/drafts/route.ts` + `[id]/route.ts` + `[id]/ai/route.ts`
- `app/api/aesthetic/stories/practice/route.ts`
- `app/api/aesthetic/stories/vault/route.ts` + `[id]/route.ts`
- `app/api/aesthetic/stories/challenge/route.ts` + `[token]/route.ts`
- `app/api/aesthetic/stories/gamification/route.ts`
- `app/api/aesthetic/manager-invite/route.ts`
- `app/api/cron/regenerate-stale-briefs/route.ts`

### New pages

- `app/(protected)/accounts/page.tsx` (list)
- `app/(protected)/accounts/[id]/page.tsx` (profile — Injector or Practice based on type)
- `app/(protected)/stories/page.tsx` (extend existing — add aesthetic surfaces)
- `app/(protected)/stories/draft/page.tsx` (drafting wizard)
- `app/(protected)/stories/practice/[draft_id]/page.tsx`
- `app/(protected)/onboarding/page.tsx` (3-path picker)
- `app/(protected)/onboarding/csv/page.tsx`
- `app/(protected)/onboarding/sync/page.tsx`
- `app/share/[token]/page.tsx` (public read-only — entity brief OR story)

### New components

- `components/aesthetic/brief-me-search.tsx` (home)
- `components/aesthetic/brief-modal.tsx`
- `components/aesthetic/entity-list.tsx` + `entity-list-filters.tsx`
- `components/aesthetic/injector-profile.tsx`
- `components/aesthetic/practice-profile.tsx`
- `components/aesthetic/profile-tabs.tsx` (shared Overview/Notes/Stories/Edit)
- `components/aesthetic/csv-importer.tsx`
- `components/aesthetic/sync-importer.tsx`
- `components/aesthetic-stories/drafting-wizard.tsx`
- `components/aesthetic-stories/practice-recorder.tsx` (wraps existing voice infra)
- `components/aesthetic-stories/score-card.tsx` (with compliance panel)
- `components/aesthetic-stories/vault-card.tsx`
- `components/aesthetic-stories/gamification-header.tsx`
- `components/aesthetic-stories/share-link-modal.tsx`

### Modified files

- `app/(protected)/layout.tsx` — add Accounts to nav
- `app/(protected)/page.tsx` (home) — add Brief Me block above voice capture
- `app/api/structure/route.ts` — write to new entity tables instead of `lib/user-memory`
- `lib/user-memory/server.ts` — deprecate (keep file with compatibility shim during transition)
- `middleware.ts` — add `/share/*` to public route whitelist

---

*End of design spec.*
