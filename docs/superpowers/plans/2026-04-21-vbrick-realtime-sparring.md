# VBrick Realtime Sparring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the VBrick sparring voice layer on the OpenAI Realtime API (WebRTC), add a persistent top nav across all dashboard routes, and keep the Bending Spoons scenario + new sparring landing page from today's work. Replaces today's broken MediaRecorder/VAD/Whisper-HTTP approach.

**Architecture:** New branch `feat/vbrick-realtime-sparring` off commit `90a0b36` (last clean state before today's broken work). Browser opens WebRTC peer connection directly to OpenAI Realtime via an ephemeral token minted by a new Next.js route. Persona + scenario + hardMode compose a single `instructions` string for the session. Server-side VAD handles turn-taking. Transcripts stream over a DataChannel and feed the existing scoring endpoint at End Call. TopNav replaces the sidebar across all dashboard routes.

**Tech Stack:** Next.js 14 App Router · React client components · WebRTC (browser-native) · OpenAI Realtime API (`gpt-4o-realtime-preview-2024-12-17`) · existing `neuTheme` tokens · no new npm dependencies.

**Spec:** `docs/superpowers/specs/2026-04-21-vbrick-realtime-sparring-design.md`

**No automated test runner.** This codebase has no jest/vitest config. Verification per task is `npm run build` + `npm run lint` green, plus targeted manual smoke. Each task ends in a commit.

---

## File map

**New:**
- `app/api/vbrick/realtime/session/route.ts` — ephemeral token endpoint
- `components/vbrick/realtime-sparring-session.tsx` — WebRTC call UI + life cycle
- `components/vbrick/top-nav.tsx` — persistent top chrome
- `components/vbrick/vbrick-shell.tsx` — layout wrapper that mounts TopNav
- `lib/vbrick/realtime-instructions.ts` — composes persona + scenario + hardMode into the Realtime session `instructions` string
- `lib/vbrick/sparring-scenarios.ts` — scenario primitive (new-write from spec; the similar file from `c4d9934` is not on this branch)

**Modified:**
- `app/vbrick/dashboard/layout.tsx` — mount `VbrickShell`
- `app/vbrick/dashboard/page.tsx` — drop Sidebar, drop `ml-[288px]`
- `app/vbrick/dashboard/sparring/page.tsx` — rebuild landing (Quick Start card + Script/Hard toggles) and launch `RealtimeSparringSession` on Start
- `app/vbrick/dashboard/stories/page.tsx` — strip local `<header>`
- `app/vbrick/dashboard/campaigns/page.tsx` — strip local `<header>`
- `app/vbrick/dashboard/playbook/page.tsx` — strip local `<header>`
- `app/vbrick/dashboard/settings/page.tsx` — strip local `<header>`
- `app/vbrick/dashboard/ci/page.tsx` — strip local `<header>`
- `lib/vbrick/dashboard-context.tsx` — add `displayName` derivation
- `lib/vbrick/sparring-personas.ts` — add `bending-spoons-vp` persona (re-written, not cherry-picked)

**Deleted:**
- `components/vbrick/sidebar.tsx`
- `components/vbrick/framework-sparring-session.tsx` — the old Framework component is replaced entirely by `RealtimeSparringSession`; the persona-grid browse path is dropped (open question #1 in spec resolved: replace)

---

## Phase 0 — Branch setup

### Task 1: Create clean branch off the last known-good commit

**Files:** none

- [ ] **Step 1: Stash any uncommitted work in the current checkout**

Run: `git stash push -u -m "wip before realtime rebuild"`
Expected: working tree clean, or "No local changes to save". Either is fine.

- [ ] **Step 2: Fetch and create the new branch**

Run: `git fetch origin && git switch -c feat/vbrick-realtime-sparring 90a0b36`
Expected: `Switched to a new branch 'feat/vbrick-realtime-sparring'`

- [ ] **Step 3: Verify the branch is at the expected commit**

Run: `git log -1 --oneline`
Expected: `90a0b36 docs(vbrick): record smoke test outcome + sparring auth fix`

- [ ] **Step 4: Bring forward only the two spec files we want on this branch**

Run:
```bash
git checkout restructure/vbrick-command-center -- \
  docs/superpowers/specs/2026-04-21-vbrick-realtime-sparring-design.md
```

Expected: the spec file appears in working tree.

- [ ] **Step 5: Commit the spec carry-over**

```bash
git add docs/superpowers/specs/2026-04-21-vbrick-realtime-sparring-design.md
git commit -m "docs(vbrick): carry realtime sparring spec onto new branch"
```

- [ ] **Step 6: Verify build still green on the clean base**

Run: `npm run build`
Expected: PASS. This confirms `90a0b36` is a buildable baseline before any changes.

---

## Phase 1 — Top nav foundation

### Task 2: Extend `DashboardProvider` with derived `displayName`

**Files:**
- Modify: `lib/vbrick/dashboard-context.tsx`

`TopNav` needs the user's display name to render an avatar initial. Derive from the existing `email` state plus `VBRICK_CONFIG.bdrDisplayNames`.

- [ ] **Step 1: Replace file contents**

```tsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'

interface DashboardContextValue {
  email: string | null
  setEmail: (email: string | null) => void
  displayName: string
  activeSection: 'dashboard' | 'stories' | 'ci'
  setActiveSection: (section: 'dashboard' | 'stories' | 'ci') => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

function deriveDisplayName(email: string | null): string {
  if (!email) return ''
  const configured = VBRICK_CONFIG.bdrDisplayNames?.[email]
  if (configured) return configured
  const localPart = email.split('@')[0]
  const first = localPart.split('.')[0]
  return first.charAt(0).toUpperCase() + first.slice(1)
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [email, setEmailState] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'stories' | 'ci'>('dashboard')

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmailState(stored)
  }, [])

  const setEmail = useCallback((next: string | null) => {
    setEmailState(next)
    if (next) {
      localStorage.setItem('vbrick_email', next)
    } else {
      localStorage.removeItem('vbrick_email')
    }
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        email,
        setEmail,
        displayName: deriveDisplayName(email),
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS. No consumers of `displayName` yet — added surface only.

- [ ] **Step 3: Commit**

```bash
git add lib/vbrick/dashboard-context.tsx
git commit -m "feat(vbrick): derive displayName in DashboardProvider"
```

---

### Task 3: Create `TopNav` component

**Files:**
- Create: `components/vbrick/top-nav.tsx`

56px persistent bar: logo + 5 nav pills with active state + user avatar menu (Settings + Sign out). No streak badge in this round — keep chrome lean.

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap,
  LayoutDashboard,
  BookOpen,
  Megaphone,
  ScrollText,
  Dumbbell,
  Settings,
  LogOut,
} from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { useDashboard } from '@/lib/vbrick/dashboard-context'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/vbrick/dashboard', icon: LayoutDashboard },
  { label: 'Stories', href: '/vbrick/dashboard/stories', icon: BookOpen },
  { label: 'Campaigns', href: '/vbrick/dashboard/campaigns', icon: Megaphone },
  { label: 'Playbook', href: '/vbrick/dashboard/playbook', icon: ScrollText },
  { label: 'Sparring', href: '/vbrick/dashboard/sparring', icon: Dumbbell },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { displayName, setEmail } = useDashboard()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  function handleSignOut() {
    setEmail(null)
    setMenuOpen(false)
    router.push('/vbrick/dashboard')
  }

  const initial = displayName.charAt(0).toUpperCase() || '?'

  return (
    <header
      className="sticky top-0 z-30 w-full font-satoshi"
      style={{
        height: 56,
        background: neuTheme.colors.bg,
        boxShadow: `0 2px 12px ${neuTheme.colors.shadow}33`,
      }}
    >
      <div className="h-full px-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/vbrick/dashboard" className="flex items-center gap-2.5 shrink-0 no-underline">
            <div
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: neuTheme.radii.sm,
                background: neuTheme.colors.accent.primary,
                boxShadow: neuTheme.shadows.raisedSm,
              }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="font-general-sans font-bold text-sm tracking-tight hidden sm:inline"
              style={{ color: neuTheme.colors.text.heading }}
            >
              Command Center
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm no-underline"
                  style={{
                    borderRadius: neuTheme.radii.sm,
                    boxShadow: isActive ? neuTheme.shadows.insetSm : 'none',
                    color: isActive ? neuTheme.colors.accent.primary : neuTheme.colors.text.body,
                    fontWeight: isActive ? 600 : 500,
                    transition: neuTheme.transitions.fast,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center border-none cursor-pointer"
            aria-label="User menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: neuTheme.radii.full,
              background: neuTheme.colors.accent.primary,
              boxShadow: neuTheme.shadows.raisedSm,
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {initial}
          </button>
          {menuOpen && (
            <div
              className="absolute right-4 top-[52px] min-w-[180px] py-2 font-satoshi text-sm"
              style={{
                background: neuTheme.colors.bg,
                borderRadius: neuTheme.radii.md,
                boxShadow: neuTheme.shadows.raised,
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/vbrick/dashboard/settings')
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 border-none bg-transparent cursor-pointer text-left"
                style={{ color: neuTheme.colors.text.body }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 border-none bg-transparent cursor-pointer text-left"
                style={{ color: neuTheme.colors.text.body }}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="md:hidden flex items-center justify-around px-2 pb-2 -mt-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] no-underline"
              style={{
                color: isActive ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS. Component compiled but not yet mounted.

- [ ] **Step 3: Commit**

```bash
git add components/vbrick/top-nav.tsx
git commit -m "feat(vbrick): add TopNav for persistent dashboard chrome"
```

---

### Task 4: Create `VbrickShell` and mount in dashboard layout

**Files:**
- Create: `components/vbrick/vbrick-shell.tsx`
- Modify: `app/vbrick/dashboard/layout.tsx`

Shell wraps children with `TopNav`. Redirects sub-routes to `/vbrick/dashboard` if email is missing so the email gate can run.

- [ ] **Step 1: Create `components/vbrick/vbrick-shell.tsx`**

```tsx
'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { TopNav } from './top-nav'
import { useDashboard } from '@/lib/vbrick/dashboard-context'
import { neuTheme } from '@/lib/vbrick/theme'

export function VbrickShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { email } = useDashboard()
  const isDashboardRoot = pathname === '/vbrick/dashboard'

  useEffect(() => {
    if (email === null && !isDashboardRoot && pathname.startsWith('/vbrick/dashboard')) {
      router.replace('/vbrick/dashboard')
    }
  }, [email, isDashboardRoot, pathname, router])

  // On the dashboard root without email, page.tsx renders its own gate — skip chrome there.
  if (!email && isDashboardRoot) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen font-satoshi" style={{ background: neuTheme.colors.bg }}>
      <TopNav />
      <main>{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/vbrick/dashboard/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { DashboardProvider } from '@/lib/vbrick/dashboard-context'
import { VbrickShell } from '@/components/vbrick/vbrick-shell'

export const metadata: Metadata = {
  title: 'Vbrick Command Center — Dashboard',
  description: 'BDR performance dashboard for Vbrick',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <VbrickShell>{children}</VbrickShell>
    </DashboardProvider>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS. TopNav now renders on every dashboard route; sub-pages and dashboard home will look visually crowded (two navs) until the next tasks strip the locals. Intentional intermediate state.

- [ ] **Step 4: Commit**

```bash
git add components/vbrick/vbrick-shell.tsx app/vbrick/dashboard/layout.tsx
git commit -m "feat(vbrick): mount VbrickShell with TopNav in dashboard layout"
```

---

### Task 5: Strip `<Sidebar>` and `ml-[288px]` from dashboard home

**Files:**
- Modify: `app/vbrick/dashboard/page.tsx`

Remove the sidebar render + horizontal offset. Everything else (email gate, intention screen, stats, quick-start tiles, performance cards, recent calls, leaderboard) stays. The dashboard page still owns its own recording state — that stays on this branch (we are deferring MicFab).

- [ ] **Step 1: Remove the Sidebar import**

In `app/vbrick/dashboard/page.tsx`, delete the line:

```tsx
import { Sidebar } from '@/components/vbrick/sidebar'
```

- [ ] **Step 2: Locate the return block that renders `<Sidebar>` and replace the outer wrapper**

Find the top-level return for the signed-in state — begins with `<div className="h-screen overflow-hidden font-satoshi" style={{ background: '#e0e5ec' }}>` and contains `<Sidebar ...>`. Replace the outer wrapper + the `<Sidebar>` + the `ml-[288px]` inner container with:

```tsx
return (
  <div className="min-h-screen">
    {isRecording && (
      <div className="fixed inset-0 bg-black/10 z-20 pointer-events-none" />
    )}

    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8 relative z-10">
      {/* existing children as before — DashboardDebriefFlow / TranscriptInput / dashboard blocks */}
    </div>
  </div>
)
```

Paste the existing children (the `view === 'debrief' && !pastedTranscript && (...)` block, the `view === 'transcript' && (...)` block, the `view === 'debrief' && pastedTranscript && (...)` block, and the `view === 'dashboard' && (<> ... </>)` block) unchanged inside the new inner `<div>`.

Delete all `onMicStart`, `onMicStop`, `onPasteTranscript`, `micDisabled`, `showStats`, `streak`, `todayCalls`, `spinAvg`, `role`, `name` props that were being passed to `<Sidebar>` — they are no longer needed. The local state backing those (setView, isRecording, etc.) stays and remains used inside the retained children.

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run lint`
Expected: PASS. Lint may complain about now-unused imports — remove them.

- [ ] **Step 4: Manual smoke**

Run: `npm run dev`. Open http://localhost:3000/vbrick/dashboard. Expect:
- TopNav at top (Dashboard pill highlighted)
- No 288px left gutter — content renders full width capped at 1200px
- Welcome + QuickStartTiles + PerformanceCards + Recent Debriefs + Leaderboard visible
- No `<Sidebar>` anywhere

- [ ] **Step 5: Commit**

```bash
git add app/vbrick/dashboard/page.tsx
git commit -m "feat(vbrick): remove Sidebar + 288px offset from dashboard home"
```

---

### Task 6: Strip local `<header>` from 5 sub-pages

**Files:**
- Modify: `app/vbrick/dashboard/stories/page.tsx`
- Modify: `app/vbrick/dashboard/campaigns/page.tsx`
- Modify: `app/vbrick/dashboard/playbook/page.tsx`
- Modify: `app/vbrick/dashboard/settings/page.tsx`
- Modify: `app/vbrick/dashboard/ci/page.tsx`

Each page today wraps its content in a local chrome block (either `<header>`, a "Back to Dashboard" breadcrumb, or both). Delete the chrome. Keep page body content.

**For each file, do all of the following steps:**

- [ ] **Step 1: Read the file**

Run Read on the file to see current structure.

- [ ] **Step 2: Delete chrome**

Remove:
- Any `<header>...</header>` block at the top of the returned JSX.
- Any `<Link href="/vbrick/dashboard">...Back...</Link>` breadcrumb element at the top of the page.
- Any `className="min-h-screen bg-background"` or equivalent outer wrapper (the shell now owns the full-page background).
- Any import rendered unused by those deletions (e.g., `Link`, `ChevronLeft`, header icon imports).

Keep:
- `<NeuTabs>`, internal sub-view routers, page body, dialogs, hero cards that are not nav chrome.

- [ ] **Step 3: Wrap body in a standard container**

Ensure the outermost returned element is a plain container. Use:

```tsx
<div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
  {/* existing body content */}
</div>
```

If the page had no inline `<h1>` outside the deleted header, add one as the first child:

```tsx
<h1
  className="font-general-sans font-bold text-2xl tracking-tight"
  style={{ color: '#2d3436' }}
>
  {/* Page name: Stories / Campaigns / Playbook / Settings / CI Dashboard */}
</h1>
```

- [ ] **Step 4: Build + lint after editing each file**

Run: `npm run build && npm run lint`
Expected: PASS. Fix any unused-import complaints before moving to the next file.

- [ ] **Step 5: Commit all five in one commit after the last file is done**

```bash
git add \
  app/vbrick/dashboard/stories/page.tsx \
  app/vbrick/dashboard/campaigns/page.tsx \
  app/vbrick/dashboard/playbook/page.tsx \
  app/vbrick/dashboard/settings/page.tsx \
  app/vbrick/dashboard/ci/page.tsx
git commit -m "refactor(vbrick): drop local headers from sub-pages (TopNav is shared chrome)"
```

---

### Task 7: Delete `Sidebar` component

**Files:**
- Delete: `components/vbrick/sidebar.tsx`

- [ ] **Step 1: Verify no remaining imports**

Run: `git grep -l "from '@/components/vbrick/sidebar'" || true`
Expected: NO output. If anything matches, fix the import and re-run before deleting.

- [ ] **Step 2: Delete**

```bash
git rm components/vbrick/sidebar.tsx
```

- [ ] **Step 3: Build + lint**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(vbrick): delete Sidebar (superseded by TopNav)"
```

---

## Phase 2 — Scenario + persona carry-forward

### Task 8: Add Bending Spoons persona

**Files:**
- Modify: `lib/vbrick/sparring-personas.ts`

- [ ] **Step 1: Extend the `PersonaId` union**

Find the `export type PersonaId = | 'disinterested-it-manager' ...` block and add `| 'bending-spoons-vp'` as the last member:

```ts
export type PersonaId =
  | 'disinterested-it-manager'
  | 'budget-conscious-cfo'
  | 'overwhelmed-cto'
  | 'skeptical-security-officer'
  | 'enthusiastic-innovator'
  | 'busy-exec-assistant'
  | 'compliance-heavy-legal'
  | 'price-shopping-procurement'
  | 'bending-spoons-vp'
```

- [ ] **Step 2: Add the persona entry**

Find the end of the last persona entry in `SPARRING_PERSONAS`. The final existing entry is `'price-shopping-procurement'`, which ends with:

```ts
You will NOT:
- Reveal specific budget numbers
- Skip procurement process
- Make emotional decisions
- Commit without seeing written proposals`
  }
}
```

Change the `}` after `proposals\`` from `}` to `,`, then add this entry before the closing `}` of `SPARRING_PERSONAS`:

```ts
  'bending-spoons-vp': {
    id: 'bending-spoons-vp',
    name: 'Dana Whitfield',
    title: 'VP of Internal Communications',
    company: 'Meridian Labs',
    companySize: '1,800 employees',
    industry: 'Enterprise software',
    voice: 'shimmer',
    personality:
      'Time-conscious. Her company closed an acquisition by Bending Spoons eight weeks ago and the integration is noisy. Picks up the phone expecting it to be internal. Polite but wary of cold outreach.',
    painPoints: [
      'Internal comms chaos post-acquisition — tooling changes every week',
      'Exec town-halls need to feel consistent across legacy and acquirer workforce',
      'Video content scattered across Zoom, Vimeo, a legacy CMS, and an acquirer platform',
      'No single source of truth for searchable video moments',
    ],
    objections: [
      'I have been pitched this three times this month',
      'We are mid-integration and cannot evaluate new tools',
      'Send me an email',
      'Not the right person',
    ],
    hotButtons: [
      'Finding the exact moment in a 40-minute town-hall',
      'Consolidating video under one secure platform',
      'Preparing for the first acquirer all-hands',
    ],
    openingContext:
      'Answering a cold call in the middle of a hectic post-acquisition integration week. Expecting an internal call.',
    systemPrompt: `You are Dana Whitfield, VP of Internal Communications at Meridian Labs. Your company was acquired by Bending Spoons eight weeks ago.

INTEGRATION IS NOISY:
- Tools are being replaced every week
- Employees are anxious
- You are responsible for keeping internal communications coherent through all of it

YOUR TONE:
- Professionally polite, slightly time-pressed
- Will not engage with weak openers or generic value props
- You answer the phone expecting it to be internal — cold callers surprise you
- If the BDR has a specific, relevant reason to be on the phone, you will listen for a minute

CONTEXT TO WEAVE IN NATURALLY:
- Attending K26 is on your radar but you have not decided
- You attend conferences when they are genuinely useful for a problem you are actively working on
- You have been contacted multiple times already about the Bending Spoons acquisition`,
  }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/vbrick/sparring-personas.ts
git commit -m "feat(vbrick): add Bending Spoons VP persona (Dana Whitfield)"
```

---

### Task 9: Create scenario primitive with `bending-spoons-k26`

**Files:**
- Create: `lib/vbrick/sparring-scenarios.ts`

- [ ] **Step 1: Create the file**

```ts
import type { PersonaId } from './sparring-personas'

export type BDRAccent = 'irish' | 'newZealand' | 'general'

export interface ScenarioScriptStep {
  label: string
  hint: string
}

export interface SparringScenario {
  id: string
  title: string
  subtitle: string
  estimatedMinutes: number
  personaId: PersonaId
  defaultAccent: BDRAccent
  scenarioContext: string
  hardModeContext: string
  cheatCard: ScenarioScriptStep[]
}

export const SPARRING_SCENARIOS: Record<string, SparringScenario> = {
  'bending-spoons-k26': {
    id: 'bending-spoons-k26',
    title: 'Bending Spoons Check-in + K26 Invite',
    subtitle:
      'Call a VP at a recently acquired company. Check on integration friction, pitch the K26 booth.',
    estimatedMinutes: 3,
    personaId: 'bending-spoons-vp',
    defaultAccent: 'general',
    scenarioContext: [
      'BACKGROUND (react to these topics only if the BDR brings them up, do NOT volunteer):',
      '- Your company was acquired by Bending Spoons eight weeks ago; integration is noisy.',
      '- K26 is next month; you have not decided whether to attend.',
      'The BDR is driving the call. Your job is to react, not lead.',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You have been contacted three separate times this month about the Bending Spoons acquisition — once by a consultant, twice by SaaS vendors. You are protective of your time. Push back on generic openers like "How are things going?". You expect specifics. You will end the call within 30 seconds if the BDR has not given you a concrete reason to stay on the line. You are NOT attending K26 unless someone gives you a concrete reason tied to a problem you actually have.',
    ].join('\n'),
    cheatCard: [
      {
        label: 'Confirm you are speaking to the right person',
        hint: 'Short and direct: "Is this Dana? Quick question for you."',
      },
      {
        label: 'Ask about Bending Spoons friction',
        hint: '"What has felt different since the deal closed?" — then listen.',
      },
      {
        label: 'Ask about K26 and pitch the booth',
        hint: '"While I have you — are you going to K26? If so, stop by. We are showing multi-modal AI that pulls the exact frame of a video you need."',
      },
    ],
  },
}

export function getScenarioById(id: string | null | undefined): SparringScenario | null {
  if (!id) return null
  return SPARRING_SCENARIOS[id] ?? null
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/vbrick/sparring-scenarios.ts
git commit -m "feat(vbrick): add sparring scenario primitive with bending-spoons-k26"
```

---

### Task 10: Create the realtime instructions composer

**Files:**
- Create: `lib/vbrick/realtime-instructions.ts`

Pulls persona + scenario + hardMode into the single `instructions` string the Realtime session uses. Used only by the server-side ephemeral token endpoint.

- [ ] **Step 1: Create the file**

```ts
import type { ProspectPersona } from './sparring-personas'
import type { SparringScenario } from './sparring-scenarios'

export function composeRealtimeInstructions(
  persona: ProspectPersona,
  scenario: SparringScenario | null,
  hardMode: boolean,
): string {
  const parts: string[] = [persona.systemPrompt]

  if (scenario) {
    parts.push(scenario.scenarioContext)
    if (hardMode && scenario.hardModeContext) parts.push(scenario.hardModeContext)
  }

  parts.push(
    [
      'BEHAVIOR RULES FOR THIS VOICE CALL:',
      '- You are answering a cold call on the phone.',
      '- Start with ONE short greeting only — "Hello." or similar. Do NOT introduce yourself.',
      '- Keep every reply short and natural. Under 20 words unless the BDR asks for detail.',
      '- Do not narrate or describe actions. Only speak dialogue.',
      '- You can interrupt and be interrupted. If the BDR interrupts, stop and listen.',
      '- Follow the BDR\'s lead. They drive the conversation.',
      '- When the BDR asks for your name, give ONLY your name (first and last).',
      `- When the BDR asks if you are responsible for [video/communications/streaming], answer based on your role as ${persona.title}.`,
      '- If the BDR asks "May I tell them hello from you?" — grant or decline politely.',
      `- Stay in character as ${persona.name}.`,
    ].join('\n'),
  )

  return parts.join('\n\n')
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/vbrick/realtime-instructions.ts
git commit -m "feat(vbrick): composer for Realtime session instructions"
```

---

## Phase 3 — Realtime voice layer

### Task 11: Ephemeral token endpoint

**Files:**
- Create: `app/api/vbrick/realtime/session/route.ts`

Mints a short-lived client secret from OpenAI's `POST /v1/realtime/sessions`. Returns only the ephemeral key + session id; never echoes `OPENAI_API_KEY`.

- [ ] **Step 1: Create the file**

```ts
import { NextResponse } from 'next/server'
import { getPersonaById, type PersonaId, SPARRING_PERSONAS } from '@/lib/vbrick/sparring-personas'
import { getScenarioById } from '@/lib/vbrick/sparring-scenarios'
import { composeRealtimeInstructions } from '@/lib/vbrick/realtime-instructions'

export const runtime = 'nodejs'
export const maxDuration = 30

const REALTIME_MODEL = 'gpt-4o-realtime-preview-2024-12-17'

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY missing on server' }, { status: 500 })
  }

  let body: { scenarioId?: string; hardMode?: boolean; personaId?: PersonaId } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine — will fall through to defaults
  }

  const scenario = getScenarioById(body.scenarioId)
  const resolvedPersonaId: PersonaId =
    body.personaId ?? scenario?.personaId ?? 'bending-spoons-vp'
  const persona = getPersonaById(resolvedPersonaId)
  if (!persona) {
    return NextResponse.json(
      { error: `Unknown personaId: ${resolvedPersonaId}` },
      { status: 400 },
    )
  }

  const instructions = composeRealtimeInstructions(persona, scenario, body.hardMode ?? false)

  try {
    const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: REALTIME_MODEL,
        voice: persona.voice,
        instructions,
        modalities: ['audio', 'text'],
        temperature: 0.8,
        turn_detection: {
          type: 'server_vad',
          silence_duration_ms: 600,
          prefix_padding_ms: 300,
        },
        input_audio_transcription: { model: 'whisper-1' },
      }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error('Realtime session mint failed:', resp.status, text)
      return NextResponse.json(
        { error: 'Failed to mint Realtime session' },
        { status: 502 },
      )
    }

    const session = (await resp.json()) as {
      id: string
      client_secret: { value: string; expires_at: number }
    }

    return NextResponse.json({
      sessionId: session.id,
      clientSecret: session.client_secret.value,
      expiresAt: session.client_secret.expires_at,
      model: REALTIME_MODEL,
      voice: persona.voice,
      personaId: persona.id,
      personaName: persona.name,
      personaTitle: persona.title,
    })
  } catch (err) {
    console.error('Realtime session error:', err)
    return NextResponse.json({ error: 'Realtime session request failed' }, { status: 500 })
  }
}

// Keep the full personas list exportable for the client via typed response consumers.
void SPARRING_PERSONAS
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS. New route compiled.

- [ ] **Step 3: Smoke the endpoint with curl (dev server required)**

Run: `npm run dev` in one terminal, then in another:

```bash
curl -s -X POST http://localhost:3000/api/vbrick/realtime/session \
  -H 'Content-Type: application/json' \
  -d '{"scenarioId":"bending-spoons-k26","hardMode":false}'
```

Expected: JSON response containing `sessionId`, `clientSecret` (long opaque string), `expiresAt`, `voice: "shimmer"`, `personaName: "Dana Whitfield"`. If the response is a 500 error, confirm `OPENAI_API_KEY` is in `.env.local` and restart dev.

- [ ] **Step 4: Commit**

```bash
git add app/api/vbrick/realtime/session/route.ts
git commit -m "feat(vbrick): ephemeral-token endpoint for Realtime sparring"
```

---

### Task 12: Build `RealtimeSparringSession` component

**Files:**
- Create: `components/vbrick/realtime-sparring-session.tsx`

The client that (a) mints a session, (b) opens a WebRTC peer connection to OpenAI, (c) renders the call UI, (d) captures transcripts via DataChannel events, (e) on End Call, posts transcript to the existing scoring endpoint.

- [ ] **Step 1: Create the file**

```tsx
/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Phone, PhoneOff } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { SPARRING_SCENARIOS, getScenarioById } from '@/lib/vbrick/sparring-scenarios'

