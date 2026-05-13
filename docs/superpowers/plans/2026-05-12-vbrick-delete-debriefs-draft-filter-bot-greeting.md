# VBrick: Delete Debriefs, Hide Empty Drafts, Bot Greeting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add delete-debrief affordance to the VBrick dashboard, hide never-started story drafts from the Stories tab, and make the realtime sparring bot answer the phone with a short greeting instead of waiting silently.

**Architecture:** Three independent changes, each scoped to one or two files. (1) New `DELETE /api/vbrick/debriefs/[id]` route mirrors the existing vault delete pattern; `RecentCalls` gains an `onDelete` prop wired through the dashboard with optimistic UI. (2) A `hasStarted()` helper in the Stories page filters drafts with no AI conversation, no framework answers, and no draft content. (3) `RealtimeSparringSession` sends a `response.create` event over the WebRTC data channel after it opens so the persona picks up first.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (admin client for vbrick public tenant), React, OpenAI Realtime API (GA `/v1/realtime/calls`).

**Spec:** `docs/superpowers/specs/2026-05-12-vbrick-delete-debriefs-draft-filter-bot-greeting-design.md`

**Verification approach:** This project has no test runner (`CLAUDE.md`: "No test runner is configured"). Each task ends with manual verification steps — running the dev server, hitting the endpoint, exercising the UI — instead of automated tests. Frequent commits stay.

---

## Task 1: Add DELETE endpoint for debrief sessions

**Files:**
- Create: `app/api/vbrick/debriefs/[id]/route.ts`

- [ ] **Step 1: Create the route file**

Write `app/api/vbrick/debriefs/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isVbrickUser } from '@/lib/vbrick/config'

export const runtime = 'nodejs'

// Resolve the caller's effective email. Prefer the authenticated Supabase
// session; fall back to a query-string email for the vbrick public tenant
// (which uses localStorage identity because /vbrick + /api are public at
// the middleware level).
async function resolveCallerEmail(request: Request): Promise<string | null> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (user?.email) return user.email.toLowerCase()

  const queryEmail = new URL(request.url).searchParams.get('email')
  if (queryEmail) return queryEmail.toLowerCase()

  return null
}

// DELETE: Remove a debrief session. Requires ownership.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const callerEmail = await resolveCallerEmail(request)
  if (!callerEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // If no Supabase session backed the call, restrict to known vbrick users.
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user && !isVbrickUser(callerEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('debrief_sessions')
    .select('email')
    .eq('id', params.id)
    .single()
  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if ((existing.email as string).toLowerCase() !== callerEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: deleteError } = await supabase
    .from('debrief_sessions')
    .delete()
    .eq('id', params.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Type-check the new route**

Run: `npx tsc --noEmit`
Expected: Exit code 0 (no new TS errors related to this file).

- [ ] **Step 3: Manually verify the endpoint**

Start the dev server in another shell:

```bash
npm run dev
```

Identify a real `debrief_sessions.id` for your VBrick email by hitting the existing GET endpoint:

```bash
curl -s "http://localhost:3000/api/vbrick/debriefs?email=YOUR_VBRICK_EMAIL&limit=1" | jq '.debriefs[0].id'
```

Smoke-test the three guards. Replace `<id>` with a real row id and `<other>` with an email that owns a different row:

```bash
# 401 — no email
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/vbrick/debriefs/<id>"
# expect: 401

# 403 — wrong owner
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/vbrick/debriefs/<id>?email=<other>"
# expect: 403

