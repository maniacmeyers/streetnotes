# Vbrick Command Center — Design Document

**Date:** 2026-03-20
**Branch:** `vbrick` (off `main` — StreetNotes.ai untouched)
**URL:** `vbrick.streetnotes.ai`
**Product Name:** Vbrick Command Center

---

## Strategic Context

Jeff coaches Vbrick's BDR team (ex-pro rugby players, brand new to sales). The CRO who hired Jeff is also ex-rugby. Goal: make the BDR team dependent on the tool's depth, have AEs take notice from the quality of BDR reports, and position Jeff as indispensable for GTM AI strategy.

## Architecture

### Branch Strategy

Separate `vbrick` branch off `main`. Zero changes to StreetNotes.ai. The branches live independently. Bug fixes from `main` can be cherry-picked into `vbrick` if needed.

### Deployment

- Subdomain: `vbrick.streetnotes.ai` via Vercel
- Same Supabase instance, same API keys, same infrastructure
- Establishes white-label pattern for future clients (`client.streetnotes.ai`)

### Config

Single config file `lib/vbrick/config.ts`:
- Brand colors (Vbrick navy/cyan palette)
- Font: Inter (legally safe alternative to Roboto)
- `emailDomain: 'vbrick.com'`
- `defaultSegment: 'bdr-cold-call'`
- `enableSPIN: true`
- `productName: 'Vbrick Command Center'`
- `rateLimitDisabled: true`
- Vbrick product/competitor context for AI prompts

---

## Landing Page — Two States

### State 1: First Visit (CRO Page)

Cookie-based detection (`vbrick_visited`). First visit shows the sell page — written for the CRO, not the BDRs.

**Header:** Vbrick Command Center (left) | Powered by StreetNotes.ai (right)

**Hero (dark navy, centered):**
- Headline: "Your team makes 200 calls a week. Salesforce captures maybe 20% of what actually happened."
- Subline: "The other 80% dies in the parking lot. Your forecast is built on whatever your reps remembered to type at the end of the day. That's not a CRM problem. That's an intelligence problem."

**The fix section:**
- "Vbrick Command Center gives every BDR a 60-second post-call debrief. AI extracts the CRM data, scores their questioning technique, and generates AE-ready briefings. No typing. No training. No behavior change — just talk."

**Three proof points (stat cards):**
- "100%" — of calls captured, not just the ones they remember
- "S.P.I.N." — scored every call, visible improvement week over week
- "AE Briefing" — generated automatically on every connected call

**CTA:** "See it in action →" — sets cookie, redirects to /debrief

**Footer:** Powered by StreetNotes.ai | Confidential

### State 2: Return Visit

No landing page. Route loads the debrief flow directly (email gate → segment → record/import → results).

---

## Debrief Tool Changes

### Email Gate

- Validates @vbrick.com email addresses only
- Copy: "Sign in with your Vbrick email"
- Enterprise styling (Vbrick navy/cyan palette, Inter font)
- No rate limit (skip the 3/day check for vbrick.com)

### Segment Selector

- BDR Cold Call as default/prominent (top, pre-highlighted)
- Divider: "or log a meeting"
- Enterprise, Mid-Market, SMB, Partner/Channel below (for AEs)

### Recorder Screen — Two Paths

**Left card: "Record a Debrief"**
- Mic button, same voice capture flow
- "Talk for 60 seconds after your call"

**Right card: "Import from Chorus / Teams"**
- Drag-and-drop zone (dashed border, file icon)
- "Drop your transcript file"
- Accepts: .txt, .vtt, .srt, .docx, .pdf
- "or paste transcript" link expands a text area
- "Works with Chorus exports, Teams transcripts, or any call notes"

**Server-side file parser:**
- `.vtt` / `.srt` — strip timestamps/formatting, extract dialogue text
- `.docx` — extract text content (lightweight parser)
- `.pdf` — extract text
- `.txt` — pass through
- Pasted text — pass through

All paths feed into the same extraction + SPIN scoring pipeline.

---

## SPIN Scoring

### Framework

