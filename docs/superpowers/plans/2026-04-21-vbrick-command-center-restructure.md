# VBrick Command Center Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trim `vbrick.streetnotes.ai` from a call-execution surface (call list + live coaching + debrief) into a strictly BDR development/practice hub (debrief + Sparring · Stories · Campaigns · Playbook).

**Architecture:** Pure restructure — no new data model, no new dependencies. Delete call-queue and live-coaching subsystems (components, hooks, API routes); edit sidebar (drop Intel + coaching/queue props); rewrite dashboard landing to render IntentionScreen → welcome header → quick-start tiles → Debrief flow → PerformanceCards → Recent Debriefs → Leaderboard; clean settings page history view; add one new component (`quick-start-tiles.tsx`).

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, Framer Motion (`motion/react`), Lucide icons, existing `NeuCard`/`neuTheme` primitives from `components/vbrick/neu` and `lib/vbrick/theme`. No test runner in this project — verification is `npm run build` + manual smoke.

**Spec:** `docs/superpowers/specs/2026-04-21-vbrick-command-center-restructure-design.md`

---

## Task 1: Pre-flight verification

Confirm nothing new has snuck into the routes before we delete. Blast-radius check.

**Files:** read-only

- [ ] **Step 1: Grep for any caller of the at-risk API routes**

Run:
```bash
grep -rn "/api/vbrick/queue\|/api/vbrick/session\|/api/vbrick/coaching/\|/api/vbrick/export/" --include="*.tsx" --include="*.ts" app components hooks lib 2>/dev/null | grep -v "route.ts"
```

Expected output — only these callers:
```
app/vbrick/dashboard/settings/page.tsx       → /api/vbrick/session?history=true, /api/vbrick/export/csv, /api/vbrick/export/pdf
app/vbrick/dashboard/page.tsx                → /api/vbrick/session, /api/vbrick/queue (the file we're rewriting)
components/vbrick/coaching/coaching-panel.tsx → /api/vbrick/coaching/session, /api/vbrick/coaching/classify (file being deleted)
components/vbrick/session-report.tsx         → /api/vbrick/export/csv, /api/vbrick/export/pdf (file being deleted)
hooks/use-streaming-stt.ts                   → /api/vbrick/coaching/token (file being deleted)
```

If any *other* caller appears (e.g., a CRON, a different tenant, a test fixture), STOP and flag to the user before proceeding.

- [ ] **Step 2: Grep for any caller of the hook/client we're deleting**

Run:
```bash
grep -rn "useStreamingSTT\|use-streaming-stt\|lib/deepgram/client" --include="*.tsx" --include="*.ts" app components hooks lib 2>/dev/null
```

Expected: only `hooks/use-streaming-stt.ts`, `components/vbrick/coaching/coaching-panel.tsx`, `lib/deepgram/client.ts` (self-references).

If anything else shows, STOP.

- [ ] **Step 3: Commit no change — this task is verification only**

No commit. Proceed to Task 2.

---

## Task 2: Delete live-coaching subsystem

Remove the live-coaching components, hook, deepgram client, and API routes. Nothing else calls these after the dashboard rewrite.

**Files:**
- Delete: `components/vbrick/coaching/coaching-panel.tsx`
- Delete: `hooks/use-streaming-stt.ts`
- Delete: `lib/deepgram/client.ts`
- Delete: `app/api/vbrick/coaching/token/route.ts`
- Delete: `app/api/vbrick/coaching/classify/route.ts`
- Delete: `app/api/vbrick/coaching/session/route.ts`

**Keep:** `components/vbrick/coaching/post-call-summary.tsx` — it's post-debrief analysis, not live.

- [ ] **Step 1: Delete coaching-panel component**

Run:
```bash
rm components/vbrick/coaching/coaching-panel.tsx
```

- [ ] **Step 2: Delete streaming-stt hook and deepgram client**

Run:
```bash
rm hooks/use-streaming-stt.ts
rm lib/deepgram/client.ts
```

If `lib/deepgram/` becomes empty, remove the directory:
```bash
[ -z "$(ls -A lib/deepgram 2>/dev/null)" ] && rmdir lib/deepgram
```

- [ ] **Step 3: Delete coaching API routes**

Run:
```bash
rm -r app/api/vbrick/coaching
```

