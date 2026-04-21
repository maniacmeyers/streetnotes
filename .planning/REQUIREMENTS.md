# Requirements: StreetNotes.ai

**Defined:** 2026-02-18
**Core Value:** A sales rep finishes a meeting, talks into their phone for 60 seconds, reviews the structured output, hits confirm, and their CRM is updated — no manual data entry.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can create account with email/password via Supabase
- [x] **AUTH-02**: User can log in with Google OAuth
- [x] **AUTH-03**: User session persists across browser refresh
- [x] **AUTH-04**: User can log out from any page

### Voice Pipeline

- [x] **VOICE-01**: User can start/stop voice recording via MediaRecorder API with iOS Safari format detection
- [x] **VOICE-02**: Recording duration displays in real-time while recording
- [x] **VOICE-03**: Audio file size validated (<25MB) before upload with user feedback
- [x] **VOICE-04**: Audio uploaded to `/api/transcribe` and transcribed via Whisper API (whisper-1)
- [x] **VOICE-05**: Whisper prompt includes sales vocabulary for jargon accuracy

### AI Structuring

- [x] **AI-01**: Transcript sent to Claude API with structured output (tool_use + Zod validation of CRM fields)
- [x] **AI-02**: Extracts: contact name, company, meeting summary, next steps, deal stage
- [x] **AI-03**: All CRM fields are nullable — handles incomplete notes without hallucination
- [x] **AI-04**: Confidence indicators flag low-confidence extractions for user review

### CRM Integration

- [x] **CRM-01**: User can connect Salesforce via OAuth (with CSRF protection)
- [x] **CRM-02**: User can connect HubSpot via OAuth (with CSRF protection)
- [x] **CRM-03**: CRM tokens stored encrypted in Supabase, never exposed to browser
- [x] **CRM-04**: Proactive token refresh before expiry (no reactive 401 loops)
- [x] **CRM-05**: User can create new opportunity/deal in connected CRM
- [x] **CRM-06**: User can update existing deal (notes, stage) in connected CRM
- [x] **CRM-07**: User can create new contact if not found in CRM
- [x] **CRM-08**: Follow-up tasks/activities auto-scheduled from extracted next steps
- [x] **CRM-09**: Pipeline stages fetched from user's CRM and cached in Supabase
- [x] **CRM-10**: CRM sync status displayed (saved locally vs. pushed to CRM)

### UI/UX

- [x] **UI-01**: Mobile-first responsive design (thumb-friendly, large tap targets)
- [x] **UI-02**: Dashboard as simple launch pad (prominent Record button + recent notes)
- [x] **UI-03**: Editable review card — all AI-extracted fields editable before CRM push
- [x] **UI-04**: Settings screen for CRM connection and deal stage configuration
- [x] **UI-05**: Note detail view showing structured fields and CRM sync status

## v2 Requirements

### Sales Intelligence

- **INTEL-01**: AI-generated lead elevator pitch from CRM + note data
- **INTEL-02**: Customer story extraction from accumulated notes
- **INTEL-03**: Sales coaching insights from note patterns

### Enhanced Voice

- **VOICE-06**: Multi-language transcription support
- **VOICE-07**: Audio playback in review for correction
- **VOICE-08**: Bulk review queue for end-of-day processing

### Team Features

- **TEAM-01**: Team admin view of rep activity
- **TEAM-02**: Push notifications for unreviewed notes
- **TEAM-03**: Shared note templates

## Out of Scope

| Feature | Reason |
|---------|--------|
| Live call recording / bot joining | Gong/Chorus territory; wrong use case for post-meeting field sales |
| Real-time transcription during meetings | Reps are in-person; phone in pocket; no value |
| Sales coaching / conversation analytics | Requires large corpus; separate product (v2+) |
| Email drafting from notes | Low adoption; reps use existing email clients |
| Zapier / webhook marketplace | Engineering distraction at MVP; ship direct CRM integrations |
| CRMs beyond Salesforce + HubSpot | Long tail; each CRM is months of work; expand after v1 |
| Desktop app | Field reps are on phones; mobile-first web is sufficient |
| Full-text search of past notes | Low urgency; reps find past notes in their CRM |
| Note sharing / collaboration | Enterprise feature requiring team management surface |
| Offline recording queue | Deferred — adds complexity; require network for MVP |
| Mobile app wrappers (React Native) | Mobile-first web only for MVP |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| UI-01 | Phase 1 | Complete |
| VOICE-01 | Phase 2 | Complete |
| VOICE-02 | Phase 2 | Complete |
| VOICE-03 | Phase 2 | Complete |
| VOICE-04 | Phase 2 | Complete |
| VOICE-05 | Phase 2 | Complete |
| AI-01 | Phase 3 | Complete |
| AI-02 | Phase 3 | Complete |
| AI-03 | Phase 3 | Complete |
| AI-04 | Phase 3 | Complete |
| CRM-01 | Phase 4 | Complete |
| CRM-02 | Phase 4 | Complete |
| CRM-03 | Phase 4 | Complete |
| CRM-04 | Phase 4 | Complete |
| CRM-09 | Phase 4 | Complete |
| UI-04 | Phase 4 | Complete |
| CRM-05 | Phase 5 | Complete |
| CRM-06 | Phase 5 | Complete |
| CRM-07 | Phase 5 | Complete |
| CRM-08 | Phase 5 | Complete |
| CRM-10 | Phase 5 | Complete |
| UI-02 | Phase 6 | Complete |
| UI-03 | Phase 6 | Complete |
| UI-05 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-04-14 — v1 requirements marked complete; aligns with `.planning/STATE.md` (Phase 6 complete).*
