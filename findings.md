# Voice Engine Findings

## Current Pipeline

Authenticated app:
- `components/voice-note-capture.tsx` records audio and posts to `/api/transcribe`.
- `/api/transcribe` authenticates with Supabase, validates audio, and calls OpenAI transcription directly.
- `/api/structure` uses Anthropic tool use with Zod validation.
- `/api/structure` loads user memory from recent saved `notes`, injects known entities, reconciles canonical names, and can use CRM schema plus sticky field rules.

Free `/debrief` tool:
- `components/debrief/debrief-flow.tsx` records audio and posts to `/api/debrief/transcribe`.
- `/api/debrief/transcribe` validates a public debrief session, then calls OpenAI transcription directly.
- `/api/debrief/structure` uses OpenAI `gpt-4o` JSON mode with a separate aesthetic prompt.
- Free debrief outputs are saved to `debrief_sessions`, and CI mentions are processed.
- Free debrief does not currently use the same user-memory, CRM schema, sticky-rule, or reconciliation path as the authenticated app.

## Model Guidance

OpenAI docs currently list `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, and `gpt-4o-transcribe-diarize` as higher-quality transcription models available through the transcription endpoint, with `gpt-4o-transcribe` described as more accurate than original Whisper models.

Current code already uses `gpt-4o-transcribe` in both paid and free transcription routes.

## Quality Gaps

1. The transcription model is already strong, but the transcription implementation is duplicated.
2. The shared transcription prompt is still generic sales vocabulary, not aesthetic-specific.
3. The best aesthetic ontology lives in `lib/debrief/prompts.ts`, while the paid app prompt remains generic B2B SaaS.
4. The best self-learning path lives in `/api/structure`, while the free tool does not use it.
5. The paid schema lacks aesthetic-first concepts such as modality, units, syringes/vials, practice manager, injector role, and switching story.
6. The free tool uses JSON mode without Zod validation or shared schema enforcement.
7. There is no obvious repeatable eval set for comparing extraction quality across paid/free paths.

## Recommended Direction

Build a single "voice engine" in shared server modules:
- audio validation and provider errors
- transcription model and aesthetic vocabulary prompt
- ontology and extraction rules
- schema/tool input definitions
- memory loading and reconciliation
- session persistence hooks for authenticated notes and free debriefs

Then point both paid and free route handlers at that engine.
