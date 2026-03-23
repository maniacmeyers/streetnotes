# Dashboard Page Overrides — Vbrick Command Center

> **PROJECT:** Vbrick Command Center
> **Updated:** 2026-03-23
> **Page Type:** Sports Performance Dashboard / BDR Calling Workstation

> **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Layout Override

**Two-Column Fixed Layout (NOT scrolling single column)**

```
┌──────────────────────────────────────────────────────┐
│ LEFT SIDEBAR (320px, fixed)  │  RIGHT CONTENT (flex)  │
│                              │                        │
│ ┌──────────────────────┐     │  ┌──────────────────┐  │
│ │  HEADER              │     │  │  CALL QUEUE /     │  │
│ │  Vbrick Command Ctr  │     │  │  IMPORT ZONE      │  │
│ ├──────────────────────┤     │  └──────────────────┘  │
│ │  PLAYER CARD         │     │  ┌──────────────────┐  │
│ │  Name / Title        │     │  │  HEAD-TO-HEAD     │  │
│ │  Streak | Today |SPIN│     │  │  LEADERBOARD      │  │
│ ├──────────────────────┤     │  └──────────────────┘  │
│ │                      │     │  ┌────────┐┌────────┐  │
│ │    ◉ MIC BUTTON      │     │  │  SPIN  ││ CONV   │  │
│ │    DEBRIEF            │     │  │  BARS  ││ BARS   │  │
│ │                      │     │  └────────┘└────────┘  │
│ ├──────────────────────┤     │  ┌──────────────────┐  │
│ │  ⚙ Settings          │     │  │  RECENT CALLS /   │  │
│ │  Mantra (subtle)     │     │  │  SESSION CALLS    │  │
│ └──────────────────────┘     │  └──────────────────┘  │
│                              │        (scrollable)     │
└──────────────────────────────────────────────────────┘
```

- Left sidebar: `position: fixed`, `width: 320px`, `height: 100vh`, bg: `#0d1e3a`
- Right content: `margin-left: 320px`, `overflow-y: auto`, `height: 100vh`, bg: `#061222`
- No responsive breakpoints needed — desktop-only (mobile is a separate design)

---

## Component Specifications

### Player Card

```
┌─────────────────────────────┐
│ ┃ JAKE                      │  ← cyan left border, Inter Black, large
│ ┃ BDR — Vbrick              │  ← gray-400, Inter regular
│ ─────────────────────────── │
│ 🔥 7 days │ 6 calls │ 5.8  │  ← streak, today, SPIN avg
│           │  today  │ SPIN  │
└─────────────────────────────┘
```

- Glass panel: `bg-[#0d1e3a]`, `border-l-4 border-[#7ed4f7]`
- Name: `font-black text-2xl uppercase tracking-wide text-white`
- Quick stats: three equal columns, Fira Code for numbers
- Streak flame: Lucide `Flame` icon (NOT emoji), cyan when active, gray when broken

### Mic Button

- Size: `w-[120px] h-[120px]` (larger than standard)
- Fill: `bg-[#7ed4f7]`
- Glow: `box-shadow: var(--glow-cyan-intense)`
- Animation: aggressive heartbeat pulse (1.2s interval)
- Hover: `scale(1.05)`, glow intensifies
- Label below: "DEBRIEF" in `font-bold uppercase tracking-widest text-sm text-white`
- Recording state: switches to `bg-red-500` with red glow, faster pulse (0.8s)
- Icon inside: Lucide `Mic` icon, `w-10 h-10`, color `#061222` (dark on cyan)

### Head-to-Head Leaderboard

```
┌─────────────┐   VS   ┌─────────────┐
│    JAKE     │        │    MIKE     │
│             │        │             │
│ Conv: 61% ↑ │        │ Conv: 54% ↓ │  ← leading KPI glows cyan
│ Appt: 21% ─ │        │ Appt: 28% ↑ │
│ SPIN: 5.8 ↑ │        │ SPIN: 6.1 ↑ │  ← leading KPI glows cyan
└─────────────┘        └─────────────┘
```

- Full-width card, glass panel
- "VS" in large cyan text between the two blocks
- Each KPI row: label (Inter), value (Fira Code bold), trend arrow
- Leading KPI gets subtle cyan glow on the value
- Weekly reset: "Week resets Monday" in tiny gray text at bottom

