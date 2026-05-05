# Voice Engine Unification Plan

**Date:** 2026-05-05
**Scope:** Authenticated voice notes plus free `/debrief` tool
**Goal:** One shared, highest-quality voice-to-CRM engine for aesthetic reps.

---

## Executive Decision

StreetNotes should not have two voice engines.

The paid app and the free debrief tool should share:

1. the same transcription path,
2. the same aesthetic ontology,
3. the same extraction schema,
4. the same memory/reconciliation logic,
5. the same quality evaluation fixtures.

The current code is split in a way that makes each side strong in a different place:

- The paid app has self-learning, CRM schema awareness, sticky rules, Zod validation, and Anthropic tool use.
- The free tool has the richer aesthetic prompt and competitive taxonomy.

The right move is to merge those strengths into a shared engine and make both products call it.

---

## Current State

### Authenticated App

Flow:

`components/voice-note-capture.tsx -> /api/transcribe -> /api/structure -> /api/notes`

Strengths:

- Uses `gpt-4o-transcribe`.
- Authenticates user server-side.
- Loads recent user memory from saved notes.
- Injects known contacts, companies, competitors, products, and deal stages.
- Reconciles near-match names/entities after extraction.
- Can load connected CRM schema and sticky field rules.
- Uses tool-use schema plus Zod validation.

Weaknesses:

- Prompt is still generic B2B SaaS.
- Schema is generic CRM note shape.
- Aesthetic concepts are mostly absent from the paid extraction path.
- Transcription code is duplicated instead of using the existing `transcribeAudio` helper.

### Free Debrief Tool

Flow:

`components/debrief/debrief-flow.tsx -> /api/debrief/transcribe -> /api/debrief/structure -> debrief_sessions`

Strengths:

- Uses `gpt-4o-transcribe`.
- Prompt is strongly tuned for aesthetic reps.
- Captures modality, injectors, practice managers, unit counts, syringes/vials, competitor taxonomy, CI mentions, switching stories, and call segments.
- Stores free debrief transcript and structured output.

Weaknesses:

- Does not use paid-app user memory.
- Does not build email-scoped memory from previous free debriefs.
- Does not use shared Zod validation.
- Does not use CRM schema or sticky rules.
- Uses a separate output type, separate prompt, and separate model/provider path.

---

## Model Strategy

Use `gpt-4o-transcribe` as the default transcription model for both surfaces.

Reason:

- Current OpenAI docs describe it as a higher-quality transcription model with better word error rate and language recognition than original Whisper models.
- Current code already uses it in both transcription routes.
- It fits the current post-call upload flow.

Consider `gpt-4o-transcribe-diarize` only for a later option:

- It can add speaker labels and timestamps.
- It is intended for less latency-sensitive workloads.
- Most StreetNotes debriefs are one rep talking after a visit, so diarization is not the default need.

Do not move the debrief flow to Realtime API right now:

- Realtime is right for live conversation, coaching, interruption, and low-latency back-and-forth.
- StreetNotes debrief quality depends more on accurate upload transcription, ontology, memory, and CRM mapping than live turn-taking.

---

## Target Architecture

Create a shared voice engine:

```text
Audio Blob/File
  -> shared audio validation
  -> shared transcription function
  -> shared transcript review/edit step
  -> shared aesthetic structuring engine
  -> memory-aware reconciliation
  -> surface-specific persistence
```

### Shared Modules

Recommended new or refactored modules:

- `lib/voice-engine/transcription.ts`
- `lib/voice-engine/audio-validation.ts`
- `lib/voice-engine/ontology.ts`
- `lib/voice-engine/prompts.ts`
- `lib/voice-engine/schema.ts`
- `lib/voice-engine/structure.ts`
- `lib/voice-engine/memory.ts`

Keep route handlers thin:

- `/api/transcribe` handles auth and calls shared transcription.
- `/api/debrief/transcribe` validates session and calls shared transcription.
- `/api/structure` handles auth/context and calls shared structuring.
- `/api/debrief/structure` validates session/email context and calls shared structuring.

---

## Ontology

The shared ontology should be aesthetic-first.

Core entity types:

- Practice/account
- Injector/contact
- Practice manager/buyer
- Medical director/owner
- Modality
- Brand/product
- Competitor
- Unit/syringe/vial volume
- Buying window/event
- Objection
- Switching story
- Follow-up task
- CRM push field

Core aesthetic vocabulary:

- injector, MA, practice manager, PM, medical director, practice owner
- neurotoxin, tox, HA filler, biostimulator, energy device, skincare
- units, syringes, vials, mL, treatment areas, price per unit
- Aesthetic Next, AMWC, Vegas Cosmetic, IMCAS, AAD, ASPS, MOAS

Brand taxonomy:

- Neurotoxin: Botox, Dysport, Xeomin, Jeuveau, Daxxify
- HA filler: Juvederm, Restylane, RHA, Versa, Belotero
- Biostimulator: Sculptra, Radiesse
- Energy device: Morpheus8, BBL, HALO, MOXI, Sofwave, Ultherapy, CoolSculpting, EmSculpt Neo, Emface, AviClear, Potenza, Opus Plasma
- Practice-management adjacent: Symplast, PatientNow, Nextech, AestheticRecord, Aesthetics Pro, Mangomint, Boulevard, Vagaro

---

## Memory Strategy

### Paid App Memory

Keep the existing `notes`-based memory path, but expand scoring to include:

- injectors as first-class contacts,
- practice managers as buyer/economic-buyer contacts,
- companies/practices,
- products/competitors,
- modalities,
- unit and volume patterns,
- recurring objections,
- switching stories.

### Free Tool Memory

Add email-scoped memory for repeat free-tool users.

