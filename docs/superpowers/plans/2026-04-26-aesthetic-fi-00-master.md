# Aesthetic Field Intelligence v1 — Master Plan Index

**Spec:** [`docs/superpowers/specs/2026-04-26-aesthetic-field-intelligence-design.md`](../specs/2026-04-26-aesthetic-field-intelligence-design.md)
**Cadence:** ~1 phase per day with Claude as co-developer.
**Branch:** `main` (no worktree — user preference).
**Testing:** Verification-first (apply change → probe to verify → commit). Project has no unit-test runner; do **not** add one as part of this build.

> **For agentic workers:** REQUIRED SUB-SKILL — use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement each phase plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

---

## What this builds

A self-learning rep-facing intelligence layer for aesthetic sales reps. Two paired surfaces — Field Intelligence (entity profiles + on-demand briefs) and Aesthetic Story Vault (drafting / practice / scoring with FDA-compliance dimension / gamification / sharing) — that cross-pollinate via a shared entity model. Org-scoped from day one so v2 (manager rollup, brand-team contracts) is a permission overlay, not a rewrite. See spec for the full design rationale.

## Phase plan index

| # | Phase | File | Status | Self-contained outcome |
|---|---|---|---|---|
| 1 | Foundation | [`01-foundation.md`](./2026-04-26-aesthetic-fi-01-foundation.md) | 📝 Written, ready | Migrations 018/019/020 applied, RLS verified, org auto-provisioning works on signup |
| 2 | Entity extraction | `02-entity-extraction.md` | ⏳ Not yet written | Voice notes write to `entities` + `entity_facts`; reconciler resolves duplicates |
| 3 | Brief generation | `03-brief-generation.md` | ⏳ Not yet written | `/api/aesthetic/brief/[id]` returns structured brief with hybrid cache |
| 4 | UI — Field Intelligence | `04-ui-field-intelligence.md` | ⏳ Not yet written | Home Brief Me + Accounts list + Brief modal + profile pages all render |
| 5 | Onboarding | `05-onboarding.md` | ⏳ Not yet written | CSV import + opt-in SF/HS sync end-to-end |
| 6 | Story Vault — drafting | `06-story-vault-drafting.md` | ⏳ Not yet written | Drafting wizard produces saveable drafts |
| 7 | Story Vault — scoring | `07-story-vault-scoring.md` | ⏳ Not yet written | Practice → 7-dimension score (with compliance) → vault entry |
| 8 | Story Vault — gamification | `08-story-vault-gamification.md` | ⏳ Not yet written | XP / levels / streaks / badges / sharing / manager-invite wedge |
| 9 | Cross-pollination + alpha | `09-cross-pollination-alpha.md` | ⏳ Not yet written | Brief surfaces stories; story drafting prefills from entity profiles; concierge alpha |

**Why phases 2–9 are not yet written:** each subsequent phase plan reflects what we actually learned in earlier phases. Writing all nine upfront would lock in assumptions that should adapt. Each phase plan gets written when the previous phase is approaching completion. This is the recommended pattern from `superpowers:writing-plans` for multi-subsystem builds.

## Conventions

### Migration numbering

Repo already has migration files through `017_crm_export_log.sql`. This build uses **018 / 019 / 020**:

- `018_aesthetic_entities.sql` — orgs, org_members, entities, entity_facts, entity_briefs, import_jobs + RLS
- `019_aesthetic_stories.sql` — drafts, practice_sessions, vault_entries, gamification, xp_events, challenges, rep_subscribers + RLS
- `020_seed_brands_products.sql` — system-seeded major aesthetic brands and their products

### Applying migrations

The project applies migrations to cloud Supabase (no local Postgres). Two paths, in priority order:

1. **Supabase MCP** (preferred if configured) — use `mcp__040c023a-909d-4af4-8b86-fc9c587a70e8__apply_migration` with the project ID. Atomic application.
2. **Supabase Studio** (manual) — paste SQL into the SQL editor in the dashboard. Use this if MCP isn't available.

Phase 1 plan walks through both.

### Code style

- Follow established patterns in `lib/`, `app/api/`, `components/streetnotes/`. The repo is mobile-first (`max-w-md mx-auto`), uses `@supabase/ssr` (never `auth-helpers`), uses Zod for validation, and uses Anthropic's tool_use for structured Claude output.
- Brand voice for any user-facing copy: direct, no buzzwords, no "leverage / seamlessly / robust." See `CLAUDE.md`.
- New libs go under `lib/aesthetic-entities/` and `lib/aesthetic-stories/`. Components under `components/aesthetic/` and `components/aesthetic-stories/`.

### Commits

- Small, frequent commits per task. Follow existing commit style: `feat(aesthetic): ...`, `fix(aesthetic): ...`, `chore(aesthetic): ...`.
- Each phase plan ends with one or more "Commit" steps that show the exact `git add` + `git commit` commands.

### Verification (instead of unit tests)

Project has no test runner. Each task ends with a verification step that proves the change works:

- Migration: apply → query `information_schema` to confirm tables/columns/indexes/policies exist → query as a different user role to confirm RLS denies unauthorized reads.
- API route: `curl` request against running dev server (`npm run dev`) → assert response shape matches expected.
- UI: load page in browser, manually verify behavior (or use Playwright via existing `screenshot-mobile.js` pattern for repeatable checks).
- Lib function: invoke from `node --experimental-vm-modules -e '...'` or a temporary `scripts/verify-*.ts` runner.

## Non-engineering dependencies (track these in parallel)

- **Before Phase 5:** Michael lines up 2 brand-prospect calls (Revance / Evolus / Merz) for the Phase 5 demo. Even at daily phase cadence these need real lead time — start scheduling at the start of Phase 1.
- **Before Phase 7:** schedule a 1-hour compliance prompt review with an aesthetic medical-affairs / regulatory contact. **Block Phase 7 completion on this review.**

## Risks (from spec, restated for execution)

1. **Compliance prompt quality** — biggest single risk. The Phase 7 review is mandatory, not optional.
2. **CSV import data quality** — reps' spreadsheets are messy. Phase 5 plan must include a self-serve error-log UI.
3. **SF entity matching ambiguity** — Phase 5 SF sync should require user confirmation on each ambiguous match.
4. **Brief generation cost** — instrument from Phase 3. Alarm at $20/rep/month.
5. **Voice-note volume regression** — instrument starting Phase 4. Alarm if weekly notes/active rep drops > 20% vs. pre-launch baseline.

## Success metrics (instrumented from Phase 4 onward)

See spec § "Success Metrics." Targets and alarm thresholds carry through unchanged.

---

## How to use this index

1. Read this file first.
2. Read the spec.
3. Open `01-foundation.md` and execute it (subagent-driven or inline).
4. After Phase 1 ships, ask to write `02-entity-extraction.md`. Iterate.
