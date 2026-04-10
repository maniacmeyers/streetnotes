# Swipe-to-Delete for Story Drafts & Vault

**Date:** 2026-04-10
**Status:** Approved
**Scope:** Story feature only (drafts + personal vault + team vault)

## Problem

Story drafts currently have no way to be deleted from the UI. Vault cards only expose delete via an in-card trash icon that requires expanding the card first. On a mobile-first app, reps expect iOS-style swipe-to-delete on any list row they own.

## Solution

Add a reusable `SwipeToDelete` wrapper that reveals a red delete action behind a row when the user swipes left. Apply it to all Story drafts and to vault cards the current user owns. Also add a persistent trash icon to draft rows (the only list with no existing delete path).

## Out of scope

- Dashboard Recent Notes list
- Any non-Story list
- Swipe-past-threshold auto-delete
- Undo toast
- Confirmation modal (swipe + tap on the revealed action is itself a two-step confirm)

## New component

**Path:** `components/vbrick/swipe-to-delete.tsx`

**Props:**

```ts
interface SwipeToDeleteProps {
  onDelete: () => void | Promise<void>
  disabled?: boolean          // Passes children through unchanged
  children: React.ReactNode
  confirmLabel?: string       // Default "Delete"
}
```

**Behavior:**

- Pointer drag on the row tracks deltaX. Only negative deltaX (leftward) translates the row.
- Clamped at −88px (the revealed action width). Elastic dampening beyond that.
- Axis lock: in the first ~10px of movement, if |dy| > |dx|, abort the swipe and release to page scroll. Prevents accidental horizontal-swipe hijacks during vertical scroll.
- On release:
  - `|deltaX| >= 44` → snap open to −88px (action revealed)
  - `|deltaX| < 44` → snap back to 0
- When open, tapping the red action fires `onDelete`. A brief exit animation (slide out + fade) plays before the parent removes the row from state.
- When open, tapping elsewhere (document `pointerdown` outside the row) snaps closed.
- Only one row open at a time: when any row opens, a shared store (module-level `let openRowId` + subscribe) closes the previously open row.
- `disabled: true` renders `{children}` with no handlers. Used for team vault entries where `entry.bdr_email !== currentUser`.
- Built with `motion/react` (already a dependency). Uses `motion.div` with `animate` for the snap, and an absolutely-positioned red action element beneath.

**Styling:**

- Action button: full-height, 88px wide, right-aligned, `background: #dc2626`, white `Trash2` icon + "Delete" label
- Rounded right edge matches the card's border radius so it doesn't bleed past

## Application

### 1. Story drafts — `components/dashboard/stories-client.tsx`

Add handler:

```ts
const handleDeleteDraft = async (id: string) => {
  await fetch(`/api/vbrick/stories/drafts/${id}`, { method: 'DELETE' })
  fetchDrafts()
}
```

Wrap each draft row. Also add a visible trash icon button at the right side of the row (44px tap target) that calls `handleDeleteDraft` with `e.stopPropagation()` so it doesn't trigger the row's open-for-edit click.

### 2. Personal vault — `components/dashboard/stories-client.tsx`

Wrap each `VaultCard` with `<SwipeToDelete onDelete={() => handleDeleteVault(entry.id)}>`. Keep the existing in-card trash icon in the expanded state as-is.

### 3. Personal vault — `app/vbrick/dashboard/stories/page.tsx`

Same wrap using the existing `handleDeleteVaultEntry(entry.id)`.

### 4. Team vault — `app/vbrick/dashboard/stories/page.tsx`

Wrap each `VaultCard` with `<SwipeToDelete disabled={entry.bdr_email !== email} onDelete={() => handleDeleteVaultEntry(entry.id)}>`.

### 5. Manager dashboard — `components/vbrick/stories/manager-dashboard.tsx`

No change. Read-only view, no `onDelete`.

## Endpoints (already exist)

- `DELETE /api/vbrick/stories/drafts/[id]` — confirmed present at `app/api/vbrick/stories/drafts/[id]/route.ts:39`
- `DELETE /api/vbrick/stories/vault/[id]` — already wired via `handleDeleteVault`

No backend changes.

## Edge cases

- **Draft row has a click handler to open for edit.** The swipe wrapper uses its own pointer handlers — taps (no drag) pass through. If the row is swiped open, the next tap on the card surface closes it instead of opening the draft.
- **Animation during delete.** The parent list already uses `AnimatePresence` with `layout` on vault entries. Drafts list currently doesn't — add `AnimatePresence` + `motion.div` with `layout` on draft rows so removal animates cleanly.
- **Accessibility.** The trash icon button on drafts is a real `<button>` with `aria-label="Delete draft"`. Swipe is a progressive enhancement; anyone on keyboard uses the button.
- **Fetch failure.** If the DELETE fetch fails, re-fetch the list anyway — the row reappears, user can retry. No optimistic removal unless the request succeeds, to avoid ghost rows on error.

## Testing

Manual on iOS Safari + desktop:

- Swipe left past 44px on a draft → red action revealed, tap deletes
- Swipe left under 44px → snaps back
- Swipe open on row A, then tap row B → row A closes
- Vertical scroll on the list → rows don't swipe open
- Team vault row owned by someone else → swipe does nothing
- Trash icon on draft rows → deletes without triggering edit
- In-card vault trash (expanded) → still works