# 404 — bogus id
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/vbrick/debriefs/00000000-0000-0000-0000-000000000000?email=YOUR_VBRICK_EMAIL"
# expect: 404
```

Do NOT delete a real row yet; we'll verify the success path through the UI in Task 3.

- [ ] **Step 4: Commit**

```bash
git add app/api/vbrick/debriefs/\[id\]/route.ts
git commit -m "feat(vbrick): add DELETE /api/vbrick/debriefs/[id]"
```

---

## Task 2: Add delete affordance to RecentCalls component

**Files:**
- Modify: `components/vbrick/recent-calls.tsx`

- [ ] **Step 1: Read the current file**

Read `components/vbrick/recent-calls.tsx` end to end so the diff below makes sense in context. The current file (157 lines) renders rows inside `<AnimatePresence mode="popLayout">` and uses the neu theme.

- [ ] **Step 2: Replace the file**

Overwrite `components/vbrick/recent-calls.tsx` with:

```tsx
'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Phone, Trash2 } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { DispositionDot, Badge } from './badge'
import { scoreColorClass } from '@/lib/vbrick/colors'
import { SwipeToDelete } from './swipe-to-delete'
import type { CallDisposition, ProspectStatus } from '@/lib/debrief/types'

export interface RecentCall {
  id: string
  contactName: string
  company: string
  disposition: CallDisposition
  prospectStatus?: ProspectStatus
  spinScore?: number
  timestamp: string
  debriefSessionId?: string
}

function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function statusVariant(status?: ProspectStatus): 'cyan' | 'green' | 'amber' | 'red' | 'gray' {
  if (!status) return 'gray'
  switch (status) {
    case 'active-opportunity': return 'green'
    case 'future-opportunity': return 'cyan'
    case 'needs-more-info': return 'amber'
    case 'not-a-fit': return 'red'
    case 'referred-elsewhere': return 'gray'
    default: return 'gray'
  }
}

function statusLabel(status?: ProspectStatus): string {
  if (!status) return ''
  return status.replace(/-/g, ' ')
}

interface RecentCallsProps {
  calls: RecentCall[]
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void | Promise<void>
}

