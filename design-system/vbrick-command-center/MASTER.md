# Design System Master File — Vbrick Command Center

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Vbrick Command Center
**Updated:** 2026-03-23
**Category:** Sports Performance Dashboard / Enterprise BDR Tool
**Visual Direction:** Ultra-modern dark sports analytics. Glassmorphism cards with frosted glass depth. Subtle aurora gradient accents. Aggressive data visualization. Dopamine-inducing micro-rewards. Looks like it was designed by a top-tier global design firm. Built for two ex-rugby players who want to feel like elite athletes tracking their performance.

### Design Philosophy

**Three visual layers that create depth and premium feel:**

1. **Deep Layer (Background):** Dark navy (#061222) with a subtle, slow-moving aurora mesh gradient in the upper portion — faint cyan and navy blending. Not animated aggressively — like northern lights barely visible through a window. Creates atmosphere without distraction. CSS: `radial-gradient` with large color stops + subtle 20s animation loop on `background-position`.

2. **Glass Layer (Cards/Panels):** Glassmorphism treatment on all cards. Not white glass — dark glass. `backdrop-filter: blur(12px) saturate(150%)` with `bg-white/[0.03]` to `bg-white/[0.06]` depending on elevation. Thin `border: 1px solid rgba(255,255,255,0.08)`. This creates the frosted depth that makes the UI feel layered and premium. Higher-elevation cards (player card, "Up Next" in queue) get slightly more opacity and a stronger border.

3. **Accent Layer (Data/Interaction):** Cyan glow effects on active elements, stat bar fills, mic button. This is where the energy lives. Glow radiates outward using layered `box-shadow`. On data updates, glow briefly intensifies then settles — a micro-celebration.

### Dopamine Design System

Every interaction should trigger a small reward signal:

- **Stat bar fills on load:** Bars animate from 0 with a glowing leading edge — satisfying to watch.
- **Ghost bar overtake:** When current stat passes last week's ghost, the bar flashes from cyan to green with a brief glow burst. The "beat your ghost" moment.
- **Personal best break:** When a score exceeds all-time PB, the number pulses with green glow and a brief particle-like shimmer effect (CSS only — radial gradient burst that fades).
- **Streak milestone:** At 5, 10, 15, 30 days — the flame icon on the player card briefly enlarges and glows brighter. The number gets a count-up animation.
- **Call completion in queue:** Completed call slides down with a subtle checkmark animation. Progress bar advances with a satisfying fill. The "Up Next" card slides up.
- **Session report reveal:** Stats appear one by one with staggered count-up animations. Each number rolls from 0 to final value. The best stat gets highlighted with a green glow.
- **Count-up numbers:** All numeric values animate from 0 on page load using spring physics (framer-motion `useSpring`). Not linear — they accelerate then ease into place.

### Premium Visual Details

- **Grain texture overlay:** A very subtle noise texture (`opacity: 0.015`) over the entire background. Adds organic warmth to the dark UI. Prevents the "too clean digital" look. Use a CSS `background-image` with a tiny repeating noise SVG or base64 PNG.
- **Gradient mesh on sidebar:** Behind the player card, a faint radial gradient from cyan (#7ed4f7 at 3% opacity) creates a subtle "spotlight" effect on the BDR's name. Premium touch.
- **Thin accent lines:** 1px cyan lines (#7ed4f7 at 20% opacity) used sparingly as section dividers. Not solid borders — luminous dividers.
- **Card hover lift:** On hover, cards get a slight `translateY(-2px)` with shadow deepening and border brightening. Smooth 200ms ease-out. Feels responsive and tactile.
- **Typography contrast:** Large stat numbers in Fira Code Bold at high sizes (text-3xl to text-5xl) create visual anchors. The contrast between massive numbers and small labels creates hierarchy that draws the eye.
- **Breathing elements:** The mic button pulse is the only continuously animated element. Everything else is triggered by data or interaction. This creates focus — the mic is always "alive" while the rest of the dashboard responds to the BDR's work.

---

## Global Rules

### Color Palette (Vbrick Brand)

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Dark Navy (BG) | `#061222` | `--color-bg-deep` | Primary background, full-screen states |
| Soft Navy (Panels) | `#0d1e3a` | `--color-bg-panel` | Cards, sidebar, glass panels |
| Primary Navy | `#1b3e6f` | `--color-primary` | Headers, accents, borders |
| Accent Cyan | `#7ed4f7` | `--color-accent` | CTAs, highlights, active states, mic glow |
| Cyan Hover | `#9de0fa` | `--color-accent-hover` | Hover states on cyan elements |
| White | `#FFFFFF` | `--color-text-primary` | Primary text on dark backgrounds |
| Gray 400 | `#9CA3AF` | `--color-text-secondary` | Secondary text, descriptions |
| Gray 500 | `#6B7280` | `--color-text-muted` | Muted text, timestamps |
| Gray 600 | `#4B5563` | `--color-text-subtle` | Subtle text, mantras |
| Red | `#EF4444` | `--color-danger` | Low scores (0-3), recording state, urgent |
| Amber | `#F59E0B` | `--color-warning` | Mid scores (4-6), caution |
| Green | `#22C55E` | `--color-success` | Personal bests, elite scores (9-10), appointments |
| Border Light | `rgba(255,255,255,0.1)` | `--color-border` | Card borders, dividers |
| Border Accent | `rgba(126,212,247,0.3)` | `--color-border-accent` | Highlighted borders |

**Score Color Scale:**
- 0-3: Red (#EF4444)
- 4-6: Amber (#F59E0B)
- 7-8: Cyan (#7ed4f7)
- 9-10: Green (#22C55E)

### Typography

- **Primary Font:** Inter (matches existing Vbrick branding)
- **Data Font:** Fira Code (monospace for stats, scores, numbers, timestamps)
- **Mood:** Sports analytics, performance tracking, aggressive, precise

**Google Fonts:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fira+Code:wght@400;500;600;700&display=swap');
```

**Usage Rules:**
- Inter for all UI text, headings, labels, descriptions
- Fira Code for numeric values, scores, percentages, timers, conversion rates
- Inter Black (900) for player names and large stat numbers
- Uppercase + wide tracking for labels and badges

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps, badge padding |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Card padding, section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps between sections |
| `--space-2xl` | `48px` / `3rem` | Section margins |

### Shadow & Glow System

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 4px 12px rgba(0,0,0,0.3)` | Default card elevation |
| `--shadow-card-hover` | `0 8px 24px rgba(0,0,0,0.4)` | Card hover state |
| `--glow-cyan` | `0 0 20px rgba(126,212,247,0.3)` | Cyan accent glow |
| `--glow-cyan-intense` | `0 0 40px rgba(126,212,247,0.5), 0 0 80px rgba(126,212,247,0.2)` | Mic button, active states |
| `--glow-red` | `0 0 20px rgba(239,68,68,0.4)` | Recording state glow |
| `--glow-green` | `0 0 20px rgba(34,197,94,0.3)` | Personal best indicators |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Small badges, pills |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `12px` | Cards, panels |
| `--radius-xl` | `16px` | Large cards, feature panels |
| `--radius-full` | `9999px` | Mic button, avatar circles |

---

## Component Specs

### Aurora Background

```css
.aurora-bg {
  background: #061222;
  position: relative;
  overflow: hidden;
}

.aurora-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    ellipse at 20% 50%,
    rgba(126, 212, 247, 0.04) 0%,
    transparent 50%
  ),
  radial-gradient(
    ellipse at 80% 20%,
    rgba(27, 62, 111, 0.06) 0%,
    transparent 40%
  ),
  radial-gradient(
    ellipse at 50% 80%,
    rgba(126, 212, 247, 0.02) 0%,
    transparent 50%
  );
  animation: aurora-drift 20s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes aurora-drift {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-5%, 3%) rotate(2deg); }
}
```

### Noise Grain Overlay

```css
.grain-overlay::after {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  /* Base64 encoded 200x200 noise PNG or SVG */
  background-image: url("data:image/svg+xml,...");
  background-repeat: repeat;
  opacity: 0.015;
  pointer-events: none;
  z-index: 100;
  mix-blend-mode: overlay;
}
```

### Glass Panel Cards (Glassmorphism — Dark)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  transition: all 200ms ease-out;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(126, 212, 247, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Elevated glass (player card, "Up Next" in queue) */
.glass-card-elevated {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 24px;
}
```

### Luminous Dividers (instead of solid borders)

```css
.divider-luminous {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(126, 212, 247, 0.2) 50%,
    transparent 100%
  );
  border: none;
}
```

### Stat Bar (Ghost Mechanic)

```css
.stat-bar-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.stat-bar-ghost {
  position: absolute;
  height: 100%;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  /* Last week's value — no animation */
}

.stat-bar-fill {
  position: absolute;
  height: 100%;
  background: #7ed4f7;
  border-radius: 4px;
  transition: width 1.5s ease-out;
  box-shadow: 0 0 8px rgba(126, 212, 247, 0.4);
}

.stat-bar-fill.exceeds-ghost {
  background: #22C55E;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}
```

### Mic Button

```css
.mic-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #7ed4f7;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 150ms ease-out;
  box-shadow: 0 0 40px rgba(126, 212, 247, 0.5), 0 0 80px rgba(126, 212, 247, 0.2);
}

.mic-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 60px rgba(126, 212, 247, 0.6), 0 0 100px rgba(126, 212, 247, 0.3);
}

/* Aggressive heartbeat pulse */
@keyframes mic-pulse {
  0%, 100% { box-shadow: 0 0 40px rgba(126, 212, 247, 0.5); }
  50% { box-shadow: 0 0 60px rgba(126, 212, 247, 0.7), 0 0 100px rgba(126, 212, 247, 0.3); }
}

.mic-button { animation: mic-pulse 1.2s ease-in-out infinite; }

/* Recording state */
.mic-button.recording {
  background: #EF4444;
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.5);
  animation: mic-pulse-red 0.8s ease-in-out infinite;
}
```

### Badges & Pills

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Status variants */
.badge-cyan { color: #7ed4f7; background: rgba(126, 212, 247, 0.1); }
.badge-green { color: #22C55E; background: rgba(34, 197, 94, 0.1); }
.badge-amber { color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
.badge-red { color: #EF4444; background: rgba(239, 68, 68, 0.1); }
.badge-gray { color: #9CA3AF; background: rgba(156, 163, 175, 0.1); }
```

### Inputs (Dark Theme)

```css
.input-dark {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 16px;
  transition: border-color 200ms ease-out;
}

.input-dark:focus {
  border-color: #7ed4f7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(126, 212, 247, 0.15);
}

.input-dark::placeholder {
  color: #6B7280;
}
```

---

## Animation Guidelines

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro-interaction | 150ms | ease-out | Hover, focus, toggle |
| State change | 200ms | ease-out | Card transitions, button states |
| Stat bar fill | 1500ms | ease-out | Dashboard load, stat updates |
| Page transition | 350ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Screen changes |
| Pulse (mic) | 1200ms | ease-in-out | Idle mic heartbeat |
| Pulse (recording) | 800ms | ease-in-out | Active recording pulse |

### Rules

- Always use `ease-out` for elements entering the viewport
- Always use `ease-in` for elements exiting
- Never use `linear` for UI transitions (feels robotic)
- Respect `prefers-reduced-motion`: disable pulse animations, reduce transitions to 0ms
- Stat bars animate from 0 to current value on load (1.5s)
- After each debrief, stat bars animate from previous to new value (smooth 500ms)
- Count-up animations for numeric values (number rolls from 0 to target)
- New list items slide in from the top with fade

---

## Icon System

- **Primary set:** Lucide React (`lucide-react`)
- **Supplementary:** react-icons where Lucide lacks coverage
- **Never use emojis as icons** — flame icon for streaks, not flame emoji
- **Icon size:** 16px (small), 20px (default), 24px (large)
- **Color:** Inherit from parent text color, or use accent cyan for active states

---

## Accessibility

- **Contrast:** 4.5:1 minimum for all text (WCAG AA). White (#FFF) on #0d1e3a = 13.5:1
- **Focus states:** Visible cyan outline (0 0 0 3px rgba(126, 212, 247, 0.4)) on all interactive elements
- **Keyboard nav:** Tab order matches visual order. All actions reachable via keyboard.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` — disable pulse, reduce all transitions
- **Touch targets:** Minimum 44x44px (relevant for future mobile version)
- **Labels:** All form inputs have visible labels or sr-only labels with aria
- **Alt text:** All images have descriptive alt text
- **Color not sole indicator:** Status always has text label in addition to color

---

## Anti-Patterns (Do NOT Use)

- Light mode or light backgrounds (this is OLED-dark only)
- Emojis as icons
- Missing cursor:pointer on interactive elements
- Scale transforms on hover that shift layout (use subtle scale only on isolated elements like mic)
- Linear easing for transitions
- Invisible focus states
- Generic SaaS styling (rounded friendly cards, pastel colors)
- Slow rendering or blocking animations
- Decorative infinite animations (pulse only on mic and recording states)

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (use Lucide/SVG)
- [ ] All icons from consistent set (Lucide React primary)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast 4.5:1 minimum on dark backgrounds
- [ ] Focus states visible (cyan outline) for keyboard navigation
- [ ] `prefers-reduced-motion` respected (no pulse, reduced transitions)
- [ ] Desktop-first: optimized for 1280px+ viewports
- [ ] No content hidden behind fixed sidebar
- [ ] Stat bars animate from 0 on load
- [ ] Numeric values use Fira Code monospace
- [ ] Labels use uppercase + tracked Inter
