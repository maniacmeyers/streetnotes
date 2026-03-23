# Vbrick Command Center Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an ultra-modern sports performance dashboard for Vbrick BDRs with daily intention screen, player card with aggressive mic button, call queue with CSV import, head-to-head leaderboard, animated stat bars with ghost mechanic, and session reporting with CSV/PDF export.

**Architecture:** Next.js 14 App Router with Supabase backend. All new UI lives under `app/vbrick/dashboard/` and `components/vbrick/`. API routes under `app/api/vbrick/`. Glassmorphism dark UI with `framer-motion` animations and Fira Code for data. Desktop-first (mobile is a separate future design). All work on the existing `vbrick` git branch.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (PostgreSQL), framer-motion (already installed as `motion`), Lucide React (icons), Fira Code + Inter (fonts), @react-pdf/renderer (session PDF)

**Design System:** `design-system/vbrick-command-center/MASTER.md` (global rules) + `pages/dashboard.md` (dashboard overrides)

**Design Doc:** `docs/plans/2026-03-23-vbrick-dashboard-design.md`

---

## Pre-Implementation Setup

### Step 1: Install dependencies

```bash
npm install lucide-react
```

(`motion`, `@react-pdf/renderer`, `react-icons` already installed)

### Step 2: Add Fira Code font

Modify `app/layout.tsx` to include Fira Code via `next/font/google` alongside existing fonts. Export it for use in Vbrick dashboard components. Alternatively, add to `app/vbrick/dashboard/layout.tsx` only since Fira Code is Vbrick-specific.

### Step 3: Commit

```bash
git add -A && git commit -m "chore: add lucide-react and Fira Code font setup"
```

---

## Wave 1: Database Migration

### Task 1: Create Supabase migration for dashboard tables

**Files:**
- Create: `supabase/migrations/004_vbrick_dashboard.sql`

**Implementation:**

```sql
-- Vbrick Daily Intentions
CREATE TABLE vbrick_daily_intentions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  know_answer text NOT NULL,
  feel_answer text NOT NULL,
  do_answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(bdr_email, date)
);

-- Vbrick Calling Sessions
CREATE TABLE vbrick_calling_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  total_calls int DEFAULT 0,
  connected_count int DEFAULT 0,
  appointments_count int DEFAULT 0,
  average_spin decimal(4,1) DEFAULT 0,
  best_spin decimal(4,1) DEFAULT 0,
  csv_imported boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Vbrick Call Queue
CREATE TABLE vbrick_call_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES vbrick_calling_sessions(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_title text,
  company text NOT NULL,
  phone text,
  salesforce_notes text,
  queue_position int NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  debrief_session_id uuid REFERENCES debrief_sessions(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Vbrick BDR Weekly Stats
CREATE TABLE vbrick_bdr_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email text NOT NULL,
  week_start_date date NOT NULL,
  total_calls int DEFAULT 0,
  connected_calls int DEFAULT 0,
  appointments_booked int DEFAULT 0,
  call_to_conversation_rate decimal(5,2) DEFAULT 0,
  conversation_to_appointment_rate decimal(5,2) DEFAULT 0,
  average_spin decimal(4,1) DEFAULT 0,
  best_spin decimal(4,1) DEFAULT 0,
  best_spin_contact text,
  streak_days int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bdr_email, week_start_date)
);

-- Indexes
CREATE INDEX idx_vbrick_intentions_email_date ON vbrick_daily_intentions(bdr_email, date);
CREATE INDEX idx_vbrick_sessions_email ON vbrick_calling_sessions(bdr_email);
CREATE INDEX idx_vbrick_queue_session ON vbrick_call_queue(session_id);
CREATE INDEX idx_vbrick_stats_email_week ON vbrick_bdr_stats(bdr_email, week_start_date);
```

**Step:** Apply this migration in the Supabase SQL Editor.

**Commit:**
```bash
git add supabase/migrations/004_vbrick_dashboard.sql
git commit -m "feat(vbrick): add dashboard database tables — intentions, sessions, queue, stats"
```

