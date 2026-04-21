---
date: 2026-04-21
status: approved
project: streetnotes/vbrick
owner: Jeff
---

# VBrick Sparring Restyle + Nav Consolidation

## Problem

BDRs open the sparring tool and hit three walls:

1. **It looks wrong.** Sparring uses raw shadcn indigo/slate while the rest of the vbrick surface (Dashboard, Stories, Campaigns, Playbook) is styled in the Neu palette. Visually it reads as a different app.
2. **Conversations end after one turn.** The prospect delivers an opening line, the BDR replies, and the AI never comes back. The loop is wired in code (`framework-sparring-session.tsx:133-186`) but silently breaks on audio playback, autoplay rejection, or `isPlayingAudio` never resetting.
3. **There is no "just start practicing" path.** BDRs face an 8-persona grid, an accent picker, and a briefing card before they ever talk. Brand-new BDRs — most of the team — give up before they start.

This week's outreach play is a specific Bending Spoons acquisition check-in + K26 booth invite. The tool should open directly into that scenario. One seasoned BDR (4 years) also needs an escape hatch: same scenario with the cheat card off and a tougher prospect.

**Separately, the vbrick app has an inconsistent nav architecture.** The `Sidebar` (288px) renders only on the dashboard home (`app/vbrick/dashboard/page.tsx:240`). Every sub-page (Sparring, Stories, Campaigns, Playbook, Settings, CI) replaces it with its own locally-invented `<header>` — different colors, different actions, no shared IA. Users navigate via the sidebar on the home page, land on a sub-page, and the sidebar vanishes. The sticky mic — core to the product — is trapped inside the sidebar and therefore unreachable from any sub-page. The 288px gutter also eats ~20% of horizontal width on a 1440px display, with stats that are already redundant with `PerformanceCards` on the same screen.

## Scope

**In scope (this branch):**
- Neu styling pass on `framework-sparring-session.tsx` and `sparring-session.tsx`
- Conversation-loop reliability fixes (4 specific changes below)
- New scenario primitive + one scenario: `bending-spoons-k26`
- New default landing at `/vbrick/dashboard/sparring` with one-click quick start and a Hard-mode toggle
- Quiet "More scenarios →" link to the existing persona grid
- **Nav consolidation:** remove the 288px `Sidebar`, introduce a persistent 56px `TopNav` rendered via the dashboard layout, and introduce a floating `MicFab` (bottom-right) so the mic reaches every sub-page. Delete the per-page custom `<header>` blocks on all 6 sub-pages.

**Out of scope (deferred):**
- DB persistence for anonymous sparring sessions (refresh = restart is acceptable for v1)
- Voice input / Whisper integration (textarea stays)
- Additional scenarios beyond Bending Spoons + K26
- Manager-side sparring visibility
- Visual pass on the review/score screen (only the picker + in-call get the restyle this round; review screen if trivially in the same token pass)

## Design

### 1. Scenario primitive

A scenario wraps a persona with a situation, a script, and a difficulty variant. Personas stay unchanged.

New file: `lib/vbrick/sparring-scenarios.ts`

```ts
export type ScenarioScriptStep = { label: string; hint: string }

export type SparringScenario = {
  id: string
  title: string
  subtitle: string                 // one-line context shown on the quick-start card
  estimatedMinutes: number
  personaId: string                // references ALL_PERSONAS
  defaultAccent: BDRAccent         // 'general' for Bending Spoons
  scenarioContext: string          // prose appended to persona's system prompt
  hardModeContext: string          // additional prose appended when hardMode = true
  cheatCard: ScenarioScriptStep[]  // 3-step script shown on screen when cheat card is on
}
```

First and only scenario for this ship: `bending-spoons-k26`.

