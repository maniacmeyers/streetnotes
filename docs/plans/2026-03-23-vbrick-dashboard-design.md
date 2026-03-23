# Vbrick Command Center — Dashboard Design

**Date:** 2026-03-23
**Branch:** `vbrick`
**URL:** `vbrick.streetnotes.ai`
**Product Name:** Vbrick Command Center

---

## Strategic Context

Jeff coaches two Vbrick BDRs (ex-pro rugby players, brand new to sales). The CRO who hired Jeff is also ex-rugby. VBRICK is StreetNotes' first enterprise deployment — the proof of concept for every enterprise deal after this. The dashboard must feel like a premium sports performance tool, not a lead magnet flow.

### Coaching Philosophy (embedded throughout)

**Mantra:** "How you do anything is how you do everything."

**Core belief:** The BDR's goal is NOT to generate appointments. The goal is to have a conversation and uncover the truth of whether there's an opportunity for Vbrick to help — now or in the future. Sales is not complicated. Be ethical. Always have the prospect's best interest at heart. Always go for the truth.

**Pre-call ritual — three questions answered every session:**
1. "What do I want this person to know?" → I am a representative of Vbrick and I genuinely offer my assistance should you ever need it.
2. "What do I want this person to feel?" → That I am trustworthy, ethical, and genuinely have their best interest. A fiduciary for sales.
3. "What do I want this person to do?" → Trust me enough to tell me the truth.

### KPIs (gamification + competition)

**Primary KPIs (tracked and gamified):**
- Call-to-conversation conversion rate (of calls made, how many became conversations)
- Conversation-to-appointment conversion rate (of conversations, how many resulted in booked AE meetings)
- SPIN composite score (questioning technique quality on connected calls)