export function RecentCalls({ calls, onSelect, onDelete }: RecentCallsProps) {
  if (calls.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
        }}
      >
        <Phone className="w-6 h-6 mx-auto mb-2" style={{ color: neuTheme.colors.text.subtle }} />
        <p className="text-sm font-inter" style={{ color: neuTheme.colors.text.muted }}>
          No recent calls
        </p>
        <p className="text-xs font-inter mt-1" style={{ color: neuTheme.colors.text.subtle }}>
          Debriefed calls will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {calls.map((call) => {
          const handleSelect = onSelect
            ? () => onSelect(call.debriefSessionId || call.id)
            : undefined

          const handleDeleteClick = onDelete
            ? (e: React.MouseEvent) => {
                e.stopPropagation()
                if (typeof window !== 'undefined' && !window.confirm('Delete this debrief?')) return
                void onDelete(call.id)
              }
            : undefined

          const row = (
            <motion.div
              role={handleSelect ? 'button' : undefined}
              tabIndex={handleSelect ? 0 : undefined}
              onClick={handleSelect}
              onKeyDown={
                handleSelect
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSelect()
                      }
                    }
                  : undefined
              }
              className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 ${
                handleSelect ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raisedSm,
                touchAction: 'manipulation',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              layout
              whileHover={handleSelect ? { boxShadow: neuTheme.shadows.raised } : undefined}
            >
              <DispositionDot disposition={call.disposition} />

              <div className="flex-1 min-w-0">
                <p
                  className="font-inter font-semibold text-sm truncate"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  {call.contactName}
                </p>
                <p
                  className="text-xs font-inter truncate"
                  style={{ color: neuTheme.colors.text.muted }}
                >
                  {call.company}
                  <span className="sm:hidden ml-2" style={{ color: neuTheme.colors.text.subtle }}>
                    · {formatRelativeTime(call.timestamp)}
                  </span>
                </p>
              </div>

              {call.prospectStatus && (
                <span className="hidden sm:inline-flex">
                  <Badge variant={statusVariant(call.prospectStatus)}>
                    {statusLabel(call.prospectStatus)}
                  </Badge>
                </span>
              )}

              <span
                className={`font-fira-code font-bold text-sm min-w-[32px] text-right ${
                  call.spinScore ? scoreColorClass(call.spinScore) : ''
                }`}
                style={!call.spinScore ? { color: neuTheme.colors.text.subtle } : undefined}
              >
                {call.spinScore ? call.spinScore.toFixed(1) : '—'}
              </span>

              <span
                className="hidden sm:inline text-xs font-fira-code min-w-[50px] text-right"
                style={{ color: neuTheme.colors.text.subtle }}
              >
                {formatRelativeTime(call.timestamp)}
              </span>

              {handleDeleteClick && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  aria-label="Delete debrief"
                  className="hidden sm:inline-flex items-center justify-center w-7 h-7 ml-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  style={{ color: neuTheme.colors.text.subtle }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )

          if (onDelete) {
            return (
              <SwipeToDelete
                key={call.id}
                onDelete={() => onDelete(call.id)}
                radius={12}
              >
                {row}
              </SwipeToDelete>
            )
          }

          return <div key={call.id}>{row}</div>
        })}
      </AnimatePresence>
    </div>
  )
}
```

Key changes vs. the previous file:
- New `onDelete?` prop.
- Added `Trash2` icon import and `SwipeToDelete` import.
- Each row gets the `group` class so the hover-only trash icon can use `group-hover:opacity-100`.
- When `onDelete` is provided, the row is wrapped in `<SwipeToDelete>` (mobile affordance) AND a hover-revealed trash button is rendered inside the row (desktop affordance).
- Confirm dialog (`window.confirm`) guards the desktop trash click only; `SwipeToDelete` already requires an explicit tap on its red Delete action.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: Exit code 0.

- [ ] **Step 4: Lint**

Run: `npm run lint -- --file components/vbrick/recent-calls.tsx`
Expected: No errors on this file. (Existing warnings elsewhere are fine.)

- [ ] **Step 5: Commit**

```bash
git add components/vbrick/recent-calls.tsx
git commit -m "feat(vbrick): add onDelete affordance to RecentCalls (swipe + hover trash)"
```

---

## Task 3: Wire delete handler in the VBrick dashboard page

**Files:**
- Modify: `app/vbrick/dashboard/page.tsx`

- [ ] **Step 1: Add the delete handler**

In `app/vbrick/dashboard/page.tsx`, locate the `handleSelectDebrief` function (around line 137) and insert a new handler immediately after it:

```tsx
  async function handleDeleteRecentCall(id: string) {
    // Optimistic remove
    setRecentCalls(prev => prev.filter(c => c.id !== id))
    setStoredOutputs(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    // If we were viewing this debrief, drop back to the dashboard
    if (viewingSessionId === id) {
      setViewingSessionId(null)
      setView('dashboard')
    }

    try {
      const url = `/api/vbrick/debriefs/${id}?email=${encodeURIComponent(email)}`
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) {
        // Reconcile with server state
        await fetchRecentDebriefs()
      }
    } catch {
      await fetchRecentDebriefs()
    }
  }
```

- [ ] **Step 2: Pass the handler to RecentCalls**

Locate the `<RecentCalls calls={recentCalls} onSelect={handleSelectDebrief} />` JSX (around line 405) and replace it with:

```tsx
<RecentCalls
  calls={recentCalls}
  onSelect={handleSelectDebrief}
  onDelete={handleDeleteRecentCall}
/>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: Exit code 0.

- [ ] **Step 4: Manual UI verification**

With `npm run dev` running:

1. Open `http://localhost:3000/vbrick/dashboard` in a desktop browser, sign in with your VBrick email if prompted.
2. Scroll to the "Recent Debriefs" section.
3. Hover over a row that you want to keep — confirm a trash icon fades in at the right edge.
4. Click the trash icon, confirm the browser prompt — the row should disappear immediately and stay gone on refresh.
5. Open DevTools → Network → confirm `DELETE /api/vbrick/debriefs/<id>?email=...` returned 200.
6. Open the same URL on a mobile device (or DevTools mobile emulator). Swipe a row left — a red Delete button should reveal. Tap it. Row should disappear and stay gone on refresh.
7. Cancel-flow check: hover a row, click trash, hit Cancel on the confirm dialog — row should remain.