- **Persona:** a new, minimal persona tailored for this scenario (net-new rather than reusing one of the existing 8, so the scenario is self-contained). VP IT or VP Internal Comms at a mid-market company that closed an acquisition by Bending Spoons eight weeks ago.
- **Cheat card (Script visible):**
  1. Confirm you're speaking to the right person
  2. Ask about friction from the Bending Spoons acquisition
  3. Ask if they're attending K26 → pitch the booth (multi-modal AI, "pull the exact frame of video you need")
- **Hard mode prompt append:** the prospect is protective of their time, has been contacted three times this month about Bending Spoons, and pushes back on weak openers.

### 2. API change

`app/api/vbrick/framework-spar/route.ts` accepts two new optional fields on all three actions (`start`, `respond`, `score`):

- `scenarioId?: string`
- `hardMode?: boolean`

When `scenarioId` is present, the server resolves the scenario, pulls the referenced persona, and constructs the system prompt as:

```
{persona.systemPrompt}

{scenario.scenarioContext}

{hardMode ? scenario.hardModeContext : ''}
```

When `scenarioId` is absent, the existing persona-only path runs unchanged. Nothing existing breaks.

No DB migration required. Scenario state lives in the client and the system prompt.

### 3. The three fixes

**A. Neu styling pass.** Inventory the tokens used in `components/vbrick/quick-start-tiles.tsx` and the Dashboard landing, then replace in `framework-sparring-session.tsx` and `sparring-session.tsx`:

- `bg-muted`, raw `Card`, `Badge`, `Progress` → the Neu surface/border/shadow pattern used on Dashboard
- `bg-gradient-to-br from-blue-500 to-purple-500` avatar → Neu accent
- `bg-yellow-50 border-yellow-200` coaching-tip card → Neu warning/accent treatment
- Buttons → Neu primary/secondary
- Keep the structural layout; only the visual tokens change.

If the review/score screen shares the same card/button primitives and the swap is trivial, include it. Otherwise defer.

**B. Conversation loop — debug and harden, not re-architect.**

1. **Ungate the input from `isPlayingAudio`.** Real calls let you interrupt. The textarea + Send button stay live while audio plays. If BDR hits Send while audio is playing, we `audioRef.current?.pause()` and submit.
2. **Display bot text immediately.** `setConversation([...updatedConversation, { speaker: 'prospect', text: data.response }])` fires the moment the API returns, not after `audio.onended`. TTS is decoration, not a gate.
3. **Audio play-rejection safety net.** Wrap `audio.play()` in `.catch()` — on rejection (autoplay policy, network, decode error), log to console, reset `isPlayingAudio`, keep the text visible. Add a mute/unmute icon in the call header.
4. **Send full conversation history, not `slice(-6)`.** Cap at 40 turns. The six-message window was cutting mid-call context and almost certainly contributes to the AI seeming to "forget" and end the conversation.

No new persistence layer. Refresh = restart for anonymous users, same as today.

**C. Quick-start landing.**

`app/vbrick/dashboard/sparring/page.tsx` becomes:

```
┌─────────────────────────────────────────── More scenarios → ┐
│                                                              │
│   🎯 This Week — Bending Spoons Check-in + K26 Invite        │
│   Calls a VP at a recently acquired company. ~3 minutes.     │
│                                                              │
│   [ Start Practice Call ]                                    │
│                                                              │
│   [ Script visible ] | [ Hard mode ]                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Default state: scenario loaded, accent preset to `general`, cheat card on, hard mode off.
- "Start Practice Call" → skips persona + accent pickers entirely → `FrameworkSparringSession` launches straight into `connecting` → `in-call`.
- "Hard mode" toggle flips the cheat card off and appends `scenario.hardModeContext` to the system prompt on the next `start` call.
- "More scenarios →" in the corner routes to the existing persona grid (current behaviour preserved verbatim).
- Inside the call, the cheat card renders the three scripted steps as a pinned card above the conversation (replacing the generic step-guidance block) when Script visible is on. When Hard mode is on, that card is hidden.

### 4. Coaching prompts (Hard mode support)

Separate deliverable, not a code artifact — see below in the final response. These are short coach/manager prompts Jeff can read aloud when a BDR freezes on Hard mode.

### 5. Nav consolidation (Option B: top nav + mic FAB)

**New shared chrome.** The dashboard layout (`app/vbrick/dashboard/layout.tsx`) becomes the single source of chrome for every page under it. A new client component `VbrickShell` wraps `children` and renders:

- **`<TopNav>`** — 56px persistent bar at top.
  - Left: StreetNotes mark + vbrick wordmark (`Command Center`) + 5 nav pills with `usePathname()` active state: `Dashboard · Stories · Campaigns · Playbook · Sparring`.
  - Right: streak badge (`🔥 {n}-day streak` — only when `n >= 1`) + user menu button (`displayName` avatar → dropdown with Settings and Sign out).
  - Styling: Neu tokens — `#e0e5ec` background, soft shadow bottom edge, Satoshi + General Sans fonts already in use.