**Tracked but NOT gamified:**
- Connect rate (BDR has zero control over this)
- Total call volume (activity for activity's sake is not the goal)

### Gamification Layers
- **Streaks:** Daily debrief consistency — builds the habit
- **Personal progression:** SPIN scores trending, conversion rates improving, personal bests — competing against themselves
- **Head-to-head:** BDR vs BDR on the three primary KPIs — competitive fire between two ex-athletes

---

## Device Strategy

**Desktop (this design):** Primary experience. BDRs sit at laptops making calls all day. Full dashboard, call queue, rich data visualization.

**Mobile (separate design, future):** Completely different experience. If user accesses vbrick.streetnotes.ai from phone, they get a mobile-optimized field tool. Not a responsive version of desktop — a distinct mobile design.

---

## Visual Direction

**Ultra-modern sports performance dashboard.** Designed to look like it came from a top-tier global design firm. Glassmorphism cards with frosted glass depth. Subtle aurora mesh gradient background. Aggressive data visualization with dopamine-inducing micro-rewards. Every interaction should feel premium and trigger engagement.

**Three visual layers creating depth:**
1. **Deep Layer:** Dark navy (#061222) with slow-moving aurora mesh gradient (faint cyan/navy, 20s animation loop). Subtle noise grain overlay (opacity 0.015) for organic warmth.
2. **Glass Layer:** Dark glassmorphism on all cards. `backdrop-filter: blur(12-16px) saturate(150-160%)`. Translucent `bg-white/[0.03]` to `bg-white/[0.06]`. Thin luminous borders (`rgba(255,255,255,0.08)`). Creates layered depth.
3. **Accent Layer:** Cyan glow effects on active elements. Glow intensifies on interaction, settles after. The "energy" layer.

**Dopamine design triggers:**
- Stat bars animate from 0 on load with glowing leading edge
- Ghost bar overtake flashes cyan → green with glow burst
- Personal best breaks trigger shimmer effect + pulsing green glow
- Streak milestones (5, 10, 15, 30) trigger flame icon celebration
- Count-up animations on all numbers using spring physics
- Staggered reveal on page load (cards appear one by one, 80ms apart)
- Session report stats appear sequentially with individual count-ups

**Luminous accent lines** replace solid borders — gradient dividers that fade from transparent to cyan and back. Premium feel without hard edges.

**Palette:** Vbrick navy/cyan (existing)
- Dark navy background: #061222
- Soft navy panels: #0d1e3a (sidebar solid), cards use glassmorphism
- Accent cyan: #7ed4f7
- White text on dark
- Score colors: red (0-3), amber (4-6), cyan (7-8), green (9-10/personal best)

**Fonts:**
- **Inter** — all UI text, headings, labels (weight 300-900)
- **Fira Code** — all numbers, scores, percentages, timers (monospace precision)

**Full design system specs:** `design-system/vbrick-command-center/MASTER.md` + `pages/dashboard.md`

---

## Screen 1: Daily Intention

Shown once per day — first time the BDR opens the app. Subsequent visits that day go straight to the dashboard.

### Layout

Full-screen dark navy (#061222) with subtle gradient to slightly lighter navy at bottom. No clutter. Pure focus.

**Top center:** Mantra in small uppercase tracked-out text, Vbrick cyan:
> HOW YOU DO ANYTHING IS HOW YOU DO EVERYTHING

**Three cards stacked vertically, centered on screen.** Each card is a dark glass panel (#0d1e3a, thin white/10 border). Each has:
- The question in white bold text
- A text input field below where the BDR types their answer
- Pre-populated with their previous day's answers in gray placeholder text
- They can accept as-is or edit — either way they're reading and consciously committing

**Card 1:** "What do I want this person to know?"
**Card 2:** "What do I want this person to feel?"
**Card 3:** "What do I want this person to do?"

**Bottom center:** Button in Vbrick cyan — "I'M READY" — transitions to dashboard.

**Tracking:** Cookie or session-based. First open per calendar day triggers this screen. Answers stored in `vbrick_daily_intentions` table.

---

## Screen 2: Dashboard

Two-column layout. Left sidebar fixed, right content area scrollable.

### Left Sidebar (Fixed — ~320px, Full Viewport Height)

Dark navy background (#0d1e3a). Subtle border-right in white/10. Never scrolls.

**Header (top):**
- "VBRICK COMMAND CENTER" — small uppercase tracked text, white
- "Powered by StreetNotes.ai" — gray-500, below

**Player Card:**
Styled like a rugby performance card. Dark glass panel with thin cyan border on the left edge.
- BDR's first name in large bold white text (e.g., "JAKE")
- Title underneath in gray-400: "BDR — Vbrick"
- Subtle horizontal divider

**Quick Stats Row (three compact stat blocks, side by side):**
- Streak: flame icon + number + "days" (cyan when active, gray when broken)
- Today: number of calls debriefed today (e.g., "6 calls")
- SPIN Avg: this week's composite score with color indicator

**The Mic:**
Below the stats. Large circular button, 100-120px diameter.
- **Resting state:** Bright cyan (#7ed4f7) fill. Hard drop shadow with cyan glow (stadium lights effect). Sharp rhythmic pulse animation — like a heartbeat on a sports monitor. Fast. Alive.
- **Hover:** Glow intensifies, button scales up slightly.
- **Label:** "DEBRIEF" in bold uppercase below the button.

The mic should feel like a "GO" button on a starting line.

**Bottom of Sidebar:**
- Small gear icon → Settings (CSV format config, profile)
- Mantra in tiny gray-600 text: "How you do anything is how you do everything" — subtle, always present

---

### Right Content Area (Scrollable)

Background: #061222. Full remaining viewport width. Content stacked vertically.

---

#### Section 1: Call Queue / Call List Import

**State A: No call list loaded**

A clean card: "LOAD TODAY'S CALL LIST" in cyan uppercase. Drag-and-drop zone with subtle dashed border, or "Browse files" link. Accepts CSV.
Below: "Export your Salesforce call list and drop it here."

Below that, the Recent Calls list showing last 5 debriefs from any session.

**State B: Call list loaded — Active Session**

Import zone disappears. Replaced by the call queue.

**Queue Header:** "SESSION — 23 CALLS" in cyan uppercase. Progress bar underneath showing completion (e.g., 7 of 23). Same aggressive animated fill style as stat bars. Fills as they work through calls.

**"Up Next" Card (prominent, highlighted):**
Stands out from the rest of the queue.
- Name in large bold white text
- Title + Company in gray-400
- Phone number in cyan, large, clickable (`tel:` link for MacBook dialing via iPhone Handoff)
- Salesforce notes in small gray text (if present in CSV)
- Subtle "Skip" button in gray

**Completed Calls (below "Up Next"):**
Stack downward as calls are completed. Each row:
- Disposition dot (cyan=connected, amber=voicemail, gray=no-answer, blue=gatekeeper)
- Contact + Company in white bold
- Prospect status pill badge (color-coded)
- SPIN score (connected calls only, dash for others)
- Time completed in gray-500

**Remaining Queue (below completed):**
Contacts not yet reached. Dimmed. Each row tappable — BDR can jump ahead in the queue by tapping a contact to make them "Up Next." Flexible, not rigid.

**Off-list calls:** The mic on the sidebar always works. If they debrief without selecting a queue contact, it works like the standard flow. The queue is a guide, not a cage.

---

#### Section 2: Head-to-Head Leaderboard

Wide card styled like a versus matchup screen in a sports broadcast.

Two player blocks side by side with "VS" in cyan between them. Each block shows:
- BDR name in bold
- Three KPIs stacked:
  - Call-to-conversation rate (%, trend arrow up/down vs last week)
  - Conversation-to-appointment rate (%, trend arrow)
  - SPIN average (score, trend arrow)
- Subtle highlight/glow on whichever BDR leads each KPI

No overall winner declared. Each KPI stands on its own. One BDR might lead conversation rate while the other leads SPIN.

**Weekly reset:** Stats reset every Monday. Previous weeks stored and accessible.

---

#### Section 3: Personal Performance Stat Bars

Two cards side by side, equal width. Dark glass panels.

**Left Card: "CALL PERFORMANCE" (cyan uppercase header)**

Three horizontal stat bars stacked vertically. Each bar fills with a cyan glow, sharp bright edge at current position. Translucent ghost bar behind shows last week's average ("beat your ghost" mechanic).

- **SPIN Composite** — primary bar, wider and more prominent. Scale 0-10. Large bold number to the right. When current exceeds the ghost, leading edge turns green.
- **Best Call This Week** — thinner bar. Single highest SPIN score from one call this week. The highlight reel stat.
- **Personal Best (All Time)** — fixed marker on the bar. Pulses when they're approaching it.

Below bars: "8 calls scored this week" in small gray text.

**Right Card: "CONVERSION RATES" (cyan uppercase header)**

Two stat bars with same ghost mechanic:

- **Call → Conversation** — percentage bar, 0-100%. Ghost bar from last week. Large bold percentage. Below: "14 of 23 calls" (raw numbers).
- **Conversation → Appointment** — same treatment. Below: "3 of 14 conversations"

Below both bars: "Week resets Monday" in gray-500.

**Animation:** On dashboard load, bars fill from zero to current position over ~1.5 seconds. After each new debrief, bars animate smoothly to updated values.

---

#### Section 4: Recent Debriefs (when no active session)

**Header:** "RECENT CALLS" in cyan uppercase, "View All" link in gray-400.

Each debrief is a horizontal row card (like match result cards):
- Disposition dot (color-coded)
- Contact + Company in white bold
- Prospect status pill badge
- SPIN score (connected calls, dash for others)
- Time: "2h ago" or "Yesterday, 3:14 PM" in gray-500

Last 5 calls by default. "View All" for full history.

New entries slide in at top with animation after each debrief.

---

## Recording State

When the BDR hits the mic, the left sidebar transforms. Right content area dims slightly.

**Sidebar transitions:**
- Player card compresses to name + today's call count
- If queue loaded: "Up Next" contact info appears (name, title, company) — BDR knows who this debrief is for
- Mic button shifts from cyan to active red. Larger. Pulsing. Recording timer counts up below: "0:34"
- Coaching prompts rotate below timer: "Who'd you talk to?", "What's actually going on at this account?", etc.

**After recording stops:**
- Transcript review (in sidebar or expanded to right content area)
- Confirm/edit
- Processing
- Results: SPIN stat card, The Truth, CRM fields, AE Briefing
- "Download PDF" button prominent
- "Next Call" button returns to dashboard, advances queue

**Right content area updates immediately:** Completed call appears in session list, stat bars animate to new values, leaderboard recalculates, queue progress bar advances. Real-time impact of every call.

---

## Session Report

When BDR clicks "END SESSION — GENERATE REPORT":

**On-screen summary card (post-match stats sheet):**
- Session duration
- Total calls
- Connected (call-to-conversation rate in bold)
- Appointments booked (conversation-to-appointment rate in bold)
- Average SPIN score
- Best SPIN score (with contact name — highlight play)
- Personal bests broken (if applicable, highlighted in green)
- Breakdown of every call: contact, disposition, prospect status, SPIN score

**Export buttons:**
- "DOWNLOAD CSV" — Salesforce import format (configured in Settings)
- "DOWNLOAD PDF" — Branded Vbrick Command Center session report. Cover page with summary stats, one page per debrief with full details and SPIN scoring.

**After report:** Session clears, dashboard returns to empty state with call list import ready for next session.

---

## AE Briefing Handoff

AE Briefings are generated on connected calls and included in the per-call PDF download. The BDR downloads the PDF and forwards it to the AE manually. No auto-send, no Salesforce integration in v1.

The manual friction is intentional — it's the taste bridge that sells the Salesforce integration to the CRO later.

---

## Settings Page

Accessed via gear icon in left sidebar.

- **CSV Import Format:** Column mapping for Salesforce call list CSV. Map StreetNotes fields (Name, Title, Company, Phone, Notes) to CSV column headers.
- **CSV Export Format:** Column mapping for activity report export. Left: StreetNotes fields. Right: dropdown for corresponding Salesforce field name. Save once, applies to all exports.
- **Profile:** Name, email, avatar/initials.
- **Session History:** Past sessions with date, call count, key stats. Tap to view or re-download reports.

---

## Database Schema

### New Tables

**`vbrick_calling_sessions`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| bdr_email | text | |
| started_at | timestamptz | |
| ended_at | timestamptz | nullable (null = active) |
| total_calls | int | updated as calls complete |
| connected_count | int | |
| appointments_count | int | |
| average_spin | decimal | |
| best_spin | decimal | |
| csv_imported | boolean | |

**`vbrick_call_queue`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → vbrick_calling_sessions |
| contact_name | text | |
| contact_title | text | nullable |
| company | text | |
| phone | text | nullable |
| salesforce_notes | text | nullable |
| queue_position | int | order in list |
| status | text | "pending" / "completed" / "skipped" |
| debrief_session_id | uuid | FK → debrief_sessions, nullable |

**`vbrick_bdr_stats`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| bdr_email | text | |
| week_start_date | date | Monday of the week |
| total_calls | int | |
| connected_calls | int | |
| appointments_booked | int | |
| call_to_conversation_rate | decimal | |
| conversation_to_appointment_rate | decimal | |
| average_spin | decimal | |
| best_spin | decimal | |
| best_spin_contact | text | name for "highlight play" |
| streak_days | int | current streak as of that week |

**`vbrick_daily_intentions`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| bdr_email | text | |
| date | date | one per BDR per day |
| know_answer | text | |
| feel_answer | text | |
| do_answer | text | |

### Existing Tables — No Changes

`debrief_sessions` continues to work as-is. New tables reference it via foreign key. Clean separation between StreetNotes core and the VBRICK layer.

---

## CSV Import Format (Salesforce Call List)

**Expected columns (configurable in Settings):**
- Name (or First Name + Last Name)
- Title
- Company (Account Name)
- Phone
- Notes (optional)

Parser is forgiving: extra columns ignored, missing optional columns handled gracefully. Missing phone = contact shows in queue without clickable dial link.

## CSV Export Format (Session Activity Report)

**Default columns (configurable in Settings):**
- Date
- Contact Name
- Title
- Company
- Phone
- Call Disposition
- Prospect Status
- Prospect Status Detail
- Current Solution
- The Truth
- SPIN Composite Score
- Next Action
- Next Action When
- AE Briefing (connected calls only)
- Objections (semicolon-separated)

---

## Technical Changes Summary

| Component | Change |
|---|---|
| `app/vbrick/dashboard/page.tsx` | New — main dashboard page |
| `app/vbrick/dashboard/layout.tsx` | New — two-column layout with fixed sidebar |
| `components/vbrick/player-card.tsx` | New — BDR player card with stats + mic |
| `components/vbrick/intention-screen.tsx` | New — daily intention ritual |
| `components/vbrick/call-queue.tsx` | New — imported call list + queue management |
| `components/vbrick/leaderboard.tsx` | New — head-to-head VS card |
| `components/vbrick/stat-bars.tsx` | New — animated performance bars with ghost mechanic |
| `components/vbrick/session-report.tsx` | New — end-of-session summary + export |
| `components/vbrick/recent-calls.tsx` | New — call history list |
| `components/vbrick/settings-page.tsx` | New — CSV format config + profile |
| `app/api/vbrick/session/route.ts` | New — create/end calling sessions |
| `app/api/vbrick/queue/route.ts` | New — CSV import, queue management |
| `app/api/vbrick/stats/route.ts` | New — aggregated stats for gamification |
| `app/api/vbrick/intentions/route.ts` | New — daily intention CRUD |
| `app/api/vbrick/export/csv/route.ts` | New — session CSV export |
| `app/api/vbrick/export/pdf/route.ts` | New — session PDF report |
| `lib/vbrick/csv-parser.ts` | New — CSV import/export logic |
| `lib/vbrick/stats.ts` | New — stat aggregation + streak calculation |
| `supabase/migrations/004_vbrick_dashboard.sql` | New — four new tables |
| `lib/vbrick/config.ts` | Update — add CSV default mappings |
