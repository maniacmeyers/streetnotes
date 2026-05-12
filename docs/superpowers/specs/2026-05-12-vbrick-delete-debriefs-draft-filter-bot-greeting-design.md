---
type: design-spec
project: streetnotes-vbrick
date: 2026-05-12
status: approved
tags: [vbrick, debriefs, story-drafts, realtime-sparring]
---

# VBrick — Delete debriefs, hide empty drafts, bot greets first

Three independent, small-scope fixes to the VBrick command center.

## Problem

1. **No way to delete a recent debrief.** The "Recent Debriefs" list on the VBrick dashboard accumulates entries forever. Users have asked for a way to remove a row (test runs, accidental submissions, stale calls).
2. **Empty drafts clutter the Stories tab.** The "Continue Drafting" section on `/vbrick/dashboard/stories` lists every row in `story_drafts` with `status = 'draft'` — including drafts that were created (by clicking a framework tile) but never advanced through the wizard. These empty shells make the list noisy.
3. **Practice-call bot is silent on pickup.** In the sparring realtime session, once the WebRTC connection establishes, the bot waits silently for the BDR to speak. The realtime instructions already describe a "Step 1 — PICK UP" greeting ("Hello?", "Yeah?"), but the bot never speaks first because no `response.create` is sent. BDRs can't tell when the line is live.

## Out of scope

- Bulk delete or multi-select for debriefs.
- Deleting empty drafts from the database. They are hidden in UI; cleanup of stale rows is a separate concern.
- Changing the realtime persona instructions, voice, or scoring logic.
- Any change to the non-realtime sparring path (`components/vbrick/sparring-session.tsx`). The user's complaint is specifically about the realtime practice call.

---

## Change 1 — Delete recent debriefs

### API

New file: `app/api/vbrick/debriefs/[id]/route.ts`.

- `DELETE` handler only.
- Mirrors the email-resolution pattern from `app/api/vbrick/stories/vault/[id]/route.ts`:
  1. Try the Supabase session via `createClient().auth.getUser()`.
  2. Fall back to `?email=` query param (VBrick is gated by localStorage identity, not Supabase auth).
  3. If neither is present → 401.
  4. If the fallback path is used, gate on `isVbrickUser(email)`.
- Loads the row from `debrief_sessions` by `id`. If not found → 404. If `email` column doesn't match the resolved caller email → 403.
- Deletes the row. Returns `{ success: true }`.
- `runtime = 'nodejs'`.

### UI — `components/vbrick/recent-calls.tsx`

- Add `onDelete?: (id: string) => void | Promise<void>` to `RecentCallsProps`.
- Wrap each row's existing `motion.div` in `<SwipeToDelete onDelete={...} radius={12}>` when `onDelete` is provided, otherwise render the bare row (so non-VBrick callers of `RecentCalls`, if any, are unaffected).
- Add a small ghost trash icon (`Trash2` from `lucide-react`) inside the row, anchored right of the score column, hidden by default and shown via `group-hover:opacity-100` on desktop (`hidden sm:inline-flex`). Tap → fire `onDelete(call.id)` with a `window.confirm()` guard.
  - Rationale: swipe-to-delete is the primary mobile affordance; the icon adds desktop discoverability without dominating the row.
- `AnimatePresence` already wraps the list, so removal animates out cleanly.

### Wire-up — `app/vbrick/dashboard/page.tsx`

- Add `handleDeleteRecentCall(id: string)`:
  1. Optimistic: `setRecentCalls(prev => prev.filter(c => c.id !== id))` and drop `id` from `storedOutputs`.
  2. `await fetch('/api/vbrick/debriefs/' + id + '?email=' + encodeURIComponent(email), { method: 'DELETE' })`.
  3. On non-OK, refetch via `fetchRecentDebriefs()` so the UI reconciles back to the server state.
- Pass `onDelete={handleDeleteRecentCall}` into the existing `<RecentCalls ... />` render at line 405.

### Acceptance

- Swiping left on a row on mobile reveals a red Delete; tapping it removes the row, hits the DELETE endpoint, and persists across refresh.
- On desktop, hovering a row reveals a trash icon; clicking it (after browser confirm) does the same.
- Deleting a row that contains the currently-viewing debrief (`viewingSessionId === id`) does not crash the view — the dashboard view is unaffected because deletion happens from the list, not the detail; this case is acceptable to ignore (user has to navigate back to the list to delete).
- Deleting another user's debrief returns 403.

---

## Change 2 — Hide empty drafts from "Continue Drafting"

### Helper

In `app/vbrick/dashboard/stories/page.tsx`, add a local helper:

