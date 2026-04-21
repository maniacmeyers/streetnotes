# Project Research Summary

**Project:** StreetNotes.ai
**Domain:** Mobile-first voice-to-CRM field sales note capture
**Researched:** 2026-02-18
**Confidence:** MEDIUM-HIGH

## Executive Summary

StreetNotes.ai occupies a genuinely underserved niche: the post-meeting voice note for field sales reps who just walked out of an in-person customer visit. Competitors (Gong, Otter.ai, Fireflies) are built around live call recording — they cannot serve in-person meetings. The closest direct competitors (Hey DAN, snapAddy VisitReport) validate that this workflow is real and paid-for. The recommended architecture is a sequential processing pipeline in a Next.js App Router monorepo: browser captures audio via MediaRecorder, server-side Route Handlers handle all AI and CRM API calls (Whisper transcription → Claude structuring → CRM push), and Supabase serves as the persistence and auth layer. The stack is confirmed and all library versions are verified as of 2026-02-18.

The product is built around a strict sequential pipeline with no room for architectural shortcuts: Auth must precede all token operations; audio format negotiation must be correct before transcription is built; Claude structuring must define the CRMNote schema before any CRM write code is written. The single biggest differentiator to ship in MVP is pulling real deal stages from the user's connected CRM — this alone closes the adoption objection that kills competitors. Everything else (bulk review queue, audio playback, push notifications, team admin view) is explicitly deferred to post-MVP.

The critical risks are concentrated in three areas: (1) iOS Safari's incompatible audio format requires format negotiation on day one or the product silently fails for iPhone users; (2) CRM OAuth token management requires careful server-side-only storage, proactive refresh to avoid race conditions, and encryption at rest — getting any of these wrong causes silent CRM failures that destroy user trust; (3) Claude's extraction schema must treat all CRM fields as optional from the start, because real voice notes are incomplete and partial, and a rigid schema either hallucinates or refuses. These pitfalls are all buildable-around if addressed in the correct phase.

---

## Key Findings

### Recommended Stack

All core technology choices are user-locked decisions — the research task was to fill in sub-library selections and verify versions. Every library listed below has been verified against live npm registry data and official documentation as of 2026-02-18. The most important call-outs: use `@supabase/ssr` (not the deprecated `@supabase/auth-helpers-nextjs`), use `jsforce` v3 only (v1/v2 are EOL), use `@hubspot/api-client` (not the unmaintained `hubspot` package), and use `next-auth@5` beta for OAuth orchestration (it has built-in Salesforce and HubSpot providers that better-auth lacks).

For voice recording, the library choice (`react-media-recorder` v1.7.2) is viable, but a custom ~80-line `useVoiceRecorder` hook using native MediaRecorder is equally recommended — it eliminates a dependency and gives full control over encoding. Audio format must be negotiated at record-start using `MediaRecorder.isTypeSupported()` rather than hardcoded.

**Core technologies:**
- `next-auth@5` (beta): OAuth orchestration — built-in Salesforce + HubSpot providers, saves weeks vs. custom OAuth
- `@supabase/supabase-js` ^2.97.0 + `@supabase/ssr` ^0.8.0: Auth, database, token storage — SSR package is current endorsed approach for App Router
- `openai` ^6.22.0: Whisper transcription — `audio/webm` from MediaRecorder is a supported format
- `@anthropic-ai/sdk` ^0.76.0: Claude AI structuring — use `output_config.format` with `zodOutputFormat()` for guaranteed-valid JSON
- `jsforce` ^3.10.14: Salesforce client — v3 is GA, v1/v2 are EOL with no security patches
- `@hubspot/api-client` ^13.4.0: HubSpot client — official V3 API client, not the unmaintained `hubspot` package
- `zod` ^4.3.6: Schema validation — defines CRMNote type used throughout the pipeline

See `/Users/guapo/Documents/Streetnotes/.planning/research/STACK.md` for full installation commands, version table, and open questions.

### Expected Features

The critical path through the feature set is: Auth → CRM OAuth → Voice Recording → Transcription → AI Structuring → Review UI → CRM Push. Every other feature is an enhancement on top of this loop. The review step (user edits AI output before CRM push) is non-negotiable — automated CRM writes without user confirmation destroy data trust and are a direct objection that kills competitor adoption.

