# Session Log

Append-only log of notable outcomes from Claude Code sessions in this repo. Written by Claude at the end of sessions that produced meaningful shifts in direction, strategy, or scope. Not a replacement for git history — this is the "why" and "so what" layer that git doesn't capture.

**Format:** one dated entry per notable session. Three lines max per entry. Link to related docs.

---

## 2026-05-11

- **VBrick briefings reverted to SPIN format.** Commit `ece4cd0` (K26 event-conversation debrief mode, added 2026-05-05 for the ServiceNow Knowledge 26 booth window) reverted at Jeff's request. Debrief flow is back to pure SPIN cold-call mode for all dates.
- Deleted the K26 event PDF route, event results card, event cheat sheet, event prompts, event PDF renderer, and the design spec. Reverted `app/api/vbrick/debrief/structure/route.ts`, dashboard page, debrief flow, recent-calls, types, and config to pre-K26 state.
- Other K26 surfaces (campaign playbook seed at `app/api/vbrick/campaigns/seed-k26/route.ts`, sparring scenarios) left intact — separate from the briefing format. Revert is staged not committed. See: [[2026-05-11-vbrick-k26-debrief-revert]].

## 2026-05-08

- **FieldGlow landing content repositioned.** Removed the timed 60-second framing in favor of a calmer brain-dump promise: "Brain dump. FieldGlow learns."
- **Public FieldGlow claims narrowed and sharpened:** Salesforce-only for now, with live competitive intel, Story Vault, and self-learning field memory kept central instead of pushed below generic voice-to-CRM.
- Scarcity copy removed from the FieldGlow pilot CTA; metadata prepared for `https://fieldglow.app`. Production deployed to Vercel and aliased to `fieldglow.app` / `www.fieldglow.app`; GoDaddy DNS still needs to point those hosts to Vercel. Verification: `npm run lint`, `npm run build`, `git diff --check`, and deployed rendered-page checks. See: [[2026-05-08-fieldglow-landing-content-reposition]].

## 2026-05-07

- **Field Glow logo and app design deployed live.** Added the uploaded Field Glow mark to the mobile app header and refreshed favicon/PWA icons from the new logo asset.
- Production alias `https://streetnotes.ai` now serves the Field Glow login/app shell; Vercel deployment `https://streetnotes-2obsm7e8p-jeffs-projects-5eeb0328.vercel.app` was promoted to production.
- Verification: `npm run lint`, `npm run build`, `git diff --check`, live `HTTP/2 200` check on `/login`, and production Playwright mobile screenshot `output/playwright/field-glow-live-login-390x844.png`. See: [[2026-05-07-fieldglow-logo-production-deploy]].

- **Field Glow mobile polish pass implemented.** Completed the P0/P1 UI/UX audit items: 48px touch targets, auth secondary action sizing, idle mic canvas pause, capture back/refresh guard, capture overscroll containment, and mobile input modes for CRM value/date/search fields.
- **Mobile verification added:** Playwright screenshots saved in `output/playwright/` for login 360x740, login 390x844, and sign-up 430x932. `/login` and `/sign-up` checked at 360/390/430 widths: no horizontal overflow and no visible target under 48px.
- Verification: `npm run lint`, `npm run build`, `git diff --check`. Protected `/dashboard` redirects to `/login` without an authenticated browser session, so capture-flow screenshot coverage remains a follow-up with auth state. See: [[2026-05-07-fieldglow-mobile-polish-pass]].

- **Field Glow UI/UX Pro audit captured.** Installed/tried `mobile-ux`, then ran `ui-ux-pro-max` design-system, UX, style, typography, chart, and Next.js guidance passes against the mobile app. Captured the consolidated recommendations in `docs/plans/2026-05-07-field-glow-ui-ux-pro-audit.md`.
- **Decision guardrail:** rejected UI Pro's generic lavender/green wellness palette and Varela/Nunito typography for Field Glow; keep the explicit bronze/cream Field Glow style guide and Plus Jakarta Sans / DM Sans. Useful rules: evolved soft UI, 48px touch targets, aria/status feedback, reduced motion, input modes, lighter mic animation, and mobile smoke matrix.
- Obsidian brain updated: `../_brain/sessions/2026-05-07-fieldglow-ui-ux-pro-audit.md`, `../_brain/CONTEXT.md`, `../_brain/MOC.md`. Cached GitNexus wiki sync run via `./scripts/sync-wiki.sh`.

- **Authenticated app UI rebranded from StreetNotes to Field Glow.** Added warm mobile-only neumorphic tokens/utilities, Field Glow metadata/manifest/package naming, phone-width app shell, no desktop sidebar, and bottom-nav/mobile action treatment.
- **Core mobile surfaces re-skinned without intended functionality changes:** auth, dashboard, mic/capture flow, transcript/review, note detail, push-plan review, settings/setup/export, story wrapper, intel wrapper, shared tabs, and inline volt/green values in Story/CI app components.
- Verification passed: `npm run lint`, `npm run build`, `git diff --check`. GitNexus MCP unavailable; used `.gitnexus/wiki/*` docs for orientation. See: [[2026-05-07-fieldglow-mobile-app-rebrand]].

