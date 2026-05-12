---
type: plan
project: StreetNotes
date: 2026-05-07
status: recommendations
tags:
  - fieldglow
  - ui-ux
  - mobile
  - neumorphism
---

# Field Glow UI/UX Pro Audit

## Scope

This note captures recommendations from two skill passes after the Field Glow mobile app rebrand:

- `mobile-ux`: phone-native compliance, platform patterns, touch targets, safe areas, gestures.
- `ui-ux-pro-max`: visual system review, accessibility, typography, mobile interaction, performance, and Next.js implementation guidance.

No functionality change is recommended here. This is a follow-up punch list for improving the app shell and core mobile flows.

## Commands Run

```bash
npx skills add pluginagentmarketplace/custom-plugin-ux-design@mobile-ux -g -y
python3 /Users/guapo/.agents/skills/ui-ux-pro-max/scripts/search.py "mobile-only wellness-tech field sales voice CRM warm neumorphism Field Glow" --design-system -p "Field Glow"
python3 /Users/guapo/.agents/skills/ui-ux-pro-max/scripts/search.py "mobile app touch accessibility safe area motion" --domain ux -n 12
python3 /Users/guapo/.agents/skills/ui-ux-pro-max/scripts/search.py "nextjs mobile tailwind app accessibility performance" --stack nextjs
python3 /Users/guapo/.agents/skills/ui-ux-pro-max/scripts/search.py "soft ui neumorphism accessibility wellness mobile" --domain style -n 10
python3 /Users/guapo/.agents/skills/ui-ux-pro-max/scripts/search.py "mobile form accessibility touch field sales app" --domain ux -n 16
python3 /Users/guapo/.agents/skills/ui-ux-pro-max/scripts/search.py "warm premium mobile app typography wellness" --domain typography -n 8
python3 /Users/guapo/.agents/skills/ui-ux-pro-max/scripts/search.py "mobile results cards dashboard chart progress" --domain chart -n 8
```

## Current Strengths

- Field Glow now has a mobile-first app shell: phone-width frame, sticky header, fixed bottom nav, safe-area-aware header/footer, and single-column content.
- The warm Field Glow palette is correctly established as the source of truth: `#FAF6EE`, `#F2EBDF`, `#1A1410`, `#3D332A`, `#A8855A`, `#8B6B40`, `#D4A28A`.
- Core actions use strong touch sizing: primary actions are `56px`, secondary actions are generally `48px`, and bottom nav items are `56px`.
- Global CSS already includes `touch-action: manipulation`, visible focus states, `prefers-reduced-motion`, and safe-area spacing.
- The app avoids horizontal desktop grids in the main authenticated shell.
- A 390x844 Playwright check on `/login` found no horizontal overflow.

## Rejected UI Pro Defaults

UI/UX Pro Max recommended a generic wellness palette and typography pair:

- Lavender/green palette: `#8B5CF6`, `#C4B5FD`, `#10B981`, `#FAF5FF`, `#4C1D95`.
- Varela Round / Nunito Sans.
- Newsletter/content-first pattern.

Do not adopt those defaults for Field Glow. They conflict with the explicit Field Glow mobile app style guide. Keep Plus Jakarta Sans / DM Sans and the warm bronze/cream palette.

The useful UI Pro Max guidance is the style category, not the suggested colors:

- Use "Soft UI Evolution" rather than pure low-contrast neumorphism.
- Keep neumorphic depth, but preserve WCAG contrast and clear focus states.
- Blend "Nature Distilled" warmth with premium mobile app restraint.

## Priority Recommendations

### P0 - Touch Target Cleanup

Make all interactive targets at least `48px` tall/wide for Android parity, even though iOS only requires `44px`.

Known targets to review:

- `components/notes/push-plan-review.tsx`: `min-h-[42px]`
- `components/streetnotes/ci/quote-wall.tsx`: `min-h-[44px]`
- `components/streetnotes/stories/vault-card.tsx`: several `min-h-[44px]`
- `components/streetnotes/stories/gamification-header.tsx`: `h-10 w-10`
- `components/dashboard/stories-client.tsx`: `h-11 w-11`
- Login inline `Sign up` link measured as a small text target. Either make it a pill-like secondary action or increase the tappable wrapper.

Keep at least `8px` between adjacent tap targets.

### P0 - Keep Errors and Statuses Announced

Maintain or add:

- `role="alert"` for errors.
- `aria-live` for save/transcribe/structure/push status.
- Text labels with status, not color alone.
- Disabled/loading states on async buttons.

This is already partly present in `voice-note-capture.tsx`; preserve it while polishing visuals.

### P1 - Pause Idle Canvas Animation

`MicInstrument` uses `requestAnimationFrame` for the circular waveform. UI Pro Max and mobile-ux both point toward restraint here:

- Draw a static idle ring once when not recording.
- Run the animation loop only while recording or actively processing.
- Respect `prefers-reduced-motion` by avoiding the idle orbit/pulse animation.

This should reduce battery usage and make the app feel calmer.

### P1 - Capture Flow Back Handling

The visible Back button protects in-progress work. Add browser/system-back protection for mobile:

- If capture has work in progress, intercept navigation/back where possible and confirm before losing work.
- Avoid custom swipe gestures that conflict with iOS edge back or Android system back.

### P1 - Overscroll Behavior During Capture

Consider `overscroll-behavior-y: contain` on the capture flow or `.fg-app` shell to reduce accidental pull-to-refresh while recording.

Do not disable natural vertical scrolling globally if it makes long review flows feel trapped.

### P1 - Mobile Keyboard Optimization

