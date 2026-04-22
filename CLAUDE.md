# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Second Brain (session-start read)

This repo is part of an Obsidian vault (`Obsidian_ClaudeCode/`). Knowledge lives in `_brain/` at the vault root.

**`_brain/CONTEXT.md` is auto-injected at session start via a `SessionStart` hook** — do NOT read it manually, it is already in your context as a `=== SECOND BRAIN (auto-injected) ===` block. Follow `[[wikilinks]]` from CONTEXT.md only when the task needs deeper context beyond what's in that block.

**At session end, follow this checklist:**
1. Write a session note to `_brain/sessions/` if anything meaningful happened
2. Write decision or pattern notes if any were made (flag to user first)
3. Update `_brain/CONTEXT.md` (last session, recent decisions, open threads)
4. Add new notes to `_brain/MOC.md`
5. Update `docs/SESSION_LOG.md` if there was a direction shift

**Note locations:**
- `_brain/decisions/` — why we chose X over Y (frontmatter: type, project, date, status, tags)
- `_brain/patterns/` — reusable technical patterns (frontmatter: type, project, date, stack, tags)
- `_brain/sessions/` — auto-generated session knowledge (frontmatter: type, project, date)
- `_brain/evolution/` — GTM/strategy shifts (frontmatter: type, project, date, area, tags)
- `_brain/MOC.md` — Map of Content linking all brain notes
- `_brain/CONTEXT.md` — always-current briefing doc

**All brain notes use `[[wikilinks]]`** to connect to each other, to project notes, and to other decisions/patterns. This powers Obsidian's graph view.

## Vault context (reference)