- **`{children}`** — full-width content area. No more `ml-[288px]`. Pages render inline with whatever page title or inline `<h1>` they want; the TopNav is the shared chrome.
- **`<MicFab>`** — circular floating action button, fixed `bottom: 24px; right: 24px`, z-index above page content.
  - Idle state: 56×56 button with mic icon, Neu styling, indigo accent (`#6366f1`).
  - Recording state: expands to pill showing duration + small waveform + Stop button. Remains tappable from any page.
  - Tapping mic while on any non-dashboard page routes to `/vbrick/dashboard` and starts the debrief flow (preserves the existing dashboard debrief behavior — the FAB is just the universal entry point).

**Recording state lifted into `DashboardProvider`.** Today `isRecording`, `recordingDuration`, `handleMicStart`, `handleMicStop` live in `app/vbrick/dashboard/page.tsx` state and are passed down to `Sidebar`. They move into `dashboard-context.tsx` so `TopNav`, `MicFab`, and the dashboard page all read from the same source.

**Email / identity lifted into `DashboardProvider` too.** The `email → displayName` logic currently in `dashboard/page.tsx:232-236` moves into the provider so `TopNav` can show the user menu on any page. The email gate (login form at lines 155-226) stays on the dashboard home as the entry point — if you land on a sub-route without an email set, `VbrickShell` redirects to `/vbrick/dashboard` to run the gate.

**Per-page headers deleted.** These six files lose their custom top-bar blocks and render only their content body:

- `app/vbrick/dashboard/sparring/page.tsx` — kill the "Cold Call Gym" green/teal gradient header; move the help dialog into the sparring-quickstart landing itself
- `app/vbrick/dashboard/stories/page.tsx`
- `app/vbrick/dashboard/campaigns/page.tsx`
- `app/vbrick/dashboard/playbook/page.tsx`
- `app/vbrick/dashboard/settings/page.tsx`
- `app/vbrick/dashboard/ci/page.tsx`

Inline `<h1>` for the page title stays on each sub-page if it was there — the TopNav is chrome, not content.

