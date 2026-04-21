# Requirements: StreetNotes.ai

**Defined:** 2026-02-18
**Core Value:** A sales rep finishes a meeting, talks into their phone for 60 seconds, reviews the structured output, hits confirm, and their CRM is updated — no manual data entry.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can create account with email/password via Supabase
- [ ] **AUTH-02**: User can log in with Google OAuth
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: User can log out from any page

### Voice Pipeline

- [ ] **VOICE-01**: User can start/stop voice recording via MediaRecorder API with iOS Safari format detection
- [ ] **VOICE-02**: Recording duration displays in real-time while recording
- [ ] **VOICE-03**: Audio file size validated (<25MB) before upload with user feedback
- [ ] **VOICE-04**: Audio uploaded to `/api/transcribe` and transcribed via Whisper API (whisper-1)
- [ ] **VOICE-05**: Whisper prompt includes sales vocabulary for jargon accuracy

### AI Structuring

- [ ] **AI-01**: Transcript sent to Claude API with structured output (Zod schema via `output_config.format`)
- [ ] **AI-02**: Extracts: contact name, company, meeting summary, next steps, deal stage
- [ ] **AI-03**: All CRM fields are nullable — handles incomplete notes without hallucination
- [ ] **AI-04**: Confidence indicators flag low-confidence extractions for user review

### CRM Integration

- [ ] **CRM-01**: User can connect Salesforce via OAuth (with CSRF protection)
- [ ] **CRM-02**: User can connect HubSpot via OAuth (with CSRF protection)
- [ ] **CRM-03**: CRM tokens stored encrypted in Supabase, never exposed to browser
- [ ] **CRM-04**: Proactive token refresh before expiry (no reactive 401 loops)
- [ ] **CRM-05**: User can create new opportunity/deal in connected CRM
- [ ] **CRM-06**: User can update existing deal (notes, stage) in connected CRM
- [ ] **CRM-07**: User can create new contact if not found in CRM
- [ ] **CRM-08**: Follow-up tasks/activities auto-scheduled from extracted next steps
- [ ] **CRM-09**: Pipeline stages fetched from user's CRM and cached in Supabase
- [ ] **CRM-10**: CRM sync status displayed (saved locally vs. pushed to CRM)

### UI/UX

- [ ] **UI-01**: Mobile-first responsive design (thumb-friendly, large tap targets)
- [ ] **UI-02**: Dashboard as simple launch pad (prominent Record button + recent notes)
- [ ] **UI-03**: Editable review card — all AI-extracted fields editable before CRM push
- [ ] **UI-04**: Settings screen for CRM connection and deal stage configuration
- [ ] **UI-05**: Note detail view showing structured fields and CRM sync status

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
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| UI-01 | Phase 1 | Pending |
| VOICE-01 | Phase 2 | Pending |
| VOICE-02 | Phase 2 | Pending |
| VOICE-03 | Phase 2 | Pending |
| VOICE-04 | Phase 2 | Pending |
| VOICE-05 | Phase 2 | Pending |
| AI-01 | Phase 3 | Pending |
| AI-02 | Phase 3 | Pending |
| AI-03 | Phase 3 | Pending |
| AI-04 | Phase 3 | Pending |
| CRM-01 | Phase 4 | Pending |
| CRM-02 | Phase 4 | Pending |
| CRM-03 | Phase 4 | Pending |
| CRM-04 | Phase 4 | Pending |
| CRM-09 | Phase 4 | Pending |
| UI-04 | Phase 4 | Pending |
| CRM-05 | Phase 5 | Pending |
| CRM-06 | Phase 5 | Pending |
| CRM-07 | Phase 5 | Pending |
| CRM-08 | Phase 5 | Pending |
| CRM-10 | Phase 5 | Pending |
| UI-02 | Phase 6 | Pending |
| UI-03 | Phase 6 | Pending |
| UI-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 after roadmap creation — all 28 requirements mapped*