### Stat Bars (Ghost Mechanic)

Each bar:
- Track: `h-2 bg-white/10 rounded-full`
- Ghost bar: `bg-white/6` — last week's position, no animation
- Current fill: `bg-[#7ed4f7]` with `box-shadow: 0 0 8px` glow
- When current > ghost: fill turns `bg-[#22C55E]` (green, beating last week)
- Large bold number to the right of bar: Fira Code, size matches bar prominence
- Personal best marker: small dot on the track that pulses when approaching

**Left card (CALL PERFORMANCE):**
- SPIN Composite bar (wider, prominent)
- Best Call This Week bar (thinner)
- Personal Best (All Time) marker

**Right card (CONVERSION RATES):**
- Call → Conversation bar (0-100%)
- Conversation → Appointment bar (0-100%)
- Raw numbers below each: "14 of 23 calls" in small gray

### Call Queue

**"Up Next" card:**
- Elevated: slightly larger, brighter border (`border-[#7ed4f7]/50`)
- Contact name: `text-lg font-bold text-white`
- Phone number: `text-[#7ed4f7] font-mono text-lg cursor-pointer` — clickable `tel:` link
- Skip button: `text-gray-500 text-xs hover:text-gray-400`

**Completed calls:**
- Disposition dot: `w-2.5 h-2.5 rounded-full` (cyan/amber/gray/blue)
- SPIN score in Fira Code, color-coded
- Compact rows, minimal padding

**Remaining queue:**
- Dimmed: `opacity-50`
- Clickable to jump ahead in queue

### Session Report (Post-Match Stats)

- Cover card with large stats: session duration, total calls, conversion rates
- Numbers use count-up animation (roll from 0 to target over 1s)
- "Best SPIN" highlighted with green glow if personal best
- Two export buttons: "DOWNLOAD CSV" + "DOWNLOAD PDF"
- Buttons: `bg-[#7ed4f7] text-[#061222] font-bold uppercase`

---

## Data Visualization Rules

### Progress/Stat Bars (NOT line charts or funnels)