---

## Wave 2: Shared UI Primitives

### Task 2: Aurora background + noise grain + luminous divider

**Files:**
- Create: `components/vbrick/aurora-background.tsx`
- Create: `components/vbrick/luminous-divider.tsx`

Build the three-layer background system from MASTER.md:
1. Aurora mesh gradient with 20s drift animation (CSS `::before` pseudo or a positioned div)
2. Noise grain overlay at 0.015 opacity (use a base64 SVG noise pattern)
3. Luminous divider: horizontal gradient line (transparent → cyan 20% → transparent)

These are purely visual primitives. No data, no state. Just CSS/Tailwind + motion.

**Commit:**
```bash
git commit -m "feat(vbrick): add aurora background, noise grain, and luminous dividers"
```

### Task 3: Glass card components

**Files:**
- Create: `components/vbrick/glass-card.tsx`

Two variants from MASTER.md:
1. `GlassCard` — standard: `backdrop-filter: blur(12px) saturate(150%)`, `bg-white/[0.03]`, `border rgba(255,255,255,0.08)`
2. `GlassCardElevated` — elevated: `blur(16px) saturate(160%)`, `bg-white/[0.06]`, `border rgba(255,255,255,0.12)`

Both support: `className` prop for overrides, hover lift animation (translateY -2px, border brightens to cyan/20), `children`, optional `title` (small uppercase cyan tracked text with luminous divider below).

Use `motion.div` from `motion/react` for the hover animation.

**Commit:**
```bash
git commit -m "feat(vbrick): add glassmorphism card components"
```

### Task 4: Animated stat bar with ghost mechanic

**Files:**
- Create: `components/vbrick/stat-bar.tsx`

Props: `value` (current, 0-100 or 0-10), `ghostValue` (last week), `max` (scale), `personalBest` (optional marker), `label`, `detail` (e.g., "14 of 23 calls"), `size` ("normal" | "prominent")

Implementation:
- Track: `h-2 bg-white/10 rounded-full` (prominent: `h-3`)
- Ghost bar: `bg-white/[0.06]`, width = ghostValue %, no animation
- Fill bar: `bg-[#7ed4f7]` with `box-shadow: 0 0 8px cyan glow`, animated width via `motion.div` with `initial={{ width: 0 }}` and `animate={{ width: pct }}` over 1.5s ease-out
- When value > ghostValue: fill becomes `bg-[#22C55E]` (green)
- Personal best marker: small circle on the track, pulses when value approaches (within 10%)
- Value display: Fira Code bold number to the right of the bar, uses score color scale (red/amber/cyan/green)

**Commit:**
```bash
git commit -m "feat(vbrick): add animated stat bar with ghost mechanic"
```

### Task 5: Count-up number component

**Files:**
- Create: `components/vbrick/count-up.tsx`

Props: `value` (number), `decimals` (0 or 1), `suffix` (e.g., "%"), `duration` (default 1000ms), `className`

Uses `motion`'s `useSpring` and `useMotionValue` to animate from 0 to target value with spring physics. Renders in Fira Code.

**Commit:**
```bash
git commit -m "feat(vbrick): add count-up number animation component"
```

### Task 6: Score color utility + badge component

**Files:**
- Create: `lib/vbrick/colors.ts`
- Create: `components/vbrick/badge.tsx`

`scoreColor(score: number)`: returns hex color based on 0-3 red, 4-6 amber, 7-8 cyan, 9-10 green.

`Badge` component: small pill with variants (cyan, green, amber, red, gray). Props: `variant`, `children`.

Disposition dot component: small colored circle for call disposition (connected=cyan, voicemail=amber, no-answer=gray, gatekeeper=blue).

**Commit:**
```bash
git commit -m "feat(vbrick): add score colors, badge, and disposition dot components"
```

---

## Wave 3: Daily Intention Screen

### Task 7: Intentions API route

**Files:**
- Create: `app/api/vbrick/intentions/route.ts`

