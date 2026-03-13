# Post-Call Brain Dump — Product Requirements Document

**Product:** Post-Call Brain Dump
**Route:** `streetnotes.ai/debrief`
**Type:** Free public lead magnet tool
**Owner:** Jeff Meyers
**Date:** 2026-03-12
**Status:** In Development

---

## Product Overview

Post-Call Brain Dump is a free, interactive web tool that gives sales reps an instant taste of what StreetNotes.ai can do. A rep finishes a call, hits the mic, talks for 60 seconds about what happened, reviews the transcript, and gets structured deal intelligence back — a deal snapshot, objections, next steps, decision makers, a deal mind map, and a branded PDF they can forward to their manager.

The tool is the top-of-funnel lead magnet. Every debrief requires an email, which feeds the waitlist. The bridge CTA at the end makes the pitch: "Now imagine this pushed straight to your CRM."

### The Taste Bridge

**Free (Brain Dump):** Voice capture, AI transcription, structured extraction, one-off mind map, PDF download.

**Missing (paid StreetNotes):** CRM auto-sync, deal history, living mind map that grows across calls, pipeline analytics, team dashboards.

The friction of copy-pasting from the PDF into a CRM IS the sales pitch. Once a rep does it twice, they want automation.

---

## User Stories

### US-1: Email Gate
As a sales rep visiting `/debrief`, I enter my work email to start a brain dump so I can access the free tool.

**Acceptance Criteria:**
- Email field validates format client-side (includes `@`)
- Email is stored in `debrief_sessions` table
- Email is upserted to `waitlist` table (no duplicates)
- Rate limit: 3 debriefs per 24 hours per email address
- Clear "3 per day" error message when limit hit
- Resend notification fires to jeff@forgetime.ai (non-blocking)

### US-2: Voice Recording
As a sales rep, I tap the mic button and talk about my latest call so my brain dump is captured.

**Acceptance Criteria:**
- Real-time waveform visualization (volt green frequency bars)
- Live audio level indicator confirms mic is picking up voice
- Minimum recording: 15 seconds (prevent accidental taps)
- Maximum recording: 3 minutes (auto-stop)
- Duration warning at 2:30
- Coaching prompts rotate after 10s ("Who was in the meeting?", "Any objections?", etc.)
- "Speak a little louder" nudge if audio level is low for 5+ seconds
- Works on Safari (mp4) and Chrome (webm) via MIME negotiation
- 44px minimum tap target on mic button
- Platform-specific guidance if mic permission denied

### US-3: Transcript Review
As a sales rep, I review and optionally edit the transcript before AI processing so names, numbers, and context are correct.

**Acceptance Criteria:**
- Full transcript displayed in editable textarea
- Word count indicator
- "Looks Good" CTA proceeds to AI extraction
- "Re-Record" option returns to recording step (keeps email/session)
- Edited transcript (not original) is sent to GPT-4o
- Monospace font for readability

### US-4: AI Extraction
As a sales rep, I see my brain dump transformed into structured deal intelligence so I can immediately use it.

**Acceptance Criteria:**
- Processing animation with phased steps ("Extracting deal intelligence...", "Building your debrief...")
- Extracted data includes: deal snapshot, key takeaways, objections (resolved/unresolved), next steps (with owners), decision makers (with sentiment), competitors, buying signals, risks
- Deal score 1-10 with one-sentence rationale
- Confidence indicators per field: high (explicitly stated), medium (strongly implied), low (loosely inferred)
- "Not mentioned" for missing data (never hallucinate)
- Results appear with staggered section-by-section reveal animation
- Each section in neo-brutalist card styling

### US-5: Deal Mind Map
As a sales rep, I see a visual mind map of the deal so I can see the full picture at a glance.

**Acceptance Criteria:**
- SVG mind map with central node (company name) and radiating branches
- Branches: objections, next steps, decision makers, buying signals, risks, competitors
- Neo-brutalist styling (thick strokes, volt accents, monospace font)
- Color-coded by sentiment/status
- Max 4 items per branch (truncate with "+N more")
- Screenshot-worthy quality

### US-6: PDF Download
As a sales rep, I download a branded PDF of my debrief so I can share it or reference it later.

**Acceptance Criteria:**
- Multi-page branded document (4 pages)
- Page 1: Cover with deal score, snapshot, summary
- Page 2: Key takeaways, objections table, next steps table
- Page 3: Stakeholders, signals, risks, competitors
- Page 4: Simplified mind map + bridge CTA
- Professional typography (Helvetica, clean spacing)
- Volt (#00E676) accent throughout
- Opens in new tab on mobile (doesn't navigate away from results)
- Filename: `streetnotes-debrief-YYYY-MM-DD.pdf`

### US-7: Bridge CTA
As a sales rep impressed by the results, I see a CTA to join the StreetNotes beta so I can get CRM auto-sync.

**Acceptance Criteria:**
- Prominent volt section at bottom of results
- Headline: "Now imagine this pushed straight to your CRM."
- Links to main site waitlist
- "Coming Soon" sticker badge

---

## Technical Requirements

### Routes
- `GET /debrief` — Public page (no auth)
- `POST /api/debrief/start` — Email gate + rate limit + session creation
- `POST /api/debrief/transcribe` — Whisper transcription (public)
- `POST /api/debrief/structure` — GPT-4o extraction
- `GET /api/debrief/pdf?sessionId=X` — PDF generation

### Database
- New table: `debrief_sessions` (migration 003)
  - `id` UUID PK
  - `email` TEXT NOT NULL
  - `created_at` TIMESTAMPTZ
  - `duration_sec` INTEGER
  - `raw_transcript` TEXT
  - `structured_output` JSONB
  - `pdf_generated` BOOLEAN
  - `source` TEXT DEFAULT 'debrief'
- RLS: anonymous insert/select/update (public tool)
- Index on (email, created_at DESC) for rate limiting

### Third-Party Services
- OpenAI Whisper (`whisper-1`) — transcription
- OpenAI GPT-4o — structured extraction (JSON mode)
- Resend — email notifications

### Dependencies (new)
- `@react-pdf/renderer` — server-side PDF
- `react-icons` — UI icons

---

## Design Requirements

### Visual System
- Neo-brutalist aesthetic matching landing page
- Colors: dark (#121212), volt (#00E676), white, black
- Fonts: Ranchers (display), Space Mono (mono), Plus Jakarta Sans (body)
- 4px borders, neo shadows, sticker badges
- Mobile-first: max-w-2xl centered container

### Mobile Requirements
- 44px minimum tap targets on all interactive elements
- No horizontal scroll at any viewport
- iPhone SE compatible (one-handed operation)
- Safe area padding for notched devices
- PDF opens in new tab (no navigation away)

---

## Success Metrics
- Waitlist conversion rate (email submitted / page visit)
- Debrief completion rate (results shown / email submitted)
- PDF download rate (downloads / completions)
- Time-to-complete (email to results)
- Bridge CTA click-through rate

## Out of Scope (v1)
- CRM auto-sync (paid feature)
- Session history / user accounts
- Multi-language support
- Team/manager sharing
- Audio storage (discarded after transcription)
