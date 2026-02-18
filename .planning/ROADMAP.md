# Roadmap: StreetNotes.ai

## Overview

StreetNotes.ai is built as a strict sequential pipeline: auth must exist before tokens can be user-scoped, audio capture must work before transcription is built, Claude's extraction schema must be stable before CRM write code is written, and OAuth connections must be live before any CRM push can happen. Six phases deliver the complete voice-to-CRM loop: a sales rep talks into their phone after a meeting, reviews the AI-structured output, and hits confirm — their CRM is updated with no manual data entry.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Auth Foundation** - Working Supabase auth, Next.js App Router scaffolding, and database schema with RLS
- [ ] **Phase 2: Voice Capture + Transcription** - Mobile voice recording with iOS format detection and Whisper transcription
- [ ] **Phase 3: AI Structuring Pipeline** - Claude structured output, CRMNote Zod schema, and note storage
- [ ] **Phase 4: CRM OAuth Connections** - Salesforce + HubSpot OAuth flows with encrypted token storage
- [ ] **Phase 5: CRM Push + Actions** - Create/update contacts, deals, and tasks in connected CRM with sync status
- [ ] **Phase 6: Review UI + Dashboard** - Editable review card, dashboard launch pad, and note history view

## Phase Details

### Phase 1: Auth Foundation
**Goal**: Users can securely sign up, log in, and access the app — and the project scaffolding, database schema, and middleware are in place for all future phases
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, UI-01
**Success Criteria** (what must be TRUE):
  1. User can create an account with email/password and is redirected to the dashboard
  2. User can log in with Google OAuth and land on the dashboard
  3. User stays logged in after closing and reopening the browser tab
  4. User can log out from any page and is returned to the login screen
  5. All pages are usable one-handed on an iPhone 14 with large, thumb-friendly tap targets
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Next.js 14 scaffold with Tailwind, Supabase client utilities, middleware, and mobile root layout
- [ ] 01-02-PLAN.md — Auth pages (login, sign-up, OAuth callback), server actions, protected layout, and dashboard
- [ ] 01-03-PLAN.md — Database migration (notes, crm_connections, deal_stage_cache) with RLS and indexes

### Phase 2: Voice Capture + Transcription
**Goal**: Users can record a voice note on any mobile device — including iOS Safari — and receive an accurate transcript of what they said
**Depends on**: Phase 1
**Requirements**: VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05
**Success Criteria** (what must be TRUE):
  1. User can tap Record on iPhone Safari and capture audio without format errors
  2. Recording duration shows in real-time while the user is speaking
  3. User sees an error with clear guidance if the audio file exceeds 25MB
  4. User receives a transcript within 30 seconds of stopping the recording
  5. Sales-specific terminology (deal stages, acronyms like ARR and MEDDIC) transcribes accurately
**Plans**: TBD

Plans:
- [ ] 02-01: useVoiceRecorder hook with MediaRecorder.isTypeSupported() format negotiation and real-time duration display
- [ ] 02-02: Client-side file size validation and /api/transcribe Route Handler with Whisper API and sales vocabulary prompt
- [ ] 02-03: Recording UI component (start/stop controls, duration display, upload progress, error states)

### Phase 3: AI Structuring Pipeline
**Goal**: A raw transcript is sent to Claude and returns a validated, structured CRM note — with all fields nullable and confidence indicators flagging uncertain extractions
**Depends on**: Phase 2
**Requirements**: AI-01, AI-02, AI-03, AI-04
**Success Criteria** (what must be TRUE):
  1. A complete transcript returns contact name, company, meeting summary, next steps, and deal stage as structured fields
  2. An incomplete transcript (e.g., "follow up with Sarah about the renewal") returns a partial result with no hallucinated values
  3. Low-confidence extractions are visibly flagged in the review UI so users know what to double-check
  4. The structured note is saved to Supabase and retrievable for future CRM push
**Plans**: TBD

Plans:
- [ ] 03-01: CRMNote Zod schema (all fields z.optional()), /api/structure Route Handler with zodOutputFormat() and Claude API
- [ ] 03-02: Confidence indicators in structured output and system prompt with few-shot examples of incomplete notes
- [ ] 03-03: Save structured note to Supabase notes table with transcript + structured fields + push status