If any step fails, fix before committing.

- [ ] **Step 5: Commit**

```bash
git add app/vbrick/dashboard/page.tsx
git commit -m "feat(vbrick): wire delete handler for recent debriefs on dashboard"
```

---

## Task 4: Hide empty story drafts from "Continue Drafting"

**Files:**
- Modify: `app/vbrick/dashboard/stories/page.tsx`

- [ ] **Step 1: Add the `hasStarted` helper**

Open `app/vbrick/dashboard/stories/page.tsx`. Add this helper at the top level of the module (above the `export default function` declaration — typically just below the imports). Adjust placement to match the file's existing style:

```ts
function hasStarted(draft: StoryDraft): boolean {
  if (draft.draft_content && draft.draft_content.trim().length > 0) return true
  if (Array.isArray(draft.ai_conversation) && draft.ai_conversation.length > 0) return true
  if (draft.framework_metadata && Object.keys(draft.framework_metadata).length > 0) return true
  return false
}
```

`StoryDraft` is already imported from `@/lib/vbrick/story-types` so no new imports are needed.

- [ ] **Step 2: Gate the "Continue Drafting" section on it**

Find the block starting at line 386:

```tsx
{drafts.some(d => d.status === 'draft') && (
```

Replace with:

```tsx
{drafts.some(d => d.status === 'draft' && hasStarted(d)) && (
```

Then find the line at 392:

```tsx
{drafts.filter(d => d.status === 'draft').slice(0, 5).map((draft) => (
```

Replace with:

```tsx
{drafts.filter(d => d.status === 'draft' && hasStarted(d)).slice(0, 5).map((draft) => (
```

Do NOT change the `drafts.filter(d => d.status === 'practicing')` line at 426 — that's the "Ready to Practice" list, which is unaffected.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: Exit code 0.

- [ ] **Step 4: Manual UI verification**

With `npm run dev` running:

1. Open `http://localhost:3000/vbrick/dashboard/stories`.
2. Click a framework tile to start a brand-new draft.
3. Immediately hit the back arrow / navigate away without typing anything — this creates a draft row with empty `ai_conversation`, empty `framework_metadata`, empty `draft_content`.
4. Return to the Stories tab → "Create" tab. Confirm the empty draft does NOT appear under "Continue Drafting".
5. Click a framework tile again, answer the first wizard question, then back out. Return to the Create tab — this in-progress draft SHOULD appear (either because `framework_metadata` got a key or because the AI replied into `ai_conversation`).
6. Confirm the "Ready to Practice" list (Vault tab) is unchanged — drafts with `status = 'practicing'` still appear.

- [ ] **Step 5: Commit**

```bash
git add app/vbrick/dashboard/stories/page.tsx
git commit -m "fix(vbrick): hide never-started story drafts from Continue Drafting"
```

---

## Task 5: Trigger bot greeting on practice-call connection

**Files:**
- Modify: `components/vbrick/realtime-sparring-session.tsx`

- [ ] **Step 1: Add the `hasGreeted` ref and helper, and fire it on connect**

In `components/vbrick/realtime-sparring-session.tsx`:

(a) Near the other refs (around lines 57–63), add a new ref:

```tsx
const hasGreetedRef = useRef(false)
```

(b) Above the `useEffect` that starts the call (around line 67), add the helper function:

```tsx
function triggerGreeting(personaFirstName: string) {
  const dc = dcRef.current
  if (!dc) return
  if (hasGreetedRef.current) return

  const send = () => {
    if (hasGreetedRef.current) return
    if (!dc || dc.readyState !== 'open') return
    hasGreetedRef.current = true
    try {
      dc.send(
        JSON.stringify({
          type: 'response.create',
          response: {
            instructions:
              "The phone just rang and you're picking up now. Open with a short, natural pickup greeting — vary it: 'Hello?' / 'Yeah?' / 'This is " +
              personaFirstName +
              ".' / 'Hey?'. ONE short utterance only. Do not start the conversation, do not introduce VBrick — just answer the phone.",
          },
        }),
      )
    } catch (err) {
      console.error('Failed to send greeting trigger:', err)
    }
  }

  if (dc.readyState === 'open') {
    send()
  } else {
    const previousOpen = dc.onopen
    dc.onopen = (ev) => {
      try {
        previousOpen?.call(dc, ev)
      } catch {}
      send()
    }
  }
}
```

