# VBrick K26 Event Debrief — Design Spec

**Date:** 2026-05-05
**Status:** Approved
**Author:** Jeff Meyers + Claude Opus 4.7

## Problem

VBrick BDRs are at the ServiceNow Knowledge 26 event in Las Vegas this week (May 5–8, 2026). The existing debrief flow is shaped for cold-call data extraction (call disposition, SPIN scoring, prospect status taxonomy). Booth conversations don't fit that shape — there's no voicemail at a booth, SPIN doesn't apply to two-minute pitches, and event-specific intel (which ServiceNow modules they own, did they watch a demo, badge collected) isn't captured.

## Goal

A second debrief shape — "K26 Event Conversation" — that runs alongside the cold-call shape during the K26 window. Same record→transcribe→structure→review→save pipeline. Different schema, prompt, result card, and PDF. After K26, the architecture stays in place for any future trade show, dinner, or webinar.

## Approach

**Time-window default with subtle mode label.** During the K26 window (`2026-05-05` through `2026-05-08`), the debrief flow auto-routes to event-conversation mode. Outside that window, it routes to cold-call mode. No selector UI; the BDR sees a small mode label only on the result card so they know which shape they got.

Behavior reverts automatically on May 9. To run the same pattern for a future event, update `EVENT_MODE_WINDOW` in `lib/vbrick/config.ts`.

## Architecture

```
[ BDR opens debrief flow ]
            │
   [ client checks current date vs EVENT_MODE_WINDOW ]
            │ → sets mode = 'event-conversation' or 'bdr-cold-call'
            ▼
[ Pre-record cheat sheet (event mode only) ]
            ▼
[ Voice record ] → /api/vbrick/debrief/transcribe (unchanged)
            ▼
[ Transcript review ]
            ▼
[ POST /api/vbrick/debrief/structure { transcript, mode } ]
            │
   ┌────────┴────────┐
   │ mode === 'bdr'  │ → existing VBRICK_BDR_SYSTEM_PROMPT (unchanged)
   │ mode === 'event'│ → new VBRICK_EVENT_SYSTEM_PROMPT
   └────────┬────────┘
            ▼
[ Result card — VbrickResultsCard or VbrickEventResultsCard, by mode ]
            │ + completeness chip
            ▼
[ Saved to debrief_sessions; structured_output.mode is the discriminator ]
            ▼
[ Recent Debriefs on dashboard — mode badge per row ]
```

Storage: same `debrief_sessions` table. The `structured_output` JSON column carries the `mode` discriminator. No migration.

PDF: separate `lib/vbrick/debrief/event-pdf.tsx` and `/api/vbrick/debrief/event-pdf` route. Existing BDR PDF untouched.

## Data shape (event-conversation)

```ts
{
  mode: 'vbrick-event-conversation',
  contactSnapshot: {
    name: string,    // "Not mentioned" if absent
    title: string,
    company: string,
    email: string,
  },
  engagementType:
    'walked-by' | 'scheduled-meeting' | 'demo-watcher' |
    'referral' | 'lead-scan' | 'other',
  demoWatched: 'full' | 'partial' | 'none',
  temperature: 'hot' | 'warm' | 'cold' | 'not-a-fit',
  badgeCollected: boolean,
  servicenowModules: string[],  // ITSM, HRSD, CSM, Employee Center Pro,
                                // Now Assist, AI Search, Video Connector,
                                // Service Portal — or [] if none mentioned
  currentSolution: string,
  theTruth: string,
  objections: string[],
  followupCommitment: string,
  nextAction: { action: string, when: string },
  aeBriefing: string | null,    // null for walked-by / lead-scan
  ciMentions: Array<{
    competitorName: string,
    contextQuote: string,
    sentiment: 'negative' | 'positive' | 'neutral',
    mentionCategory: 'pricing' | 'features' | 'switching' | 'satisfaction' |
                     'comparison' | 'contract' | 'migration' | 'general',
  }>,
}
```