For CRM/edit fields, add `inputMode` where relevant:

- Numeric values: `inputMode="decimal"` or `numeric`.
- Dates: use native date input where appropriate.
- Email: already uses `type="email"`.

### P2 - Replace Legacy Overrides With First-Class Field Glow Components

The `.fg-app` scoped overrides are useful as a migration bridge for old `glass`, `volt`, and dark-mode classes. Long-term, replace them with explicit Field Glow classes in Story/CI components.

Target outcome:

- Fewer legacy dark/green classes hidden by CSS overrides.
- Easier future UI audits.
- Less chance of old visual language leaking back in.

### P2 - Bundle and Runtime Performance

Run a bundle analysis before shipping a polished mobile version:

```bash
ANALYZE=true npm run build
```

Watch for:

- `motion/react`
- `lucide-react`
- `react-icons`
- `@react-pdf/renderer`
- charting or heavy visual packages if added later

### P2 - Mobile Smoke Test Matrix

Before considering the UI pass complete, run a short Playwright mobile matrix:

- 360x740
- 390x844
- 430x932

Check:

- Login/signup no overflow.
- Dashboard bottom nav does not cover content.
- Capture flow sticky footer does not cover editable fields.
- Transcript textarea remains usable above the keyboard.
- Notes, settings, stories, and intel pages stay single-column.

## Chart and Results Guidance

Use compact labeled indicators instead of heavy dashboards:

- Progress bars or bullet-chart style rows for "Glow Score," "Field Balance," and confidence.
- Always show numeric value beside visual progress.
- Avoid hover-only chart interactions.
- Keep charts optional; result cards are the primary mobile pattern.

## Local Non-UI Blocker Observed

While checking the app locally, `/api/notes` returned:

```text
column notes.push_status does not exist
```

This is a local Supabase schema mismatch, not a UI finding. It blocks clean dashboard note hydration locally and should be handled separately before full end-to-end QA.

## Recommended Next Pass

Implement the P0/P1 items in one focused mobile-polish pass:

1. Normalize all touch targets to `48px`.
2. Pause idle mic canvas animation.
3. Add capture-route back/overscroll handling.
4. Add input modes to editable CRM fields.
5. Run lint/build plus Playwright mobile screenshots.

## Implementation Pass - 2026-05-07

Status: implemented.

Files updated:

- `app/(auth)/login/page.tsx`
- `app/(auth)/sign-up/page.tsx`
- `components/dashboard/dashboard-client.tsx`
- `components/mic-instrument.tsx`
- `components/notes/editable-structured-output.tsx`
- `components/notes/push-plan-review.tsx`
- `components/streetnotes/brutal/brutal-button.tsx`
- `components/streetnotes/brutal/brutal-toggle.tsx`
- `components/streetnotes/ci/quote-wall.tsx`
- `components/streetnotes/stories/gamification-header.tsx`
- `components/streetnotes/stories/vault-card.tsx`
- `components/dashboard/stories-client.tsx`

What changed:

- Raised remaining interactive targets from `42px` / `44px` to `48px`, including Story Vault buttons, CRM mapping controls, auth secondary links, and the shared brutal toggle/button components.
- Changed the auth footer text links into 48px secondary pill actions.
- Tightened auth-page vertical padding so the secondary auth action fits cleanly on a 360x740 phone viewport.
- Updated `MicInstrument` so the circular canvas draws once while idle and only runs `requestAnimationFrame` while recording, with `prefers-reduced-motion` respected.
- Added capture-mode browser/system-back protection and `beforeunload` handling when work is in progress.
- Added `overscroll-y-contain` to the capture-mode screen.
- Added mobile input hints for editable CRM fields: estimated value uses `inputMode="decimal"`, date-like fields use `inputMode="numeric"`, and CI quote search uses `inputMode="search"`.

Screenshots captured:

- `output/playwright/field-glow-login-360x740.png`
- `output/playwright/field-glow-login-390x844.png`
- `output/playwright/field-glow-signup-430x932.png`

Playwright mobile target/overflow check:

- `/login` and `/sign-up` checked at 360x740, 390x844, and 430x932.
- No horizontal overflow found.
- No visible interactive targets below 48px found on those auth surfaces.

Verification:

- Focused ESLint on changed TSX files passed.
- Full verification results are tracked in the session log for this pass.

## Logo and Production Deploy - 2026-05-07

Status: live on production.

Brand assets added or refreshed:

- `public/fieldglow/brand/logo.png` - full uploaded Field Glow logo.
- `public/fieldglow/brand/field-glow-mark.png` - cropped app/header mark used in the mobile shell.
- `public/favicon.ico`
- `public/apple-touch-icon.png`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/icon-maskable-512.png`

UI update:

- `components/fieldglow/logo.tsx` now renders the uploaded FG mark with the `Field Glow` wordmark text in the app header.

Production deployment:

- Production alias: `https://streetnotes.ai`
- Vercel deployment: `https://streetnotes-2obsm7e8p-jeffs-projects-5eeb0328.vercel.app`
- Vercel inspect: `https://vercel.com/jeffs-projects-5eeb0328/streetnotes/EBiJAsDUSVEUj3d51g5riS7mVjmR`

Live verification:

- `https://streetnotes.ai/login?fg_verify=2026-05-07` returned `HTTP/2 200`.
- Rendered HTML includes `Field Glow` metadata and `/fieldglow/brand/field-glow-mark.png`.
- Production Playwright mobile screenshot captured at `output/playwright/field-glow-live-login-390x844.png`.

Pre-deploy verification:

- `npm run lint`
- `npm run build`
- `git diff --check`