The function is module-internal (defined inside the component) so it captures `dcRef` and `hasGreetedRef` from closure.

Actually — `triggerGreeting` references `dcRef` and `hasGreetedRef`, both of which exist on the component instance. Define it **inside** the `RealtimeSparringSession` function body (just above the `useEffect`) so those refs are in scope.

(c) Fire the greeting after `setPhase('in-call')`. Replace line 128:

```tsx
        if (!cancelled) setPhase('in-call')
```

with:

```tsx
        if (!cancelled) {
          setPhase('in-call')
          const firstName = (sessionData.personaName || 'Prospect').split(' ')[0]
          triggerGreeting(firstName)
        }
```

(d) Reset the guard on teardown so a fresh session in the same component lifecycle (rare, but possible if the parent remounts) re-greets. In the `teardown()` function (around line 188), add at the end:

```tsx
    hasGreetedRef.current = false
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: Exit code 0.

- [ ] **Step 3: Lint**

Run: `npm run lint -- --file components/vbrick/realtime-sparring-session.tsx`
Expected: No new errors.

- [ ] **Step 4: Manual practice-call verification**

With `npm run dev` running:

1. Open `http://localhost:3000/vbrick/dashboard/sparring`.
2. Pick any persona + scenario and start a practice call. Grant mic permission.
3. As soon as the "Connecting…" status flips to "Listening…" / "<Persona> is speaking", you should hear the persona say a short greeting ("Hello?", "Yeah?", "This is <name>.") within 1–2 seconds. You should NOT have to speak first.
4. After the greeting lands, deliver the standard "<Persona name>?" line. The call should continue per the existing Step 2 → Step 5 flow.
5. End the call. Verify scoring still works (no scoring regressions).
6. Open DevTools → Console. Confirm there are no errors related to `response.create` or the data channel.
7. Repeat once with a different persona to confirm the greeting still fires.

If the greeting does NOT fire on a fresh call, check the Network/Console for `response.create` errors and verify `dc.readyState` at fire time.

- [ ] **Step 5: Commit**

```bash
git add components/vbrick/realtime-sparring-session.tsx
git commit -m "fix(vbrick): realtime sparring bot greets first on pickup"
```

---

## Post-implementation

- [ ] **Final sanity sweep**

Run `npx tsc --noEmit` once more from a clean state to make sure nothing regressed across the five commits.

- [ ] **Update SESSION_LOG.md**

Append a one-line entry to `docs/SESSION_LOG.md` under today's date:

```markdown
- 2026-05-12 — vbrick: delete recent debriefs, hide empty story drafts, realtime bot greets on pickup
```

- [ ] **Commit the log**

```bash
git add docs/SESSION_LOG.md
git commit -m "docs(vbrick): log delete-debriefs + draft filter + bot greeting changes"
```

---

## Self-review notes

- Spec coverage: Change 1 → Tasks 1–3. Change 2 → Task 4. Change 3 → Task 5. All "Acceptance" bullets in the spec map to manual-verification steps in their respective tasks.
- No placeholders in code blocks; all code is concrete.
- Type names referenced (`StoryDraft`, `RecentCall`, `CallDisposition`, `ProspectStatus`) match the existing imports in those files.
- The `RecentCalls` component signature change is backward-compatible — `onDelete` is optional, so any other caller (none today) keeps working.
- VBrick uses localStorage identity, so the DELETE route accepts `?email=` and gates on `isVbrickUser()` — same pattern as `app/api/vbrick/stories/vault/[id]/route.ts`.
- No test runner exists; verification is manual per `CLAUDE.md`.
