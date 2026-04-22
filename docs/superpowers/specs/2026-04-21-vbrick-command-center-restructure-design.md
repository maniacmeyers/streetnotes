# VBrick Command Center Restructure — Design Spec

**Date:** 2026-04-21
**Tenant:** `vbrick.streetnotes.ai` (VBrick tenant, served from `app/vbrick/` via host-based rewrite in `middleware.ts`)
**Status:** Approved design, pending implementation plan

## Goal

Reposition `vbrick.streetnotes.ai` from a call-execution surface (call list + live coaching + debrief) to a **strictly BDR development/practice hub**. BDRs don't load call lists here and don't run live-coached calls through it. They come here to debrief calls they've already made, then practice: stories, campaigns, playbook, sparring.

The VBrick BDR Sparring Partner (shipped commit `844ee2f`, audited 2026-04-20) is already wired at `/vbrick/dashboard/sparring` and stays. This work trims the shell around it.

## Nav

Before: `Dashboard · Stories · Campaigns · Intel · Playbook · Sparring`
After: `Dashboard · Stories · Campaigns · Playbook · Sparring`

**Intel drops from nav.** The route (`app/vbrick/dashboard/ci/`) stays in the codebase but is unlinked — accessible by URL only.

## Dashboard landing (`/vbrick/dashboard`)

The dashboard is both the **debrief surface** and the **practice hub**. BDRs still do debriefs, so the debrief flow stays inline — not hidden behind a triggered view.

Layout, top to bottom:

1. **Intention gate** — `IntentionScreen`, first visit of the day only (existing, unchanged)
2. **Welcome header** — new line: `Welcome back, {name} — {streak}-day streak`
3. **Quick-start tiles** — 4-up grid, order: **Sparring · Stories · Campaigns · Playbook**. Each tile is a `NeuCard` link to its route with icon + label + one-line descriptor. Sparring first because it's the new/featured surface.
4. **Debrief** — `DashboardDebriefFlow` + `TranscriptInput` (existing). Triggered by sidebar mic OR paste-transcript button. Post-debrief analysis via `PostCallSummary` (existing).
5. **Performance** — `PerformanceCards` (existing, unchanged)
6. **Recent Debriefs** — `RecentCalls` component, heading relabeled "Recent Calls" → "Recent Debriefs". Data source unchanged.
7. **Leaderboard** — `Leaderboard` (existing, unchanged)

## Sidebar (`components/vbrick/sidebar.tsx`)

**Sticky mic stays.** It's the fastest path to "I just got off a call, let me dump it" from anywhere in the app.

Remove:
- `Intel` nav item
- `queueContact` prop + the "Debriefing [contact]" block that renders during recording
- `onStartCoaching`, `onEndCoaching`, `isCoaching`, `coachingPromptIndex`, `callingSessionId` props
- "Start Live Coaching" button and the `CoachingCompactIndicator` sub-component
- `import type { CoachingSummary }`

Keep: player card, nav, sticky mic, paste-transcript button, settings, bottom quote.

## Removals

### Component files (delete)

- `components/vbrick/call-queue.tsx`
- `components/vbrick/coaching/coaching-panel.tsx`
- `components/vbrick/session-report.tsx` (tied to queue-session end flow)
- `components/vbrick/csv-import-zone.tsx` (already unused per code comment "CSV import removed")

### API routes (delete)

- `app/api/vbrick/queue/route.ts`
- `app/api/vbrick/session/route.ts` — **verify first.** Should be queue-session CRUD; if `DashboardDebriefFlow` depends on it, keep.
- `app/api/vbrick/coaching/token/route.ts` (live-coaching Deepgram/OpenAI token issuer)
- `app/api/vbrick/coaching/classify/route.ts` (live-coaching classifier)
- `app/api/vbrick/coaching/session/route.ts` — **verify first.** Delete if it's the live-coaching session writer; keep if it's post-debrief analysis used by `dashboard-debrief-flow.tsx`.

### Dashboard page cleanup (`app/vbrick/dashboard/page.tsx`, currently 640 lines)

Remove:
- Imports: `CallQueue`, `QueueItem`, `CoachingPanel`, `CoachingSummary`, `SessionReport`
- State: `queue`, `isCoaching`, `coachingSummary`, `coachingIdx`, `sessionId`, `sessionReport`, `sessionStartRef`, `timerRef`
- Functions: `fetchActiveSession`, `handleSkipQueueItem`, `handleJumpTo`, `handleEndSession`
- Coaching-prompt rotation timer inside the recording `useEffect`
- JSX: `<CallQueue>`, `<CoachingPanel>`, `<SessionReport>` renders; `queueContact` and all coaching props on `<Sidebar>`
- Queue-update block inside `handleDebriefComplete`

Keep: `handleMicStart`/`handleMicStop`, `handleDebriefComplete` (slimmed), `fetchStats`, `fetchRecentCalls`, `handleIntentionComplete`, `DashboardDebriefFlow`, `TranscriptInput`, `PostCallSummary`.

Add:
- 4-tile quick-start grid component (inline or new `components/vbrick/quick-start-tiles.tsx`)
- `Welcome back, {name} — {streak}-day streak` header line

### Database

**Do not drop tables.** `vbrick_sessions`, `vbrick_queue_items`, and any live-coaching tables stay in place. The app stops writing to them. Rationale: preserves data, keeps migration history intact, avoids destructive ops, leaves the door open to restore.

## Out of scope

- **Manager-side sparring visibility** — a "Sparring Performance" section for the manager dashboard was in the original ask but is deferred to a separate pass. This work is already touching sidebar, dashboard page, component deletions, and route deletions; keep it clean.
- **New sparring content** — personas, scoring dimensions, and prompts stay as they are today. Carry-over from 2026-04-20 audit: voice-capture wiring for framework session still scaffolded; aesthetics product adaptations (prompts/stage-mapper/CI dictionary) still uncoded. Not part of this work.
- **Visual design pass on generic ui primitives** — carry-over from 2026-04-20 audit. Out of scope here.

## Success criteria

1. Nav shows five items in the order `Dashboard · Stories · Campaigns · Playbook · Sparring`.
2. Dashboard landing renders: IntentionScreen (gated) → welcome header → 4 quick-start tiles (Sparring first) → Debrief flow → Performance → Recent Debriefs → Leaderboard. No call queue, no live-coaching entry point, no session-end report.
3. Sidebar mic still starts a debrief from any page; paste-transcript button still works; sidebar contains no live-coaching UI and no `queueContact` block.
4. `npm run build` passes with no references to deleted components or API routes.
5. `/vbrick/dashboard/ci` remains reachable by direct URL (route alive).
6. No Supabase migrations added or dropped in this change.

## Open item carried into implementation

During implementation, verify the two coaching API routes flagged "verify first":
- `app/api/vbrick/session/route.ts` — if used by `DashboardDebriefFlow`, keep; else delete.
- `app/api/vbrick/coaching/session/route.ts` — if post-debrief analysis, keep; if live-coaching session writer, delete.

The verification is mechanical (grep for route usage, read the route handler's purpose). No design decision deferred — the rule is "keep if debrief-flow depends on it, delete otherwise."
