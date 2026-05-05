# Voice Engine Unification Plan

## Goal

Make the authenticated app voice pipeline and the free `/debrief` tool use one shared, highest-quality voice-to-CRM engine for aesthetic sales reps.

## Current Status

- [x] Phase 1: Inspect current paid and free voice paths
- [x] Phase 2: Verify current model guidance
- [x] Phase 3: Capture architecture gaps
- [x] Phase 4: Implement shared engine
- [x] Phase 5: Add self-learning for free debrief sessions
- [x] Phase 6: Add evaluation fixtures and quality checks
- [x] Phase 7: Run lint/build and manual smoke tests

## Plan

### Phase 4: Shared Voice Engine

Create shared server utilities so both `/api/transcribe` and `/api/debrief/transcribe` call the same transcription function, validation, provider-error mapping, and domain prompt.

Expected files:
- `lib/openai/server.ts`
- `lib/openai/transcribe.ts`
- `app/api/transcribe/route.ts`
- `app/api/debrief/transcribe/route.ts`

### Phase 5: Shared Aesthetic Structuring Engine

Move aesthetic ontology, CRM extraction rules, JSON schema/tool schema, memory injection, and reconciliation into shared modules. The free tool should not be a separate prompt island.

Expected files:
- `lib/notes/schema.ts`
- `lib/notes/input-schema.ts`
- `lib/notes/prompts.ts`
- `lib/debrief/prompts.ts`
- `app/api/structure/route.ts`
- `app/api/debrief/structure/route.ts`

### Phase 6: Self-Learning for Free Tool

Add an email-scoped memory path for `debrief_sessions`, so repeat free-tool users benefit from prior names, practices, competitors, products, modalities, and deal-stage patterns without needing auth.

Expected files:
- `lib/user-memory/server.ts`
- `lib/user-memory/scoring.ts`
- `lib/user-memory/reconcile.ts`
- `app/api/debrief/structure/route.ts`
- Possible migration for memory indexes or a dedicated learned-entity table

### Phase 7: Quality Evaluation

Create repeatable fixtures for aesthetic transcripts and expected extraction outputs. Run them through both paid and free structure routes or shared pure functions.

Expected files:
- `lib/**/__fixtures__/*` or `test-fixtures/voice-engine/*`
- Optional script under `scripts/`

## Guardrails

- No production deployment without explicit approval.
- No database migration without explicit approval.
- No new production dependency without explaining why and asking first.
- If a GitNexus impact tool is unavailable, use direct local inspection and report that limitation.
- Keep the free tool privacy-safe: email-scoped memory only, no cross-user leakage.

## Open Decisions

1. Whether free-tool self-learning should use `debrief_sessions` directly or a dedicated `debrief_memory`/`learned_entities` table.
2. Whether the paid app should fully pivot from generic B2B stages to aesthetic stages, or preserve generic stages and add aesthetic hints.
3. Whether to use `gpt-4o-transcribe-diarize` for multi-speaker debriefs. It may improve speaker attribution but is intended for less latency-sensitive workloads.

## Verification

- `node scripts/voice-engine-eval.mjs` — passed for 5 fixture scenarios
- `npm run lint` — passed
- `npm run build` — passed