- **S (Situation):** Facts gathered about prospect's current state
- **P (Problem):** Pain uncovered
- **I (Implication):** Cost/impact of the problem explored
- **N (Need-Payoff):** Prospect articulated value of solving it

### Scoring Model

0-10 per letter:
- 0-3: Not present or barely touched
- 4-6: Asked but surface level
- 7-8: Strong, specific, got real answers
- 9-10: Elite — stacked questions, got prospect talking

Composite: `(S×1 + P×1.5 + I×2 + N×2.5) / 7 × 10` (I and N weighted higher)

### Stat Card Display

Rugby performance card format. Four horizontal bars with scores, evidence, and missed opportunities. One-line coaching note at the bottom — specific to what they missed, not generic.

### Scope

- SPIN scoring on BDR Cold Call mode only
- No SPIN on AE Enterprise/Mid-Market/SMB/Partner dumps

---

## AI Prompt Changes

### Vbrick Product Context (injected into all prompts)

"The BDR sells Vbrick, an enterprise video platform. Core products: live streaming, video on demand (VOD), video content management, AI-powered video search, eCDN. Primary competitors: Panopto, Kaltura, Microsoft Stream, Brightcove, Qumu."

### BDR Prompt Additions

1. SPIN analysis block added to output schema (score, evidence, missed, coachingNote per letter + composite)
2. AE Briefing generated on every connected call (not just active-opportunity)
3. Vbrick product/competitor context for accurate extraction

### AE Prompt (Enterprise/Mid-Market/etc.)

Standard deal debrief extraction. No SPIN. Vbrick product context added for accurate competitor/product identification.

---

## PDF — Vbrick Command Center

### Branding

- Header: "Vbrick Command Center" in Inter Bold (navy on white, or white on dark)
- Footer: "Powered by StreetNotes.ai" with StreetNotes logo (small), page numbers, "Confidential — Vbrick Internal"
- Accent color: Vbrick cyan (#7ed4f7) replaces volt green (#00E676)
- Dark backgrounds: Vbrick navy (#1b3e6f / #061222) replaces pure black
- Font: Inter throughout

### BDR Cold Call PDF — Page Structure

**Page 1 — Cold Call Activity Log:**
- Dark header: "Vbrick Command Center" top left, date/email top right
- Doc label: "Cold Call Log"
- Company name, contact, status badges
- Contact Details
- The Truth
- SPIN Stat Card (new)
- Next Action
- Objections (if any)
- Referral (if any)

**Page 2 — AE Briefing** (every connected call):
- Header: "Vbrick Command Center" | "AE Briefing"
- Full briefing text

**Last Page — CTA:**
- "Vbrick Command Center" large
- "Debrief every call. Get better every week."
- "Powered by StreetNotes.ai"

### AE Enterprise PDF

Same Vbrick branding. Standard deal intelligence report (deal tear sheet, attendees, tasks, call summary, deal map). No SPIN.

---

## Technical Changes Summary

| Component | Change |
|---|---|
| `lib/vbrick/config.ts` | New — brand config, product context, feature flags |
| `app/vbrick/page.tsx` | New — two-state landing page (cookie-based) |
| `components/debrief/email-gate.tsx` | Vbrick variant — @vbrick.com validation, no rate limit |
| `components/debrief/segment-selector.tsx` | Vbrick variant — BDR Cold Call default |
| `components/debrief/recorder.tsx` | Vbrick variant — adds Chorus/Teams file drop + paste |
| `components/debrief/spin-stat-card.tsx` | New — SPIN scoring display |
| `components/debrief/file-drop-zone.tsx` | New — drag-and-drop file import |
| `app/api/debrief/import/route.ts` | New — file parsing endpoint (vtt, srt, docx, pdf, txt) |
| `app/api/debrief/start/route.ts` | Skip rate limit for vbrick.com |
| `lib/debrief/prompts.ts` | Vbrick BDR prompt with SPIN + product context |
| `lib/debrief/pdf.tsx` | Vbrick branded PDF with SPIN stat card |
| `components/debrief/results-display.tsx` | Show SPIN stat card in results |
| `app/debrief/layout.tsx` | Vbrick branding/styling |
| `vercel.json` | Subdomain config for vbrick.streetnotes.ai |