- Horizontal bars with ghost overlay (last week's value behind current)
- Fill animates from 0 on page load (1.5s ease-out)
- Fill animates smoothly on data update (500ms ease-out)
- Glowing leading edge on the fill
- Color transitions when exceeding ghost (cyan → green)

### Numeric Displays

- All numbers in Fira Code monospace
- Large stats: `text-3xl font-bold` minimum
- Count-up animation on load
- Trend arrows: ↑ (green), ↓ (red), ─ (gray)
- Percentage values: one decimal place max

### Leaderboard

- Side-by-side comparison (NOT table format)
- VS mechanic in the center
- Leading values get subtle glow
- No overall winner — each KPI independent

---

## Interaction Specifications

### Hover States

- Cards: border shifts to `border-[#7ed4f7]/30`, shadow deepens
- Buttons: opacity 0.9, subtle lift (`translateY(-1px)`)
- Mic: scale 1.05, glow intensifies
- Queue rows: background lightens to `bg-white/5`
- All transitions: 200ms ease-out

### Loading States

- Skeleton screens with `animate-pulse` on `bg-white/5` blocks
- Stat bars show empty tracks before data loads
- Spinner for async operations > 300ms
- Mic button disabled state: reduced opacity, no pulse

### State Transitions

- Sidebar → recording: smooth transform, player card compresses
- Queue advance: completed call slides down, new "Up Next" slides up
- Stat bar update: smooth width transition (500ms)
- Session end: content fades, report card slides in

---

## Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base content | 0 | Right content area |
| Fixed sidebar | 10 | Left sidebar |
| Sticky headers | 20 | Queue header, section headers |
| Overlays | 30 | Dimmed content during recording |
| Modals | 40 | Settings, confirmations |
| Toast/alerts | 50 | Notifications |

---

## Chart Library

**Do NOT use traditional chart libraries.** No Chart.js, no Recharts, no D3 for this dashboard.

All data visualization is custom-built with Tailwind + CSS animations:
- Stat bars: pure CSS with Tailwind utility classes + `framer-motion` for animation
- Progress indicators: CSS + `motion` library
- Count-up numbers: custom hook or `framer-motion` `useSpring`
- No SVG charts, no canvas rendering

This keeps the bundle light and the aesthetic fully custom.

---

## Premium Visual Layer (Ultra-Modern)

### Background Treatment

The right content area uses the aurora background from MASTER.md. A subtle, slow-moving mesh gradient creates depth and atmosphere. The sidebar has a faint radial cyan gradient spotlight behind the player card.

```
Right content area:
  - Base: #061222
  - Aurora mesh gradient overlay (::before pseudo, z-index: -1)
  - Noise grain overlay (::after pseudo, z-index: 100)

Left sidebar:
  - Base: #0d1e3a
  - Radial gradient spotlight behind player card:
    radial-gradient(ellipse at 50% 30%, rgba(126, 212, 247, 0.05) 0%, transparent 70%)
```

### Glassmorphism Application

| Component | Glass Level | backdrop-filter | bg opacity |
|-----------|-------------|-----------------|------------|
| Sidebar | Solid panel | none | `#0d1e3a` solid |
| Player card | Elevated glass | `blur(16px) saturate(160%)` | `white/[0.06]` |
| Leaderboard | Standard glass | `blur(12px) saturate(150%)` | `white/[0.03]` |
| Stat bar cards | Standard glass | `blur(12px) saturate(150%)` | `white/[0.03]` |
| "Up Next" card | Elevated glass | `blur(16px) saturate(160%)` | `white/[0.06]` |
| Queue rows | Minimal glass | `blur(8px)` | `white/[0.02]` |
| Recent call rows | Minimal glass | `blur(8px)` | `white/[0.02]` |
| Session report | Elevated glass | `blur(16px) saturate(160%)` | `white/[0.06]` |

### Dopamine Moments (Specific to Dashboard)

**On page load:**
1. Aurora background fades in (0 → full opacity, 800ms)
2. Sidebar slides in from left (200ms, ease-out)
3. Player card fades up (300ms delay)
4. Mic button appears with a burst glow that settles into pulse (400ms delay)
5. Right content cards stagger in from bottom (each 80ms apart)
6. Stat bars fill from 0 (starts at 600ms, takes 1.5s)
7. Numbers count up (starts at 800ms, takes 1s, spring physics)

**After completing a debrief:**
1. Completed call card slides into position (300ms)
2. Queue progress bar advances with glowing edge (500ms)
3. Stat bars smoothly update to new values (500ms)
4. If ghost bar was overtaken, cyan → green flash (200ms flash + 300ms settle)
5. If personal best broken, the PB marker pulses green 3 times then settles
6. Leaderboard values update with brief highlight on changed KPIs
7. "Up Next" card slides up into position (300ms)

**Streak milestones (5, 10, 15, 30 days):**
- Flame icon scales up 1.3x with intense orange-to-cyan gradient glow
- Streak number gets count-up animation
- Brief shimmer effect across the player card (CSS gradient sweep, 600ms)

**Session report reveal:**
- Each stat appears one at a time (150ms stagger)
- Numbers count up from 0 with spring easing
- "Best SPIN" stat gets green glow highlight
- If any personal bests were broken, a "NEW PB" badge animates in with a brief burst

### Luminous Accent Lines

Replace all solid `border-b` and `border-t` dividers with luminous gradient dividers:

```css
/* Instead of: border-b border-white/10 */
/* Use: */
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(126, 212, 247, 0.15), transparent);
}
```

These create depth between sections without hard edges. Premium feel.

### Card Header Treatment

Card headers (e.g., "CALL PERFORMANCE", "CONVERSION RATES") use:
- Small uppercase text, `tracking-[0.2em]`, `text-[11px]`
- Color: `#7ed4f7` (cyan)
- A luminous divider below the header text
- No background fill — the header floats on the glass card

### Number Rendering

All stat numbers follow this hierarchy:

| Size | Usage | Font | Weight |
|------|-------|------|--------|
| `text-5xl` (48px) | Hero metrics (session report cover) | Fira Code | 700 |
| `text-3xl` (30px) | Leaderboard KPIs, main stat bar values | Fira Code | 700 |
| `text-2xl` (24px) | Player card stats, composite scores | Fira Code | 600 |
| `text-lg` (18px) | Queue phone numbers, secondary stats | Fira Code | 500 |
| `text-sm` (14px) | Timestamps, raw counts ("14 of 23") | Fira Code | 400 |

Numbers always get count-up animation on first render. Update animations use smooth interpolation (not count-up — just smooth transition to new value).