## 2026-05-06

- **FieldGlow landing page at `/fieldglow` built and aesthetically corrected through three iterations.** Inherited dark-navy + rose-gold glassmorphism scaffold rejected (AI-slop-with-beauty-filter cliché). Rebuilt as editorial luxury — Fraunces serif (variable, w/ SOFT/WONK/opsz axes) + DM Sans, warm bone paper, single gilt accent. Then pulled back from magazine theater per Jeff: stripped Roman numerals, *Vol. 01* dateline, drop cap, asterism, "From the FieldGlow Brief" attribution. Kept editorial typography minus the cosplay.
- **Hero rewritten in plain English** (Hopkins specificity + Halbert directness): three concrete outcomes — Salesforce updates, competitor intel, pitch vault. *"The more you use it, the smarter it gets."* promoted from buried moat section to hero kicker, italic gilt with shimmer. Brand wall (Allergan/Galderma/Merz/etc) pulled in favor of generic category line per [[Brand deals first revenue model]] — re-add specific names only when signed pilots land.
- **`components/shiny-text.tsx` ported across as-is** with gilt-palette params (`color: #8B6B40`, `shineColor: #E8C9A0`; blush variant for dark Apply section). Pattern captured: ShinyText `inline-block` + `background-clip: text` clips italic SOFT/WONK descenders unless `line-height` is loose (≥ 1.5) on the inline-block — fix applied to all 8 instances. See: [[2026-05-06-fieldglow-landing-editorial-pullback]].

## 2026-05-05

- **Planned voice-engine unification** for the authenticated app and free `/debrief` tool: one shared transcription path, one aesthetic ontology, one canonical schema, and memory-aware structuring for both surfaces. Plan: `docs/plans/2026-05-05-voice-engine-unification-plan.md`.
- Key finding: both routes already use `gpt-4o-transcribe`, but the paid app owns self-learning/CRM-schema logic while the free tool owns the richer aesthetic ontology. Next implementation should merge those strengths before any database migration.
- Implemented the shared engine locally: common transcription helper, shared Anthropic structuring service, optional aesthetic schema fields, email-scoped debrief memory, adapter for free-tool results, and 5 fixture scenarios. Verification: fixture script, lint, and build passed.

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

## 2026-05-09

- **Direction shift: first Field Glow rollout is Salesforce-only.** HubSpot stripped from the UI — settings CRM picker, export flavor selector, CRM connections card, push-plan-review label branch. Server routes (`app/api/auth/hubspot/*`, `lib/crm/hubspot.ts`) intentionally preserved for re-enable later.
- Full mobile UX review across Dashboard / Stories / Intel / Settings + cross-surface consistency, then implementation pass on every approved fix. Highlights: Field Balance floor (`Math.max(12, …)`) removed, sign-out moved off Dashboard to Settings, Intel CTA "Generate weekly brief" promoted from icon-only to labeled action, Recent Notes / Dashboard stats now surface a real "Couldn't load · Retry" state instead of `.catch(() => {})`-swallowing the 500. Field Glow logo background (cream box + neumorphic shadow) removed.
- **Backend gap surfaced.** Migration `013_crm_push_log.sql` (adds `notes.push_status` + `crm_push_log` table) was never applied — `/api/notes` returns 500. Supabase MCP unauth + local Docker off, so SQL handed back to Jeff for the Supabase SQL editor.
- Verification: `npx tsc --noEmit` clean; iPhone-14-Pro Playwright screenshots re-captured at `/tmp/sn-{dashboard,stories,intel,settings,recording-lab}-full.png`.
- Session note: `_brain/sessions/2026-05-09-fieldglow-app-ux-review-fix-pass.md`.

## 2026-05-10

