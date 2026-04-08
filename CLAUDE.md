# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StreetNotes.ai is a mobile-first voice-to-CRM web app. A sales rep finishes a meeting, talks into their phone for 60 seconds, reviews the AI-structured output, hits confirm, and their CRM is updated — no manual data entry.

**Parent brand:** ForgeTime.ai (micro-SaaS venture studio)
**Founders:** Jeff Meyers (GTM/Sales, 20+ years enterprise SaaS) + Michael Hervis (Strategy/Ops)

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm start            # Start production server
```

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + TypeScript
- **Backend:** Next.js API Routes (monorepo, no separate server)
- **Database/Auth:** Supabase (PostgreSQL + Auth via `@supabase/ssr`)
- **Transcription:** OpenAI Whisper API (`whisper-1` model)
- **AI Structuring:** Anthropic Claude API (`@anthropic-ai/sdk`, Sonnet 4.6 via tool_use)
- **CRM Targets:** Salesforce (jsforce v3) + HubSpot (`@hubspot/api-client`) — Phase 4+
- **Voice Capture:** Native MediaRecorder API (custom hook, no library)

## Architecture

### Route Groups
- `app/(auth)/` — Login, sign-up pages (public)
- `app/(protected)/` — Dashboard and app pages (auth-gated via server layout)
- `app/api/` — API route handlers

### Supabase Client Pattern
Three utility files — use the correct one based on context:
- `lib/supabase/client.ts` — Browser/Client Components
- `lib/supabase/server.ts` — Server Components and Route Handlers
- `lib/supabase/middleware.ts` — Middleware session refresh

**Critical:** Always use `getUser()` server-side, never `getSession()` (can be spoofed).

### Voice → Structure → Save Pipeline
```
useVoiceRecorder hook → MediaRecorder (MIME negotiation) → audioBlob
  → POST /api/transcribe (FormData) → OpenAI Whisper → transcript text
  → POST /api/structure (JSON) → Claude Sonnet tool_use → CRMNote (Zod-validated)
  → POST /api/notes (JSON) → Supabase notes table (transcript + structured JSONB)