const REALTIME_API_URL = 'https://api.openai.com/v1/realtime'

type TranscriptTurn = { role: 'user' | 'assistant'; text: string; at: number }

type Phase = 'idle' | 'connecting' | 'in-call' | 'ending' | 'scored' | 'error'

export type SparringScoreResult = {
  score: number
  frameworkScore: number
  wouldTransfer: boolean
  dimensions?: Array<{ name: string; score: number; feedback?: string }>
  strengths?: string[]
  improvements?: string[]
  [key: string]: unknown
}

interface RealtimeSparringSessionProps {
  scenarioId: string
  hardMode: boolean
  scriptVisible: boolean
  onEnd: (result: SparringScoreResult | null, transcript: TranscriptTurn[]) => void
  onCancel: () => void
}

export function RealtimeSparringSession({
  scenarioId,
  hardMode,
  scriptVisible,
  onEnd,
  onCancel,
}: RealtimeSparringSessionProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [personaName, setPersonaName] = useState<string>('Prospect')
  const [personaTitle, setPersonaTitle] = useState<string>('')
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [assistantSpeaking, setAssistantSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([])

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const transcriptRef = useRef<TranscriptTurn[]>([])
  const sessionIdRef = useRef<string | null>(null)
  const personaIdRef = useRef<string | null>(null)

  const scenario = getScenarioById(scenarioId) ?? SPARRING_SCENARIOS['bending-spoons-k26']

  // --- Start the call on mount ---
  useEffect(() => {
    let cancelled = false
    async function start() {
      setPhase('connecting')
      try {
        const sessionResp = await fetch('/api/vbrick/realtime/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId, hardMode }),
        })
        if (!sessionResp.ok) throw new Error('Failed to mint Realtime session')
        const sessionData = await sessionResp.json()
        if (cancelled) return
        sessionIdRef.current = sessionData.sessionId
        personaIdRef.current = sessionData.personaId
        setPersonaName(sessionData.personaName || 'Prospect')
        setPersonaTitle(sessionData.personaTitle || '')

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        localStreamRef.current = stream

        const pc = new RTCPeerConnection()
        pcRef.current = pc

        stream.getTracks().forEach((track) => pc.addTrack(track, stream))

        pc.ontrack = (e) => {
          if (!remoteAudioRef.current) return
          remoteAudioRef.current.srcObject = e.streams[0]
          void remoteAudioRef.current.play().catch(() => {})
        }

        const dc = pc.createDataChannel('oai-events')
        dcRef.current = dc
        dc.onmessage = (evt) => handleRealtimeEvent(evt.data)

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const sdpResp = await fetch(`${REALTIME_API_URL}?model=${encodeURIComponent(sessionData.model)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionData.clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        })
        if (!sdpResp.ok) throw new Error(`SDP exchange failed: ${sdpResp.status}`)
        const answerSdp = await sdpResp.text()
        if (cancelled) return
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

        if (!cancelled) setPhase('in-call')
      } catch (err) {
        console.error('Realtime start failed:', err)
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : String(err))
          setPhase('error')
        }
      }
    }
    void start()
    return () => {
      cancelled = true
      teardown()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRealtimeEvent(raw: unknown) {
    let msg: { type?: string; transcript?: string } & Record<string, unknown>
    try {
      msg = JSON.parse(raw as string)
    } catch {
      return
    }

    switch (msg.type) {
      case 'input_audio_buffer.speech_started':
        setUserSpeaking(true)
        break
      case 'input_audio_buffer.speech_stopped':
        setUserSpeaking(false)
        break
      case 'output_audio_buffer.started':
        setAssistantSpeaking(true)
        break
      case 'output_audio_buffer.stopped':
      case 'response.done':
        setAssistantSpeaking(false)
        break
      case 'conversation.item.input_audio_transcription.completed': {
        const text = typeof msg.transcript === 'string' ? msg.transcript.trim() : ''
        if (text) appendTurn('user', text)
        break
      }
      case 'response.audio_transcript.done': {
        const text = typeof msg.transcript === 'string' ? msg.transcript.trim() : ''
        if (text) appendTurn('assistant', text)
        break
      }
      default:
        break
    }
  }

  function appendTurn(role: 'user' | 'assistant', text: string) {
    const turn: TranscriptTurn = { role, text, at: Date.now() }
    transcriptRef.current = [...transcriptRef.current, turn]
    setTranscript(transcriptRef.current)
  }

  function teardown() {
    try {
      dcRef.current?.close()
    } catch {}
    try {
      pcRef.current?.getSenders().forEach((s) => {
        try {
          s.track?.stop()
        } catch {}
      })
      pcRef.current?.close()
    } catch {}
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    pcRef.current = null
    dcRef.current = null
  }

  async function endCall() {
    if (phase === 'ending' || phase === 'scored') return
    setPhase('ending')
    // Let any in-flight transcription events land before we score.
    await new Promise((r) => setTimeout(r, 400))
    teardown()

    const turns = transcriptRef.current
    if (turns.length < 2 || !personaIdRef.current) {
      onEnd(null, turns)
      setPhase('scored')
      return
    }

    try {
      const transcription = turns
        .map((t) => `${t.role === 'user' ? 'BDR' : personaName}: ${t.text}`)
        .join('\n\n')

      const scoreResp = await fetch('/api/vbrick/framework-spar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: personaIdRef.current,
          action: 'score',
          sessionId: sessionIdRef.current,
          transcription,
          bdrAccent: 'general',
          durationSeconds: Math.max(30, turns.length * 15),
        }),
      })
      if (!scoreResp.ok) throw new Error('Scoring failed')
      const result = (await scoreResp.json()) as SparringScoreResult
      onEnd(result, turns)
      setPhase('scored')
    } catch (err) {
      console.error('Scoring failed:', err)
      onEnd(null, turns)
      setPhase('scored')
    }
  }

  // --- UI ---
  const statusLabel =
    phase === 'connecting'
      ? 'Connecting…'
      : phase === 'ending'
      ? 'Scoring…'
      : phase === 'error'
      ? 'Connection failed'
      : userSpeaking
      ? "You're speaking"
      : assistantSpeaking
      ? `${personaName} is speaking`
      : phase === 'in-call'
      ? 'Listening…'
      : ''

  const circleColor =
    phase === 'connecting' || phase === 'ending'
      ? neuTheme.colors.accent.muted
      : phase === 'error'
      ? neuTheme.colors.status.danger
      : assistantSpeaking
      ? neuTheme.colors.status.success
      : userSpeaking
      ? neuTheme.colors.accent.primary
      : neuTheme.colors.bg

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div
        className="flex items-center justify-between p-4"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raisedSm,
          borderRadius: neuTheme.radii.md,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '9999px',
              background: neuTheme.colors.accent.primary,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: neuTheme.shadows.raisedSm,
              fontWeight: 700,
            }}
          >
            {personaName.charAt(0)}
          </div>
          <div>
            <p
              className="font-general-sans font-bold text-base"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {personaName}
            </p>
            <p className="text-xs font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
              {personaTitle}
            </p>
          </div>
        </div>
        <span
          className="text-xs font-satoshi font-medium px-3 py-1"
          style={{
            background: neuTheme.colors.bgLight,
            boxShadow: neuTheme.shadows.insetSm,
            borderRadius: neuTheme.radii.full,
            color: neuTheme.colors.text.body,
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col items-center py-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 120,
            height: 120,
            borderRadius: '9999px',
            background: circleColor,
            boxShadow:
              assistantSpeaking || userSpeaking
                ? `0 0 0 8px ${neuTheme.colors.accent.muted}33, 0 0 40px ${neuTheme.colors.accent.primary}55`
                : neuTheme.shadows.raised,
            transition: 'all 0.3s ease',
            animation: userSpeaking || assistantSpeaking ? 'rt-pulse 1.2s ease-in-out infinite' : 'none',
          }}
        >
          <Phone className="w-12 h-12" style={{ color: userSpeaking || assistantSpeaking ? 'white' : neuTheme.colors.accent.primary }} />
        </div>
        <style>{`@keyframes rt-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }`}</style>
      </div>

      <div
        className="p-4 space-y-3 font-satoshi text-sm max-h-[320px] overflow-y-auto"
        style={{
          background: neuTheme.colors.bgLight,
          boxShadow: neuTheme.shadows.insetSm,
          borderRadius: neuTheme.radii.md,
          color: neuTheme.colors.text.body,
        }}
      >
        {transcript.length === 0 && phase !== 'error' && (
          <p style={{ color: neuTheme.colors.text.muted }}>
            {phase === 'connecting' ? 'Connecting to the prospect…' : `Waiting for ${personaName} to answer…`}
          </p>
        )}
        {transcript.map((t, i) => (
          <div key={i}>
            <span
              className="font-satoshi font-semibold mr-2"
              style={{ color: t.role === 'user' ? neuTheme.colors.accent.primary : neuTheme.colors.text.heading }}
            >
              {t.role === 'user' ? 'You:' : `${personaName}:`}
            </span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {scriptVisible && !hardMode && scenario.cheatCard.length > 0 && (
        <div
          className="p-4 space-y-2"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.md,
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.2em] font-satoshi font-medium"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            Your script
          </p>
          <ol className="space-y-2">
            {scenario.cheatCard.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  className="flex items-center justify-center shrink-0 font-bold text-[10px]"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '9999px',
                    background: neuTheme.colors.accent.primary,
                    color: 'white',
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium" style={{ color: neuTheme.colors.text.heading }}>
                    {step.label}
                  </p>
                  <p className="text-xs" style={{ color: neuTheme.colors.text.muted }}>
                    {step.hint}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {phase === 'error' && (
        <div
          className="p-3 font-satoshi text-xs"
          style={{
            background: neuTheme.colors.bgLight,
            boxShadow: neuTheme.shadows.insetSm,
            borderRadius: neuTheme.radii.sm,
            borderLeft: `3px solid ${neuTheme.colors.status.danger}`,
            color: neuTheme.colors.text.body,
          }}
        >
          Connection failed: {errorMsg ?? 'Unknown error'}. Try again.
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={endCall}
          disabled={phase === 'ending' || phase === 'scored'}
          className="flex items-center gap-2 px-5 py-2.5 font-satoshi font-medium text-sm border-none cursor-pointer"
          style={{
            background: neuTheme.colors.status.danger,
            color: 'white',
            borderRadius: neuTheme.radii.full,
            boxShadow: neuTheme.shadows.raisedSm,
            opacity: phase === 'ending' || phase === 'scored' ? 0.6 : 1,
          }}
        >
          <PhoneOff className="w-4 h-4" />
          End Call
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 font-satoshi text-xs border-none cursor-pointer"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.full,
            color: neuTheme.colors.text.muted,
          }}
        >
          Back
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build && npm run lint`
Expected: PASS. Unused-imports lint warnings are acceptable only if they document deliberate shapes; otherwise fix.

- [ ] **Step 3: Commit**

```bash
git add components/vbrick/realtime-sparring-session.tsx
git commit -m "feat(vbrick): RealtimeSparringSession component (WebRTC to OpenAI Realtime)"
```

---

### Task 13: Rebuild sparring landing page to launch the Realtime session

**Files:**
- Modify: `app/vbrick/dashboard/sparring/page.tsx`

Replace the entire file. Quick-start card for Bending Spoons + Script/Hard toggles + on Start, render `<RealtimeSparringSession>`. End Call flows back to the landing with a result banner.

- [ ] **Step 1: Replace the whole file**

```tsx
/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState } from 'react'
import { Phone, Dumbbell } from 'lucide-react'
import {
  RealtimeSparringSession,
  type SparringScoreResult,
} from '@/components/vbrick/realtime-sparring-session'
import { SPARRING_SCENARIOS } from '@/lib/vbrick/sparring-scenarios'
import { neuTheme } from '@/lib/vbrick/theme'

type Mode = 'landing' | 'active'

const QUICK_SCENARIO = SPARRING_SCENARIOS['bending-spoons-k26']

export default function SparringPage() {
  const [mode, setMode] = useState<Mode>('landing')
  const [scriptVisible, setScriptVisible] = useState(true)
  const [hardMode, setHardMode] = useState(false)
  const [lastResult, setLastResult] = useState<SparringScoreResult | null>(null)

  if (mode === 'active') {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <RealtimeSparringSession
          scenarioId={QUICK_SCENARIO.id}
          hardMode={hardMode}
          scriptVisible={scriptVisible}
          onEnd={(result) => {
            if (result) setLastResult(result)
            setMode('landing')
          }}
          onCancel={() => setMode('landing')}
        />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      {lastResult && (
        <div
          className="p-4 flex items-center justify-between"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.md,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center font-bold"
              style={{
                width: 56,
                height: 56,
                borderRadius: '9999px',
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.insetSm,
                color:
                  lastResult.score >= 80
                    ? neuTheme.colors.status.success
                    : lastResult.score >= 70
                    ? neuTheme.colors.status.warning
                    : neuTheme.colors.status.danger,
                fontSize: 20,
              }}
            >
              {lastResult.score}
            </div>
            <div>
              <p
                className="font-general-sans font-semibold text-base"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {lastResult.score >= 80
                  ? 'Great call.'
                  : lastResult.score >= 70
                  ? 'Solid.'
                  : 'Keep reps going.'}
              </p>
              <p className="text-xs font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
                Framework {lastResult.frameworkScore}%
                {lastResult.wouldTransfer ? ' · Would transfer ✓' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMode('active')}
            className="px-4 py-2 font-satoshi text-sm font-medium border-none cursor-pointer"
            style={{
              background: neuTheme.colors.accent.primary,
              color: 'white',
              borderRadius: neuTheme.radii.sm,
              boxShadow: neuTheme.shadows.raisedSm,
            }}
          >
            Run it again
          </button>
        </div>
      )}

      <div
        className="p-8"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
          borderRadius: neuTheme.radii.xl,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: neuTheme.radii.sm,
              background: neuTheme.colors.accent.primary,
              boxShadow: neuTheme.shadows.raisedSm,
            }}
          >
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
              style={{ color: neuTheme.colors.accent.primary }}
            >
              This week's play
            </p>
            <h1
              className="font-general-sans font-bold text-2xl tracking-tight"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {QUICK_SCENARIO.title}
            </h1>
          </div>
        </div>

        <p className="font-satoshi text-sm mb-6" style={{ color: neuTheme.colors.text.muted }}>
          {QUICK_SCENARIO.subtitle} · ~{QUICK_SCENARIO.estimatedMinutes} minutes.
        </p>

        <button
          onClick={() => setMode('active')}
          className="flex items-center gap-2 px-6 py-3 font-satoshi font-semibold text-base border-none cursor-pointer mb-6"
          style={{
            background: neuTheme.colors.accent.primary,
            color: 'white',
            borderRadius: neuTheme.radii.md,
            boxShadow: neuTheme.shadows.raised,
          }}
        >
          <Phone className="w-4 h-4" />
          Start Practice Call
        </button>

        <div className="flex items-center gap-2">
          <TogglePill active={scriptVisible} onClick={() => setScriptVisible((v) => !v)} label="Script visible" />
          <TogglePill active={hardMode} onClick={() => setHardMode((v) => !v)} label="Hard mode" />
        </div>

        {scriptVisible && !hardMode && (
          <div className="mt-6 space-y-3">
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
              style={{ color: neuTheme.colors.text.muted }}
            >
              Your three-step script
            </p>
            <ol className="space-y-3">
              {QUICK_SCENARIO.cheatCard.map((step, i) => (
                <li
                  key={i}
                  className="p-3 flex items-start gap-3"
                  style={{
                    background: neuTheme.colors.bgLight,
                    boxShadow: neuTheme.shadows.insetSm,
                    borderRadius: neuTheme.radii.sm,
                  }}
                >
                  <span
                    className="flex items-center justify-center shrink-0 font-bold text-xs"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '9999px',
                      background: neuTheme.colors.accent.primary,
                      color: 'white',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p
                      className="font-satoshi text-sm font-medium"
                      style={{ color: neuTheme.colors.text.heading }}
                    >
                      {step.label}
                    </p>
                    <p className="font-satoshi text-xs mt-0.5" style={{ color: neuTheme.colors.text.muted }}>
                      {step.hint}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {hardMode && (
          <div
            className="mt-6 p-3 font-satoshi text-xs"
            style={{
              background: neuTheme.colors.bgLight,
              boxShadow: neuTheme.shadows.insetSm,
              borderRadius: neuTheme.radii.sm,
              borderLeft: `3px solid ${neuTheme.colors.status.danger}`,
              color: neuTheme.colors.text.body,
            }}
          >
            <strong>Hard mode:</strong> cheat card hidden, prospect is skeptical and guarded. Be specific or they hang up.
          </div>
        )}
      </div>
    </div>
  )
}

function TogglePill({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 font-satoshi text-xs font-medium border-none cursor-pointer"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: active ? neuTheme.shadows.insetSm : neuTheme.shadows.raisedSm,
        color: active ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
        borderRadius: neuTheme.radii.full,
        transition: neuTheme.transitions.fast,
      }}
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/vbrick/dashboard/sparring/page.tsx
git commit -m "feat(vbrick): sparring landing launches Realtime session with Script/Hard toggles"
```

---

### Task 14: Delete legacy sparring component and unused chat branches

**Files:**
- Delete: `components/vbrick/framework-sparring-session.tsx`

This branch started from `90a0b36` which already has that file, but no page references it after Task 13 lands. Confirm, then delete.

- [ ] **Step 1: Verify no remaining imports**

Run: `git grep -l "framework-sparring-session" app components lib || true`
Expected: NO output. If anything matches, open those files and remove the import + any reference.

- [ ] **Step 2: Delete**

```bash
git rm components/vbrick/framework-sparring-session.tsx
```

- [ ] **Step 3: Build + lint**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(vbrick): delete legacy FrameworkSparringSession (superseded by Realtime)"
```

---

## Phase 4 — End-to-end verification and ship

### Task 15: Full smoke test

- [ ] **Step 1: Build + lint**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 2: Start dev**

Run: `npm run dev`. Open http://localhost:3000/vbrick/dashboard.

- [ ] **Step 3: Sign-in flow**

Enter your email at the gate if prompted. Expect the dashboard home to render full width under the TopNav.

- [ ] **Step 4: Navigation smoke**

Click each TopNav item:
- Dashboard, Stories, Campaigns, Playbook, Sparring — each should load, with the TopNav persistent and the active pill highlighted. No page should display a local `<header>` or breadcrumb above the content.

- [ ] **Step 5: Sparring quick-start smoke (wear headphones)**

On `/vbrick/dashboard/sparring`:
1. Click **Start Practice Call**. Grant mic permission if prompted.
2. Within ~2s, the status pill should transition from "Connecting…" to "Listening…" and Dana should say "Hello."
3. Say: "Hi, this is [your name] calling from VBRICK. Could I get your first and last name?"
4. Pause — Dana should reply quickly: "Dana Whitfield." or similar.
5. Say: "Great, I was hoping you can help me out. Are you on the team responsible for Meridian's video communications?"
6. Dana should reply: "Yes. What is this regarding?" or similar.
7. Say: "The reason I'm calling — we help companies consolidate video tooling. Quick question: have things felt different since the Bending Spoons deal closed?"
8. Dana should engage briefly with 1-2 sentences.
9. Try interrupting her mid-sentence — she should stop talking and listen.
10. Click **End Call**. Expect a score banner on the landing page.

Each of the 10 steps is a check. If any fail, STOP and debug before proceeding.

- [ ] **Step 6: Hard mode smoke**

Toggle **Hard mode** on the landing (Script visible auto-hides). Start Practice Call. Open with "How are things going?" — Dana should push back (e.g., "Who is this and what do you need?" or similar). Verify she is notably more guarded than in normal mode.

- [ ] **Step 7: Error path smoke**

Temporarily rename `OPENAI_API_KEY` in `.env.local` to something invalid and restart dev. Click Start Practice Call. Expect the error banner ("Connection failed: ...") rather than a crash. Restore the key.

- [ ] **Step 8: Cost guardrail** (visual, not a check)

Note how long you ran the call. Realtime API bills per-minute for both input and output audio. This is not a blocker for shipping, but surface this in the PR body as a risk.

- [ ] **Step 9: Commit any smoke fixes**

If any of the above exposed a fixable bug, fix it in-place:

```bash
git add -A
git commit -m "fix(vbrick): smoke-test fixes"
```

---

### Task 16: Push branch and open PR

- [ ] **Step 1: Push**

Run: `git push -u origin feat/vbrick-realtime-sparring`
Expected: branch pushed, PR URL suggested in output.

- [ ] **Step 2: Open PR against `main`**

```bash
gh pr create --base main --title "feat(vbrick): realtime voice sparring + top nav" --body "$(cat <<'EOF'
## Summary

- Replaces today's failed MediaRecorder/VAD/Whisper-HTTP sparring stack with a direct WebRTC connection to the OpenAI Realtime API.
- Adds persistent TopNav across all `/vbrick/dashboard/*` routes; deletes the 288px Sidebar and local per-page headers.
- Adds `bending-spoons-k26` scenario + Dana Whitfield persona; sparring landing is a one-click Quick Start with Script/Hard toggles.
- End Call feeds the captured transcript to the existing `framework-spar?action=score` endpoint.

## Architecture

- `POST /api/vbrick/realtime/session` mints a short-lived OpenAI ephemeral token server-side (API key never leaves the server).
- Browser opens `RTCPeerConnection` to OpenAI Realtime using that token. Server-side VAD handles turn-taking. Transcripts stream via DataChannel events.
- Session instructions composed from persona systemPrompt + scenario context + (optional) hardMode context + call-behavior rules.

## Risk / cost

- Pinned model: `gpt-4o-realtime-preview-2024-12-17`.
- Realtime API bills per-minute for audio in/out. Watch usage during rollout.

## Test plan

- [ ] Dashboard loads full-width under TopNav
- [ ] All 5 sub-page routes render under TopNav with no local headers
- [ ] Start Practice Call connects in ~2s and the bot greets with "Hello."
- [ ] 3+ turn conversation works without taps or VAD misfires
- [ ] Interruption works (talk over the bot → bot stops)
- [ ] Hard mode visibly changes the bot's disposition
- [ ] End Call returns a score banner
- [ ] Error path (bad API key) renders a banner, not a crash

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Return the PR URL**

Print the URL from `gh pr create` output. Stop and wait for the user to review the preview deploy before merging.

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] Realtime voice layer via WebRTC → Tasks 11, 12, 13
- [x] Ephemeral token endpoint → Task 11
- [x] Session instructions composed from persona + scenario + hardMode → Task 10
- [x] Persona voice used on Realtime session → Task 11 (`voice: persona.voice`)
- [x] Server-side VAD config → Task 11 (`turn_detection: server_vad`)
- [x] Transcript capture via DataChannel events → Task 12
- [x] End Call feeds existing scoring endpoint → Task 12 (`endCall()` POST to `framework-spar?action=score`)
- [x] Bending Spoons scenario + Dana persona carried forward → Tasks 8, 9
- [x] Sparring landing with Quick Start + Script/Hard toggles → Task 13
- [x] TopNav across all dashboard routes → Tasks 2, 3, 4
- [x] Sidebar deleted → Task 7
- [x] Per-page headers stripped from all 5 sub-pages → Task 6
- [x] Dashboard home reflows full-width → Task 5
- [x] Legacy `framework-sparring-session.tsx` deleted (spec open question #1 resolved: replace) → Task 14
- [x] Clean branch off 90a0b36 → Task 1

**2. Placeholder scan:** No TBDs. Every code block contains the actual code. Every command is exact. Error handling is concrete (not "add appropriate error handling").

**3. Type consistency:**
- `SparringScoreResult` defined in Task 12, imported by Task 13 — consistent.
- `TranscriptTurn` local to the component, not leaked — consistent.
- `PersonaId` union extended in Task 8, referenced by type throughout — consistent.
- `scenarioId` / `hardMode` / `scriptVisible` props consistent between Task 12 (component) and Task 13 (consumer).
- `composeRealtimeInstructions` signature in Task 10 matches call site in Task 11.

No gaps found.
