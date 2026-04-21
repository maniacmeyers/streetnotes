# VBrick Sparring + Nav Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two workstreams in one branch: (a) restyle sparring + fix conversation loop + add one-click Bending Spoons / K26 scenario with Hard-mode toggle, and (b) replace the 288px Sidebar with a persistent TopNav + floating MicFab across every vbrick dashboard route.

**Architecture:** Nav ships first (Phase 1–2) because Phase 3 rebuilds the sparring page on top of the new shared chrome. State moves: recording + identity both lift into `DashboardProvider`. A new `VbrickShell` client component in the dashboard layout renders TopNav + children + MicFab for all sub-routes. A new scenario primitive wraps the existing persona system without replacing it.

**Tech Stack:** Next.js 14 App Router · React client components · Tailwind (inline styles where Neu tokens apply) · `motion/react` · existing `neuTheme` tokens (`lib/vbrick/theme.ts`) · OpenAI (already wired) · no new deps · no DB migration.

**Spec:** `docs/superpowers/specs/2026-04-21-vbrick-sparring-restyle-fixes-quickstart-design.md`

**Branch:** `restructure/vbrick-command-center` (PR #2 already open — commits land on this branch)

**No automated test runner.** This codebase has no jest/vitest config. Verification per task is `npm run build` + `npm run lint` green, plus targeted manual smoke. Each task ends in a commit; after each phase we run full build+lint before proceeding.

---

## File Map

**New:**
- `components/vbrick/top-nav.tsx`
- `components/vbrick/mic-fab.tsx`
- `components/vbrick/vbrick-shell.tsx`
- `lib/vbrick/sparring-scenarios.ts`

**Modified:**
- `lib/vbrick/dashboard-context.tsx` — add recording + displayName state
- `app/vbrick/dashboard/layout.tsx` — mount `VbrickShell`
- `app/vbrick/dashboard/page.tsx` — drop Sidebar, drop `ml-[288px]`, consume context
- `lib/vbrick/sparring-personas.ts` — append `bending-spoons-vp` persona
- `app/api/vbrick/framework-spar/route.ts` — accept `scenarioId` + `hardMode`
- `components/vbrick/framework-sparring-session.tsx` — Neu restyle, conversation-loop fixes, cheat-card, scenario plumbing
- `components/vbrick/sparring-session.tsx` — Neu restyle only
- `app/vbrick/dashboard/sparring/page.tsx` — new quick-start landing
- `app/vbrick/dashboard/stories/page.tsx` — strip local header
- `app/vbrick/dashboard/campaigns/page.tsx` — strip local header
- `app/vbrick/dashboard/playbook/page.tsx` — strip local header
- `app/vbrick/dashboard/settings/page.tsx` — strip local header
- `app/vbrick/dashboard/ci/page.tsx` — strip local header

**Deleted:**
- `components/vbrick/sidebar.tsx`

---

## Phase 1 — Nav foundation

### Task 1: Extend `DashboardProvider` with recording state and identity

**Files:**
- Modify: `lib/vbrick/dashboard-context.tsx`

The shared chrome (TopNav + MicFab) needs to read and write recording state and know the display name. Today this state is owned by `app/vbrick/dashboard/page.tsx`. It lifts into the provider so any descendant can access it.

- [ ] **Step 1: Replace the context value with the extended shape**

Replace the entire file contents with:

```tsx
'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'

interface DashboardContextValue {
  email: string | null
  setEmail: (email: string | null) => void
  displayName: string
  activeSection: 'dashboard' | 'stories' | 'ci'
  setActiveSection: (section: 'dashboard' | 'stories' | 'ci') => void
  // recording state (lifted from dashboard page)
  isRecording: boolean
  recordingDuration: number
  micDisabled: boolean
  setMicDisabled: (disabled: boolean) => void
  startRecording: () => void
  stopRecording: () => void
  // streak — single quick stat surfaced in TopNav
  streak: number
  setStreak: (n: number) => void
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
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [micDisabled, setMicDisabled] = useState(false)
  const [streak, setStreak] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmailState(stored)
  }, [])

  useEffect(() => {
    if (!isRecording) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }
    setRecordingDuration(0)
    timerRef.current = window.setInterval(() => {
      setRecordingDuration((prev) => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const setEmail = useCallback((next: string | null) => {
    setEmailState(next)
    if (next) {
      localStorage.setItem('vbrick_email', next)
    } else {
      localStorage.removeItem('vbrick_email')
    }
  }, [])

  const startRecording = useCallback(() => setIsRecording(true), [])
  const stopRecording = useCallback(() => setIsRecording(false), [])

  return (
    <DashboardContext.Provider
      value={{
        email,
        setEmail,
        displayName: deriveDisplayName(email),
        activeSection,
        setActiveSection,
        isRecording,
        recordingDuration,
        micDisabled,
        setMicDisabled,
        startRecording,
        stopRecording,
        streak,
        setStreak,
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
Expected: PASS. Nothing consumes the new fields yet so existing behavior is unchanged.

- [ ] **Step 3: Commit**

```bash
git add lib/vbrick/dashboard-context.tsx
git commit -m "feat(vbrick): lift recording + identity state into DashboardProvider"
```

---

### Task 2: Create `TopNav` component

**Files:**
- Create: `components/vbrick/top-nav.tsx`

56px persistent top bar. Left: logo + 5 nav pills with `usePathname()` active state. Right: streak badge + user menu (avatar initial → dropdown with Settings + Sign out).

- [ ] **Step 1: Create `components/vbrick/top-nav.tsx`**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Zap, LayoutDashboard, BookOpen, Megaphone, ScrollText, Dumbbell, Settings, LogOut, Flame } from 'lucide-react'
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
  const { displayName, streak, setEmail } = useDashboard()
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
        {/* Left: brand + nav */}
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

        {/* Right: streak + user menu */}
        <div className="flex items-center gap-4 shrink-0">
          {streak > 0 && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-medium"
              style={{
                borderRadius: neuTheme.radii.full,
                boxShadow: neuTheme.shadows.insetSm,
                color: neuTheme.colors.text.body,
              }}
            >
              <Flame className="w-3.5 h-3.5" style={{ color: neuTheme.colors.status.warning }} />
              {streak}-day streak
            </div>
          )}

          <div className="relative" ref={menuRef}>
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
                transition: neuTheme.transitions.fast,
              }}
            >
              {initial}
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-[44px] min-w-[180px] py-2 font-satoshi text-sm"
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
      </div>

      {/* Mobile nav row */}
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
Expected: PASS. Component is defined but not yet imported.

- [ ] **Step 3: Commit**

```bash
git add components/vbrick/top-nav.tsx
git commit -m "feat(vbrick): add TopNav component for persistent chrome"
```

---

### Task 3: Create `MicFab` component

**Files:**
- Create: `components/vbrick/mic-fab.tsx`

Floating action button bottom-right. Reads recording state from context. On non-dashboard routes, tapping routes to `/vbrick/dashboard` then starts recording.

- [ ] **Step 1: Create `components/vbrick/mic-fab.tsx`**

```tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Mic, Square } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { useDashboard } from '@/lib/vbrick/dashboard-context'

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MicFab() {
  const pathname = usePathname()
  const router = useRouter()
  const { isRecording, recordingDuration, micDisabled, startRecording, stopRecording } = useDashboard()

  // Hide entirely on the email gate (user not signed in yet — page will handle it)
  // and hide on sparring routes where the user is practicing (would conflict with the practice audio).
  const hiddenOnRoute = pathname.startsWith('/vbrick/dashboard/sparring')
  if (hiddenOnRoute) return null

  function handleClick() {
    if (micDisabled) return
    if (isRecording) {
      stopRecording()
      return
    }
    if (pathname !== '/vbrick/dashboard') {
      // Route to dashboard first — debrief flow lives there
      router.push('/vbrick/dashboard')
      // slight delay so the dashboard mounts before we flip state
      window.setTimeout(() => startRecording(), 50)
      return
    }
    startRecording()
  }

  return (
    <div
      className="fixed z-40 font-satoshi"
      style={{ bottom: 24, right: 24 }}
    >
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-3 pl-4 pr-2 py-2"
            style={{
              background: neuTheme.colors.bg,
              borderRadius: neuTheme.radii.full,
              boxShadow: neuTheme.shadows.raised,
            }}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: neuTheme.colors.status.danger, animation: 'pulse 1.2s ease-in-out infinite' }}
            />
            <span
              className="font-fira-code text-sm tabular-nums"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {formatDuration(recordingDuration)}
            </span>
            <button
              onClick={handleClick}
              className="flex items-center justify-center border-none cursor-pointer"
              aria-label="Stop recording"
              style={{
                width: 44,
                height: 44,
                borderRadius: neuTheme.radii.full,
                background: neuTheme.colors.status.danger,
                color: 'white',
                boxShadow: neuTheme.shadows.raisedSm,
              }}
            >
              <Square className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="idle"
            onClick={handleClick}
            disabled={micDisabled}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: micDisabled ? 1 : 1.05 }}
            whileTap={{ scale: micDisabled ? 1 : 0.95 }}
            className="flex items-center justify-center border-none cursor-pointer"
            aria-label="Start debrief"
            style={{
              width: 56,
              height: 56,
              borderRadius: neuTheme.radii.full,
              background: micDisabled ? neuTheme.colors.bgLight : neuTheme.colors.accent.primary,
              color: 'white',
              boxShadow: neuTheme.shadows.raised,
              opacity: micDisabled ? 0.5 : 1,
              cursor: micDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            <Mic className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/vbrick/mic-fab.tsx
git commit -m "feat(vbrick): add MicFab floating action button"
```

---

### Task 4: Create `VbrickShell` and mount in dashboard layout

**Files:**
- Create: `components/vbrick/vbrick-shell.tsx`
- Modify: `app/vbrick/dashboard/layout.tsx`

Shell wraps all dashboard pages with TopNav + MicFab. Email redirect: if a sub-route loads without an email set in localStorage, bounce to `/vbrick/dashboard` to run the login gate.

- [ ] **Step 1: Create `components/vbrick/vbrick-shell.tsx`**

```tsx
'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { TopNav } from './top-nav'
import { MicFab } from './mic-fab'
import { useDashboard } from '@/lib/vbrick/dashboard-context'
import { neuTheme } from '@/lib/vbrick/theme'

export function VbrickShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { email } = useDashboard()
  const isDashboardRoot = pathname === '/vbrick/dashboard'

  // If user lands on a sub-route without email, redirect to dashboard root to run the gate.
  useEffect(() => {
    if (email === null && !isDashboardRoot && pathname.startsWith('/vbrick/dashboard')) {
      router.replace('/vbrick/dashboard')
    }
  }, [email, isDashboardRoot, pathname, router])

  // On the dashboard root without email, page.tsx renders its own email gate — skip chrome there.
  if (!email && isDashboardRoot) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen font-satoshi" style={{ background: neuTheme.colors.bg }}>
      <TopNav />
      <main className="relative">{children}</main>
      <MicFab />
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/vbrick/dashboard/layout.tsx` contents**

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
Expected: PASS. Every dashboard page now has TopNav + MicFab layered on top, but sub-pages still render their own headers (next tasks remove those). Visually this will temporarily look crowded — that's fine; we fix it in tasks 6–7.

- [ ] **Step 4: Commit**

```bash
git add components/vbrick/vbrick-shell.tsx app/vbrick/dashboard/layout.tsx
git commit -m "feat(vbrick): mount VbrickShell with TopNav + MicFab in dashboard layout"
```

---

### Task 5: Strip Sidebar + `ml-[288px]` from dashboard home; wire context

**Files:**
- Modify: `app/vbrick/dashboard/page.tsx`

The home page now (a) stops rendering `Sidebar`, (b) stops offsetting content with `ml-[288px]`, (c) reads recording state and displayName from context, (d) publishes streak into context so TopNav can display it.

- [ ] **Step 1: Edit imports and top of component**

In `app/vbrick/dashboard/page.tsx`:

Remove the line `import { Sidebar } from '@/components/vbrick/sidebar'`.

Add to imports:
```tsx
import { useDashboard } from '@/lib/vbrick/dashboard-context'
```

- [ ] **Step 2: Replace local recording state with context**

Remove these state declarations inside `VbrickDashboardPage`:
- `const [email, setEmail] = useState<string | null>(null)` (already redefined below — context now owns it)
- `const [isRecording, setIsRecording] = useState(false)`
- `const [recordingDuration, setRecordingDuration] = useState(0)`

Also remove the timer `useEffect` block (lines ~86–93 starting with `if (!isRecording) return`) — the provider handles it.

Replace with:
```tsx
const { email, setEmail, displayName, isRecording, recordingDuration, startRecording, stopRecording, setStreak } = useDashboard()
const [emailInput, setEmailInput] = useState('')
const [showIntention, setShowIntention] = useState(false)
const [stats, setStats] = useState<StatsData | null>(null)
const [view, setView] = useState<DashboardView>('dashboard')
const [pastedTranscript, setPastedTranscript] = useState<string | null>(null)
const [recentCalls, setRecentCalls] = useState<RecentCall[]>([])
```

Note: `displayName` is now derived by context — delete the local `const localPart = email.split('@')[0] ... const displayName = ...` block near line 232.

- [ ] **Step 3: Replace handlers that touched recording state**

Change `handleMicStart`:
```tsx
function handleMicStart() {
  setView('debrief')
  startRecording()
}

function handleMicStop() {
  stopRecording()
}
```

(Keep existing references to `handleMicStart` / `handleMicStop` — they still get called, they now delegate to context.)

In `handleDebriefComplete`, replace `setIsRecording(false)` with `stopRecording()`.

In the transcript/email-gate `setIsRecording(false)` calls in the JSX (lines ~268 and ~293), replace with `stopRecording()`.

- [ ] **Step 4: Publish `streak` into context after stats fetch**

In the `fetchStats` function, after `setStats(data)`:
```tsx
if (res.ok) {
  setStats(data)
  setStreak(data.streak || 0)
}
```

- [ ] **Step 5: Replace the email-submit handler to use context**

Replace `handleEmailSubmit`:
```tsx
function handleEmailSubmit(e: React.FormEvent) {
  e.preventDefault()
  const clean = emailInput.trim().toLowerCase()
  if (!clean) return
  setEmail(clean)
}
```

- [ ] **Step 6: Remove `<Sidebar>` + `ml-[288px]` offset**

Find the `return (` block for the signed-in state (starts around line 238 `<div className="h-screen overflow-hidden font-satoshi" ...>`). Replace that entire return block with:

```tsx
return (
  <div className="min-h-screen font-satoshi">
    {isRecording && (
      <div className="fixed inset-0 bg-black/10 z-20 pointer-events-none" />
    )}

    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8 relative z-10">
      {view === 'debrief' && !pastedTranscript && (
        <DashboardDebriefFlow
          email={email}
          queueContact={null}
          onComplete={handleDebriefComplete}
          onCancel={() => { setView('dashboard'); stopRecording() }}
          isRecording={isRecording}
          onRecordingStart={startRecording}
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
              className="font-general-sans font-bold text-3xl tracking-tight"
              style={{ color: neuTheme.colors.text.heading }}
            >
              Welcome back, {displayName}
            </h1>
            {stats && (
              <p
                className="text-sm font-satoshi mt-1"
                style={{ color: neuTheme.colors.text.muted }}
              >
                {stats.streak}-day streak · {stats.todayCalls} calls today
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
)
```

Note: `onPasteTranscript` and `micDisabled` references are gone — those were props on the old Sidebar. Paste-transcript affordance moves into the debrief flow itself or is deferred (YAGNI for this ship).

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: PASS. `TypeScript` may complain if an import is unused — drop any orphaned imports.

Run: `npm run lint`
Expected: PASS or cosmetic warnings only.

- [ ] **Step 8: Manual smoke**

Run: `npm run dev`

Open http://localhost:3000/vbrick/dashboard. Expect:
- Email gate renders if no email in localStorage.
- After entering email, dashboard renders with TopNav at top, content below, MicFab bottom-right, NO sidebar on the left, NO 288px gutter.
- Clicking nav items in TopNav navigates correctly. Active state highlights the current page.
- Clicking MicFab triggers the debrief flow.

- [ ] **Step 9: Commit**

```bash
git add app/vbrick/dashboard/page.tsx
git commit -m "feat(vbrick): remove Sidebar from dashboard home, consume shared context"
```

---

## Phase 2 — Strip per-page headers

### Task 6: Remove local `<header>` blocks from Stories, Campaigns, Playbook, Settings, CI

**Files:**
- Modify: `app/vbrick/dashboard/stories/page.tsx`
- Modify: `app/vbrick/dashboard/campaigns/page.tsx`
- Modify: `app/vbrick/dashboard/playbook/page.tsx`
- Modify: `app/vbrick/dashboard/settings/page.tsx`
- Modify: `app/vbrick/dashboard/ci/page.tsx`

Each sub-page today wraps its content in its own `<header>` or a "Back to Dashboard" breadcrumb. The TopNav replaces all of that.

For each file:

- [ ] **Step 1: Read the file and locate the top-level `<header>` or breadcrumb block**

Use Read on each file. Find the block that contains:
- Either a `<header>` tag at the top of the returned JSX, OR
- A `<Link href="/vbrick/dashboard">` "Back to..." breadcrumb element

- [ ] **Step 2: Delete only the redundant chrome**

Remove:
- The entire `<header>...</header>` block at the top of the page JSX (if present).
- Any "Back to dashboard" / "Back to X" breadcrumb Link at the top of the page.
- Any import that becomes unused after deletion (e.g., `Link` if only used for the breadcrumb).

Keep:
- Everything else — internal tabs (`NeuTabs`), page-body content, dialogs, hero sections that are not navigation chrome.
- Inline `<h1>` page titles IF they were inside the header. If there was no inline `<h1>` outside the removed header, add one at the top of the main content with:

```tsx
<h1
  className="font-general-sans font-bold text-2xl tracking-tight mb-6"
  style={{ color: '#2d3436' }}
>
  {/* Page name — e.g. "Stories", "Campaigns", "Playbook", "Settings", "CI Dashboard" */}
</h1>
```

- [ ] **Step 3: Wrap the page content in a standard container**

Ensure the outermost returned wrapper is a plain `<div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">` (or use the existing container if it already matches). Delete any `min-h-screen bg-background` wrapper — the shell owns the full-page background.

- [ ] **Step 4: Build + lint after each file edit**

After editing each of the 5 files, run:
```bash
npm run build && npm run lint
```
Expected: PASS.

- [ ] **Step 5: Commit all five at once**

```bash
git add app/vbrick/dashboard/stories/page.tsx app/vbrick/dashboard/campaigns/page.tsx app/vbrick/dashboard/playbook/page.tsx app/vbrick/dashboard/settings/page.tsx app/vbrick/dashboard/ci/page.tsx
git commit -m "refactor(vbrick): drop local headers from sub-pages (TopNav is shared chrome)"
```

---

### Task 7: Strip `<header>` from Sparring page (defer content rebuild to Phase 3)

**Files:**
- Modify: `app/vbrick/dashboard/sparring/page.tsx`

The sparring page's header has a help dialog and a Start button. The help-dialog content (the framework script) is valuable — preserve its content; we'll re-home it inside the sparring quick-start layout in Task 10. For this task, just strip the `<header>` and get the file compiling without it.

- [ ] **Step 1: Delete the `<header>` block**

In `app/vbrick/dashboard/sparring/page.tsx`, delete the entire `<header>...</header>` block at the top of BOTH return branches (active session and non-active). Also delete the duplicate `<header>` wrapper on the active-session return (lines ~40–44 today: the "Cold Call Sparring — Active Session" wrapper).

The active-session return becomes:
```tsx
if (isActiveSession) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <FrameworkSparringSession
        onComplete={handleSessionComplete}
        onCancel={() => setIsActiveSession(false)}
      />
    </div>
  )
}
```

The non-active return opens with:
```tsx
return (
  <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
    {/* existing body content — hero, last-result, framework steps, personas, accent tips */}
  </div>
)
```

Remove the outer `<div className="min-h-screen bg-background">` wrappers on both returns.

- [ ] **Step 2: Move the help-dialog trigger into the body**

The help dialog currently lived in the header. For now, add a small "Framework help" button above the hero section inside the non-active return body (existing `<Dialog>` block can be moved there verbatim). We will redesign this entirely in Task 10, so the goal here is only to keep the dialog reachable without the old header. Don't spend time styling.

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/vbrick/dashboard/sparring/page.tsx
git commit -m "refactor(vbrick): strip local header from sparring page"
```

---

### Task 8: Delete `Sidebar` and verify no remaining imports

**Files:**
- Delete: `components/vbrick/sidebar.tsx`

- [ ] **Step 1: Verify no remaining imports**

Run: `grep -rn "from '@/components/vbrick/sidebar'" app components lib || true`
Expected: NO output (no files import Sidebar anymore).

If any match appears, go remove the import and reference first.

- [ ] **Step 2: Delete the file**

Run: `git rm components/vbrick/sidebar.tsx`

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(vbrick): delete Sidebar (superseded by TopNav + MicFab)"
```

---

## Phase 3 — Sparring: scenario primitive, API, landing, loop fixes, restyle

### Task 9: Add `bending-spoons-vp` persona

**Files:**
- Modify: `lib/vbrick/sparring-personas.ts`

- [ ] **Step 1: Extend the `PersonaId` union**

At the top of the file, change the union:
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

Inside the `SPARRING_PERSONAS` record (before the closing brace), add:

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
    'Time-conscious. Their company closed an acquisition by Bending Spoons eight weeks ago and the integration is noisy. Picks up the phone expecting it to be internal. Polite but wary of cold outreach.',
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
    'Preparing for their first acquirer all-hands',
  ],
  openingContext:
    'Answering a cold call in the middle of a hectic post-acquisition integration week. Expecting an internal call.',
  systemPrompt:
    'You are Dana Whitfield, VP of Internal Communications at Meridian Labs. Your company was acquired by Bending Spoons eight weeks ago. Integration is noisy — tools are being replaced, people are anxious, and you are the person responsible for keeping internal communications coherent through it. You are time-conscious and mildly wary of cold outreach because you have been contacted several times about this acquisition already. You are professionally polite but will not engage with weak openers or generic value props. You attend industry conferences when they are genuinely useful — K26 is on your radar but you have not decided whether to attend.',
},
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/vbrick/sparring-personas.ts
git commit -m "feat(vbrick): add Bending Spoons VP persona for K26 scenario"
```

---

### Task 10: Create `sparring-scenarios.ts` with `bending-spoons-k26` scenario

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
    subtitle: 'Call a VP at a recently acquired company. Check on integration friction, pitch the K26 booth.',
    estimatedMinutes: 3,
    personaId: 'bending-spoons-vp',
    defaultAccent: 'general',
    scenarioContext: [
      'SCENARIO CONTEXT (append to persona behavior):',
      'The BDR is calling to do two specific things in order:',
      '1. Confirm they are speaking to the right person.',
      '2. Ask how the Bending Spoons acquisition has been going, specifically whether any friction has shown up for internal comms / video tooling.',
      '3. Ask whether Dana plans to attend K26 next month, and if so invite her to stop by the VBRICK booth to see the multi-modal AI demo (pulling the exact frame of a video you need, whenever you need it).',
      'Respond as Dana, realistically. You can be positive, guarded, or busy depending on how the BDR opens.',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You have been contacted three separate times this month about the Bending Spoons acquisition — once by a consultant, twice by SaaS vendors. You are protective of your time. Push back on generic openers ("How are things going?"). You expect specifics. You will end the call within 30 seconds if the BDR has not given you a concrete reason to stay on the line. You are NOT attending K26 unless someone gives you a concrete reason tied to a problem you actually have.',
    ].join('\n'),
    cheatCard: [
      {
        label: 'Confirm you are speaking to the right person',
        hint: 'Short and direct. "Is this Dana? Quick question for you."',
      },
      {
        label: 'Ask about friction from the Bending Spoons acquisition',
        hint: '"What has felt different since the deal closed?" — then listen.',
      },
      {
        label: 'Ask about K26 and pitch the booth',
        hint: '"While I have you — are you going to K26? If so, stop by — we are showing multi-modal AI that pulls the exact frame of a video you need."',
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
git commit -m "feat(vbrick): add sparring-scenarios primitive with bending-spoons-k26"
```

---

### Task 11: Extend `framework-spar` API with `scenarioId` + `hardMode`

**Files:**
- Modify: `app/api/vbrick/framework-spar/route.ts`

The route today takes `personaId`. We add optional `scenarioId` and `hardMode`. When `scenarioId` is present, we resolve the scenario, look up the persona it references, and compose the system prompt as `persona.systemPrompt + '\n\n' + scenario.scenarioContext + (hardMode ? '\n\n' + scenario.hardModeContext : '')`. When `scenarioId` is absent, existing behavior is unchanged.

- [ ] **Step 1: Import the scenario helper**

At the top of `app/api/vbrick/framework-spar/route.ts`, add:
```ts
import { getScenarioById, type SparringScenario } from '@/lib/vbrick/sparring-scenarios'
```

- [ ] **Step 2: Destructure the new body fields**

In the handler body where we destructure `body`:
```ts
const {
  personaId,
  action,
  sessionId,
  bdrMessage,
  transcription,
  bdrAccent = 'general',
  currentStep = 'name_capture',
  scenarioId,
  hardMode = false,
} = body
```

- [ ] **Step 3: Add a helper to compose scenario-aware system prompt**

Add below the destructure, before the `action === 'start'` branch:

```ts
const scenario: SparringScenario | null = getScenarioById(scenarioId)

function composeSystemPrompt(base: string): string {
  if (!scenario) return base
  const parts = [base, scenario.scenarioContext]
  if (hardMode && scenario.hardModeContext) parts.push(scenario.hardModeContext)
  return parts.join('\n\n')
}
```

- [ ] **Step 4: Use `composeSystemPrompt` in the `start` branch**

Replace the `content:` string in the start-branch chat completion (currently `persona.systemPrompt + '\n\nCURRENT CONTEXT: ...'`) with:

```ts
content: `${composeSystemPrompt(persona.systemPrompt)}\n\nCURRENT CONTEXT: This is a cold call. The BDR (sales rep) is calling you. They'll ask for your name first:\n\n"First and last name?" (inquisitive tone)\n\nAfter you give your name, they say: "Great, I was hoping you can help me out real quick."\n\nYOUR RESPONSE (as ${persona.name}, ${persona.title}):\n- Answer with your first and last name\n- Include your natural reaction (busy, curious, guarded)\n- This sets the tone for the rest of the call\n\nKeep response realistic and conversational (1-2 sentences).`
```

- [ ] **Step 5: Use `composeSystemPrompt` in the `respond` branch**

In the `respond` branch chat completion, change the first message's `content` to:
```ts
content: `${composeSystemPrompt(persona.systemPrompt)}\n\nFRAMEWORK TRACKING:\nThe BDR is using the VBRICK cold call framework. Current step: ${detectedStep}\n\n${frameworkContext}\n\nCONVERSATION GUIDELINES:\n- Respond as ${persona.name} authentically\n- React to their script naturally - you can say yes or no to qualification\n- If they ask "Are you responsible for X?" - answer honestly based on your role\n- If you say NO, expect them to ask for a referral\n- If you say YES, expect a value proposition\n- Stay in character - don't "play nice" just because it's training\n- You can be skeptical, busy, or interested based on your personality`
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/api/vbrick/framework-spar/route.ts
git commit -m "feat(vbrick): framework-spar accepts scenarioId + hardMode"
```

---

### Task 12: Fix the conversation loop in `framework-sparring-session.tsx`

**Files:**
- Modify: `components/vbrick/framework-sparring-session.tsx`

Four targeted fixes. Do NOT restyle yet (Task 13 does that).

- [ ] **Step 1: Add scenarioId + hardMode props, thread through API calls**

Change the `FrameworkSparringSessionProps` interface:
```ts
interface FrameworkSparringSessionProps {
  onComplete: (result: SparringResult, persona: ProspectPersona) => void
  onCancel: () => void
  scenarioId?: string
  hardMode?: boolean
  onStartFromScenario?: (personaId: ProspectPersona['id']) => void
}
```

Update the component signature:
```tsx
export function FrameworkSparringSession({ onComplete, onCancel, scenarioId, hardMode = false }: FrameworkSparringSessionProps) {
```

In `startSession`, include in the POST body:
```tsx
body: JSON.stringify({
  personaId: persona.id,
  action: 'start',
  bdrAccent: selectedAccent,
  scenarioId,
  hardMode,
})
```

In `submitBDRResponse`, include in the POST body:
```tsx
body: JSON.stringify({
  personaId: selectedPersona.id,
  action: 'respond',
  sessionId,
  bdrMessage: text,
  currentStep,
  conversationHistory: updatedConversation.slice(-40),
  bdrAccent: selectedAccent,
  scenarioId,
  hardMode,
})
```

Note the `.slice(-40)` — this is fix #4 (increased history).

- [ ] **Step 2: Decouple bot text from audio in `startSession`**

Find the block in `startSession` that currently does:
```tsx
if (data.audioBase64) {
  const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
  audioRef.current = audio
  setIsPlayingAudio(true)
  audio.onended = () => {
    setIsPlayingAudio(false)
    setCallState('in-call')
  }
  audio.play()

  setConversation([{ speaker: 'prospect', text: data.openingResponse }])
}
```

Replace it with:
```tsx
setConversation([{ speaker: 'prospect', text: data.openingResponse }])
setCallState('in-call')

if (data.audioBase64) {
  const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
  audioRef.current = audio
  setIsPlayingAudio(true)
  audio.onended = () => setIsPlayingAudio(false)
  audio.onerror = () => setIsPlayingAudio(false)
  audio.play().catch((err) => {
    console.warn('TTS autoplay rejected or failed:', err)
    setIsPlayingAudio(false)
  })
}
```

- [ ] **Step 3: Same decoupling in `submitBDRResponse`**

Find the `submitBDRResponse` block that handles audio (currently near lines 167-179). Replace with:
```tsx
setConversation([
  ...updatedConversation,
  { speaker: 'prospect', text: data.response }
])

if (data.audioBase64) {
  const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
  audioRef.current = audio
  setIsPlayingAudio(true)
  audio.onended = () => setIsPlayingAudio(false)
  audio.onerror = () => setIsPlayingAudio(false)
  audio.play().catch((err) => {
    console.warn('TTS autoplay rejected or failed:', err)
    setIsPlayingAudio(false)
  })
}
```

(The `setConversation` call is moved above the audio block so the text renders immediately.)

- [ ] **Step 4: Ungate the input from `isPlayingAudio`**

In the `<input>` element that takes the BDR response (currently line ~439), change `disabled={isLoading || isPlayingAudio}` to `disabled={isLoading}`.

In the Send `<Button>` (currently line ~451), change `disabled={isLoading || isPlayingAudio}` to `disabled={isLoading}`.

Also — when the BDR types while audio is playing, we should cut the audio. In the `submitBDRResponse` function, at the very top of the `try` block, add:
```tsx
if (audioRef.current) {
  audioRef.current.pause()
  audioRef.current = null
  setIsPlayingAudio(false)
}
```

- [ ] **Step 5: Add a simple mute toggle in the call header**

This is lightweight — a `<button>` next to the "Your turn" / "Speaking..." badge. When toggled, set `audioRef.current.muted = true` (if present) and store a `isMuted` state that gets applied to any new `Audio` created. Add near the top of the component:
```tsx
const [isMuted, setIsMuted] = useState(false)
```

In both `startSession` and `submitBDRResponse` audio blocks, right after `const audio = new Audio(...)`, add:
```tsx
audio.muted = isMuted
```

In the call header JSX (the block with the "Your turn" `<Badge>`), add a mute button next to it:
```tsx
<button
  onClick={() => {
    const next = !isMuted
    setIsMuted(next)
    if (audioRef.current) audioRef.current.muted = next
  }}
  className="text-xs px-2 py-1 border-none bg-transparent cursor-pointer"
  style={{ color: '#636e72' }}
  aria-label={isMuted ? 'Unmute' : 'Mute'}
>
  {isMuted ? '🔇' : '🔊'}
</button>
```

- [ ] **Step 6: Verify build**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/vbrick/framework-sparring-session.tsx
git commit -m "fix(vbrick): harden sparring conversation loop (ungate input, decouple audio, scenario props)"
```

---

### Task 13: Neu restyle pass on `framework-sparring-session.tsx` and `sparring-session.tsx`

**Files:**
- Modify: `components/vbrick/framework-sparring-session.tsx`
- Modify: `components/vbrick/sparring-session.tsx`

Swap generic shadcn visuals for Neu tokens. Keep the structural layout; change only colors, shadows, and avatar treatment.

- [ ] **Step 1: Add Neu import to `framework-sparring-session.tsx`**

At the top:
```tsx
import { neuTheme } from '@/lib/vbrick/theme'
```

- [ ] **Step 2: Replace the avatar gradient with Neu accent**

Find both occurrences of:
```tsx
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
```
and the similar `w-10 h-10` variant.

Replace with inline-styled Neu avatar:
```tsx
<div
  className="flex items-center justify-center text-white font-bold"
  style={{
    width: 48,
    height: 48,
    borderRadius: '9999px',
    background: neuTheme.colors.accent.primary,
    boxShadow: neuTheme.shadows.raisedSm,
    fontSize: 18,
  }}
>
```
(for the larger; use `width: 40, height: 40, fontSize: 16` for the smaller).

- [ ] **Step 3: Replace `bg-muted` / `bg-muted/50` containers**

Anywhere `className` contains `bg-muted` or `bg-muted/50` or `bg-muted rounded-lg p-4`:
- Remove the `bg-muted*` class.
- Add inline style:
  ```tsx
  style={{
    background: neuTheme.colors.bgLight,
    boxShadow: neuTheme.shadows.insetSm,
    borderRadius: neuTheme.radii.md,
  }}
  ```

- [ ] **Step 4: Replace `Card` components with Neu-styled div**

Every `<Card className="...">` inside this file: replace with `<div>` and add inline Neu styling:
```tsx
<div
  className="p-4"
  style={{
    background: neuTheme.colors.bg,
    boxShadow: neuTheme.shadows.raisedSm,
    borderRadius: neuTheme.radii.md,
  }}
>
```

Drop the `import { Card } from '@/components/ui/card'` if it becomes unused.

- [ ] **Step 5: Replace yellow coaching-tip card**

Find `bg-yellow-50 rounded border border-yellow-200`. Replace with:
```tsx
style={{
  background: neuTheme.colors.bg,
  boxShadow: neuTheme.shadows.insetSm,
  borderRadius: neuTheme.radii.sm,
  borderLeft: `3px solid ${neuTheme.colors.status.warning}`,
}}
```
Update the text color from `text-yellow-800` / `text-yellow-700` to `style={{ color: neuTheme.colors.text.body }}`.

- [ ] **Step 6: Replace the text input**

The bottom-of-page response `<input>` with `className="flex-1 px-4 py-2 rounded-lg border bg-background"`: replace with Neu inset:
```tsx
<input
  type="text"
  placeholder="Type your response (or speak)..."
  className="flex-1 px-4 py-2.5 font-satoshi text-sm border-none outline-none"
  style={{
    background: neuTheme.colors.bg,
    boxShadow: neuTheme.shadows.insetSm,
    borderRadius: neuTheme.radii.sm,
    color: neuTheme.colors.text.body,
  }}
  onKeyDown={...}
  disabled={isLoading}
/>
```

- [ ] **Step 7: Replace all `<Button>` with Neu-styled `<button>` at least on the call-action row**

For the Send and End Call buttons in the in-call view, convert to Neu:
```tsx
<button
  onClick={...}
  disabled={isLoading}
  className="px-4 py-2.5 font-satoshi text-sm font-medium border-none cursor-pointer"
  style={{
    background: neuTheme.colors.accent.primary,
    color: 'white',
    borderRadius: neuTheme.radii.sm,
    boxShadow: neuTheme.shadows.raisedSm,
    opacity: isLoading ? 0.5 : 1,
  }}
>
  Send
</button>
```
Keep existing functional behavior verbatim — only style changes.

- [ ] **Step 8: Same patterns applied to `sparring-session.tsx`**

Open `components/vbrick/sparring-session.tsx`. Apply the same Neu patterns:
- Add `import { neuTheme } from '@/lib/vbrick/theme'`.
- Replace `Card`, `bg-muted`, raw `Button`, gradient avatars with Neu equivalents from steps 2–7.

Do NOT touch the component's state machine or logic — styling only.

- [ ] **Step 9: Verify build**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add components/vbrick/framework-sparring-session.tsx components/vbrick/sparring-session.tsx
git commit -m "style(vbrick): Neu restyle pass on sparring components"
```

---

### Task 14: Rebuild sparring landing page with quick-start

**Files:**
- Modify: `app/vbrick/dashboard/sparring/page.tsx`

Replace the old landing (hero + persona grid + framework overview + accent tips) with the new quick-start flow. The persona-grid path gets tucked behind a "More scenarios →" button.

- [ ] **Step 1: Replace the entire file contents**

```tsx
/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState } from 'react'
import { Phone, Trophy, Dumbbell } from 'lucide-react'
import { FrameworkSparringSession } from '@/components/vbrick/framework-sparring-session'
import { SPARRING_SCENARIOS } from '@/lib/vbrick/sparring-scenarios'
import { type ProspectPersona } from '@/lib/vbrick/sparring-personas'
import { neuTheme } from '@/lib/vbrick/theme'

type SessionResult = {
  score: number
  frameworkScore: number
  wouldTransfer: boolean
  [key: string]: unknown
}

type Mode = 'quickstart' | 'browse' | 'active'

const QUICK_SCENARIO = SPARRING_SCENARIOS['bending-spoons-k26']

export default function SparringPage() {
  const [mode, setMode] = useState<Mode>('quickstart')
  const [scriptVisible, setScriptVisible] = useState(true)
  const [hardMode, setHardMode] = useState(false)
  const [lastResult, setLastResult] = useState<SessionResult | null>(null)
  const [lastPersonaName, setLastPersonaName] = useState<string | null>(null)

  function handleSessionComplete(result: SessionResult, persona: ProspectPersona) {
    setLastResult(result)
    setLastPersonaName(persona.name)
    setMode('quickstart')
  }

  if (mode === 'active') {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <FrameworkSparringSession
          onComplete={handleSessionComplete}
          onCancel={() => setMode('quickstart')}
          scenarioId={QUICK_SCENARIO.id}
          hardMode={hardMode}
        />
        {scriptVisible && !hardMode && <CheatCard scenario={QUICK_SCENARIO} />}
      </div>
    )
  }

  if (mode === 'browse') {
    // Browse mode: original persona grid (FrameworkSparringSession's own `select` state handles it)
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-4">
        <button
          onClick={() => setMode('quickstart')}
          className="font-satoshi text-sm border-none bg-transparent cursor-pointer"
          style={{ color: neuTheme.colors.text.muted }}
        >
          ← Back to quick start
        </button>
        <FrameworkSparringSession
          onComplete={handleSessionComplete}
          onCancel={() => setMode('quickstart')}
        />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      {/* Last result banner */}
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
              <p className="font-general-sans font-semibold text-base" style={{ color: neuTheme.colors.text.heading }}>
                {lastResult.score >= 80 ? 'Great call.' : lastResult.score >= 70 ? 'Solid.' : 'Keep reps going.'}
              </p>
              <p className="text-xs font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
                vs. {lastPersonaName} · Framework {lastResult.frameworkScore}%
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

      {/* Quick-start card */}
      <div
        className="p-8 relative"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
          borderRadius: neuTheme.radii.xl,
        }}
      >
        {/* More scenarios link, top-right */}
        <button
          onClick={() => setMode('browse')}
          className="absolute top-4 right-4 font-satoshi text-xs border-none bg-transparent cursor-pointer"
          style={{ color: neuTheme.colors.text.muted }}
        >
          More scenarios →
        </button>

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
            <p className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium" style={{ color: neuTheme.colors.accent.primary }}>
              This week's play
            </p>
            <h1 className="font-general-sans font-bold text-2xl tracking-tight" style={{ color: neuTheme.colors.text.heading }}>
              {QUICK_SCENARIO.title}
            </h1>
          </div>
        </div>

        <p className="font-satoshi text-sm mb-6" style={{ color: neuTheme.colors.text.muted }}>
          {QUICK_SCENARIO.subtitle} · ~{QUICK_SCENARIO.estimatedMinutes} minutes.
        </p>

        <button
          onClick={() => setMode('active')}
          className="flex items-center gap-2 px-6 py-3 font-satoshi font-medium text-base border-none cursor-pointer mb-6"
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

        {/* Mode toggles */}
        <div className="flex items-center gap-2">
          <TogglePill
            active={scriptVisible}
            onClick={() => setScriptVisible((v) => !v)}
            label="Script visible"
          />
          <TogglePill
            active={hardMode}
            onClick={() => setHardMode((v) => !v)}
            label="Hard mode"
          />
        </div>

        {/* Cheat-card preview when script visible */}
        {scriptVisible && !hardMode && (
          <div className="mt-6 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium" style={{ color: neuTheme.colors.text.muted }}>
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
                    <p className="font-satoshi text-sm font-medium" style={{ color: neuTheme.colors.text.heading }}>
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

function TogglePill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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

function CheatCard({ scenario }: { scenario: typeof QUICK_SCENARIO }) {
  return (
    <div
      className="fixed bottom-24 right-6 max-w-[320px] p-4 z-30"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raised,
        borderRadius: neuTheme.radii.md,
      }}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] font-satoshi font-medium mb-2" style={{ color: neuTheme.colors.accent.primary }}>
        Script
      </p>
      <ol className="space-y-2">
        {scenario.cheatCard.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="flex items-center justify-center shrink-0 font-bold text-[10px]"
              style={{
                width: 18,
                height: 18,
                borderRadius: '9999px',
                background: neuTheme.colors.accent.primary,
                color: 'white',
              }}
            >
              {i + 1}
            </span>
            <p className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.body }}>
              {step.label}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Preserved for typed import reference — not rendered directly
void Trophy
```

- [ ] **Step 2: Verify build**

Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 3: Manual smoke**

Run: `npm run dev`. Navigate to `/vbrick/dashboard/sparring`. Expect:
- Landing shows single "Bending Spoons Check-in + K26 Invite" card with Start Practice Call button.
- "Script visible" and "Hard mode" pills toggle independently.
- With Script visible + Hard mode off, the 3-step cheat card is shown on the landing.
- "More scenarios →" top-right routes to the original persona grid.
- Clicking Start Practice Call launches the FrameworkSparringSession with `scenarioId='bending-spoons-k26'`.

- [ ] **Step 4: Commit**

```bash
git add app/vbrick/dashboard/sparring/page.tsx
git commit -m "feat(vbrick): new sparring landing with Bending Spoons quick start + Hard mode"
```

---

## Phase 4 — Verify and ship

### Task 15: Full verification pass

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Smoke checklist**

Run `npm run dev` and click through:

- [ ] `/vbrick/dashboard` (home) — TopNav + content + MicFab render. No sidebar. Welcome + QuickStartTiles + PerformanceCards + Recent Debriefs + Leaderboard visible.
- [ ] `/vbrick/dashboard/stories` — TopNav persists, no local header, content renders.
- [ ] `/vbrick/dashboard/campaigns` — same.
- [ ] `/vbrick/dashboard/playbook` — same.
- [ ] `/vbrick/dashboard/settings` — same.
- [ ] `/vbrick/dashboard/ci` — same.
- [ ] `/vbrick/dashboard/sparring` — new quick-start landing; Start Practice Call works; Hard mode toggle flips cheat-card visibility on the landing.
- [ ] Click MicFab from any non-sparring page → routes to home and starts debrief flow.
- [ ] On `/vbrick/dashboard/sparring`, MicFab is hidden (per the pathname guard in MicFab).
- [ ] Sparring active session: send a message, wait for reply, send another. Conversation should continue for at least 4 turns without the input becoming disabled.
- [ ] TopNav user menu → Sign out returns to dashboard root with email gate.

If any smoke item fails, fix before committing the next phase.

- [ ] **Step 4: Commit if any smoke fixes**

```bash
git add -A
git commit -m "fix(vbrick): smoke-test fixes for nav + sparring"
```

---

### Task 16: Push to PR branch, update PR body, and offer merge

- [ ] **Step 1: Push commits**

```bash
git push origin restructure/vbrick-command-center
```

- [ ] **Step 2: Update PR #2 body with a changelog delta**

Run:
```bash
gh pr view 2 --json body -q '.body' > /tmp/pr2_body.md
```

Edit `/tmp/pr2_body.md` to append (or replace if the existing changelog is stale):

```markdown
## 2026-04-21 update

**Nav consolidation:**
- Deleted `components/vbrick/sidebar.tsx`; added persistent `TopNav` + floating `MicFab` via new `VbrickShell` mounted in dashboard layout.
- Recording state + identity lifted into `DashboardProvider`.
- Per-page headers stripped from stories, campaigns, playbook, settings, ci, sparring.

**Sparring:**
- New scenario primitive `lib/vbrick/sparring-scenarios.ts` with `bending-spoons-k26`.
- API `/api/vbrick/framework-spar` accepts optional `scenarioId` + `hardMode`.
- Sparring landing is one-click quick start with `Script visible` / `Hard mode` toggles; old persona grid lives behind "More scenarios →".
- Conversation loop hardened: input no longer gated on audio playback, bot text renders immediately, autoplay rejections caught, full 40-turn history sent.
- Neu restyle on `framework-sparring-session.tsx` and `sparring-session.tsx`.
```

Then:
```bash
gh pr edit 2 --body-file /tmp/pr2_body.md
```

- [ ] **Step 3: Stop and ask user**

**DO NOT merge to main automatically.** Ask:

> "All commits pushed to PR #2 (preview deploy triggered). Smoke tests green locally. Ready to merge to main for prod deploy? Confirm with 'merge' or review the preview first."

Wait for confirmation.

- [ ] **Step 4 (on confirmation): Merge**

```bash
gh pr merge 2 --squash --delete-branch=false
```

Do NOT pass `--admin` or bypass checks. If checks fail, stop and ask.

Expected result: PR #2 merged to `main`, Vercel auto-deploys to `vbrick.streetnotes.ai`.

- [ ] **Step 5: Post-merge verification**

After Vercel deploy finishes (~2 min), ask the user to spot-check `https://vbrick.streetnotes.ai/dashboard` and `/dashboard/sparring` in production.

---

## Self-Review Checklist (run after plan is complete)

**1. Spec coverage:**
- [x] Sparring Neu restyle → Task 13
- [x] Conversation loop fixes (4 changes) → Task 12
- [x] Scenario primitive + bending-spoons-k26 → Tasks 9, 10
- [x] API scenarioId + hardMode → Task 11
- [x] Quick-start landing with Script/Hard toggles → Task 14
- [x] "More scenarios →" link → Task 14
- [x] Cheat card in-call → Task 14 (`CheatCard` component)
- [x] TopNav + MicFab + VbrickShell → Tasks 2–4
- [x] Recording + identity lifted to provider → Task 1
- [x] Per-page header removal × 6 → Tasks 6, 7
- [x] Sidebar deleted → Task 8
- [x] Dashboard home reflow full-width → Task 5
- [x] Mobile responsive TopNav → Task 2 (md: breakpoint)
- [x] Email-gate redirect for sub-routes without email → Task 4 (VbrickShell `useEffect`)
- [x] MicFab hidden on sparring routes to avoid audio conflict → Task 3 (pathname guard)

**2. Placeholder scan:** No "TBD", no "implement later", no hand-wavy error handling. Every new file ships full content.

**3. Type consistency:**
- `useDashboard` return shape used consistently across TopNav, MicFab, VbrickShell, dashboard page.
- `scenarioId`/`hardMode` props threaded through FrameworkSparringSession consistently.
- `PersonaId` union extended in one place (Task 9), referenced everywhere by type.

No gaps found.
