# Voice Engine Progress

## 2026-05-05

- Read current repo instructions and confirmed this task is planning-first.
- Checked prior memory; no directly relevant prior voice-engine unification plan was found.
- Inspected current transcription routes, structuring routes, prompts, schemas, user-memory utilities, audio utilities, and free debrief flow.
- Verified current OpenAI model guidance from official docs/search results: `gpt-4o-transcribe` is the right default for highest-quality transcription, with diarization as a possible specialized option.
- Created planning files for the shared voice-engine work.
- Implemented shared aesthetic ontology and shared `gpt-4o-transcribe` helper with centralized audio validation/provider error mapping.
- Refactored `/api/transcribe`, `/api/debrief/transcribe`, `/api/structure`, and `/api/debrief/structure` to use shared engine paths.
- Extended canonical CRM note schema/tool schema with optional aesthetic fields, CI mentions, risks, modalities, unit/vial/buying-window details, and switching stories.
- Added email-scoped free-tool memory from prior `debrief_sessions` and expanded memory aggregation/reconciliation for aesthetic entities.
- Added `lib/debrief/adapter.ts` so canonical CRM notes can still render the existing free-tool result/PDF shape.
- Added fixture scenarios and `scripts/voice-engine-eval.mjs`.
- Verification passed: `node scripts/voice-engine-eval.mjs`, `npm run lint`, and `npm run build`.
- GitNexus CLI/MCP impact analysis was unavailable in this session; `npx gitnexus --help` hung while trying to install/run, so direct local call-site inspection plus build verification were used instead.