The curated map of non-code context lives in `docs/INDEX.md` and is imported below. Read it for file locations, not for strategic context (that's in `_brain/CONTEXT.md`).

@docs/INDEX.md

**Keep the vault honest.** When you create or substantially modify a vault document, update `docs/INDEX.md`. Rules are inside `docs/INDEX.md`.

**Codebase wiki:** A GitNexus-generated wiki lives at `docs/codebase/` (gitignored, auto-refreshed). Read `docs/codebase/overview.md` for a linked module map before exploring source. The wiki regenerates automatically after every commit via `.git/hooks/post-commit` (runs `./scripts/sync-wiki.sh` in the background; logs to `.gitnexus/wiki-sync.log`). GitNexus skips unchanged modules, so most commits are free or near-free; only architectural changes trigger paid regen. Manual refresh: `./scripts/sync-wiki.sh`. The graph index itself (`.gitnexus/`) is refreshed by the existing PostToolUse hook.

## Project Overview

StreetNotes.ai is a mobile-first voice-to-CRM web app. A sales rep finishes a meeting, talks into their phone for 60 seconds, reviews the AI-structured output, hits confirm, and their CRM is updated — no manual data entry.

**Parent brand:** ForgeTime.ai (micro-SaaS venture studio)
**Founders:** Jeff Meyers (GTM/Sales, 20+ years enterprise SaaS) + Michael Hervis (Strategy/Ops)

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm start            # Start production server
node screenshot-mobile.js  # Playwright mobile-viewport screenshot utility
```

No test runner is configured. Playwright is installed for screenshot/automation utilities only.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + TypeScript
- **Backend:** Next.js API Routes (monorepo, no separate server)
- **Database/Auth:** Supabase (PostgreSQL + Auth via `@supabase/ssr`)
- **Transcription:** OpenAI Whisper API (`whisper-1` model)
- **AI Structuring:** Anthropic Claude API (`@anthropic-ai/sdk`, Sonnet 4.6 via tool_use)
- **CRM Targets:** Salesforce (REST API v59.0) + HubSpot (CRM v3 API) — called directly via `fetch`, no SDK
- **Voice Capture:** Native MediaRecorder API (custom hook, no library)

## Architecture

### Route Groups
- `app/(auth)/` — Login, sign-up pages (public)
- `app/(protected)/` — Dashboard and app pages (auth-gated via server layout)
- `app/api/` — API route handlers

### Supabase Client Pattern
Three utility files — use the correct one based on context:
- `lib/supabase/client.ts` — Browser/Client Components
- `lib/supabase/server.ts` — Server Components and Route Handlers
- `lib/supabase/middleware.ts` — Middleware session refresh

**Critical:** Always use `getUser()` server-side, never `getSession()` (can be spoofed).

### Voice → Structure → Save Pipeline
```
useVoiceRecorder hook → MediaRecorder (MIME negotiation) → audioBlob
  → POST /api/transcribe (FormData) → OpenAI Whisper → transcript text
  → POST /api/structure (JSON) → Claude Sonnet tool_use → CRMNote (Zod-validated)
  → POST /api/notes (JSON) → Supabase notes table (transcript + structured JSONB)
```
- MIME negotiation at record-start: Safari produces `audio/mp4`, Chrome produces `audio/webm;codecs=opus`
- 25MB file size limit enforced client-side and server-side
- Audio discarded after transcription (no storage)
- `/api/transcribe` is authenticated and isolated from structuring for retry independence
- `/api/structure` uses Claude tool_use with a JSON schema to force structured output, then validates with Zod
- Confidence indicators (high/medium/low) flag uncertain extractions for user review
- All CRM fields are optional — incomplete transcripts produce partial results, no hallucination

### Database Schema (Supabase)
Four tables with RLS enabled — all scoped to `user_id`:
- `notes` — voice note transcripts + structured output (JSONB) + push_status (null/pending/success/failed)
- `crm_connections` — Encrypted OAuth tokens per CRM type (UNIQUE on user_id + crm_type), instance_url for Salesforce
- `deal_stage_cache` — Cached pipeline stages from connected CRM (UNIQUE on user_id + crm_type)
- `crm_push_log` — Audit trail per push attempt (note_id, crm_type, status, CRM record IDs, errors)

RLS policies use `(select auth.uid())` subquery form (evaluated once per query, not per row).

Migrations:
- `supabase/migrations/001_initial_schema.sql` — Tables, RLS, indexes
- `supabase/migrations/002_add_instance_url.sql` — instance_url column + deal_stage_cache unique constraint
- `supabase/migrations/013_crm_push_log.sql` — crm_push_log table + push_status column on notes

### Key Files
- `hooks/use-voice-recorder.ts` — Custom MediaRecorder hook with MIME negotiation
- `lib/audio/recording.ts` — Audio format utilities, MIME type preferences, size limits
- `lib/openai/server.ts` — Singleton OpenAI client + sales vocabulary Whisper prompt
- `lib/anthropic/server.ts` — Singleton Anthropic client (server-only)
- `lib/notes/schema.ts` — CRMNote Zod schema with confidence indicators
- `lib/notes/input-schema.ts` — JSON Schema for Claude tool_use input
- `lib/notes/prompts.ts` — System prompt + few-shot examples for CRM extraction
- `components/voice-note-capture.tsx` — Record → transcribe → structure → save UI component
- `app/api/structure/route.ts` — Claude structuring endpoint (auth + tool_use + Zod validation)
- `app/api/notes/route.ts` — Note CRUD (save transcript + structured output to Supabase)
- `lib/crm/encryption.ts` — AES-256-GCM encrypt/decrypt for CRM tokens (CRM_ENCRYPTION_KEY env var)
- `lib/crm/token-refresh.ts` — Proactive token refresh (5-min buffer before expiry) for SF + HS
- `lib/crm/salesforce.ts` — Salesforce deal stage fetching via Opportunity describe API
- `lib/crm/hubspot.ts` — HubSpot deal pipeline/stage fetching via CRM v3 API
- `app/api/auth/salesforce/connect/route.ts` — Initiate Salesforce OAuth (CSRF state cookie + redirect)
- `app/api/auth/salesforce/callback/route.ts` — Handle SF callback (code exchange, encrypt tokens, store)
- `app/api/auth/hubspot/connect/route.ts` — Initiate HubSpot OAuth (CSRF state cookie + redirect)
- `app/api/auth/hubspot/callback/route.ts` — Handle HS callback (code exchange, encrypt tokens, store)
- `app/api/crm/connections/route.ts` — GET connected CRMs (no tokens exposed), DELETE to disconnect
- `app/api/crm/stages/route.ts` — GET deal stages from connected CRM (24h cache)
- `app/(protected)/settings/page.tsx` — Settings page (CRM connections)
- `components/settings/crm-connections.tsx` — Connect/disconnect CRM cards with deal stage display
- `lib/crm/push/types.ts` — Shared types for CRM push (PushResult, PushOptions, CrmCandidate, CachedStage)
- `lib/crm/push/stage-mapper.ts` — Fuzzy deal stage mapping + value/name parsing utilities
- `lib/crm/push/salesforce.ts` — Salesforce push (Contact/Account/Opportunity/Task CRUD via REST API v59.0)
- `lib/crm/push/hubspot.ts` — HubSpot push (Contact/Company/Deal/Note/Task CRUD via CRM v3 API with 429 retry)
- `app/api/crm/push/route.ts` — POST endpoint: auth → load note → get tokens → dispatch to SF/HS → log result
- `middleware.ts` — Supabase session refresh on every request

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-anon-key>
OPENAI_API_KEY=<openai-api-key>
ANTHROPIC_API_KEY=<anthropic-api-key>
CRM_ENCRYPTION_KEY=<64-char-hex-string>
SALESFORCE_CLIENT_ID=<salesforce-connected-app-client-id>
SALESFORCE_CLIENT_SECRET=<salesforce-connected-app-client-secret>
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/salesforce/callback
SALESFORCE_AUTH_URL=https://login.salesforce.com
HUBSPOT_CLIENT_ID=<hubspot-app-client-id>
HUBSPOT_CLIENT_SECRET=<hubspot-app-client-secret>
HUBSPOT_REDIRECT_URI=http://localhost:3000/api/auth/hubspot/callback
```

See `.env.local.example`. Never commit `.env.local`.

## Build Progress

The original 6-phase voice-to-CRM build is complete. The codebase has since grown to include several adjacent surfaces (Story Vault, CI dashboard, user-memory) — see "Adjacent Surfaces" below. Always check `.planning/STATE.md` for current position before assuming what's next.

Full roadmap and execution plans live in `.planning/`:
- `.planning/PROJECT.md` — Core requirements and decisions
- `.planning/ROADMAP.md` — 6-phase build plan with success criteria
- `.planning/STATE.md` — Current position and session continuity
- `.planning/REQUIREMENTS.md` — All v1 requirements with traceability
- `.planning/phases/` — Per-phase research and execution plans

## Brain Dump Lead Magnet (Post-Call Brain Dump)

A free public tool at `/debrief` — the lead magnet for StreetNotes.ai. Demonstrates the core value prop: voice → structured CRM fields.

### Route
- `app/debrief/` — Public page (no auth required), added to middleware whitelist

### Flow
Email gate → Segment select → Voice recording → AI transcription (Whisper) → User reviews/edits transcript → GPT-4o CRM extraction → Results display with CRM preview + PDF download → Bridge CTA

### What It Extracts (CRM-focused, NOT coaching)
- Deal snapshot: company, stage, value, close date, next step
- Attendees: names, titles, roles in the deal, sentiment
- Call summary: 3-5 bullet points for CRM activity notes
- Follow-up tasks: actions, owners, due dates, priority
- Opportunity notes: ready-to-paste CRM description
- Additional: competitors, products discussed, pain points, risks

### Key Files
- `lib/debrief/types.ts` — TypeScript interfaces (DebriefStructuredOutput, DebriefStep)
- `lib/debrief/prompts.ts` — GPT-4o system and user prompts with few-shot examples
- `lib/debrief/pdf.tsx` — @react-pdf/renderer branded PDF (tear sheet + CTA)
- `components/debrief/` — All UI components (debrief-flow, email-gate, segment-selector, recorder, mic-button, waveform-visualizer, transcript-review, processing-steps, results-display, bridge-cta)
- `hooks/use-audio-analyser.ts` — Web Audio API waveform hook
- `app/api/debrief/start/` — Email gate + rate limiting + session creation
- `app/api/debrief/transcribe/` — Public Whisper transcription
- `app/api/debrief/structure/` — GPT-4o CRM field extraction
- `app/api/debrief/pdf/` — PDF generation endpoint

### Database
- `debrief_sessions` table (migration 003) — tracks email, transcript, structured output per session
- Rate limit: 3 debriefs/day/email (enforced in `/api/debrief/start`)

### Dependencies Added
- `@react-pdf/renderer` — server-side PDF generation
- `react-icons` — UI icons (mic, stop, download, check)

### Bridge Mechanic
Free: CRM-ready structured fields, follow-up tasks, opportunity notes, one-time PDF export
Missing (paid): auto-push to CRM, follow-ups scheduled automatically, deal history across calls, Salesforce + HubSpot integration

### Important: NOT a coaching tool
StreetNotes does NOT do deal coaching, pattern recognition, buyer psychology, or objection diagnostics. That's Gong's lane. StreetNotes extracts CRM-ready data from voice and pushes it to the CRM. The differentiator is the CRM integration, not the analysis.

## Adjacent Surfaces

Beyond the core voice→CRM pipeline and `/debrief` lead magnet, the repo houses several feature surfaces that share the same Next.js app and Supabase instance. Treat them as first-class, not dead code.

### Story Vault + Story Challenges
Story drafting, practice, scoring, and gamification — BDRs build elevator pitches, Feel-Felt-Found responses, and ABT customer stories, then share practice challenges via public tokenized links.
- Routes: `app/challenge/[token]/` (public share page + OG image)
- Components: `components/streetnotes/stories/`, `components/streetnotes/brutal/`
- Migrations: `006_story_vault.sql` (drafts, practice, scores), `012_story_challenges.sql` (shared challenge tokens)

### Competitive Intelligence Dashboard
Public CI dashboard showing sentiment/category heatmaps, trend charts, and quote feeds over competitor mentions.
- Route: `app/ci/` (public)
- Components: `components/ci/` (`heatmap-grid`, `quote-feed`, `trend-chart`), `components/streetnotes/ci/`
- Lib: `lib/ci/pipeline.ts`, `lib/ci/types.ts` (sentiment + mention category taxonomy)
- Migration: `005_ci_dashboard.sql`
- API: `app/api/ci/*`

### User Memory (entity aggregation)
Per-user rolling memory of entities (contacts, accounts, products, competitors) extracted from prior notes. Used to improve CRM extraction accuracy by giving Claude known-entity context.
- Lib: `lib/user-memory/server.ts` (5-min cached load over most recent 100 notes), `lib/user-memory/scoring.ts` (entity aggregation), `lib/user-memory/reconcile.ts`
- Consumed by `/api/structure` to prime the extraction prompt

### Vbrick surfaces
The repo also contains `app/vbrick/`, `app/vbrick-site/`, and `lib/vbrick/` — a separate tenant served from `vbrick.streetnotes.ai` (see host-based rewrite in `middleware.ts`). The command center is a **BDR development/practice hub**: `Dashboard · Stories · Campaigns · Playbook · Sparring`. Dashboard landing = IntentionScreen + `Welcome back, {name}` + QuickStartTiles + Debrief flow + PerformanceCards + Recent Debriefs + Leaderboard. Call-queue and live-coaching subsystems were removed on 2026-04-21 (see `docs/superpowers/specs/2026-04-21-vbrick-command-center-restructure-design.md`); DB tables `vbrick_calling_sessions`, `vbrick_queue_items`, `vbrick_coaching_sessions` are intentionally preserved. Treat as a sibling app sharing the codebase.

## Key Decisions (Do Not Override)

- Use `@supabase/ssr` — the older `@supabase/auth-helpers-nextjs` is deprecated
- `tailwindcss-safe-area@0.1.0` — v1.3.0 breaks webpack in Next.js 14
- Keep `/api/transcribe` separate from AI structuring — retry isolation
- User always reviews structured output before CRM push — no auto-push
- Public routes (see `lib/supabase/middleware.ts`): `/`, `/login`, `/sign-up`, `/auth/*`, `/api/*`, `/debrief/*`, `/vbrick/*`, `/vbrick-site/*`, `/ci/*`, `/sw.js`, `/manifest.webmanifest`. The `/challenge/[token]` route is public via token-based access. Everything else requires auth.
- Mobile-first layout: `max-w-md mx-auto` with thumb-friendly 44px min tap targets

## Ideabrowser Project

Strategy, offer definition, brand voice, and ICP are managed in Ideabrowser (MCP tool).
- **Project ID:** `f75b829b-c0c0-451b-97f1-12bb813ce610`
- **Idea ID:** `6297`
- Use `get_project_context` with this project ID to load full strategic context.

## Brand Voice (for any copy/UI text)

Direct. Fast. Zero fluff. Speaks like a rep, not a SaaS startup. No buzzwords. No corporate speak.
- Lead with the problem, not the product
- Short punchy sentences. Fragments welcome.
- Never use: "leverage," "synergy," "robust," "seamlessly," "game-changer," "revolutionary," "empower," "enable," "solution," "platform"
- Profanity OK when natural. No emoji in product copy.
- Full voice profile saved in Ideabrowser context files.

## Code Intelligence

This project uses GitNexus for codebase knowledge graphs. Use the GitNexus MCP tools to understand code structure before exploring files directly.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Streetnotes** (2150 symbols, 3948 relationships, 84 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/Streetnotes/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Streetnotes/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Streetnotes/clusters` | All functional areas |
| `gitnexus://repo/Streetnotes/processes` | All execution flows |
| `gitnexus://repo/Streetnotes/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