**GET:** Fetch today's intention for the given email. Also fetch yesterday's answers for pre-population.
- Query param: `email`
- Returns: `{ today: IntentionRow | null, previous: IntentionRow | null }`

**POST:** Save today's intention answers.
- Body: `{ email, know_answer, feel_answer, do_answer }`
- Upserts into `vbrick_daily_intentions` (unique on email + date)
- Returns: `{ success: true }`

**Commit:**
```bash
git commit -m "feat(vbrick): add daily intentions API route"
```

### Task 8: Intention screen component

**Files:**
- Create: `components/vbrick/intention-screen.tsx`

Full-screen overlay. Dark navy (#061222) background.

Layout:
1. Mantra text top center: "HOW YOU DO ANYTHING IS HOW YOU DO EVERYTHING" — small uppercase tracked cyan
2. Three glass cards stacked vertically, each with:
   - Question text in white bold
   - Text input (dark theme input from MASTER.md) pre-populated with previous answers as placeholder
3. "I'M READY" button at bottom — cyan fill, disabled until all three fields have content
4. On submit: POST to `/api/vbrick/intentions`, then call `onComplete` callback

Props: `email: string`, `onComplete: () => void`

Use `motion` for staggered card entrance animation.

**Commit:**
```bash
git commit -m "feat(vbrick): add daily intention screen component"
```

---

## Wave 4: Dashboard Layout + Sidebar

### Task 9: Dashboard layout (two-column)

**Files:**
- Create: `app/vbrick/dashboard/layout.tsx`
- Create: `app/vbrick/dashboard/page.tsx`

Layout:
- Full viewport height, no scroll on body
- Left: fixed sidebar div, 320px wide, `bg-[#0d1e3a]`, `border-r border-white/10`, full height
- Right: `ml-[320px]`, `overflow-y-auto`, `h-screen`, aurora background
- Noise grain overlay on the entire layout

The page component is the orchestrator. It manages:
- Whether to show intention screen (check cookie/localStorage for today's date)
- Current dashboard state (idle, recording, session active)
- Data fetching for stats, queue, recent calls

Add `/vbrick/dashboard` to the public routes in middleware if needed (or keep under /vbrick which is already public).

**Commit:**
```bash
git commit -m "feat(vbrick): add two-column dashboard layout"
```

### Task 10: Player card component

**Files:**
- Create: `components/vbrick/player-card.tsx`

Props: `name`, `title`, `streak`, `todayCalls`, `spinAvg`

Elevated glass card with cyan left border. Renders:
- Name in `font-black text-2xl uppercase tracking-wide`
- "BDR — Vbrick" in gray-400
- Luminous divider
- Three stat blocks side by side: streak (Lucide `Flame` icon + count), today's calls, SPIN avg
- Streak icon: cyan when active (streak > 0), gray when broken
- SPIN avg colored by score color scale
- All numbers in Fira Code

**Commit:**
```bash
git commit -m "feat(vbrick): add player card component"
```

### Task 11: Mic button component

**Files:**
- Create: `components/vbrick/mic-button.tsx`

Large circular button (120px). Two states:

**Resting:** Cyan fill, Lucide `Mic` icon (dark color on cyan), aggressive pulse animation (1.2s heartbeat), intense cyan glow box-shadow, hover scales to 1.05 with increased glow. "DEBRIEF" label below.

**Recording:** Red fill, red glow, faster pulse (0.8s), Lucide `Square` (stop) icon, timer counting up below.

Props: `isRecording`, `durationSec`, `onStart`, `onStop`, `disabled`

Use CSS keyframes for the pulse (from MASTER.md spec). Respect `prefers-reduced-motion`.

**Commit:**
```bash
git commit -m "feat(vbrick): add aggressive mic button with glow and pulse"
```

### Task 12: Sidebar assembly

**Files:**
- Create: `components/vbrick/sidebar.tsx`

Assembles the left sidebar:
1. Header: "VBRICK COMMAND CENTER" + "Powered by StreetNotes.ai"
2. Player card
3. Mic button
4. Bottom: Settings gear (Lucide `Settings` icon) + mantra text

Props: stats data, recording state, onMicStart, onMicStop, onSettingsClick

The sidebar has two visual states:
- **Default:** Full player card + mic
- **Recording:** Compressed player card (name + today only) + queue contact info (if loaded) + recording mic + timer + coaching prompts

**Commit:**
```bash
git commit -m "feat(vbrick): assemble sidebar with player card, mic, and settings"
```

---

## Wave 5: Gamification Components

### Task 13: Stats aggregation utility

**Files:**
- Create: `lib/vbrick/stats.ts`

Functions:
- `getWeekStart(date: Date)`: returns Monday of the week
- `calculateConversionRate(numerator, denominator)`: safe division, returns 0-100
- `calculateStreakDays(email, supabase)`: queries debrief_sessions to count consecutive days with at least one debrief
- `getWeeklyStats(email, supabase)`: fetches or computes current week stats from debrief_sessions data (total calls, connected, appointments, SPIN averages)
- `getLastWeekStats(email, supabase)`: same for previous week (ghost bar data)
- `getPersonalBests(email, supabase)`: all-time best SPIN, best conversion rates
- `updateWeeklyStats(email, supabase)`: recalculates and upserts current week row in vbrick_bdr_stats

**Commit:**
```bash
git commit -m "feat(vbrick): add stats aggregation and streak calculation utilities"
```

### Task 14: Stats API route

**Files:**
- Create: `app/api/vbrick/stats/route.ts`

**GET:** Returns dashboard data for a BDR.
- Query param: `email`
- Returns: `{ thisWeek, lastWeek, personalBests, streak, todayCalls, allBdrs[] }`
- `allBdrs` includes stats for both BDRs (for leaderboard)
- Calls the utility functions from `lib/vbrick/stats.ts`

**POST:** Triggers a stats recalculation (called after each debrief completes).
- Body: `{ email }`
- Recalculates and saves updated stats

**Commit:**
```bash
git commit -m "feat(vbrick): add stats API route for dashboard data"
```

### Task 15: Head-to-head leaderboard component

**Files:**
- Create: `components/vbrick/leaderboard.tsx`

Props: `players: Array<{ name, convRate, apptRate, spinAvg, convTrend, apptTrend, spinTrend }>`

Layout: Wide glass card. Two player blocks side-by-side with "VS" in large cyan text between them. Each block shows three KPI rows with:
- Label (Inter, small uppercase)
- Value (Fira Code, bold, large)
- Trend arrow: ↑ green, ↓ red, ─ gray (compared to last week)
- Leading value on each KPI gets subtle cyan glow

Use `motion` for staggered entrance animation (80ms between cards).

**Commit:**
```bash
git commit -m "feat(vbrick): add head-to-head leaderboard component"
```

### Task 16: Personal performance cards (stat bars)

**Files:**
- Create: `components/vbrick/performance-cards.tsx`

Two glass cards side by side using the `StatBar` component from Task 4.

**Left card — "CALL PERFORMANCE":**
- SPIN Composite (prominent size, scale 0-10)
- Best Call This Week (normal size, scale 0-10)
- PB marker on SPIN bar

**Right card — "CONVERSION RATES":**
- Call → Conversation (scale 0-100%)
- Conversation → Appointment (scale 0-100%)
- Raw counts below each bar

Both cards show ghost bars from last week's data.

"Week resets Monday" text at bottom.

**Commit:**
```bash
git commit -m "feat(vbrick): add performance stat bar cards with ghost mechanic"
```

### Task 17: Recent calls list component

**Files:**
- Create: `components/vbrick/recent-calls.tsx`

Props: `calls: Array<{ contactName, company, disposition, prospectStatus, spinScore, timestamp, debriefSessionId }>`

Renders last 5 calls as horizontal row cards. Each row:
- Disposition dot (colored circle)
- Contact + Company (white bold)
- Prospect status badge
- SPIN score (Fira Code, colored) or dash
- Relative timestamp ("2h ago")

New entries animate in from top using `motion` `AnimatePresence`.

**Commit:**
```bash
git commit -m "feat(vbrick): add recent calls list component"
```

---

## Wave 6: Call Queue + CSV Import

### Task 18: CSV parser utility

**Files:**
- Create: `lib/vbrick/csv-parser.ts`

Functions:
- `parseCallListCSV(csvText: string, columnMapping: ColumnMapping)`: parses CSV text, maps columns to contact fields (name, title, company, phone, notes). Returns array of queue contacts. Handles: extra columns (ignore), missing optional columns, various CSV dialects (quoted fields, commas in values).
- `generateActivityCSV(calls: SessionCall[], columnMapping: ColumnMapping)`: generates CSV string from session data for Salesforce import.
- Default column mappings stored in `lib/vbrick/config.ts`.

**Commit:**
```bash
git commit -m "feat(vbrick): add CSV import/export parser utilities"
```

### Task 19: Queue API routes

**Files:**
- Create: `app/api/vbrick/session/route.ts`
- Create: `app/api/vbrick/queue/route.ts`

**Session route:**
- **POST** — Create new calling session. Body: `{ email, contacts?: QueueContact[] }`. If contacts provided (CSV was imported), creates session + inserts queue rows. Returns `{ sessionId }`.
- **PATCH** — End session. Body: `{ sessionId }`. Sets `ended_at`, calculates final stats. Returns session summary.
- **GET** — Get active session for email. Returns session + queue data.

**Queue route:**
- **PATCH** — Update queue item status. Body: `{ queueItemId, status, debriefSessionId? }`. Updates status to completed/skipped, links debrief if provided.
- **POST** `/api/vbrick/queue/advance` — Advance to next contact. Returns the new "Up Next" item.

**Commit:**
```bash
git commit -m "feat(vbrick): add session and queue management API routes"
```

### Task 20: Call queue component

**Files:**
- Create: `components/vbrick/call-queue.tsx`
- Create: `components/vbrick/csv-import-zone.tsx`

**CsvImportZone:** Drag-and-drop zone for CSV file. Parses on drop, calls onImport with contact array. Reuse patterns from existing `file-drop-zone.tsx` but simplified for CSV only.

**CallQueue:** Two states:
- **No session:** Shows CsvImportZone + recent calls below
- **Active session:** Queue header with progress bar, "Up Next" elevated card (name, title, company, phone as `tel:` link, notes, skip button), completed calls, remaining queue (dimmed, clickable to jump)

Props: `session`, `queue`, `recentCalls`, `onImport`, `onSkip`, `onJumpTo`, `onEndSession`

**Commit:**
```bash
git commit -m "feat(vbrick): add call queue and CSV import components"
```

---

## Wave 7: Recording Integration

### Task 21: Dashboard recording flow

**Files:**
- Modify: `components/vbrick/sidebar.tsx` — add recording state transitions
- Create: `components/vbrick/dashboard-debrief-flow.tsx`

When the BDR hits the mic:
1. Sidebar transitions to recording mode (compressed player card, "Up Next" contact info if queue loaded, recording mic, timer, coaching prompts)
2. Right content area dims (overlay with `bg-black/30`)
3. Recording uses existing `useVoiceRecorder` hook
4. After recording stops: transcript review appears in the right content area (reusing existing `TranscriptReview` component)
5. After confirmation: send to `/api/debrief/structure` with the queue contact info injected into the prompt context
6. Results display with existing SPIN stat card, Truth, CRM fields, AE Briefing
7. "Download PDF" + "Next Call" buttons
8. "Next Call" dismisses results, advances queue, triggers stat recalculation, returns to dashboard

The key integration point: if a queue is active, the current "Up Next" contact's name/title/company are passed to the structure API so the AI has pre-filled context.

**Modify:** `app/api/debrief/structure/route.ts` — accept optional `contactContext: { name, title, company }` in the POST body. When present, prepend to the transcript: "BDR is calling [name], [title] at [company]."

**After debrief completes:**
- Mark queue item as completed, link debrief_session_id
- POST to `/api/vbrick/stats` to recalculate
- Dashboard re-fetches stats (stat bars animate to new values)

**Commit:**
```bash
git commit -m "feat(vbrick): integrate recording flow with dashboard and call queue"
```

---

## Wave 8: Session Report + Export

### Task 22: Session report component

**Files:**
- Create: `components/vbrick/session-report.tsx`

Shown when BDR clicks "END SESSION — GENERATE REPORT."

Elevated glass card with staggered stat reveals:
- Session duration (computed from started_at to now)
- Total calls (count-up animation)
- Connected / call-to-conversation rate (count-up)
- Appointments / conversation-to-appointment rate (count-up)
- Average SPIN (count-up)
- Best SPIN + contact name (highlighted green if PB)
- Call breakdown list below

Two buttons: "DOWNLOAD CSV" + "DOWNLOAD PDF"

Props: `session`, `calls`, `onClose`

**Commit:**
```bash
git commit -m "feat(vbrick): add session report component with count-up reveals"
```

### Task 23: CSV export API route

**Files:**
- Create: `app/api/vbrick/export/csv/route.ts`

**GET:** `?sessionId=xxx`
- Fetches all completed queue items for the session with their linked debrief data
- Uses `generateActivityCSV()` from csv-parser utility
- Returns CSV file as download (`Content-Type: text/csv`, `Content-Disposition: attachment`)

**Commit:**
```bash
git commit -m "feat(vbrick): add session CSV export endpoint"
```

### Task 24: Session PDF report

**Files:**
- Create: `lib/vbrick/session-pdf.tsx`
- Create: `app/api/vbrick/export/pdf/route.ts`

Session PDF using `@react-pdf/renderer` with Vbrick branding (same navy/cyan palette as existing per-call PDF):
- **Cover page:** "Vbrick Command Center — Session Report" + date + BDR name + summary stats (total calls, conversion rates, SPIN avg, best SPIN)
- **Per-call pages:** One page per completed debrief with full details (reuse layout from existing `VbrickBDRDebriefPDF` but simplified)
- **Footer:** "Confidential — Vbrick Internal" + page numbers

API route: GET `?sessionId=xxx`, generates and returns PDF.

**Commit:**
```bash
git commit -m "feat(vbrick): add branded session PDF report"
```

---

## Wave 9: Settings + Polish

### Task 25: Settings page

**Files:**
- Create: `app/vbrick/dashboard/settings/page.tsx`
- Create: `components/vbrick/settings-form.tsx`

Simple page accessible from gear icon. Sections:
1. **Profile:** Name, email (read-only for Vbrick users), display name for player card
2. **CSV Import Mapping:** Five field mappings (Name, Title, Company, Phone, Notes) → CSV column header text inputs. Saved to localStorage.
3. **CSV Export Mapping:** Column name overrides for Salesforce import. Saved to localStorage.
4. **Session History:** List of past sessions with date, call count, stats. Links to re-download CSV/PDF.

Settings stored in localStorage (no backend needed — two users, simple config).

**Commit:**
```bash
git commit -m "feat(vbrick): add settings page with CSV mapping and session history"
```

### Task 26: Landing page redirect update

**Files:**
- Modify: `app/vbrick/page.tsx`

Update the return-visit redirect: instead of redirecting to `/debrief`, redirect to `/vbrick/dashboard`. First-time CRO pitch page stays the same. Cookie `vbrick_visited` now sends them to the dashboard.

Also update: the dashboard should detect if the user hasn't gone through the email gate yet. Use localStorage to persist the authenticated email. If no email stored, show a minimal email gate before the dashboard loads.

**Commit:**
```bash
git commit -m "feat(vbrick): redirect returning users to dashboard, add email persistence"
```

### Task 27: Dashboard page orchestration

**Files:**
- Modify: `app/vbrick/dashboard/page.tsx`

Wire everything together. The page component:
1. Checks localStorage for email — if none, shows email gate
2. Checks localStorage for today's intention — if none, shows IntentionScreen
3. Fetches stats from `/api/vbrick/stats?email=xxx`
4. Fetches active session from `/api/vbrick/session?email=xxx`
5. Renders sidebar (left) + content area (right)
6. Content area renders: call queue/import → leaderboard → performance cards → recent calls
7. Handles recording flow state transitions
8. After each debrief: re-fetches stats, updates UI

Use React state + SWR or simple `useEffect` fetching for data. Keep it straightforward — two users, no complex caching needed.

**Commit:**
```bash
git commit -m "feat(vbrick): wire up dashboard page orchestration"
```

### Task 28: Visual polish pass

**Files:**
- All `components/vbrick/*.tsx` files

Final polish:
- Verify all cards use glassmorphism from design system
- Verify aurora background renders correctly
- Verify noise grain overlay is subtle (0.015 opacity)
- Verify luminous dividers replace all solid borders
- Verify all numbers use Fira Code
- Verify all labels use uppercase tracked Inter
- Verify stat bar animations fire on load (1.5s) and on update (500ms)
- Verify count-up animations use spring physics
- Verify mic button pulse is aggressive (1.2s interval)
- Verify hover states on all interactive elements (200ms ease-out)
- Verify staggered card entrance on page load (80ms apart)
- Verify `prefers-reduced-motion` disables pulse and reduces transitions
- Test at 1280px, 1440px, 1920px viewport widths
- Run through pre-delivery checklist from MASTER.md

**Commit:**
```bash
git commit -m "feat(vbrick): visual polish pass — glassmorphism, animations, accessibility"
```

### Task 29: Build verification + deploy

```bash
npm run build
npm run lint
```

Fix any TypeScript or lint errors. Push to `vbrick` branch. Verify Vercel deploys to `vbrick.streetnotes.ai`.

**Commit:**
```bash
git commit -m "chore(vbrick): build verification and cleanup"
git push origin vbrick
```

---

## Task Dependency Graph

```
Wave 1: [Task 1: DB Migration]
              ↓
Wave 2: [Task 2-6: UI Primitives] (parallel)
              ↓
Wave 3: [Task 7-8: Intentions] ──────────────────────┐
              ↓                                        │
Wave 4: [Task 9-12: Layout + Sidebar]                 │
              ↓                                        │
Wave 5: [Task 13-17: Gamification] (parallel)         │
              ↓                                        │
Wave 6: [Task 18-20: Call Queue + CSV]                │
              ↓                                        │
Wave 7: [Task 21: Recording Integration]              │
              ↓                                        │
Wave 8: [Task 22-24: Session Report + Export]         │
              ↓                                        │
Wave 9: [Task 25-29: Settings + Polish + Deploy] ←────┘
```

**Parallelizable within waves:**
- Wave 2: Tasks 2-6 are independent UI primitives
- Wave 5: Tasks 13-17 are independent (stats util → API first, then components in parallel)
- Wave 8: Tasks 22-24 are independent exports

---

## Key Files Reference

| Existing File | Reuse For |
|---|---|
| `hooks/use-voice-recorder.ts` | Recording audio in dashboard mic |
| `hooks/use-audio-analyser.ts` | Waveform during recording |
| `components/debrief/transcript-review.tsx` | Transcript editing after recording |
| `components/debrief/processing-steps.tsx` | Processing animation |
| `components/debrief/results-display.tsx` | BDR results with SPIN card |
| `components/debrief/spin-stat-card.tsx` | SPIN scoring display |
| `lib/debrief/prompts.ts` | VBRICK_BDR_SYSTEM_PROMPT |
| `lib/debrief/pdf.tsx` | VbrickBDRDebriefPDF for per-call PDFs |
| `lib/vbrick/config.ts` | Vbrick brand config, email validation |
| `app/api/debrief/structure/route.ts` | AI extraction endpoint (modify to accept contact context) |