**Must have in MVP (table stakes):**
- Auth (login/logout) — prerequisite for all token operations
- CRM OAuth connection for Salesforce + HubSpot — required before any CRM write
- Deal stages pulled from user's actual CRM (not hardcoded) — closes the #1 adoption objection
- Voice recording on mobile (MediaRecorder) — core input method, reps will not type
- Whisper transcription (async, server-side) — latency target < 30s
- Claude AI structuring — contact, company, summary, next steps, deal stage (all fields optional)
- Review UI — all fields editable before push, clear error states
- CRM push — create contact, create/update deal, schedule follow-up task, update deal stage
- Offline recording queue — record locally, upload on reconnect (mobile signal loss is real)
- Clear error states for transcription and CRM push failures

**Should have (differentiators worth shipping in or near MVP):**
- AI field confidence indicators — flag low-confidence extractions in review UI (builds trust faster)
- Speed-to-complete metric — show "CRM updated in 45 seconds" (makes value visceral, low implementation cost)
- Smart dupe prevention — check if contact/deal exists before creating (add after seeing real CRM write patterns)

**Defer to post-MVP (explicit anti-scope-creep list):**
- Multi-language transcription (Whisper supports it, but prompt/structuring needs tuning; English first)
- Bulk review queue (single-note flow first)
- Audio playback in review (adds storage complexity)
- Push notifications (requires PWA install)
- Team admin view (separate product surface, enterprise v2)
- Third CRM: Pipedrive, Dynamics (expansion round after Salesforce + HubSpot are solid)
- Live call recording, real-time transcription, email drafting — explicit anti-features

See `/Users/guapo/Documents/Streetnotes/.planning/research/FEATURES.md` for competitive snapshot and feature dependency graph.

### Architecture Approach

StreetNotes is a sequential processing pipeline embedded in a Next.js App Router monorepo. The browser handles only recording and UI — all external API calls (Whisper, Claude, Salesforce, HubSpot) are made exclusively from server-side Route Handlers under `app/api/`. CRM tokens are never exposed to the browser. Supabase holds three tables: `notes` (transcript + structured output + push status), `crm_connections` (encrypted tokens, one row per user per CRM), and `deal_stage_cache` (pipeline stages with TTL invalidation).

The five steps of the pipeline are intentionally separate Route Handlers (not one combined request) — this allows the UI to show the transcript before structuring, supports independent retries, and avoids hitting serverless timeouts on slow mobile networks.

**Major components:**
1. Browser recording layer — MediaRecorder with format negotiation + Blob assembly; sends FormData to `/api/transcribe`
2. `/api/transcribe` — receives audio, forwards to Whisper API, returns raw transcript
3. `/api/structure` — sends transcript to Claude with Zod-validated JSON schema, saves to Supabase `notes`, returns typed CRMNote
4. Review UI — user edits AI output; all fields writable before CRM push is triggered
5. `/api/crm/push` — reads encrypted tokens from Supabase (service role key only), refreshes if expiring, calls Salesforce or HubSpot REST API
6. `/api/auth/[crm]/connect` + `/api/auth/[crm]/callback` — OAuth flows with CSRF protection; stores tokens in `crm_connections`

**Critical constraint:** The browser never holds CRM tokens. Token reads are service-role-key-only on the server side.

See `/Users/guapo/Documents/Streetnotes/.planning/research/ARCHITECTURE.md` for complete route handler structure, Supabase schema DDL, code patterns, and anti-patterns.

### Critical Pitfalls

1. **iOS Safari MediaRecorder format mismatch** — Safari produces `audio/mp4`, not `audio/webm`. Hardcoding webm silently produces recordings that Whisper cannot parse on all iPhones. Fix: implement `MediaRecorder.isTypeSupported()` negotiation on day one of audio work; test on a real iOS device before any release. (Confidence: HIGH)

2. **Token refresh race condition in App Router** — Next.js parallel rendering can trigger multiple simultaneous token refresh attempts, each invalidating the previous refresh token. Fix: centralize token refresh in a single Route Handler with proactive expiry check (refresh if expires within 5 min), not reactive 401 retry; use Supabase `select for update` advisory lock to prevent concurrent refreshes. (Confidence: HIGH)

3. **CRM tokens stored in plaintext** — OAuth tokens grant write access to production CRM data. RLS alone is not sufficient — a compromised service role key or DB admin exposes all credentials. Fix: encrypt `access_token` and `refresh_token` columns using AES-256-GCM with an env-var key, or use Supabase Vault. Non-negotiable before any real user data. (Confidence: MEDIUM)