- [ ] **Step 4: Verify the build still compiles the remaining parts that reference coaching (it will still break because `post-call-summary.tsx` stays and dashboard/sidebar still import `CoachingPanel` / `CoachingSummary`; that's expected — we fix in later tasks). Just confirm file removal:**

Run:
```bash
ls components/vbrick/coaching/
ls app/api/vbrick/coaching/ 2>&1 | head -1
```

Expected: `post-call-summary.tsx` alone, and "No such file or directory" for the API dir.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(vbrick): remove live-coaching subsystem

Deletes coaching-panel, streaming-stt hook, deepgram client, and
/api/vbrick/coaching/* routes. Live coaching is being removed from
the command center per the 2026-04-21 restructure spec. The
post-call-summary component remains — it is post-debrief analysis,
not live coaching."
```

---

## Task 3: Delete call-queue subsystem

Remove queue UI, session-report, csv-import-zone, calling-session + queue + export API routes.

**Files:**
- Delete: `components/vbrick/call-queue.tsx`
- Delete: `components/vbrick/session-report.tsx`
- Delete: `components/vbrick/csv-import-zone.tsx`
- Delete: `app/api/vbrick/queue/route.ts`
- Delete: `app/api/vbrick/session/route.ts`
- Delete: `app/api/vbrick/export/csv/route.ts`
- Delete: `app/api/vbrick/export/pdf/route.ts`

**Database:** do **not** drop tables. Leave `vbrick_calling_sessions`, `vbrick_queue_items`, `vbrick_coaching_sessions` in place per spec.

- [ ] **Step 1: Delete queue/session/csv components**

Run:
```bash
rm components/vbrick/call-queue.tsx
rm components/vbrick/session-report.tsx
rm components/vbrick/csv-import-zone.tsx
```

- [ ] **Step 2: Delete queue + session API routes**

Run:
```bash
rm -r app/api/vbrick/queue
rm -r app/api/vbrick/session
```

- [ ] **Step 3: Delete export API routes**

Run:
```bash
rm -r app/api/vbrick/export
```

- [ ] **Step 4: Verify removal**

Run:
```bash
ls app/api/vbrick/
```

Expected output (alphabetical, no `queue` / `session` / `export`):
```
campaigns
coaching    # may be absent if task 2 already deleted it
framework-spar
intentions
spar
stats
stories
```

Note: `coaching` directory was deleted in Task 2. `stats`, `campaigns`, `intentions`, `spar`, `framework-spar`, `stories` stay.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(vbrick): remove call-queue subsystem

Deletes call-queue, session-report, csv-import-zone components and
/api/vbrick/queue, /api/vbrick/session, /api/vbrick/export/* routes.
BDRs no longer load call lists in the command center per the
2026-04-21 restructure spec.

Database tables (vbrick_calling_sessions, vbrick_queue_items) are
intentionally left in place — non-destructive, preserves history."
```

---

## Task 4: Create QuickStartTiles component

New component for the dashboard landing. 4-tile grid linking to the practice surfaces. Order: Sparring · Stories · Campaigns · Playbook (Sparring first, it's the featured surface).

**Files:**
- Create: `components/vbrick/quick-start-tiles.tsx`

- [ ] **Step 1: Create the component file**

Create `components/vbrick/quick-start-tiles.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Dumbbell, BookOpen, Megaphone, ScrollText, type LucideIcon } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

interface Tile {
  label: string
  descriptor: string
  href: string
  icon: LucideIcon
}

const TILES: Tile[] = [
  { label: 'Sparring', descriptor: 'Train against AI personas', href: '/vbrick/dashboard/sparring', icon: Dumbbell },
  { label: 'Stories',  descriptor: 'Draft and practice pitches', href: '/vbrick/dashboard/stories',  icon: BookOpen },
  { label: 'Campaigns',descriptor: 'Study outbound plays',      href: '/vbrick/dashboard/campaigns', icon: Megaphone },
  { label: 'Playbook', descriptor: 'Framework and references',  href: '/vbrick/dashboard/playbook',  icon: ScrollText },
]

export function QuickStartTiles() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {TILES.map((tile, i) => {
        const Icon = tile.icon
        return (
          <motion.div
            key={tile.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i }}
          >
            <Link
              href={tile.href}
              className="block no-underline"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raised,
                borderRadius: neuTheme.radii.lg,
                padding: '20px',
                transition: neuTheme.transitions.default,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: neuTheme.radii.sm,
                    background: neuTheme.colors.accent.primary,
                    boxShadow: neuTheme.shadows.raisedSm,
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="font-general-sans font-semibold text-base tracking-tight"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  {tile.label}
                </h3>
              </div>
              <p
                className="text-xs font-satoshi"
                style={{ color: neuTheme.colors.text.muted }}
              >
                {tile.descriptor}
              </p>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Sanity-check it compiles in isolation**

Run:
```bash
npx tsc --noEmit components/vbrick/quick-start-tiles.tsx 2>&1 | head -20
```

Expected: no errors specific to this file. (Stale errors from unfinished task 3/5 state are ok — we're only checking *this* file's syntax.)

- [ ] **Step 3: Commit**

```bash
git add components/vbrick/quick-start-tiles.tsx
git commit -m "feat(vbrick): add QuickStartTiles component

4-tile grid for the command-center landing page linking to the
practice surfaces: Sparring, Stories, Campaigns, Playbook. Sparring
first per the 2026-04-21 restructure spec."
```

---

## Task 5: Prune the sidebar

Remove Intel nav item, live-coaching props/buttons, queueContact block, CoachingCompactIndicator sub-component. Keep player card, nav (now 5 items), sticky mic, paste-transcript button, settings.

**Files:**
- Modify: `components/vbrick/sidebar.tsx`

- [ ] **Step 1: Replace the imports block**

Current top (lines 1-13):
```tsx
'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Settings, ClipboardPaste, Zap, LayoutDashboard, BookOpen, Radar, Radio, PhoneOff, Megaphone, ScrollText, Dumbbell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PlayerCard } from './player-card'
import { MicButton } from './mic-button'
import type { CoachingSummary } from './coaching/coaching-panel'
import { NeuButton } from '@/components/vbrick/neu'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'
import { neuTheme } from '@/lib/vbrick/theme'
```

Replace with:
```tsx
'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Settings, ClipboardPaste, Zap, LayoutDashboard, BookOpen, Megaphone, ScrollText, Dumbbell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PlayerCard } from './player-card'
import { MicButton } from './mic-button'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'
import { neuTheme } from '@/lib/vbrick/theme'
```

Removed: `Radar` (Intel icon), `Radio` (Start Live Coaching), `PhoneOff` (coaching indicator), `useState`/`useEffect` (only used by `CoachingCompactIndicator`), `CoachingSummary` type, `NeuButton` (only used by `CoachingCompactIndicator`).

- [ ] **Step 2: Remove the Intel nav item**

Current `navItems` array (line ~15):
```tsx
const navItems = [
  { label: 'Dashboard', href: '/vbrick/dashboard', icon: LayoutDashboard },
  { label: 'Stories', href: '/vbrick/dashboard/stories', icon: BookOpen },
  { label: 'Campaigns', href: '/vbrick/dashboard/campaigns', icon: Megaphone },
  { label: 'Intel', href: '/vbrick/dashboard/ci', icon: Radar },
  { label: 'Playbook', href: '/vbrick/dashboard/playbook', icon: ScrollText },
  { label: 'Sparring', href: '/vbrick/dashboard/sparring', icon: Dumbbell },
]
```

Replace with:
```tsx
const navItems = [
  { label: 'Dashboard', href: '/vbrick/dashboard', icon: LayoutDashboard },
  { label: 'Stories', href: '/vbrick/dashboard/stories', icon: BookOpen },
  { label: 'Campaigns', href: '/vbrick/dashboard/campaigns', icon: Megaphone },
  { label: 'Playbook', href: '/vbrick/dashboard/playbook', icon: ScrollText },
  { label: 'Sparring', href: '/vbrick/dashboard/sparring', icon: Dumbbell },
]
```

- [ ] **Step 3: Trim the `SidebarProps` interface**

Current interface (lines ~24-49) has: `name`, `email`, `role`, `showStats`, `streak`, `todayCalls`, `spinAvg`, `isRecording`, `durationSec`, `onMicStart`, `onMicStop`, `onSettingsClick`, `onPasteTranscript`, `micDisabled`, `queueContact`, `coachingPromptIndex`, `isCoaching`, `onStartCoaching`, `onEndCoaching`, `callingSessionId`.

Replace the `SidebarProps` interface with:

```tsx
interface SidebarProps {
  name: string
  email: string
  role?: string
  showStats?: boolean
  streak: number
  todayCalls: number
  spinAvg: number
  isRecording: boolean
  durationSec: number
  onMicStart: () => void
  onMicStop: () => void
  onSettingsClick: () => void
  onPasteTranscript: () => void
  micDisabled?: boolean
}
```

Removed: `queueContact`, `coachingPromptIndex`, `isCoaching`, `onStartCoaching`, `onEndCoaching`, `callingSessionId`.

- [ ] **Step 4: Trim the `Sidebar` function signature**

Current destructuring (lines ~51-74) pulls all the props including coaching/queue ones. Replace the destructuring block with:

```tsx
export function Sidebar({
  name,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  email,
  role = 'BDR — Vbrick',
  showStats = true,
  streak,
  todayCalls,
  spinAvg,
  isRecording,
  durationSec,
  onMicStart,
  onMicStop,
  onSettingsClick,
  onPasteTranscript,
  micDisabled = false,
}: SidebarProps) {
  const pathname = usePathname()
```

- [ ] **Step 5: Remove the queueContact "Debriefing" block**

Delete the `AnimatePresence` block that renders "Debriefing [contact name]" during recording (currently lines ~155-178, starts with `{/* Queue contact info during recording */}` and ends with its closing `</AnimatePresence>`).

- [ ] **Step 6: Remove the coaching prompts animation inside MicButton wrapper**

Current block (lines ~191-207):
```tsx
{/* Coaching prompts during recording */}
<AnimatePresence mode="wait">
  {isRecording && (
    <motion.div
      key={coachingPromptIndex}
      className="mt-6 mx-5 px-4 py-3"
      style={{ borderRadius: neuTheme.radii.sm, boxShadow: neuTheme.shadows.inset, maxWidth: 240 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-xs font-satoshi text-center italic" style={{ color: neuTheme.colors.text.muted }}>
        {VBRICK_CONFIG.coachingPrompts[coachingPromptIndex % VBRICK_CONFIG.coachingPrompts.length]}
      </p>
    </motion.div>
  )}
</AnimatePresence>
```

Delete the entire block.

- [ ] **Step 7: Remove the "Start Live Coaching" button**

Current block (lines ~221-231):
```tsx
{/* Start Live Coaching button */}
{!isRecording && !isCoaching && onStartCoaching && (
  <button
    onClick={onStartCoaching}
    ...
  >
    <Radio className="w-4 h-4" />
    Start Live Coaching
  </button>
)}
```

Delete the entire block.

- [ ] **Step 8: Remove the `isCoaching` simplified-paste-button gate**

Current (line ~210):
```tsx
{!isRecording && !isCoaching && (
  <button onClick={onPasteTranscript} ...>
```

Replace `!isRecording && !isCoaching` with `!isRecording`:

```tsx
{!isRecording && (
  <button onClick={onPasteTranscript} ...>
```

- [ ] **Step 9: Remove the `CoachingCompactIndicator` render and `{!isCoaching && <div ...>}` fallback**

Current (lines ~234-239):
```tsx
{/* Live Coaching compact indicator */}
{isCoaching && onEndCoaching && (
  <CoachingCompactIndicator onEndCoaching={onEndCoaching} />
)}

{!isCoaching && <div className="flex-1" />}
```

Replace with:
```tsx
<div className="flex-1" />
```

- [ ] **Step 10: Delete the `CoachingCompactIndicator` sub-component**

Delete the entire function definition starting at `function CoachingCompactIndicator({ onEndCoaching }: ...)` through its closing brace (currently lines ~263-305).

- [ ] **Step 11: Verify the sidebar compiles**

Run:
```bash
npx tsc --noEmit 2>&1 | grep "sidebar.tsx" | head -20
```

Expected: no errors for `sidebar.tsx`. If `CoachingSummary` or `Radar`/`Radio`/`PhoneOff`/`NeuButton` show as unused, re-check steps 1 and 10.

(Errors in `app/vbrick/dashboard/page.tsx` about removed props passed to `<Sidebar>` are expected — fixed in Task 6.)

- [ ] **Step 12: Commit**

```bash
git add components/vbrick/sidebar.tsx
git commit -m "refactor(vbrick): prune sidebar of intel, queue, and live-coaching

Drops Intel nav item, queueContact block, live-coaching props +
buttons, and the CoachingCompactIndicator sub-component. Sidebar
keeps player card, five-item nav, sticky mic, paste-transcript
button, and settings."
```

---

## Task 6: Rewrite the dashboard page

Rewrite `app/vbrick/dashboard/page.tsx` to match the new spec: IntentionScreen gate → welcome header → QuickStartTiles → Debrief flow → Performance → Recent Debriefs → Leaderboard. Drop all queue/coaching state. Keep email gate, mic handling, debrief complete handler, paste transcript view.

**Files:**
- Modify: `app/vbrick/dashboard/page.tsx` (currently 640 lines; new file ~280 lines)

This is a full rewrite because the removals touch nearly every function and every JSX block. Shorter to rewrite than to edit piecewise.

- [ ] **Step 1: Replace the entire file content**

Overwrite `app/vbrick/dashboard/page.tsx` with:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Sidebar } from '@/components/vbrick/sidebar'
import { IntentionScreen } from '@/components/vbrick/intention-screen'
import { Leaderboard } from '@/components/vbrick/leaderboard'
import { PerformanceCards } from '@/components/vbrick/performance-cards'
import { RecentCalls, type RecentCall } from '@/components/vbrick/recent-calls'
import { DashboardDebriefFlow } from '@/components/vbrick/dashboard-debrief-flow'
import { TranscriptInput } from '@/components/vbrick/transcript-input'
import { QuickStartTiles } from '@/components/vbrick/quick-start-tiles'
import type { DebriefOutput, CallDisposition, ProspectStatus } from '@/lib/debrief/types'
import { isBDROutput, isVbrickBDROutput } from '@/lib/debrief/types'
import { isVbrickBdr, VBRICK_CONFIG } from '@/lib/vbrick/config'
import { neuTheme } from '@/lib/vbrick/theme'

interface StatsData {
  thisWeek: {
    totalCalls: number
    connectedCalls: number
    appointmentsBooked: number
    callToConversationRate: number
    conversationToAppointmentRate: number
    averageSpin: number
    bestSpin: number
    bestSpinContact: string
  }
  lastWeek: {
    totalCalls: number
    connectedCalls: number
    appointmentsBooked: number
    callToConversationRate: number
    conversationToAppointmentRate: number
    averageSpin: number
    bestSpin: number
  }
  personalBests: {
    bestSpin: number
    bestConvRate: number
    bestApptRate: number
  }
  streak: number
  todayCalls: number
  allBdrs: Array<{
    email: string
    name: string
    callToConversationRate: number
    conversationToAppointmentRate: number
    averageSpin: number
    convTrend: number
    apptTrend: number
    spinTrend: number
  }>
}

type DashboardView = 'dashboard' | 'debrief' | 'transcript'

export default function VbrickDashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [showIntention, setShowIntention] = useState(false)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [view, setView] = useState<DashboardView>('dashboard')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [pastedTranscript, setPastedTranscript] = useState<string | null>(null)
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmail(stored)
  }, [])

  useEffect(() => {
    if (!email) return
    const today = new Date().toISOString().split('T')[0]
    const intentionKey = `vbrick_intention_${today}`
    if (!localStorage.getItem(intentionKey)) setShowIntention(true)
    fetchStats()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  useEffect(() => {
    if (!isRecording) return
    setRecordingDuration(0)
    const timer = window.setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isRecording])

  async function fetchStats() {
    if (!email) return
    try {
      const res = await fetch(`/api/vbrick/stats?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok) setStats(data)
    } catch {}
  }

  function handleIntentionComplete() {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`vbrick_intention_${today}`, '1')
    setShowIntention(false)
  }

  function handleMicStart() {
    setView('debrief')
    setIsRecording(true)
  }

  function handleMicStop() {
    setIsRecording(false)
  }

  const handleDebriefComplete = useCallback(async (debriefSessionId: string, output: DebriefOutput) => {
    if (email) {
      await fetch('/api/vbrick/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    }
    if (isBDROutput(output)) {
      const spinScore = isVbrickBDROutput(output) ? output.spin.composite : undefined
      const newCall: RecentCall = {
        id: debriefSessionId,
        contactName: output.contactSnapshot.name || 'Unknown',
        company: output.contactSnapshot.company || 'Unknown',
        disposition: output.callDisposition as CallDisposition,
        prospectStatus: output.prospectStatus as ProspectStatus,
        spinScore,
        timestamp: new Date().toISOString(),
        debriefSessionId,
      }
      setRecentCalls(prev => [newCall, ...prev].slice(0, 10))
    }
    await fetchStats()
    setView('dashboard')
    setIsRecording(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = emailInput.trim().toLowerCase()
    if (!clean) return
    localStorage.setItem('vbrick_email', clean)
    setEmail(clean)
  }

  if (!email) {
    return (
      <div style={{ background: '#e0e5ec', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          className="font-satoshi"
          style={{
            background: '#e0e5ec',
            boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
            borderRadius: '28px',
            padding: '32px',
            width: '100%',
            maxWidth: '384px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ background: '#6366f1', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width={16} height={16} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-general-sans), sans-serif', fontWeight: 700, fontSize: 18, color: '#2d3436', letterSpacing: '-0.01em' }}>
              Command Center
            </span>
          </div>
          <p style={{ fontSize: 12, textAlign: 'center', marginBottom: 32, color: '#636e72', fontFamily: 'var(--font-satoshi), sans-serif' }}>
            Powered by StreetNotes.ai
          </p>
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                background: '#e0e5ec',
                boxShadow: 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
                color: '#44475a',
                border: 'none',
                borderRadius: 16,
                padding: '14px 20px',
                fontSize: 14,
                fontFamily: 'var(--font-satoshi), sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 16,
                fontFamily: 'var(--font-general-sans), sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                color: 'white',
                background: '#6366f1',
                boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
                border: 'none',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (showIntention) {
    return <IntentionScreen email={email} onComplete={handleIntentionComplete} />
  }

  const localPart = email.split('@')[0]
  const firstName = localPart.split('.')[0]
  const fallbackName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  const displayName = VBRICK_CONFIG.bdrDisplayNames[email] || fallbackName
  const userIsBdr = isVbrickBdr(email)

  return (
    <div className="h-screen overflow-hidden font-satoshi" style={{ background: '#e0e5ec' }}>
      <Sidebar
        name={displayName}
        email={email}
        role={userIsBdr ? 'BDR — Vbrick' : 'Coach — Vbrick'}
        showStats={userIsBdr}
        streak={stats?.streak || 0}
        todayCalls={stats?.todayCalls || 0}
        spinAvg={stats?.thisWeek.averageSpin || 0}
        isRecording={isRecording}
        durationSec={recordingDuration}
        onMicStart={handleMicStart}
        onMicStop={handleMicStop}
        onSettingsClick={() => router.push('/vbrick/dashboard/settings')}
        onPasteTranscript={() => setView('transcript')}
        micDisabled={view === 'debrief' && !isRecording}
      />

      <div className="ml-[288px] h-screen overflow-y-auto relative" style={{ background: '#e0e5ec' }}>
        {isRecording && (
          <div className="fixed inset-0 ml-[288px] bg-black/10 z-20 pointer-events-none" />
        )}

        <div className="px-8 py-8 space-y-8 relative z-10">
          {view === 'debrief' && !pastedTranscript && (
            <DashboardDebriefFlow
              email={email}
              queueContact={null}
              onComplete={handleDebriefComplete}
              onCancel={() => { setView('dashboard'); setIsRecording(false) }}
              isRecording={isRecording}
              onRecordingStart={() => setIsRecording(true)}
            />
          )}

          {view === 'transcript' && (
            <TranscriptInput
              onSubmit={(text) => {
                setPastedTranscript(text)
                setView('debrief')
              }}
              onCancel={() => setView('dashboard')}
            />
          )}

          {view === 'debrief' && pastedTranscript && (
            <DashboardDebriefFlow
              email={email}
              queueContact={null}
              onComplete={(sid, output) => {
                setPastedTranscript(null)
                handleDebriefComplete(sid, output)
              }}
              onCancel={() => { setView('dashboard'); setPastedTranscript(null) }}
              isRecording={false}
              onRecordingStart={() => {}}
              pastedTranscript={pastedTranscript}
            />
          )}

          {view === 'dashboard' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <h1
                  className="font-general-sans font-bold text-2xl tracking-tight"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  Welcome back, {displayName}
                </h1>
                {stats && (
                  <p
                    className="text-sm font-satoshi mt-1"
                    style={{ color: neuTheme.colors.text.muted }}
                  >
                    {stats.streak}-day streak
                  </p>
                )}
              </motion.div>

              <QuickStartTiles />

              {stats && userIsBdr && (
                <PerformanceCards
                  playerName={displayName}
                  spinAvg={stats.thisWeek.averageSpin}
                  bestSpin={stats.thisWeek.bestSpin}
                  personalBestSpin={stats.personalBests.bestSpin}
                  ghostSpinAvg={stats.lastWeek.averageSpin}
                  ghostBestSpin={stats.lastWeek.bestSpin}
                  convRate={stats.thisWeek.callToConversationRate}
                  apptRate={stats.thisWeek.conversationToAppointmentRate}
                  ghostConvRate={stats.lastWeek.callToConversationRate}
                  ghostApptRate={stats.lastWeek.conversationToAppointmentRate}
                  connectedCalls={stats.thisWeek.connectedCalls}
                  totalCalls={stats.thisWeek.totalCalls}
                  appointments={stats.thisWeek.appointmentsBooked}
                  scoredCalls={stats.thisWeek.totalCalls}
                />
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium mb-3" style={{ color: '#6366f1' }}>
                  Recent Debriefs
                </h3>
                <RecentCalls calls={recentCalls} />
              </motion.div>

              {stats && stats.allBdrs.length >= 2 && (
                <Leaderboard
                  players={stats.allBdrs.map(b => ({
                    name: b.name,
                    convRate: b.callToConversationRate,
                    apptRate: b.conversationToAppointmentRate,
                    spinAvg: b.averageSpin,
                    convTrend: b.convTrend,
                    apptTrend: b.apptTrend,
                    spinTrend: b.spinTrend,
                  }))}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

Note — removed from the previous version:
- `CallQueue`, `CoachingPanel`, `SessionReport`, `PostCallSummary` imports
- queue / sessionId / coaching / report / timerRef / sessionStartRef state
- `fetchActiveSession`, `fetchRecentCalls` (dead — was already a no-op), `handleSkipQueueItem`, `handleJumpTo`, `handleEndSession`, `handleCloseReport`, `formatSessionDuration`
- Coaching-prompt rotation timer inside the recording `useEffect`
- CallQueue, CoachingPanel overlay, SessionReport, PostCallSummary JSX
- `queueContact` prop wiring (now passed as `null` to DashboardDebriefFlow)
- Sidebar's coaching / queueContact prop pass-through

Added:
- `QuickStartTiles` import + render
- `Welcome back, {displayName}` + streak header block
- `neuTheme` import for the welcome header

Intentionally kept `PostCallSummary` out of the new render tree — it was only triggered from the live-coaching end-flow, which no longer exists. The file itself stays on disk (see spec).

- [ ] **Step 2: Verify typecheck**

Run:
```bash
npx tsc --noEmit 2>&1 | grep -E "app/vbrick/dashboard/page.tsx|components/vbrick/sidebar.tsx" | head -30
```

Expected: no errors. If `queueContact` is still flagged as a required prop on `DashboardDebriefFlow`, check that component's signature — it should already accept `null`.

- [ ] **Step 3: Commit**

```bash
git add app/vbrick/dashboard/page.tsx
git commit -m "refactor(vbrick): rewrite dashboard page for practice hub

Replaces call-queue + live-coaching dashboard with:
  - IntentionScreen gate (kept)
  - Welcome header with streak
  - 4-tile quick-start grid (Sparring, Stories, Campaigns, Playbook)
  - Debrief flow (kept inline — BDRs still debrief here)
  - Performance cards (kept)
  - Recent Debriefs (relabeled from Recent Calls)
  - Leaderboard (kept)

Drops queue/coaching/report state and JSX. Full rewrite was simpler
than a piecewise edit given the scope of removals."
```

---

## Task 7: Clean the settings page history view

Remove the "Sessions history" block and its CSV/PDF export buttons, since the underlying `/api/vbrick/session?history=true` and `/api/vbrick/export/*` routes are deleted.

**Files:**
- Modify: `app/vbrick/dashboard/settings/page.tsx`

- [ ] **Step 1: Read current state of settings page history block**

Run:
```bash
grep -n "sessions\|history\|export/csv\|export/pdf" app/vbrick/dashboard/settings/page.tsx
```

Note the line ranges for: the `sessions` state declaration, the `fetch(... session?... history=true)` call, and the JSX block that lists sessions with export buttons.

- [ ] **Step 2: Remove the `sessions` state, the history fetch, and the JSX block**

Open `app/vbrick/dashboard/settings/page.tsx`. Make three edits:

**Edit A** — remove the `const [sessions, setSessions] = useState<...>` declaration (around line 16).

**Edit B** — remove the `fetch('/api/vbrick/session?... history=true')` call (around line 35) and its `.then(...)` that calls `setSessions`. If this leaves an empty `useEffect`, remove the `useEffect` too. If the `useEffect` had other work, leave the other work in place.

**Edit C** — remove the JSX block starting with `{sessions.length === 0 ? ...` (around line 183) through the matching closing tags. This includes the `<a href="/api/vbrick/export/csv?...">` and `<a href="/api/vbrick/export/pdf?...">` buttons. If the enclosing card/section becomes empty-purpose after this, remove that card too.

Because this is a bounded surgical edit on code the implementer has in front of them, do not copy-paste a large JSX block into this plan — follow the three edits above. After each edit, visually confirm the file still parses.

- [ ] **Step 3: Verify typecheck**

Run:
```bash
npx tsc --noEmit 2>&1 | grep "settings/page.tsx" | head -10
```

Expected: no errors in this file.

- [ ] **Step 4: Commit**

```bash
git add app/vbrick/dashboard/settings/page.tsx
git commit -m "refactor(vbrick): remove session history from settings

The sessions-history list and its CSV/PDF export buttons depended
on /api/vbrick/session?history=true and /api/vbrick/export/*, which
were removed with the call-queue subsystem."
```

---

## Task 8: Build verification

Full build and manual smoke-check.

- [ ] **Step 1: Run full build**

Run:
```bash
npm run build 2>&1 | tail -40
```

Expected: build completes with no errors. `Route (app)` output should list `/vbrick/dashboard`, `/vbrick/dashboard/sparring`, `/vbrick/dashboard/stories`, `/vbrick/dashboard/campaigns`, `/vbrick/dashboard/playbook`, `/vbrick/dashboard/settings`, `/vbrick/dashboard/ci`. No `/vbrick/dashboard/*` route should be missing and no new errors should appear.

If build fails: read the error, fix it in the relevant file, re-run.

- [ ] **Step 2: Run lint**

Run:
```bash
npm run lint 2>&1 | tail -30
```

Expected: no errors in any of `components/vbrick/sidebar.tsx`, `components/vbrick/quick-start-tiles.tsx`, `app/vbrick/dashboard/page.tsx`, `app/vbrick/dashboard/settings/page.tsx`.

If unused-import or unused-var lint errors appear, remove them.

- [ ] **Step 3: Start dev server and manual smoke**

Run `npm run dev` in a separate shell, then in a browser visit `http://localhost:3000/vbrick/dashboard` (or the host-rewrite URL if set up locally).

Verify:
- Email gate appears → enter a known BDR email → dashboard loads.
- IntentionScreen appears (first visit of the day).
- After intention: you see **Welcome back, {name}**, streak line, 4 tiles in order **Sparring · Stories · Campaigns · Playbook**, Performance cards, Recent Debriefs (likely empty in fresh session), Leaderboard.
- Sidebar shows 5 nav items: **Dashboard · Stories · Campaigns · Playbook · Sparring**. No Intel. No "Start Live Coaching" button.
- Click each sidebar item. Each loads its existing page.
- Click sidebar mic. Recording starts. Click stop. Debrief flow continues. Cancel to return to dashboard.
- Click "Paste Chorus Transcript" in sidebar. Transcript input appears. Cancel to return.
- Navigate to `/vbrick/dashboard/ci` directly via URL. The CI route still loads (orphan but alive).
- Navigate to `/vbrick/dashboard/settings`. The "Sessions history" block is gone; other settings remain.

If anything above fails, fix and re-run build.

- [ ] **Step 4: Commit nothing — smoke is verification, not a code change**

Proceed to Task 9.

---

## Task 9: Update second brain + index

Document the shipped restructure in the second brain and vault index so future sessions pick up the new shape.

**Files:**
- Modify: `_brain/CONTEXT.md` (at vault root, one level above repo)
- Create: `_brain/sessions/2026-04-21-vbrick-command-center-shipped.md`
- Modify: `docs/SESSION_LOG.md`
- Modify: `CLAUDE.md` (Adjacent Surfaces → VBrick paragraph)

- [ ] **Step 1: Append a session note**

Create `../\_brain/sessions/2026-04-21-vbrick-command-center-shipped.md` (path is relative to repo root — the `_brain/` dir lives at the Obsidian vault root, one level above):

```markdown
---
type: session
project: StreetNotes
date: 2026-04-21
---
# Session — 2026-04-21 — VBrick Command Center restructure (shipped)

## What happened

Shipped the restructure brainstormed earlier today. VBrick command center is now a strictly BDR development/practice hub.

## Decisions delivered

- Nav: `Dashboard · Stories · Campaigns · Playbook · Sparring` (Intel dropped, route kept).
- Sidebar mic still sticky; live-coaching UI and queueContact block removed.
- Dashboard landing: IntentionScreen → Welcome back, {name} + streak → QuickStartTiles (Sparring/Stories/Campaigns/Playbook) → Debrief flow → PerformanceCards → Recent Debriefs → Leaderboard.
- Deleted: call-queue subsystem (call-queue, session-report, csv-import-zone components; /api/vbrick/queue, /api/vbrick/session, /api/vbrick/export/*) and live-coaching subsystem (coaching-panel, use-streaming-stt hook, lib/deepgram/client, /api/vbrick/coaching/*).
- DB tables (vbrick_calling_sessions, vbrick_queue_items, vbrick_coaching_sessions) left in place per spec — non-destructive.

## New component

- `components/vbrick/quick-start-tiles.tsx` — 4-tile grid for the dashboard landing.

## Open threads (carry forward)

- Manager-side sparring visibility — deferred separate pass.
- Carry-over from 2026-04-20: visual pass on shadcn-API primitives (don't match Neu aesthetic), voice-capture wiring for framework sparring session, aesthetics product adaptations (prompts/stage-mapper/CI dictionary).

## See also

- Spec: `Streetnotes/docs/superpowers/specs/2026-04-21-vbrick-command-center-restructure-design.md`
- Plan: `Streetnotes/docs/superpowers/plans/2026-04-21-vbrick-command-center-restructure.md`
- [[2026-04-21-vbrick-command-center-restructure-brainstorm]] — the brainstorm session note
- [[2026-04-20-vbrick-sparring-audit]] — the sparring feature this restructure surfaces
```

- [ ] **Step 2: Update `_brain/CONTEXT.md` `Last session` block**

Edit `../\_brain/CONTEXT.md`. Set `updated:` to `2026-04-21`. Replace the `## Last session` block with a summary pointing at `[[2026-04-21-vbrick-command-center-shipped]]`. Preserve every other section verbatim.

- [ ] **Step 3: Append to `docs/SESSION_LOG.md`**

Append a dated entry (newest on top, under `# Session Log`):

```markdown
## 2026-04-21 (shipped)

- Shipped the VBrick command center restructure brainstormed earlier today. Nav trimmed to Dashboard · Stories · Campaigns · Playbook · Sparring. Call-queue and live-coaching subsystems fully removed (components + hooks + API routes). Dashboard landing now renders Welcome → quick-start tiles → Debrief → Performance → Recent Debriefs → Leaderboard.
- Plan: `docs/superpowers/plans/2026-04-21-vbrick-command-center-restructure.md`. Spec: `docs/superpowers/specs/2026-04-21-vbrick-command-center-restructure-design.md`. Session note: `_brain/sessions/2026-04-21-vbrick-command-center-shipped.md`.
```

- [ ] **Step 4: Update CLAUDE.md "Adjacent Surfaces → Vbrick" paragraph**

Open `CLAUDE.md`. Find the "Vbrick surfaces" paragraph under "## Adjacent Surfaces". Update the one-line description so a future session knows what vbrick looks like today — a practice hub, not a call-execution tool.

Replace the current paragraph with:

```markdown
### Vbrick surfaces
The repo also contains `app/vbrick/`, `app/vbrick-site/`, and `lib/vbrick/` — a separate tenant served from `vbrick.streetnotes.ai` (see host-based rewrite in `middleware.ts`). The command center is a **BDR development/practice hub**: `Dashboard · Stories · Campaigns · Playbook · Sparring`. Dashboard landing = IntentionScreen + welcome + quick-start tiles + Debrief flow + PerformanceCards + Recent Debriefs + Leaderboard. Call-queue and live-coaching subsystems were removed on 2026-04-21 (see `docs/superpowers/specs/2026-04-21-vbrick-command-center-restructure-design.md`). Treat as a sibling app sharing the codebase.
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md docs/SESSION_LOG.md
git add ../_brain/CONTEXT.md ../_brain/sessions/2026-04-21-vbrick-command-center-shipped.md
git commit -m "docs(vbrick): document the 2026-04-21 command-center restructure

Updates CLAUDE.md Adjacent Surfaces, appends SESSION_LOG entry, adds
a shipped-session brain note, and refreshes _brain/CONTEXT.md."
```

Note: `_brain/` lives at the Obsidian vault root (one level above the repo). The `git add ../_brain/...` paths are intentional — the vault is its own git tree in a different repo. If running from inside the Streetnotes repo and the brain files fall outside the repo, skip the `../_brain` git add and just write the files; the brain repo has its own commit flow. Use `git status ..` in the vault root if unsure.

---

## Done criteria

- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] Manual smoke checklist in Task 8 step 3 all ✓.
- [ ] No references anywhere in `app/`, `components/`, `hooks/`, `lib/` to: `CallQueue`, `CoachingPanel`, `SessionReport`, `csv-import-zone`, `useStreamingSTT`, `/api/vbrick/queue`, `/api/vbrick/session`, `/api/vbrick/coaching/`, `/api/vbrick/export/`. Verify with grep after Task 7.
- [ ] `/vbrick/dashboard/ci` still loads via direct URL.
- [ ] No Supabase migrations added or dropped.
- [ ] Documentation updated (CLAUDE.md, SESSION_LOG, brain).
