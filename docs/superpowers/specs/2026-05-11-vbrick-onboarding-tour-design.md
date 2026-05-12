---
type: spec
project: streetnotes
surface: vbrick
date: 2026-05-11
status: approved-for-planning
tags: [vbrick, onboarding, tour, ux]
---

# Vbrick Command Center — In-App Onboarding Tour

## Goal

Give a first-time vbrick BDR a guided walkthrough of all five tabs (Dashboard, Stories, Campaigns, Playbook, Sparring) so they know what each surface is for inside 90 seconds. Auto-starts on first login. Replayable any time via a "Take the tour" button in the top nav.

## Non-Goals

- No video, no Lottie, no marketing-site walkthrough. In-app overlay only.
- No teaching deep workflows. The tour orients; it does not train.
- No A/B testing of tour copy. One canonical step list, edited by humans.
- No analytics in v1. (Add later if needed.)

## Architecture

### Library

[driver.js](https://driverjs.com/) — ~5KB gzipped, zero deps, MIT, themeable via CSS. Loaded lazily on tour start so it does not affect initial bundle for non-tour users.

### Component / File Layout

```
lib/vbrick/tour/
  steps.ts                  # Ordered TourStep[] — single source of truth
  tour-context.tsx          # React context: { running, startTour, stopTour }
  use-wait-for-element.ts   # Hook: polls/MutationObserver until selector mounts
  storage.ts                # localStorage helpers keyed by lowercased email
components/vbrick/
  tour-provider.tsx         # Mounts driver.js, owns auto-start + nav timing
  take-the-tour-button.tsx  # Lives in TopNav, calls startTour() unconditionally
app/vbrick/layout.tsx       # Wraps children in <TourProvider>
styles/vbrick-tour.css      # Theme overrides for .driver-popover et al.
```

### Cross-Page Navigation

The tour spans five routes. driver.js does not know about Next.js routing; the provider wires it up:

1. `TourProvider` is mounted in `app/vbrick/layout.tsx`, above the route outlet — survives route changes.
2. On `startTour()`, lazy-import `driver.js`, build a driver instance from `steps`, call `driver.drive()`.
3. driver.js `onHighlightStarted(element, step, opts)` hook:
   - If `step.route !== pathname`: call `router.push(step.route)`.
   - Then `await useWaitForElement(step.target, { timeoutMs: 3000 })`.
   - On resolve: let driver.js continue. On timeout: log warning, call `opts.driver.moveNext()`.
4. driver.js `onDestroyed` hook: write completion flag to localStorage, reset context state.

### Persistence

- Key: `vbrick:tour-seen:${email.toLowerCase()}`
- Value: `"1"` (written on natural completion OR explicit skip)
- Auto-start trigger (in dashboard `page.tsx`, gated by `TourProvider`'s `startTour`):
  - `email` from `useDashboard()` is non-null
  - localStorage key is absent
  - Run after 600ms delay (let dashboard render settle)
- "Take the tour" button bypasses the persistence check; never re-writes flag until tour completes again.
- No-op if email is null (user hasn't identified yet).

### TourStep Type

```ts
export type VbrickRoute =
  | '/vbrick/dashboard'
  | '/vbrick/dashboard/stories'
  | '/vbrick/dashboard/campaigns'
  | '/vbrick/dashboard/playbook'
  | '/vbrick/dashboard/sparring'

export type TourStep = {
  id: string                    // stable id for logging/skip telemetry later
  route: VbrickRoute
  target?: string               // CSS selector (e.g. '[data-tour="quick-start"]'); omit = centered modal
  title: string
  body: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
}
```

## Step List

14 steps total. Copy follows StreetNotes brand voice — direct, fragments OK, no fluff.

### Dashboard (6 steps)

1. **welcome** — *centered modal* — "Welcome to vbrick Command Center." / "This is your BDR practice hub. 90 seconds to walk through it."
2. **intention** — `[data-tour="intention"]` — "Set your intention." / "Pick what you're working on today. Drives what shows up below."
3. **quick-start** — `[data-tour="quick-start"]` — "Quick Start." / "Debrief a call, draft a story, or jump straight into sparring."
4. **debrief** — `[data-tour="debrief"]` — "Drop in a call." / "Talk for 60 seconds after a meeting. We turn it into CRM fields plus coachable moments."
5. **performance** — `[data-tour="performance"]` — "Your numbers." / "Calls, stories drafted, sparring reps. Updates live."
6. **leaderboard** — `[data-tour="leaderboard"]` — "Where you rank." / "vs. the rest of the vbrick BDR team."

### Stories (2 steps)

7. **story-vault** — `[data-tour="story-vault"]` — "Your story vault." / "Elevator pitches, Feel-Felt-Found, ABT customer stories. Drafted, scored, reusable."
8. **story-practice** — `[data-tour="story-practice"]` — "Practice out loud." / "Record yourself. Get scored. Share the challenge with a teammate."

### Campaigns (1 step)

9. **campaigns** — `[data-tour="campaigns"]` — "Outbound campaigns." / "What you're running this week. Sequences, targets, results."

### Playbook (2 steps)

10. **playbook-content** — `[data-tour="playbook-content"]` — "The vbrick playbook." / "Talk tracks, objection handling, qualification questions. The stuff that works."
11. **playbook-frameworks** — `[data-tour="playbook-frameworks"]` — "Frameworks on demand." / "PAS, ABT, Feel-Felt-Found. Pulled up when you need them."

### Sparring (2 steps)

12. **sparring-scenarios** — `[data-tour="sparring-scenarios"]` — "Live sparring." / "AI plays a prospect. You handle the call. Real-time."
13. **sparring-pick** — `[data-tour="sparring-pick"]` — "Pick your fight." / "Cold call, discovery, objection drill, referral ask. Start anywhere."

### Closing (1 step)

14. **done** — *centered modal* — "You're set." / "Replay this tour anytime from the 'Take the tour' button up top."

### data-tour marker placement (during implementation)

The implementation plan resolves exact component-level placement. Initial placement targets:

- `data-tour="intention"` → `components/vbrick/intention-screen.tsx` root
- `data-tour="quick-start"` → `components/vbrick/quick-start-tiles.tsx` root
- `data-tour="debrief"` → `components/vbrick/dashboard-debrief-flow.tsx` root
- `data-tour="performance"` → `components/vbrick/performance-cards.tsx` root
- `data-tour="leaderboard"` → `components/vbrick/leaderboard.tsx` root
- `data-tour="story-vault"` and `data-tour="story-practice"` → main containers in `components/vbrick/stories/`
- `data-tour="campaigns"` → main container in `components/vbrick/campaigns/`
- `data-tour="playbook-content"` and `data-tour="playbook-frameworks"` → main containers in `components/vbrick/playbook/`
- `data-tour="sparring-scenarios"` and `data-tour="sparring-pick"` → containers in `components/vbrick/sparring-dashboard.tsx` and `realtime-sparring-session.tsx`

If a target is hard to land cleanly on a single element, fall back to wrapping the section in a `<div data-tour="...">`.

## Theming

vbrick uses a neumorphic palette (`neuTheme` in `lib/vbrick/theme.ts`) on `#e0e5ec`. driver.js popovers need overrides to fit:

- Font: Satoshi (already loaded in vbrick layout)
- Popover: white background, soft shadow `0 8px 24px rgba(163, 177, 198, 0.4)`, 12px radius, no border
- Title: 16px Satoshi semibold, vbrick text color
- Body: 14px Satoshi regular, 1.5 line height
- Buttons: vbrick primary for "Next", text-only for "Skip"
- Spotlight: 8px radius around target, dim overlay `rgba(20, 25, 40, 0.55)`

CSS lives in `styles/vbrick-tour.css`, imported once from `tour-provider.tsx`.

## Edge Cases

| Case | Behavior |
|---|---|
| Target element never mounts within 3s | Log warning, advance to next step. Tour never deadlocks. |
| User clicks Skip mid-tour | Write completion flag, destroy driver instance. Treated same as completion. |
| User navigates away via browser back/forward during tour | `pathname` change is detected by provider; if it diverges from expected step route, destroy tour silently. Re-runnable from button. |
| User refreshes mid-tour | Tour state is in-memory only; tour ends. Auto-start will not re-trigger (the user already started it once this session — but completion flag was not written, so they'll see it again on next dashboard load if no email change. Acceptable.) |
| Email is null on dashboard mount | No auto-start. Tour button still works (writes flag against the empty key — replaced once email is set). |
| Element exists but is `display: none` (hidden on mobile) | driver.js skips it; advance handler still fires correctly. |
| Two browser tabs open vbrick simultaneously | Both could auto-start. Acceptable; localStorage write resolves it on next page load. |

## Bundle Impact

- driver.js: ~5KB gzipped, lazy-loaded only when tour starts
- CSS: ~1KB
- New TS files: ~150 LOC total
- Zero impact on first paint for users who never trigger the tour

## Testing

- **Manual smoke (required before merge):**
  1. Clear localStorage, set email via login screen → land on dashboard → tour auto-starts after 600ms
  2. Click through all 14 steps → verify each route transition lands → verify spotlight matches description
  3. Reload dashboard → tour does NOT auto-start
  4. Click "Take the tour" in TopNav → tour starts again
  5. Mid-tour: click Skip → tour ends → reload → no auto-start
  6. Resize to 375px viewport → repeat steps 1-2 → no broken layout, no off-screen popovers
- **Playwright script (optional, manual run):** `scripts/test-vbrick-tour.ts` — pre-sets email in localStorage, visits dashboard, screenshots each step, asserts pathname matches `step.route`. Not wired into CI (no test runner configured per CLAUDE.md).
- **No unit tests** — step list is data; tour controller is glue. Behavior emerges from integration.

## Brand Voice Compliance

All copy reviewed against StreetNotes brand voice (`CLAUDE.md`):
- No banned words: leverage, synergy, robust, seamlessly, game-changer, revolutionary, empower, enable, solution, platform — none present.
- Short sentences. Fragments. ✓
- Leads with the function, not the product. ✓

## Open Items Deferred

- Analytics: tour start/skip/complete events → defer until we know what we'd do with them.
- Per-tab mini-tours triggered from each tab's help icon → defer; full tour replay covers it.
- Localization → defer; vbrick is English-only.
- Cross-device persistence → defer; localStorage per device is acceptable for a BDR tool.