4. **Claude extraction schema too rigid** — Real voice notes are incomplete ("follow up with Sarah about the renewal" has no company, no amount). A required-fields schema causes hallucination or refusal. Fix: all CRM fields must be `z.optional()` in the Zod schema; add a `confidence` field per extraction; include few-shot examples of incomplete notes in the system prompt. (Confidence: HIGH)

5. **Supabase `getSession()` used server-side** — `getSession()` trusts the client-supplied cookie without re-validating the JWT; it can be spoofed. Fix: always use `getUser()` in Server Components, Route Handlers, and middleware. (Confidence: HIGH — explicitly documented by Supabase)

Additional moderate pitfalls: Salesforce instance URL must be stored per-user from the OAuth token response (never hardcoded); HubSpot 401 responses must NOT trigger automatic token refresh (causes infinite loop); Whisper 25 MB limit requires client-side size check before upload; silent CRM sync failure requires two-state UI (saved vs. crm_synced).

See `/Users/guapo/Documents/Streetnotes/.planning/research/PITFALLS.md` for full prevention strategies and phase-specific warning table.

---

## Implications for Roadmap

Based on the feature dependency graph, architecture pipeline, and pitfall phase-mapping, the suggested build order has 6 phases. Each phase has a strict prerequisite — no phase can be safely started without the previous being complete.

### Phase 1: Auth Foundation + Project Setup
**Rationale:** Every API route needs to authenticate the caller. CRM tokens cannot be user-scoped without auth. Supabase `getUser()` (not `getSession()`) pattern must be established before any sensitive data is handled — retrofitting this causes security regressions.
**Delivers:** Working Supabase auth (signup, login, session middleware), Next.js App Router project structure, `notes` + `crm_connections` + `deal_stage_cache` Supabase tables with RLS, `middleware.ts` for session refresh.
**Addresses:** Table stakes — "Basic auth (login/logout)"
**Avoids:** Pitfall 11 (getSession spoofing), Pitfall 5 (plaintext token storage — schema set up with encryption plan from start)

### Phase 2: Audio Capture + Transcription
**Rationale:** Core value proposition. Proves the mobile audio pipeline works before building downstream components. Format negotiation must be correct at this phase — retrofitting iOS support after transcription is built requires touching every layer.
**Delivers:** MediaRecorder component with `isTypeSupported()` format negotiation, Blob upload to `/api/transcribe`, Whisper transcription returning raw transcript, client-side file size validation (25 MB guard), wake lock + visibility API handling for iOS screen lock.
**Addresses:** Table stakes — "Voice recording (mobile)", "Audio transcription"
**Avoids:** Pitfall 1 (Safari format mismatch), Pitfall 2 (Whisper 25 MB limit), Pitfall 10 (iOS screen lock stops recording)
**Research flag:** Standard pattern — well-documented MediaRecorder + Whisper integration; no additional research needed.

### Phase 3: AI Structuring Pipeline
**Rationale:** Requires working transcript from Phase 2. Defines the `CRMNote` Zod schema that ALL downstream CRM push code depends on — changing the schema after CRM write code is built is expensive. This is also when the system prompt and few-shot examples are developed, which requires iteration.
**Delivers:** `/api/structure` Route Handler, `CRMNote` Zod schema (all fields optional), Claude structured output with `zodOutputFormat()`, note saved to Supabase `notes` table, transcript review UI with editable fields before push is triggered.
**Addresses:** Table stakes — "AI-generated summary", "Contact name + company extraction", "Next steps / action items extraction", "Editable review before CRM push"
**Avoids:** Pitfall 9 (rigid schema causes hallucination/refusal)
**Research flag:** Prompt engineering for field extraction is the work here — may need iteration and testing with real voice note samples before the schema stabilizes.

