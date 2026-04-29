# Session Log

Append-only log of notable outcomes from Claude Code sessions in this repo. Written by Claude at the end of sessions that produced meaningful shifts in direction, strategy, or scope. Not a replacement for git history — this is the "why" and "so what" layer that git doesn't capture.

**Format:** one dated entry per notable session. Three lines max per entry. Link to related docs.

---

## 2026-04-22

- **Voice architecture shift for VBrick sparring:** MediaRecorder + homemade client-VAD + HTTP Whisper/chat/TTS → direct WebRTC to OpenAI Realtime API (`gpt-4o-realtime-preview-2024-12-17`) with server-side VAD and ephemeral tokens. Sub-second turns, native interruption. New branch `feat/vbrick-realtime-sparring` off `90a0b36` (pre-fail clean commit). PR #3 open.
- Also: persistent `TopNav` across all `/vbrick/dashboard/*` routes (288px Sidebar deleted, sub-page headers stripped, dashboard home reflows full-width). Score-detail expanded from tiny banner to full breakdown. Hydration race in `DashboardProvider` fixed — was silently kicking every sub-route click back to dashboard root.
- Playbook + Campaigns rewritten against Career Maniacs K26 script and 2-Week BDR Outreach SOP. "I know you weren't expecting my call" removed everywhere. Triple Play card rebuilt with 2-Week SOP content (25+ contacts per pod, 5–8 T1 / 8–10 T2 / rest T3, 3 Sales Nav Boolean searches). Cold Calls 100/200. "What Vbrick Does" rewritten with 2026 GTM positioning (enterprise video intelligence layer, MCP-connected). Session: [[2026-04-22-vbrick-realtime-sparring-top-nav-playbook]]. Spec: `docs/superpowers/specs/2026-04-21-vbrick-realtime-sparring-design.md`.

## 2026-04-22 (part 2 — shipping pass)

- **PR #3 squash-merged to main as `3fff47a` and live on `vbrick.streetnotes.ai`.** Build was unblocked by adding `export const dynamic = 'force-dynamic'` to `app/api/vbrick/stories/leaderboard/route.ts` (was being prerendered statically and throwing on `createAdminClient()` during build).
- **Vercel alias rot found and fixed at the root.** `vbrick.streetnotes.ai` had been silently serving a 32-day-old deployment because its Vercel domain config had `gitBranch: "vbrick"` pinning it to a long-deleted branch. Fixed via Vercel REST API (`PATCH /v9/projects/{id}/domains/{domain}` → `{"gitBranch": null}`). Subdomain now auto-tracks production deploys forever. Pattern captured: [[Vercel branch-domain rot]].
- Session: [[2026-04-22-vbrick-ship-to-prod-alias-fix]].

## 2026-04-22 (part 3 — prod debugging pass)