Dropped from cold-call shape (don't fit booth chats): `callDisposition`, `prospectStatus` / `prospectStatusDetail`, `referral` (folds into `theTruth` or `nextAction`), `spin` (booth conversations are too short for SPIN scoring).

## Completeness scaffolding

**Pre-record cheat sheet** (above the mic button on the recorder screen, event mode only):

> **Try to cover in your debrief:**
> • Who — name, title, company
> • Demo — did they watch it? Full or partial?
> • ServiceNow stack — which products do they use?
> • Current video — what are they on today? Pain points?
> • Temperature — gut feel: hot, warm, cold, not-a-fit
> • Objections — anything they pushed back on
> • Commitment — what did they agree to do next?
> • Badge — did you scan their badge or get a card?

**Post-structure completeness chip** at the top of the result card:
- 🟢 "Complete debrief — all fields captured"
- 🟡 "Missing: <field list>" (1–2 fields blank)
- 🔴 "Thin debrief — most fields missing" (3+ blank)

Informational only, never blocks save.

## Files

**New:**
- `lib/vbrick/debrief/event-prompts.ts` — system prompt + user template + 2 K26 examples
- `lib/vbrick/debrief/event-pdf.tsx` — React-PDF event layout
- `app/api/vbrick/debrief/event-pdf/route.ts` — PDF generation endpoint
- `components/vbrick/event-results-card.tsx` — result card variant
- `components/vbrick/event-cheat-sheet.tsx` — pre-record reminder card

**Modified:**
- `lib/debrief/types.ts` — add `EventConversationOutput` + `isEventOutput` type guard
- `lib/vbrick/config.ts` — add `EVENT_MODE_WINDOW = { start: '2026-05-05', end: '2026-05-08' }` and helper `isInEventWindow()`
- `app/api/vbrick/debrief/structure/route.ts` — branch prompt selection on `mode` request body field
- `components/vbrick/dashboard-debrief-flow.tsx` — detect mode by date, render cheat sheet in event mode, send mode in structure request, render correct result card
- `app/vbrick/dashboard/page.tsx` — render mode badge on Recent Debriefs rows

## Result card layout (event mode)

```
┌─────────────────────────────────────────────────┐
│ K26 Event Debrief · 2:34pm                     │
│ 🟢 Complete debrief — all fields captured      │
├─────────────────────────────────────────────────┤
│ [contact]   [engagement chips]                 │
│ Priya Sharma                  [demo-watcher]   │
│ Director of L&D, TechCorp     [hot]            │
│ priya@techcorp.com            [badge ✓]        │
├─────────────────────────────────────────────────┤
│ ServiceNow stack                                │
│ [ITSM] [HRSD] [Employee Center Pro] [Now Assist]│
├─────────────────────────────────────────────────┤
│ The Truth                                       │
│ "..."                                           │
├─────────────────────────────────────────────────┤
│ Demo watched      Current solution             │
│ Full              Microsoft Stream — broken    │
├─────────────────────────────────────────────────┤
│ Objections                                      │
│ • "..."                                         │
│ Competitive intel                               │
│ • Microsoft Stream — negative — satisfaction    │
├─────────────────────────────────────────────────┤
│ Followup commitment                             │
│ "Will send specs Friday"                       │
│ Next action: Brief Jake before Thursday demo    │
├─────────────────────────────────────────────────┤
│ ▼ AE Briefing                                   │
│ "Meeting with Priya..." (collapsible)          │
├─────────────────────────────────────────────────┤
│ [ Download PDF ]                                │
└─────────────────────────────────────────────────┘
```

## Out of scope

- BDR-side ability to manually override the mode (per Approach C: time-based only).
- Post-K26 cleanup of the `EVENT_MODE_WINDOW` constant — left in place; expires harmlessly.
- Generalized "event mode" UX with multiple ongoing events. Single window only for now.

## Success criteria

- BDR records a booth conversation between May 5–8, gets back a structured payload in event-conversation shape (not cold-call).
- BDR records the same content May 9, gets back a cold-call shape.
- Result card displays "K26 Event Debrief" header with completeness chip.
- PDF download produces an event-shaped tear sheet.
- Recent Debriefs on the dashboard shows a mode badge per row, both modes coexist.
- No migration needed; existing cold-call data on the dashboard is unaffected.