### Phase 4: CRM OAuth Connections
**Rationale:** Must be complete before any CRM push. OAuth flows for both CRMs can be built and tested with mock push calls. Token encryption must be implemented in this phase — do not store plaintext tokens even temporarily.
**Delivers:** Salesforce OAuth flow (`/api/auth/salesforce/connect` + `/api/auth/salesforce/callback`), HubSpot OAuth flow (`/api/auth/hubspot/connect` + `/api/auth/hubspot/callback`), CSRF state validation, encrypted token storage in `crm_connections`, `instance_url` stored per Salesforce user, CRM connection health indicator in UI.
**Addresses:** Table stakes — "OAuth CRM connection (user-initiated)"
**Avoids:** Pitfall 3 (Salesforce refresh token invalidation), Pitfall 4 (token refresh race condition), Pitfall 5 (plaintext token storage), Pitfall 6 (hardcoded Salesforce instance URL), Pitfall 14 (missing `refresh_token` scope)
**Research flag:** jsforce v3 `refresh` event handling in stateless serverless Route Handlers needs confirmation — specifically how to capture the event and persist new tokens to Supabase. Salesforce sandbox vs. production endpoint strategy also needs team decision before implementation.

### Phase 5: CRM Push — Salesforce
**Rationale:** Requires Phase 3 (CRMNote schema) and Phase 4 (valid tokens). Salesforce first because it is the dominant enterprise CRM and the harder integration — getting it right establishes patterns HubSpot push will follow.
**Delivers:** `/api/crm/push` Route Handler with proactive token refresh (5-min expiry check, not reactive 401), Salesforce REST API calls for Contact create/update, Opportunity create/update, Task scheduling, deal stage update using user's actual pipeline stages from `deal_stage_cache`, CRM sync status in UI (saved vs. crm_synced: pending/success/failed).
**Addresses:** Table stakes — "Push to Salesforce", "Deal stage update", "Create new contact", "Create new opportunity", "Follow-up task scheduling"; Differentiator — "Configurable deal stages (pulled from CRM)"
**Avoids:** Pitfall 4 (refresh race condition), Pitfall 13 (silent sync failure)

### Phase 6: CRM Push — HubSpot
**Rationale:** HubSpot-specific quirks (30-minute token expiry, 401-is-not-refresh, Search API rate limits) are meaningfully different from Salesforce and warrant a separate phase. Building on the patterns from Phase 5 (token refresh, push architecture, sync status).
**Delivers:** HubSpot OAuth token refresh (proactive, 30-min expiry), `/api/crm/push` HubSpot branch, Contacts/Deals/Notes writes with minimal required scopes, exponential backoff + 429 handling for Search API rate limits, contact ID caching to avoid repeated lookups.
**Addresses:** Table stakes — "Push to HubSpot"
**Avoids:** Pitfall 7 (HubSpot 401 infinite refresh loop), Pitfall 8 (Search API rate limits), Pitfall 15 (scope creep failing app review)
**Research flag:** HubSpot public app vs. private app decision must be made before this phase — public app (OAuth) is required for multi-user, but the review process and scope requirements differ. Confirm app type before implementing.

### Phase Ordering Rationale

- Auth precedes everything because token scoping is impossible without a user identity
- Audio + Transcription precedes AI Structuring because the CRMNote schema is best designed against real transcription output samples, not hypothetical strings
- AI Structuring precedes CRM OAuth because the CRMNote type defines what data gets pushed — CRM write code is written to the schema
- Both CRM OAuth phases precede their respective CRM Push phases (obvious hard dependency)
- Salesforce before HubSpot because Salesforce has more complexity (instance URLs, longer-lived tokens, SOAP deprecation warnings) — patterns established in Salesforce make HubSpot integration faster

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (CRM OAuth):** jsforce v3 token refresh event handling in stateless serverless functions is not a standard pattern. Confirm approach before implementation.
- **Phase 4 (CRM OAuth):** Salesforce sandbox vs. production auth endpoint strategy needs explicit env variable plan.
- **Phase 6 (HubSpot Push):** HubSpot public app vs. private app distinction affects OAuth flow, scope requirements, and marketplace review. Needs explicit team decision.
- **Phase 3 (AI Structuring):** Prompt engineering for field extraction — plan for iteration cycles before schema stabilizes. Consider building a small test harness with 10-15 sample voice note transcripts.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Auth):** `@supabase/ssr` + Next.js 14 App Router auth is a documented, well-tested pattern with official Supabase guides.
- **Phase 2 (Audio):** MediaRecorder + Whisper pipeline is well-documented; all edge cases (iOS format, 25 MB limit) are identified.
- **Phase 5 (Salesforce Push):** jsforce v3 CRUD operations on Contact/Opportunity/Task are standard API calls with good documentation.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All library versions verified against live npm registry and official docs on 2026-02-18. One medium-confidence item: next-auth@5 is beta — stable for production but watch for stable release. |
| Features | MEDIUM | Core table stakes verified across multiple competitors and official CRM docs. Differentiator value (confidence indicators, speed metric) is inference from UX research, not direct user validation. |
| Architecture | HIGH | Verified against official Next.js 14, Anthropic, Supabase, HubSpot, and MDN documentation. Pipeline pattern is well-established for this type of integration. |
| Pitfalls | HIGH | Critical pitfalls (iOS Safari, token refresh race condition, getSession spoofing) are confirmed by official documentation. Moderate pitfalls confirmed by official API docs and credible post-mortems. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **jsforce v3 refresh event in serverless context:** How to capture jsforce's `refresh` event in a stateless Next.js Route Handler and persist the new token back to Supabase. This is a non-trivial pattern. Address during Phase 4 planning.
- **Supabase Transparent Column Encryption availability:** Supabase's native column encryption was in early access as of research date. If unavailable, application-level AES-256-GCM encryption is the fallback. Evaluate at Phase 4 start.
- **HubSpot public app review timeline:** If the app needs to be listed in the HubSpot marketplace, the review process has lead time. Scope this decision early — it affects Phase 6 planning.
- **Whisper prompt parameter effectiveness for sales jargon:** The Whisper `prompt` parameter can reduce acronym errors (NRR, MEDDIC, ARR), but effectiveness varies. Plan for a transcription quality tuning pass after real-world notes are collected.
- **next-auth@5 stable release timing:** The beta has been production-stable for months but has not shipped a stable version. Monitor during development. The Better Auth acquisition introduces mild organizational uncertainty — both parties have committed to continued maintenance.