- **Synced 3 missing prod secrets** (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRM_ENCRYPTION_KEY`) from `.env.local` to Vercel via REST API. Without them, every `createAdminClient()`-using route was returning 500 in prod. Pattern: [[Vercel env var sync from .env.local]].
- **Sparring call connection bug was an OpenAI silent deprecation, not our code.** OpenAI Realtime API removed `onyx`, `nova`, `fable` from the supported voice list. 6 of our 9 personas used one of those three → 400 invalid_value on every mint. Mapped `onyx→ash`, `nova→coral`, `fable→verse`; widened TS union to current full set. Pattern: [[OpenAI Realtime voice deprecation]].
- **Diagnostic technique:** Temporarily surfaced upstream error in 502 response (`openaiStatus`, `openaiBody`), shipped, hit endpoint, got exact error string, fixed root cause, reverted in same commit. Generic 502 errors hide everything.
- **K26 campaign regenerated** via direct POST to `/api/vbrick/campaigns/{id}/generate` — no UI needed; the endpoint uses current `lib/vbrick/campaign-prompts.ts`. 5 channels rewritten in 23s.
- Session: [[2026-04-22-vbrick-prod-debugging-pass]].

## 2026-04-23

- **VBrick sparring catalog grew from 1 scenario to 12.** Added K26 trio (registration push, booth drive, session attendance drive — substance-first, no cash-prize mechanic since Jeff hasn't confirmed one), Google EVP discovery, and a 7-scenario pack per spec (wrong-person referral, corp comms, IT/infra, L&D, regulated, "we already have Teams", external+internal blur). Plus 6 new personas. All 8 original personas got realistic last names (framework scoring requires first + last).
- **`SparringScenario` interface extended** with optional coaching-grade fields: `repGoal`, `whyVbrickFits`, `openingContinuation`, `prospectTone`, `likelyProspectResponses`, `strong/weakRepResponses`, `desiredOutcome`, `coachingNote`, `difficultyScore`, `topMistakes`, `topWinMoves`. Existing scenarios still valid. UI does not yet surface the new fields.
- **Difficulty calibrated for beginners.** First pass rated 6-8/10 — too punishing; Jeff pushed back hard. All 12 scenarios now ≤5 AND content softened so prospects share pain on reasonable discovery questions instead of requiring exact trigger words.
- Qualification phrasing in realtime-instructions composer changed to "video strategy — internal, external, or both" to prime the bot for the internal/external blur scenario.
- Session: [[2026-04-23-vbrick-sparring-content-expansion]].

## 2026-04-29

- **Three standard Vbrick elevator pitches (30s / 45s / 1-min) seeded into the Stories team vault** as canonical content visible to every authorized user. New idempotent seed endpoint at `/api/vbrick/stories/seed-standards`. Worked around the team-vault domain filter (a `@vbrick.com` user only sees entries from other `@vbrick.com` users) by inserting each pitch once per authorized domain under a `standard@<domain>` sentinel identity. Sentinel accounts never log in; they exist only as domain-scoped owners so the existing query surfaces these across all three authorized teams. Each pitch carries a coaching note framing when to use that length variant. 9 vault rows, 0 errors. Verified for both `jeff@forgetime.ai` and a `@vbrick.com` user.
- Session: [[2026-04-29-vbrick-standard-pitches-team-vault]].

## 2026-04-15

- Added `docs/INDEX.md` as the auto-loaded vault map and wired it into project `CLAUDE.md` via `@docs/INDEX.md`.
- Established the session-log pattern: Claude appends to this file at end of sessions that shift direction or produce new vault docs.
- Generated initial GitNexus wiki (65 module pages) into `docs/codebase/` via `./scripts/sync-wiki.sh`. Wiki is gitignored and regenerated on demand. INDEX.md and CLAUDE.md updated to point at the new wiki.
- Installed `.git/hooks/post-commit` to auto-refresh the wiki in the background after every commit. Logs to `.gitnexus/wiki-sync.log`. Cost stays bounded because GitNexus skips unchanged modules.

## 2026-04-21

- **Shipped** the VBrick command-center restructure on branch `restructure/vbrick-command-center` (9 commits, PR #2, build + lint + manual smoke all green). `vbrick.streetnotes.ai` is now a strictly BDR development/practice hub: nav `Dashboard · Stories · Campaigns · Playbook · Sparring`, sticky sidebar mic, dashboard landing = intention → welcome → quick-start tiles → debrief → performance → recent debriefs → leaderboard. Call-queue + live-coaching + settings history fully removed. New component `components/vbrick/quick-start-tiles.tsx`. DB tables untouched.
- Smoke test caught a pre-existing sparring-API auth bug (shipped in `844ee2f`): routes required Supabase auth but VBrick uses localStorage email identity. Fixed in-branch (`065c252`) — hard auth gate dropped, DB insert kept opportunistic. Anonymous sessions don't persist (NOT NULL `user_id`); proper fix is a `bdr_email` migration.
- Earlier in the day: direction-shift brainstorm captured in `_brain/sessions/2026-04-21-vbrick-command-center-restructure-brainstorm.md`. Spec: `docs/superpowers/specs/2026-04-21-vbrick-command-center-restructure-design.md`. Plan: `docs/superpowers/plans/2026-04-21-vbrick-command-center-restructure.md`. Shipped notes: `_brain/sessions/2026-04-21-vbrick-command-center-shipped.md`.

## 2026-04-19

- Major strategic pivot: beachhead vertical changed from generic field sales → **aesthetics/plastic surgery sales reps**. Exit thesis changed from moat-building → **build-to-sell in 24 months**. Revenue model changed from individual reps → **brand deals first** (Revance, Evolus, Merz, InMode, BTL).
- Full research: `Streetnotes/.planning/research/aesthetics-vertical-analysis.md`. Strategy plan updated: `.claude/plans/moat-please-analyze-the-glowing-tulip.md`. Three investor briefs written for Michael Hervis (send v3): `docs/plans/2026-04-19-aesthetics-investor-brief-v3.md`.
- Brain updated: `_brain/CONTEXT.md` reflects new direction. Session note: `_brain/sessions/2026-04-19-aesthetics-pivot-exit-thesis.md`.

## 2026-04-18

- Removed stale CodeGraph MCP config (never installed, caused "Failed to reconnect" errors).
- Built Obsidian Second Brain: `_brain/` with CONTEXT.md, MOC.md, decisions/, patterns/, sessions/, evolution/. Design doc: `docs/plans/2026-04-18-second-brain-design.md`.
- Created `.obsidianignore` to hide code from Obsidian graph. Seeded 5 decisions, 3 patterns, 1 evolution note, 1 session note.