### Phase 4: CRM OAuth Connections
**Goal**: Users can connect their Salesforce or HubSpot account once in Settings, and the app securely stores encrypted tokens and fetches their actual deal pipeline stages
**Depends on**: Phase 3
**Requirements**: CRM-01, CRM-02, CRM-03, CRM-04, CRM-09, UI-04
**Success Criteria** (what must be TRUE):
  1. User can initiate Salesforce OAuth from the Settings screen and land back in the app with a confirmed connection
  2. User can initiate HubSpot OAuth from the Settings screen and land back in the app with a confirmed connection
  3. CRM tokens are never exposed in the browser — all token reads happen server-side with the service role key
  4. The app proactively refreshes tokens before expiry without the user experiencing a CRM failure
  5. Deal stages shown in the review UI match the user's actual CRM pipeline stages, not hardcoded defaults
**Plans**: TBD

Plans:
- [ ] 04-01: Salesforce OAuth flow (/api/auth/salesforce/connect + /api/auth/salesforce/callback) with CSRF protection, instance_url storage, and AES-256-GCM token encryption
- [ ] 04-02: HubSpot OAuth flow (/api/auth/hubspot/connect + /api/auth/hubspot/callback) with CSRF protection and encrypted token storage
- [ ] 04-03: Proactive token refresh logic (5-min expiry check, Supabase advisory lock), deal stage cache fetch from both CRMs, and Settings screen UI

### Phase 5: CRM Push + Actions
**Goal**: After the user confirms the review card, the structured note is pushed into their connected CRM — creating or updating contacts, deals, and follow-up tasks — and the sync status is visible
**Depends on**: Phase 4
**Requirements**: CRM-05, CRM-06, CRM-07, CRM-08, CRM-10
**Success Criteria** (what must be TRUE):
  1. User can create a new opportunity/deal in their CRM from the review screen with one tap
  2. User can update an existing deal's notes and stage from the review screen
  3. User can create a new contact in their CRM if one is not found
  4. Follow-up tasks are automatically scheduled in the CRM from the next steps extracted in the note
  5. Each note shows a clear sync status — locally saved vs. pushed to CRM — and CRM push failures show a retry option
**Plans**: TBD

Plans:
- [ ] 05-01: /api/crm/push Salesforce branch — Contact create/update, Opportunity create/update, Task scheduling with proactive token refresh
- [ ] 05-02: /api/crm/push HubSpot branch — Contact/Deal/Note writes with exponential backoff on 429s and proactive 30-min token refresh
- [ ] 05-03: CRM sync status state (saved / crm_synced: pending / success / failed) persisted in Supabase and displayed in UI

### Phase 6: Review UI + Dashboard
**Goal**: The complete user-facing experience is polished — a fast launch pad to start recording, an editable review card to approve structured output, and a note history to reference past meetings
**Depends on**: Phase 5
**Requirements**: UI-02, UI-03, UI-05
**Success Criteria** (what must be TRUE):
  1. The dashboard loads with a prominent Record button that starts a new note in one tap
  2. Recent notes are listed on the dashboard so the user can see their history at a glance
  3. Every AI-extracted field in the review card is editable before the CRM push is triggered
  4. A past note's detail view shows the structured fields and the CRM sync status for that note
**Plans**: TBD

Plans:
- [ ] 06-01: Dashboard launch pad (prominent Record button, recent notes list)
- [ ] 06-02: Editable review card (all CRMNote fields editable, confidence indicators visible, CRM push trigger)
- [ ] 06-03: Note detail view (structured fields display, CRM sync status, retry CRM push option)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Auth Foundation | 0/3 | Planning complete | - |
| 2. Voice Capture + Transcription | 0/3 | Not started | - |
| 3. AI Structuring Pipeline | 0/3 | Not started | - |
| 4. CRM OAuth Connections | 0/3 | Not started | - |
| 5. CRM Push + Actions | 0/3 | Not started | - |
| 6. Review UI + Dashboard | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-18*
*Last updated: 2026-02-18 after Phase 1 planning*