---

## Sources

### Primary (HIGH confidence)
- Supabase SSR docs — https://supabase.com/docs/guides/auth/server-side/nextjs
- Next.js App Router Route Handlers — https://nextjs.org/docs/app/api-reference/file-conventions/route
- Anthropic Claude Structured Outputs — https://platform.claude.com/docs/en/docs/build-with-claude/structured-outputs
- MDN MediaStream Recording API — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
- OpenAI Audio API FAQ (25 MB limit) — https://help.openai.com/en/articles/7031512-audio-api-faq
- jsforce v3 GA announcement — https://github.com/jsforce/jsforce/discussions/1529
- HubSpot OAuth Quickstart Guide — https://developers.hubspot.com/docs/api/oauth-quickstart-guide
- HubSpot API Rate Limits — https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines
- Salesforce OAuth Refresh Token Flow — https://developer.salesforce.com/docs/platform/mobile-sdk/guide/oauth-refresh-token-flow.html
- Supabase Server-Side Auth Advanced Guide — https://supabase.com/docs/guides/auth/server-side/advanced-guide
- Auth.js Refresh Token Rotation — https://authjs.dev/guides/refresh-token-rotation
- WebKit MediaRecorder API announcement (iOS format confirmation) — https://webkit.org/blog/11353/mediarecorder-api/

### Secondary (MEDIUM confidence)
- Hey DAN Voice-to-CRM features — https://heydan.ai/what-is-voice-to-crm
- snapAddy VisitReport features — https://www.snapaddy.com/en/snapaddy-visitreport/features.html
- Arrows.to AI notetaker comparison — https://arrows.to/guide/top-ai-notetakers/a-side-by-side-comparison-of-22-ai-notetakers-for-sales
- Salesforce refresh token invalid_grant post-mortem — https://nango.dev/blog/salesforce-oauth-refresh-token-invalid-grant
- Next.js token refresh race condition discussion — https://github.com/nextauthjs/next-auth/discussions/3940
- better-auth Salesforce provider gap — https://github.com/better-auth/better-auth/issues/6660
- iOS Safari MediaRecorder field report — https://www.buildwithmatija.com/blog/iphone-safari-mediarecorder-audio-recording-transcription

### Tertiary (LOW-MEDIUM confidence)
- LeadBeam "10% of in-person sales data captured" statistic — https://www.leadbeam.ai/blog/common-challenges-for-outside-sales-reps-and-how-ai-can-help (vendor blog, needs independent validation)
- Smallest.ai voice-to-CRM cascading pipeline pattern — https://smallest.ai/blog/voice-crm-revolution-ai-agents

---
*Research completed: 2026-02-18*
*Ready for roadmap: yes*
