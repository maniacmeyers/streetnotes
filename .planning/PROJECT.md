# StreetNotes.ai

## What This Is

A mobile-first web app for field sales reps who currently type meeting notes manually into their CRM. StreetNotes lets them capture a voice note after a meeting, which gets transcribed (Whisper), structured by AI (Claude) into CRM-ready fields, and — after the rep reviews and approves — pushed directly into their CRM (Salesforce or HubSpot). It creates opportunities, updates deals, schedules follow-ups, and creates contacts automatically.

## Core Value

A sales rep finishes a meeting, talks into their phone for 60 seconds, reviews the structured output, hits confirm, and their CRM is updated — no manual data entry.

## Requirements

### Validated

(None yet — ship to validate)

### Active (v1 — shipped per `.planning/STATE.md`, 2026-04-08)

- [x] User auth (email/password) via Supabase
- [x] Voice recording via MediaRecorder API (start/stop, mobile-first)
- [x] Transcription via OpenAI Whisper API (whisper-1 model) through Next.js API route
- [x] AI structuring via Claude API — extracts: contact name, company, meeting summary, next steps, deal stage
- [x] Deal stages are user-configurable (pulled from connected CRM, editable in settings)
- [x] Editable review card — user reviews and edits structured output before CRM push
- [x] CRM integration: Salesforce (OAuth)
- [x] CRM integration: HubSpot (OAuth)
- [x] CRM actions: create new opportunity/deal from first meeting
- [x] CRM actions: update existing deal (add notes, update stage)
- [x] CRM actions: schedule follow-up task/event for next steps
- [x] CRM actions: create new contact if they don't exist
- [x] Save note to Supabase (local record of all notes)
- [x] Dashboard as simple launch pad (prominent Record button)
- [x] Note detail view (view past note with structured fields)
- [x] Settings screen: CRM connection (OAuth), deal stage configuration

### Out of Scope

- Onboarding flows — manual setup is fine for MVP
- Follow-up management / reminders — CRM handles this after push
- Mobile app wrappers (React Native, Capacitor) — mobile-first web only
- CRMs beyond Salesforce and HubSpot — add later based on demand
- Team features / multi-user accounts — single user per account for MVP
- Real-time collaboration — not relevant for individual note capture
- Audio playback / storage — we transcribe and discard audio for MVP
- Auto-push mode — always review before CRM push in MVP

## Context

- Target user: field sales rep who has 3-8 in-person meetings per day and currently types notes into CRM manually (or forgets to)
- The friction they face: after a meeting they're rushing to the next one. Typing detailed notes into Salesforce on a phone is painful. Notes get lost or are too sparse to be useful.
- Voice capture is the unlock — talking is 3-5x faster than typing and can be done while walking to the car
- CRM integration is core to the value prop, not a nice-to-have. If the data doesn't land in the CRM, the rep still has to do manual work.
- Two CRM targets: Salesforce (enterprise reps) and HubSpot (SMB/startup reps)
- OAuth is the connection method — user connects once in settings, stays connected

## Constraints

- **Tech stack**: Next.js 14 (App Router), Tailwind CSS, Supabase (auth + DB), OpenAI Whisper API, Anthropic Claude API — all specified by user
- **Architecture**: Single repo, Next.js API routes for backend (no separate server for MVP)
- **Voice capture**: Browser MediaRecorder API — no native app dependencies
- **CRM auth**: OAuth flows for both Salesforce and HubSpot
- **Review flow**: User always reviews structured output before CRM push — no auto-push

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Include CRM integration in MVP | CRM push is core to value prop — without it, user still does manual work | Shipped (v1) |
| Salesforce + HubSpot for MVP | Covers enterprise + SMB segments | Shipped (v1) |
| OAuth for CRM connection | Standard, user-friendly, no API key management | Shipped (v1) |
| Always-review before CRM push | Builds trust, prevents bad data in CRM | Shipped (v1) |
| User-configurable deal stages from CRM | Stages vary per org, must match their pipeline | Shipped (v1) |
| Simple launch pad dashboard | Speed matters — get to recording fast | Shipped (v1) |
| Discard audio after transcription | Simplifies storage, privacy-friendly for MVP | Shipped (v1) |

---
*Last updated: 2026-04-14 — Active requirements and decisions reconciled to shipped v1 (see `.planning/STATE.md`).*