- **Migration 013 applied to remote Supabase via the management API SQL endpoint** — closes the gap surfaced 2026-05-09 where `/api/notes` was 500-ing on `column notes.push_status does not exist`. `crm_push_log` table + `notes.push_status` column verified present. Dashboard stats + Recent Notes now render proper empty states instead of the defensive "Couldn't load" UI.
- **Migration tracking mismatch identified.** Local `supabase/migrations/` has 19 numeric/dated files; remote `supabase_migrations.schema_migrations` records six timestamp-named entries with zero overlap. Likely caused by some migrations applied via `supabase db push` and others pasted into the Dashboard SQL editor over the project's history. `db push` is unsafe until reconciled.
- **Reconciliation queued for next session.** Recommended Path A: audit every local migration against live remote schema → `supabase migration repair --status applied` for already-present changes, run + repair for missing ones, decide per-entry on the six orphan timestamps. Self-contained handoff prompt written for the fresh-session agent.
- Session note: `_brain/sessions/2026-05-10-supabase-migration-013-applied-and-reconciliation-handoff.md`.
- **Migration tracking reconciliation — closed.** Audit-and-repair pass executed end-to-end (Path A', adapted from Path A to handle duplicate-prefix collisions on `002`/`014`/`015`). Renamed 6 local files (filename only, no SQL changes) to their already-applied timestamp versions: `001 → 20260408171907`, `002_add_instance_url → 20260408171913`, `014_original_structured_output → 20260410200159`, `014_tighten_rls_policies → 20260413185516`, `015_add_exported_at_to_notes → 20260413213144`, `20260419_sparring_partner → 20260420190005`. Applied the 5 truly-missing migrations via the management API (`012_story_challenges`, `015_crm_schema_cache`, `016_crm_field_rules`, `017_crm_export_log`, `018_user_preferences`). Ran `supabase migration repair --status applied` for 16 versions to backfill tracking. **Final state: 22 local files = 22 tracked rows, zero orphans, zero pending. `supabase db push` is now safe.**
- Session note: `_brain/sessions/2026-05-10-supabase-migration-reconciliation.md`.

## 2026-05-12

- **VBrick three-fix pass.** Added delete-debrief affordance to the dashboard (`DELETE /api/vbrick/debriefs/[id]` + `RecentCalls` swipe-to-delete + hover trash icon, ownership-gated), hid never-started story drafts from the "Continue Drafting" list via a `hasStarted()` helper (`draft_content`/`ai_conversation`/`framework_metadata` all empty → hide), and fixed the realtime sparring bot to greet first on pickup by sending `response.create` over the data channel after the call connects.
- Plan: `docs/superpowers/plans/2026-05-12-vbrick-delete-debriefs-draft-filter-bot-greeting.md`. Spec: `docs/superpowers/specs/2026-05-12-vbrick-delete-debriefs-draft-filter-bot-greeting-design.md`.
- Verification: `npx tsc --noEmit` clean across the branch. Manual UI smoke (dashboard delete + sparring greeting + empty-draft filtering) deferred to a live dev-server pass.

## 2026-06-28

- **VBrick sparring — beginner Easy/Hard split + opening/recognition/scoring overhaul** (ahead of Jeff's Government/FedRAMP client meeting). New optional `track` field splits the tool: existing prospects → Hard (untouched, nothing deleted), new beginner content → Easy. Added 7 Government stakeholders (VA, GSA, DISA/DoD, IRS, CDC, CA Dept. of Technology, State/FSI) + 5 FedRAMP scenarios, and 7 Financial-Services stakeholders (JPMorgan, Morgan Stanley, Fidelity, Goldman, Capital One, Mastercard, Schwab) + 5 scenarios — each stakeholder tied to a real named institution. Commits `f652257`, `3f54033`.
- **Call opening + recognition root-cause fix.** Prospect now answers a plain "Hello?" and the rep introduces themselves by their own name. The "you didn't say your name" bug had two causes: the scorer treated step 1 as the rep asking the *prospect's* name (so saying your *own* name scored false — now a self-introduction with benefit-of-the-doubt), and transcription was `whisper-1` → switched to `gpt-4o-transcribe`. Scoring loosened (off-script no longer penalized; Easy track lenient); `should_have_said` rebuttals recalibrated to a natural middle ground; the over-aggressive FedRAMP close rewritten. See: [[2026-06-28-vbrick-sparring-easy-mode-overhaul]].
- Also added 7 fifteen-second elevator pitches (AI, MCP+CLI, Smart Search; compliance for Gov/FinServe/Healthcare/any-regulated) to the team-vault `STANDARD_PITCHES`. `tsc` + `eslint` clean. Open thread: recognition fix not reproduced live — needs a transcript from one call to confirm.

## 2026-06-29

- **VBrick sparring expanded: Intermediate difficulty + 4 new Easy-track verticals** (Jeff iterating live against prod). Added a third difficulty **Intermediate** between Easy and Hard — Easy & Intermediate reuse the same easy-track content, differing only in calibration (Intermediate makes the rep earn the meeting; scorer drops the beginner ~70 floor). Difficulty threaded explicitly through page → session/score APIs → instructions + scorer. Commit `5b69e11`.
- Added **Manufacturing, Telecom, Universities, Healthcare** to the Easy track, each **5 scenarios + 5 stakeholders tied to real named orgs** (Boeing/GM/Caterpillar/3M/Siemens · AT&T/Verizon/T-Mobile/Comcast/Lumen · ASU/Michigan/Penn State/UT Austin/NYU · Mayo/Kaiser/HCA/Cleveland Clinic/CVS). Now 34 easy personas / 30 easy scenarios across 6 verticals. Healthcare PHI framed via the control stack — no HIPAA-seal claim. Commit `8025674`. All shipped to production via `vercel promote`. See: [[2026-06-29-vbrick-sparring-intermediate-and-four-verticals]].
- Process note: parallel content subagents are slow (~8–10 min) not stalled — give ≥12-min windows; splice via Python extractor + `tsc` validation.