```
- MIME negotiation at record-start: Safari produces `audio/mp4`, Chrome produces `audio/webm;codecs=opus`
- 25MB file size limit enforced client-side and server-side
- Audio discarded after transcription (no storage)
- `/api/transcribe` is authenticated and isolated from structuring for retry independence
- `/api/structure` uses Claude tool_use with a JSON schema to force structured output, then validates with Zod
- Confidence indicators (high/medium/low) flag uncertain extractions for user review
- All CRM fields are optional — incomplete transcripts produce partial results, no hallucination

### Database Schema (Supabase)
Four tables with RLS enabled — all scoped to `user_id`:
- `notes` — voice note transcripts + structured output (JSONB) + push_status (null/pending/success/failed)
- `crm_connections` — Encrypted OAuth tokens per CRM type (UNIQUE on user_id + crm_type), instance_url for Salesforce
- `deal_stage_cache` — Cached pipeline stages from connected CRM (UNIQUE on user_id + crm_type)
- `crm_push_log` — Audit trail per push attempt (note_id, crm_type, status, CRM record IDs, errors)

RLS policies use `(select auth.uid())` subquery form (evaluated once per query, not per row).

Migrations:
- `supabase/migrations/001_initial_schema.sql` — Tables, RLS, indexes
- `supabase/migrations/002_add_instance_url.sql` — instance_url column + deal_stage_cache unique constraint
- `supabase/migrations/013_crm_push_log.sql` — crm_push_log table + push_status column on notes

### Key Files
- `hooks/use-voice-recorder.ts` — Custom MediaRecorder hook with MIME negotiation
- `lib/audio/recording.ts` — Audio format utilities, MIME type preferences, size limits
- `lib/openai/server.ts` — Singleton OpenAI client + sales vocabulary Whisper prompt
- `lib/anthropic/server.ts` — Singleton Anthropic client (server-only)
- `lib/notes/schema.ts` — CRMNote Zod schema with confidence indicators
- `lib/notes/input-schema.ts` — JSON Schema for Claude tool_use input
- `lib/notes/prompts.ts` — System prompt + few-shot examples for CRM extraction
- `components/voice-note-capture.tsx` — Record → transcribe → structure → save UI component
- `app/api/structure/route.ts` — Claude structuring endpoint (auth + tool_use + Zod validation)
- `app/api/notes/route.ts` — Note CRUD (save transcript + structured output to Supabase)
- `lib/crm/encryption.ts` — AES-256-GCM encrypt/decrypt for CRM tokens (CRM_ENCRYPTION_KEY env var)
- `lib/crm/token-refresh.ts` — Proactive token refresh (5-min buffer before expiry) for SF + HS
- `lib/crm/salesforce.ts` — Salesforce deal stage fetching via Opportunity describe API
- `lib/crm/hubspot.ts` — HubSpot deal pipeline/stage fetching via CRM v3 API
- `app/api/auth/salesforce/connect/route.ts` — Initiate Salesforce OAuth (CSRF state cookie + redirect)
- `app/api/auth/salesforce/callback/route.ts` — Handle SF callback (code exchange, encrypt tokens, store)
- `app/api/auth/hubspot/connect/route.ts` — Initiate HubSpot OAuth (CSRF state cookie + redirect)
- `app/api/auth/hubspot/callback/route.ts` — Handle HS callback (code exchange, encrypt tokens, store)
- `app/api/crm/connections/route.ts` — GET connected CRMs (no tokens exposed), DELETE to disconnect
- `app/api/crm/stages/route.ts` — GET deal stages from connected CRM (24h cache)
- `app/(protected)/settings/page.tsx` — Settings page (CRM connections)
- `components/settings/crm-connections.tsx` — Connect/disconnect CRM cards with deal stage display
- `lib/crm/push/types.ts` — Shared types for CRM push (PushResult, PushOptions, CrmCandidate, CachedStage)
- `lib/crm/push/stage-mapper.ts` — Fuzzy deal stage mapping + value/name parsing utilities
- `lib/crm/push/salesforce.ts` — Salesforce push (Contact/Account/Opportunity/Task CRUD via REST API v59.0)
- `lib/crm/push/hubspot.ts` — HubSpot push (Contact/Company/Deal/Note/Task CRUD via CRM v3 API with 429 retry)
- `app/api/crm/push/route.ts` — POST endpoint: auth → load note → get tokens → dispatch to SF/HS → log result
- `middleware.ts` — Supabase session refresh on every request

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-anon-key>
OPENAI_API_KEY=<openai-api-key>
ANTHROPIC_API_KEY=<anthropic-api-key>
CRM_ENCRYPTION_KEY=<64-char-hex-string>
SALESFORCE_CLIENT_ID=<salesforce-connected-app-client-id>
SALESFORCE_CLIENT_SECRET=<salesforce-connected-app-client-secret>
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/salesforce/callback
SALESFORCE_AUTH_URL=https://login.salesforce.com
HUBSPOT_CLIENT_ID=<hubspot-app-client-id>
HUBSPOT_CLIENT_SECRET=<hubspot-app-client-secret>
HUBSPOT_REDIRECT_URI=http://localhost:3000/api/auth/hubspot/callback
```

See `.env.local.example`. Never commit `.env.local`.

## Build Progress

Phases 1-5 are complete. Phase 6 (Review UI + Dashboard) is next.

Full roadmap and execution plans live in `.planning/`:
- `.planning/PROJECT.md` — Core requirements and decisions
- `.planning/ROADMAP.md` — 6-phase build plan with success criteria
- `.planning/STATE.md` — Current position and session continuity
- `.planning/REQUIREMENTS.md` — All v1 requirements with traceability
- `.planning/phases/` — Per-phase research and execution plans

## Brain Dump Lead Magnet (Post-Call Brain Dump)