**Sidebar deleted.** `components/vbrick/sidebar.tsx` is removed. The stats it showed (streak, today's calls, spin avg) are redundant with `PerformanceCards` on the dashboard home, except streak which moves to the TopNav.

**Dashboard home content re-flows.** `app/vbrick/dashboard/page.tsx` stops rendering `<Sidebar>` and stops offsetting with `ml-[288px]`. Welcome block + QuickStartTiles + PerformanceCards + Recent Debriefs + Leaderboard now render full-width under the TopNav. This should visibly feel "larger" — that's the point.

**Mobile/responsive.** TopNav pills collapse to a hamburger menu under `md` breakpoint (existing Tailwind breakpoint). MicFab stays bottom-right on mobile. No sidebar drawer needed — the whole point of this change is to not have a sidebar.

## Files touched

**Sparring restyle + quick-start:**
- **New:** `lib/vbrick/sparring-scenarios.ts`
- **Modified:** `lib/vbrick/sparring-personas.ts` — append one new persona (the Bending Spoons VP) referenced by the scenario
- **Modified:** `app/vbrick/dashboard/sparring/page.tsx` — new landing layout
- **Modified:** `components/vbrick/framework-sparring-session.tsx` — Neu styling, input ungated from audio, cheat-card rendering, scenario + hardMode props
- **Modified:** `components/vbrick/sparring-session.tsx` — Neu styling only
- **Modified:** `app/api/vbrick/framework-spar/route.ts` — accept `scenarioId` and `hardMode`, compose system prompt accordingly

**Nav consolidation:**
- **New:** `components/vbrick/top-nav.tsx`
- **New:** `components/vbrick/mic-fab.tsx`
- **New:** `components/vbrick/vbrick-shell.tsx` — client wrapper rendering TopNav + children + MicFab, handling email redirect
- **Modified:** `app/vbrick/dashboard/layout.tsx` — wrap children in `VbrickShell`
- **Modified:** `lib/vbrick/dashboard-context.tsx` — add recording state + email/displayName to context
- **Modified:** `app/vbrick/dashboard/page.tsx` — stop rendering Sidebar, stop offsetting `ml-[288px]`, stop owning recording state
- **Modified:** strip per-page `<header>` blocks from the 6 sub-pages listed above
- **Deleted:** `components/vbrick/sidebar.tsx`

No DB migrations. No new env vars. No new dependencies.

## Success criteria

- BDR can complete a 6+ turn conversation without getting locked out, on Chrome and Safari desktop.
- Quick-start button → in-call in under 2 seconds with no intermediate screens.
- Hard mode toggle visibly hides the cheat card and the AI prospect pushes back on weak openers.
- `framework-sparring-session.tsx` uses no raw `bg-muted` / default shadcn card visuals.
- The existing persona-grid path still works end-to-end for anyone who clicks "More scenarios →".
- Every dashboard page (`/vbrick/dashboard` + all 6 sub-routes) renders the same `TopNav` and the same `MicFab`. No page has a local `<header>` with its own nav-looking chrome.
- Tapping the `MicFab` on any non-dashboard page starts a debrief flow (routes to the dashboard root).
- The dashboard home content (Welcome + QuickStartTiles + PerformanceCards + Recent Debriefs + Leaderboard) renders at full available width — no `ml-[288px]` offset.
- `components/vbrick/sidebar.tsx` is deleted; `git grep Sidebar` returns no imports.

## Risks / watch-outs

- **TTS still fails silently.** If after ungating input the BDR still can't hear the AI, the text is readable so the practice session continues; we add a log + a mute-state indicator in the call header so we notice.
- **Hard mode drift.** The system prompt append needs to actually produce more skeptical replies. If the model keeps being cooperative, we tune the hardModeContext prose rather than touching code.
- **Existing `sparring-session.tsx` generic flow.** Styling-only changes there — do not touch its state machine to avoid regressions on the legacy path.
- **MicFab collision with page content.** Fixed bottom-right at z-20+; must not cover primary actions. Pages with their own bottom-right buttons (if any) need a small bottom-padding pass. Check sparring in-call "Send / End Call" row and the debrief screens.
- **Mic state race when navigating mid-recording.** If the user taps the mic on `/vbrick/dashboard/sparring` while in a sparring call, we need to NOT start a debrief over the sparring session. Simplest rule: disable the MicFab whenever the dashboard debrief flow is already active OR whenever the route is `/vbrick/dashboard/sparring` with an active session. Encode this in the context.
- **Email gate on sub-routes.** If the user somehow deep-links to `/vbrick/dashboard/stories` without an email in localStorage, `VbrickShell` redirects to `/vbrick/dashboard` to run the gate. Test the redirect doesn't loop.