Minimum viable approach:

- Load prior `debrief_sessions` for the same normalized email.
- Aggregate recent structured output the same way paid notes are aggregated.
- Inject a context block into the free structuring call.
- Reconcile names/brands/practices after extraction.

Better long-term approach:

- Create a dedicated learned-entities table keyed by `memory_scope` and normalized identity.
- Write normalized entities after each successful paid note or free debrief.
- Read from that table for faster, cleaner memory.

Privacy rule:

- Free-tool memory must be scoped to the exact normalized email or an explicit authenticated team boundary.
- No global learning from one rep into another rep's output unless there is a deliberate team/tenant model.

---

## Schema Strategy

Move toward one canonical structured output that can render both the paid review card and the free PDF/result page.

Recommended fields:

- `contactName`
- `company`
- `dealStage`
- `estimatedValue`
- `closeDate`
- `meetingSummary`
- `nextSteps`
- `opportunityNotes`
- `competitorsMentioned`
- `productsDiscussed`
- `painPoints`
- `risks`
- `attendees`
- `dealSegment`
- `ciMentions`
- `modality`
- `unitVolume`
- `syringeVolume`
- `vialCount`
- `buyingWindow`
- `switchingStories`

Compatibility path:

- Add optional fields only.
- Keep existing fields stable.
- Convert canonical output to free-tool display type if needed.
- Do not require every field; optional fields prevent hallucination.

---

## Implementation Phases

### Phase 1: Shared Transcription

Refactor both transcription routes to use one server helper.

Tasks:

- Expand `SALES_WHISPER_PROMPT` into `AESTHETIC_TRANSCRIPTION_PROMPT`.
- Centralize file validation and provider error mapping.
- Return consistent metadata from both routes.
- Keep `gpt-4o-transcribe` default.

Acceptance:

- Paid and free transcription routes produce the same transcript behavior for the same audio file.
- Lint/build pass.

### Phase 2: Shared Aesthetic Prompt/Ontology

Extract the aesthetic vocabulary and competitor taxonomy from `lib/debrief/prompts.ts` into shared ontology modules.

Tasks:

- Update paid app prompt to use aesthetic ontology.
- Keep B2B generic fallback only if needed behind a flag.
- Remove duplicated taxonomy text where possible.

Acceptance:

- Paid app extracts aesthetic-specific facts at least as well as free debrief.
- Free debrief behavior remains stable.

### Phase 3: Canonical Schema

Extend the paid `CRMNoteSchema` with optional aesthetic fields and CI fields.

Tasks:

- Add optional schema fields.
- Add JSON tool schema fields.
- Update free debrief to validate through the same schema or a canonical superset.
- Add adapter functions if the UI still needs the legacy free-output shape.

Acceptance:

- Existing notes still render.
- Free results still render.
- No required field forces hallucination.

### Phase 4: Shared Structuring Service

Create a shared `structureTranscript` function.

Inputs:

- transcript
- context type: authenticated app or free debrief
- optional user id
- optional email
- optional CRM schema
- optional sticky rules

Outputs:

- canonical structured output
- optional push plan
- confidence/reconciliation metadata

Acceptance:

- `/api/structure` and `/api/debrief/structure` call the same structuring function.
- Provider/model choice is centralized.
- Zod validation happens for both routes.

### Phase 5: Free Tool Self-Learning

Add email-scoped memory to `/debrief`.

Tasks:

- Load recent sessions by normalized email.
- Aggregate entities from `structured_output`.
- Inject free-tool memory into shared structuring.
- Reconcile output against email-scoped memory.
- Invalidate/refresh memory after successful debrief.

Acceptance:

- If a returning rep says "Dr. Patel" after a prior debrief stored "Dr. Maya Patel at Patel Aesthetics", the system can resolve the canonical name/practice without inventing unsupported facts.

### Phase 6: Evaluation Harness

Create fixture transcripts and expected outputs.

Fixture set:

- injector check-in with tox unit counts,
- practice-manager pricing meeting,
- device demo,
- conference booth with incomplete data,
- competitor switching story,
- noisy/ambiguous transcript with partial names.

Acceptance:

- A local script can run extraction against fixtures or validate pure prompt/schema functions.
- Build and lint pass.
- Manual smoke covers `/debrief` and authenticated capture.

---

## Risks

- Prompt/schema expansion can increase token cost.
- Aesthetic stage names may not map cleanly into every Salesforce/HubSpot pipeline.
- Free-tool memory by email is useful but weaker than authenticated team-scoped memory.
- If output shape changes too abruptly, existing free result/PDF components can break.
- Diarization may improve attendee attribution but can slow the flow and increase complexity.

---

## Recommended Next Step

Start with Phase 1 and Phase 2 together:

1. shared transcription helper and aesthetic transcription prompt,
2. shared ontology module,
3. paid prompt upgraded to use the aesthetic ontology,
4. no database migration yet.

That gives immediate quality gain with low persistence risk. Then do schema/memory after the shared engine boundary is clean.

---

## Implementation Note

Implemented locally after planning:

- Shared aesthetic ontology and transcription prompt.
- Shared `gpt-4o-transcribe` helper for paid, free, and story-practice transcription callers.
- Shared Anthropic tool-use structuring service for paid `/api/structure` and free `/api/debrief/structure`.
- Optional aesthetic fields on the canonical CRM note schema.
- Email-scoped free-tool memory from previous `debrief_sessions`.
- Adapter from canonical CRM note output to the existing free debrief result/PDF shape.
- Fixture validator with five aesthetic debrief scenarios.

Verification:

- `node scripts/voice-engine-eval.mjs`
- `npm run lint`
- `npm run build`