A free public tool at `/debrief` — the lead magnet for StreetNotes.ai. Demonstrates the core value prop: voice → structured CRM fields.

### Route
- `app/debrief/` — Public page (no auth required), added to middleware whitelist

### Flow
Email gate → Segment select → Voice recording → AI transcription (Whisper) → User reviews/edits transcript → GPT-4o CRM extraction → Results display with CRM preview + PDF download → Bridge CTA

### What It Extracts (CRM-focused, NOT coaching)
- Deal snapshot: company, stage, value, close date, next step
- Attendees: names, titles, roles in the deal, sentiment
- Call summary: 3-5 bullet points for CRM activity notes
- Follow-up tasks: actions, owners, due dates, priority
- Opportunity notes: ready-to-paste CRM description
- Additional: competitors, products discussed, pain points, risks

### Key Files
- `lib/debrief/types.ts` — TypeScript interfaces (DebriefStructuredOutput, DebriefStep)
- `lib/debrief/prompts.ts` — GPT-4o system and user prompts with few-shot examples
- `lib/debrief/pdf.tsx` — @react-pdf/renderer branded PDF (tear sheet + CTA)
- `components/debrief/` — All UI components (debrief-flow, email-gate, segment-selector, recorder, mic-button, waveform-visualizer, transcript-review, processing-steps, results-display, bridge-cta)
- `hooks/use-audio-analyser.ts` — Web Audio API waveform hook
- `app/api/debrief/start/` — Email gate + rate limiting + session creation
- `app/api/debrief/transcribe/` — Public Whisper transcription
- `app/api/debrief/structure/` — GPT-4o CRM field extraction
- `app/api/debrief/pdf/` — PDF generation endpoint

### Database
- `debrief_sessions` table (migration 003) — tracks email, transcript, structured output per session
- Rate limit: 3 debriefs/day/email (enforced in `/api/debrief/start`)

### Dependencies Added
- `@react-pdf/renderer` — server-side PDF generation
- `react-icons` — UI icons (mic, stop, download, check)

### Bridge Mechanic
Free: CRM-ready structured fields, follow-up tasks, opportunity notes, one-time PDF export
Missing (paid): auto-push to CRM, follow-ups scheduled automatically, deal history across calls, Salesforce + HubSpot integration

### Important: NOT a coaching tool
StreetNotes does NOT do deal coaching, pattern recognition, buyer psychology, or objection diagnostics. That's Gong's lane. StreetNotes extracts CRM-ready data from voice and pushes it to the CRM. The differentiator is the CRM integration, not the analysis.

## Key Decisions (Do Not Override)

- Use `@supabase/ssr` — the older `@supabase/auth-helpers-nextjs` is deprecated
- `tailwindcss-safe-area@0.1.0` — v1.3.0 breaks webpack in Next.js 14
- Keep `/api/transcribe` separate from AI structuring — retry isolation
- User always reviews structured output before CRM push — no auto-push
- Public routes: `/login`, `/sign-up`, `/auth`, `/debrief` — all others require auth
- Mobile-first layout: `max-w-md mx-auto` with thumb-friendly 44px min tap targets

## Ideabrowser Project

Strategy, offer definition, brand voice, and ICP are managed in Ideabrowser (MCP tool).
- **Project ID:** `f75b829b-c0c0-451b-97f1-12bb813ce610`
- **Idea ID:** `6297`
- Use `get_project_context` with this project ID to load full strategic context.

## Brand Voice (for any copy/UI text)

Direct. Fast. Zero fluff. Speaks like a rep, not a SaaS startup. No buzzwords. No corporate speak.
- Lead with the problem, not the product
- Short punchy sentences. Fragments welcome.
- Never use: "leverage," "synergy," "robust," "seamlessly," "game-changer," "revolutionary," "empower," "enable," "solution," "platform"
- Profanity OK when natural. No emoji in product copy.
- Full voice profile saved in Ideabrowser context files.