```ts
function hasStarted(draft: StoryDraft): boolean {
  if (draft.draft_content && draft.draft_content.trim().length > 0) return true
  if (draft.ai_conversation && draft.ai_conversation.length > 0) return true
  if (draft.framework_metadata && Object.keys(draft.framework_metadata).length > 0) return true
  return false
}
```

A draft "has started" if any one of: assembled draft text exists, the AI wizard has at least one message, or any framework answer was captured.

### Use sites

In the "Active Drafts" block (around lines 386–412):

- Replace `drafts.some(d => d.status === 'draft')` with `drafts.some(d => d.status === 'draft' && hasStarted(d))`.
- Replace `drafts.filter(d => d.status === 'draft')` with `drafts.filter(d => d.status === 'draft' && hasStarted(d))`.

### Acceptance

- A draft created by clicking a framework tile but never advanced past the wizard's first question does NOT appear under "Continue Drafting".
- A draft with at least one AI message OR at least one captured framework answer OR any assembled `draft_content` DOES appear.
- The "Ready to Practice" list (drafts with `status = 'practicing'`) is unaffected.
- No database changes; stale empty rows remain in `story_drafts` and are simply not rendered. They can be cleaned up later if desired.

---

## Change 3 — Realtime bot greets first on practice calls

### Root cause

`components/vbrick/realtime-sparring-session.tsx` establishes a WebRTC session and waits. The OpenAI Realtime API does not auto-emit a turn — it waits for the input audio buffer to signal speech. The persona instructions in `lib/vbrick/realtime-instructions.ts` describe what to say when picking up, but nothing tells the model to speak first.

### Fix

In `components/vbrick/realtime-sparring-session.tsx`, after `await pc.setRemoteDescription(...)` and `setPhase('in-call')`:

1. Define a helper `triggerGreeting()` that sends a `response.create` event over the data channel:

   ```ts
   function triggerGreeting() {
     const dc = dcRef.current
     if (!dc || dc.readyState !== 'open') return
     dc.send(
       JSON.stringify({
         type: 'response.create',
         response: {
           instructions:
             "The phone just rang and you're picking up now. Open with a short, natural pickup greeting — vary it: 'Hello?' / 'Yeah?' / 'This is " +
             personaName +
             ".' / 'Hey?'. ONE short utterance only. Do not start the conversation, do not introduce VBrick — just answer the phone.",
         },
       }),
     )
   }
   ```

2. After `setPhase('in-call')`, call `triggerGreeting()`. If the data channel is not yet open, fall back to attaching a one-shot `dc.onopen` that calls `triggerGreeting()` then clears itself.

3. Use a `hasGreetedRef = useRef(false)` to guard against the function being invoked twice (e.g., if both the direct call AND `onopen` fire).

### Acceptance

- BDR clicks "Start Practice" → sees "Connecting…" → as soon as the call is live, hears the persona say a short greeting ("Hello?" or similar) within 1–2 seconds.
- The greeting is one short utterance; the bot then stops and listens for the BDR. Step 2 ("HELP REQUEST") of the script proceeds normally.
- No regression in scoring — the bot's pickup line is already accounted for by the existing instructions (the instructions describe Step 1 → Step 5).
- If the greeting fails to fire for any reason (channel closed, etc.), the call still works; the BDR may have to speak first, matching today's behavior.

---

## Files touched

| File | Change |
| --- | --- |
| `app/api/vbrick/debriefs/[id]/route.ts` | NEW — DELETE handler |
| `components/vbrick/recent-calls.tsx` | Add `onDelete` prop, wrap rows in `SwipeToDelete`, add desktop trash icon |
| `app/vbrick/dashboard/page.tsx` | Add `handleDeleteRecentCall`, pass to `<RecentCalls />` |
| `app/vbrick/dashboard/stories/page.tsx` | Add `hasStarted()` helper, gate "Continue Drafting" on it |
| `components/vbrick/realtime-sparring-session.tsx` | Send `response.create` after data channel opens to trigger pickup greeting |

No database migrations. No environment variables. No new dependencies.

## Risks

- **Delete on shared identity.** VBrick uses localStorage email as identity. Anyone who knows another VBrick BDR's email could DELETE that user's debriefs via a hand-crafted request. This is consistent with how the rest of `/api/vbrick/*` works (vault, drafts) — it is a known property of the VBrick demo tenant and not a regression introduced by this change.
- **Greeting collides with eager BDR.** If a BDR speaks before the bot's greeting lands, the model may produce an awkward overlap. The greeting fires immediately after `in-call`, so the window is small (sub-second); acceptable.
- **Realtime event format drift.** The `response.create` payload follows the GA `/v1/realtime/calls` event schema already in use elsewhere in this file. If OpenAI changes the schema, the greeting silently fails and behavior reverts to today — acceptable failure mode.
