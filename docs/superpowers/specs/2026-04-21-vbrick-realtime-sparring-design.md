---
date: 2026-04-21
status: approved-in-concept
project: streetnotes/vbrick
owner: Jeff
supersedes: docs/superpowers/specs/2026-04-21-vbrick-sparring-restyle-fixes-quickstart-design.md (for the sparring voice layer only)
---

# VBrick Sparring — Realtime Voice Rebuild + Top Nav

## Problem

The voice stack we shipped today — MediaRecorder → Whisper HTTP → OpenAI chat HTTP → TTS HTTP → HTMLAudioElement, glued together with a homemade RMS silence detector — does not support natural conversation. Every turn incurs 3–6s of latency, the client-side VAD misfires on bot-audio bleed, and interruptions are impossible. Jeff built a working sparring partner six months ago that was materially better; that version almost certainly used the OpenAI Realtime API directly, which is the right tool for this job.

Separate but related problem: the nav we have on `restructure/vbrick-command-center` leaves a sidebar on the dashboard home and re-invented local headers on every sub-page. Jeff wants a persistent top nav across routes instead.

## Scope

**In scope:**

1. **Realtime voice layer for sparring** — replace the MediaRecorder/VAD/transcribe/TTS stack with direct WebRTC to OpenAI's Realtime API. Persona voice, natural turn-taking, interruption, transcripts captured for scoring.
2. **Keepers from today's `c4d9934`** — cherry-pick only the `bending-spoons-k26` scenario, the `Dana Whitfield` persona, and the new sparring landing page with Quick Start card + Script visible / Hard mode toggles. Drop everything else from that commit.
3. **Top nav** — persistent `TopNav` across `/vbrick/dashboard/*`, strip local `<header>` blocks from the six sub-pages, delete `components/vbrick/sidebar.tsx`. Content on every sub-page reflows full-width.
4. **End-of-call scoring** — reuse the existing `POST /api/vbrick/framework-spar?action=score` endpoint unchanged. Feed it the accumulated Realtime transcript at End Call.

**Out of scope (deferred):**

- `MicFab` (floating debrief button) — valuable but orthogonal; separate ship.
- Nav consolidation beyond sub-page headers (no mobile drawer, no user menu redesign — those were in the earlier spec and stay deferred).
- Realtime function-calling / tool use from the bot (no dynamic framework detection during the call — the turn-by-turn `action=respond` branch of `framework-spar` goes away entirely).
- DB persistence for anonymous sparring sessions (still refresh = restart for anonymous).
- Voice input for the main debrief flow (separate surface).

## Branch strategy

New branch **`feat/vbrick-realtime-sparring`** off `restructure/vbrick-command-center@90a0b36` (the last commit before today's broken work). PR #2 stays on `restructure/vbrick-command-center` and can ship on its own schedule. The new branch opens its own PR.

Cherry-pick surgically from `c4d9934`:

- `lib/vbrick/sparring-scenarios.ts` (new file — keep)
- `lib/vbrick/sparring-personas.ts` — keep only the `bending-spoons-vp` persona addition
- `app/vbrick/dashboard/sparring/page.tsx` — keep the new landing (Quick Start card + Script/Hard toggles + CheatCard component). Drop any `autoStartPersonaId` wiring that assumes today's broken voice loop; rebuild the scenario's in-call route using the new `RealtimeSparringSession` component below.

Drop entirely:

- The MediaRecorder + VAD code in `components/vbrick/framework-sparring-session.tsx` that I added today
- `app/api/vbrick/transcribe/route.ts`
- `scenarioId` / `hardMode` plumbing through `respond` branch of `framework-spar` route — no longer needed (see Architecture)

## Architecture

### Data flow

```
Browser (RealtimeSparringSession)
  │
  │  1. POST /api/vbrick/realtime/session { scenarioId, hardMode }
  ├──────────────────────────────────────────────────────────────►  Next.js route handler
  │                                                                 │
  │                                                                 │  2. resolves persona + scenario,
  │                                                                 │     composes instructions,
  │                                                                 │     calls OpenAI POST /v1/realtime/sessions
  │                                                                 │     with OPENAI_API_KEY server-side
  │                                                                 │
  │  3. { client_secret: { value, expires_at }, session }            │
  │ ◄──────────────────────────────────────────────────────────────┤
  │
  │  4. getUserMedia({ audio: true })
  │  5. new RTCPeerConnection → addTrack(mic)
  │  6. createDataChannel('oai-events') for session events
  │  7. createOffer() → setLocalDescription(offer)
  │
  │  8. POST https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview
  │     Authorization: Bearer {client_secret.value}
  │     Content-Type: application/sdp
  │     body: offer.sdp
  ├───────────────────────────────────────────────────────────────►  OpenAI Realtime
  │                                                                    │
  │  9. SDP answer                                                     │
  │ ◄──────────────────────────────────────────────────────────────────┤
  │
  │  10. setRemoteDescription(answer)
  │      ontrack → play assistant audio via <audio autoplay>
  │
  │  11. WebRTC audio flows both ways; DataChannel delivers transcript events:
  │      - conversation.item.input_audio_transcription.completed (user)
  │      - response.audio_transcript.done (assistant)
  │      - response.done (turn boundary)
  │
  │  12. On End Call:
  │      - peerConnection.close()
  │      - POST /api/vbrick/framework-spar { action: 'score', ... transcript }
  │ ──────────────────────────────────────►
```

### Why WebRTC (not WebSocket)

WebRTC is OpenAI's recommended path for browser clients to the Realtime API. It handles audio transport natively (browser media pipeline, jitter buffer, echo cancellation), doesn't require raw PCM base64 encoding over a WebSocket, and is lower latency. WebSocket is the server-to-server path. We're browser-to-OpenAI, so WebRTC.

### Ephemeral token endpoint

New route: `app/api/vbrick/realtime/session/route.ts`. Nodejs runtime. Accepts `POST { scenarioId?, hardMode? }`. No auth required (matches the vbrick tenant pattern — localStorage identity, opportunistic Supabase user).

Server responsibilities:

1. Resolve persona (from scenario.personaId or a default)
2. Compose `instructions` (see below)
3. Call `POST https://api.openai.com/v1/realtime/sessions` with headers `Authorization: Bearer ${OPENAI_API_KEY}` and body:
   ```json
   {
     "model": "gpt-4o-realtime-preview-2024-12-17",
     "voice": "<persona.voice>",
     "instructions": "<composed>",
     "turn_detection": { "type": "server_vad", "silence_duration_ms": 600, "prefix_padding_ms": 300 },
     "input_audio_transcription": { "model": "whisper-1" },
     "temperature": 0.8,
     "modalities": ["audio", "text"]
   }
   ```
4. Return to client: `{ client_secret: session.client_secret, session: { id, ...echo of inputs } }`. Never return `OPENAI_API_KEY`.

The `client_secret.value` is short-lived (~1 minute). The client must use it immediately for the SDP exchange. If the session expires before the call starts, the client asks the user to retry.

### Session instructions composition

```ts
function composeRealtimeInstructions(
  persona: ProspectPersona,
  scenario: SparringScenario | null,
  hardMode: boolean
): string {
  const parts: string[] = []

  parts.push(persona.systemPrompt)

  if (scenario) {
    parts.push(scenario.scenarioContext)
    if (hardMode && scenario.hardModeContext) parts.push(scenario.hardModeContext)
  }

  parts.push(`
BEHAVIOR RULES FOR THIS VOICE CALL:
- You are answering a cold call on the phone.
- Start with ONE short greeting only — "Hello." or similar. Do NOT introduce yourself.
- Keep every reply short and natural. Under 20 words unless the BDR asks for detail.
- Do not narrate or describe actions. Only speak dialogue.
- You can interrupt and be interrupted. If the BDR interrupts, stop and listen.
- Follow the BDR's lead. They drive the conversation.
- When the BDR asks for your name, give ONLY your name (first and last).
- When the BDR asks if you are responsible for [video/comms/streaming], answer based on your role as ${persona.title}.
- If the BDR asks "May I tell them hello from you?" — grant or decline politely.
- Stay in character as ${persona.name}.
`.trim())

  return parts.join('\n\n')
}
```

This replaces the current `framework-spar` `start` + `respond` prompts entirely. The Realtime session carries one set of instructions for the whole call.

### RealtimeSparringSession component

New file: `components/vbrick/realtime-sparring-session.tsx`.

**Props:**
```ts
interface RealtimeSparringSessionProps {
  scenarioId: string
  hardMode: boolean
  scriptVisible: boolean
  onEnd: (result: { score: number; ... } | null, transcript: TranscriptTurn[]) => void
  onCancel: () => void
}
```

**State machine:** `'idle' → 'connecting' → 'in-call' → 'ending' → 'scored'`.

**Life cycle:**

- **On mount (`'idle'` → `'connecting'`):**
  1. POST `/api/vbrick/realtime/session` with `{ scenarioId, hardMode }`, get `client_secret`.
  2. `getUserMedia({ audio: true })`, store stream.
  3. `new RTCPeerConnection({ iceServers: [] })`. Add local mic track. Subscribe `ontrack` → attach remote stream to a hidden `<audio autoplay>`.
  4. `createDataChannel('oai-events')`, subscribe to `onmessage` for JSON events.
  5. `createOffer()`, `setLocalDescription`, POST SDP to `https://api.openai.com/v1/realtime?model=...` with the client secret, get SDP answer, `setRemoteDescription`.
  6. Transition to `'in-call'`.

- **While `'in-call'`:**
  - DataChannel events of interest:
    - `conversation.item.input_audio_transcription.completed` — `{ transcript }` — BDR turn finalized. Append to `transcriptRef.current` with role `user`.
    - `response.audio_transcript.done` — `{ transcript }` — prospect turn finalized. Append with role `assistant`.
    - `response.done` — purely a turn-boundary signal for UI state.
  - UI state indicators from DataChannel:
    - `input_audio_buffer.speech_started` / `speech_stopped` → "You're speaking…" / "Prospect thinking…"
    - `output_audio_buffer.started` / `stopped` → "Prospect is speaking"
  - Show live transcript as turns finalize (a simple scrolling column, prospect name left / "You" right).
  - Render the scenario cheat card as a fixed side panel when `scriptVisible && !hardMode`.

- **On End Call (`'in-call'` → `'ending'` → `'scored'`):**
  1. `peerConnection.close()`. Stop mic tracks.
  2. Build transcript string: `transcriptRef.current.map(t => ${t.role === 'user' ? 'BDR' : personaName}: ${t.text}).join('\n\n')`.
  3. POST `/api/vbrick/framework-spar` with `{ action: 'score', personaId, sessionId: <uuid generated client-side at call start>, transcription, bdrAccent: 'general' }`.
  4. Fire `onEnd(scoreResult, transcriptRef.current)`. Page renders the score screen.

- **On cancel before end:** close peer connection, stop tracks, discard transcript (no scoring).

**UI (Neu, single pane):**

```
┌─────────────────────────────────────────────┐
│  Dana Whitfield · VP of Internal Comms      │
│  [status pill: "Calling…" / "In call" /     │
│   "You're speaking" / "Dana is speaking"]   │
│                                             │
│  ────── live transcript (scrolls) ──────    │
│  Dana: Hello.                               │
│  You: Hi, Dana. First and last name?        │
│  Dana: Dana Whitfield.                      │
│  You: Great, I was hoping you can help...  │
│  ...                                        │
│                                             │
│  ┌─ Cheat card (if Script visible) ──┐      │
│  │ 1. Confirm right person            │      │
│  │ 2. Bending Spoons friction         │      │
│  │ 3. K26 booth invite                │      │
│  └────────────────────────────────────┘      │
│                                             │
│  [ End Call ]                               │
└─────────────────────────────────────────────┘
```

No mic button. No Done speaking button. No tap-to-talk. The whole call is one continuous session — user speaks whenever, gets interrupted or interrupts naturally, ends with one End Call button.

### Transcript capture

Transcripts come from OpenAI's server-side Whisper (configured via `input_audio_transcription` on the session). Separate events fire for user (`input_audio_transcription.completed`) and assistant (`audio_transcript.done`). We do not run our own Whisper.

Shape:
```ts
type TranscriptTurn = { role: 'user' | 'assistant'; text: string; at: number }
```

On End Call, flatten to the format the scoring endpoint already consumes.

### What we delete

Upon merge of this spec's implementation:

- `app/api/vbrick/transcribe/route.ts` (the endpoint I added today) — remove
- `scenarioId` / `hardMode` fields on the `start` and `respond` branches of `framework-spar/route.ts` — remove; only the `score` branch is used now
- The entire MediaRecorder + VAD code path in `framework-sparring-session.tsx` — remove
- `framework-sparring-session.tsx` itself stays only if we need the persona-grid "Browse mode" fallback. If yes, strip it back to pre-today behavior and use it only from "More scenarios →". If no, delete and route "More scenarios →" to a new simpler chooser that drops into RealtimeSparringSession with `scenarioId=null` and an ad-hoc persona. Decision in planning.

### Top nav

Persistent chrome mounted in `app/vbrick/dashboard/layout.tsx` via a new `VbrickShell` client component that renders `TopNav` + `{children}`. TopNav is essentially the design from the earlier spec (Section 5 of `2026-04-21-vbrick-sparring-restyle-fixes-quickstart-design.md`), minus the MicFab and minus the streak-badge complexity (streak can render on the dashboard page itself — the chrome stays lean).

Changes this makes:

- New: `components/vbrick/top-nav.tsx`, `components/vbrick/vbrick-shell.tsx`
- Modified: `app/vbrick/dashboard/layout.tsx`, `app/vbrick/dashboard/page.tsx` (drop Sidebar + `ml-[288px]`)
- Modified: strip local `<header>` blocks from stories, campaigns, playbook, settings, ci, sparring
- Deleted: `components/vbrick/sidebar.tsx`

Identity/displayName is derived in `DashboardProvider` (already client-aware via localStorage read). Recording state does NOT need to move into the provider for this round — without MicFab, the dashboard page is the only consumer.

## Files at the end of this spec

**New:**
- `app/api/vbrick/realtime/session/route.ts`
- `components/vbrick/realtime-sparring-session.tsx`
- `components/vbrick/top-nav.tsx`
- `components/vbrick/vbrick-shell.tsx`

**Modified:**
- `app/vbrick/dashboard/layout.tsx` — mount VbrickShell
- `app/vbrick/dashboard/page.tsx` — drop Sidebar, drop `ml-[288px]`
- `app/vbrick/dashboard/sparring/page.tsx` — wire landing page to launch `RealtimeSparringSession` on Start; keep Script/Hard toggles; "More scenarios →" decision in planning
- 5 sub-page files — strip local headers (stories, campaigns, playbook, settings, ci)
- `lib/vbrick/dashboard-context.tsx` — add `displayName` derivation (no recording state)
- `lib/vbrick/sparring-personas.ts` — cherry-pick Dana Whitfield persona only
- `app/api/vbrick/framework-spar/route.ts` — strip `scenarioId`/`hardMode` from start+respond (keep `score` branch as-is)
- `components/vbrick/framework-sparring-session.tsx` — either stripped back to pre-today or deleted (planning decides)

**Deleted:**
- `components/vbrick/sidebar.tsx`
- `app/api/vbrick/transcribe/route.ts`
- `components/vbrick/framework-sparring-session.tsx` (probably — planning decides)

**New file (cherry-picked from `c4d9934`):**
- `lib/vbrick/sparring-scenarios.ts` (contents identical to today's file, keep as-is)

## Environment

- `OPENAI_API_KEY` already configured. No new env vars.
- Model: `gpt-4o-realtime-preview-2024-12-17` (pin the version — pre-production Realtime models get deprecated without notice).
- Voice: read from `persona.voice` which already uses OpenAI's voice pool (alloy/echo/fable/onyx/nova/shimmer). Realtime API accepts the same pool.

## Success criteria

- Tap "Start Practice Call" on `/vbrick/dashboard/sparring` → within ~2 seconds, connection established and the bot says "Hello." with Dana's voice.
- BDR can speak naturally at normal cadence. The bot responds inside 1 second of the BDR finishing, indistinguishable in feel from a phone call.
- BDR can interrupt the bot mid-sentence (talk over) and the bot stops and listens.
- The bot follows the scripted framework: gives name when asked, answers Yes/No to qualification, keeps replies short.
- End Call returns a score that reuses the existing scoring rubric.
- TopNav renders on every dashboard route. No local `<header>` remains on any sub-page.
- Dashboard home renders full-width (no 288px sidebar gutter). No `<Sidebar>` import anywhere in the repo.
- `git grep -l "MediaRecorder\|audioContextRef\|vadIntervalRef"` returns no results in `components/vbrick/` or `app/vbrick/`.

## Risks / watch-outs

- **Ephemeral token leakage.** Don't log `client_secret.value`. Return it to the client once and forget it. The endpoint must not echo the full OPENAI_API_KEY under any error path.
- **Browser permissions.** Safari requires `getUserMedia` to be triggered from a user gesture. Our Start Call button handler is the gesture — fine. Do NOT move token-fetch before the gesture.
- **Realtime model deprecation.** Pin the preview model version; re-test on version bumps.
- **Cost exposure.** Realtime API charges per-minute for both input and output audio. We should log session duration per call and surface an aggregate somewhere for Jeff to watch. Out of scope for v1 but worth flagging in the plan.
- **No VAD knob needed — OpenAI's server VAD handles turn-taking.** Do NOT build a client-side VAD as a "safety net" — that's what failed today. Trust the server.
- **Transcript completeness.** Realtime fires transcription events asynchronously. On End Call, wait briefly (~300ms) for in-flight `*.completed` events to land before sending to score, OR accept that the last turn may be missing.
- **PR #2 and this branch diverge.** The earlier TopNav/MicFab design in PR #2's plan is NOT built. This branch builds TopNav only. If PR #2 later lands a different TopNav, we merge-conflict. Decision: PR #2 carries nav work ONLY if we decide to ship it on its own — otherwise hold PR #2 until this branch merges and cherry-pick forward.

## Open questions (decide in planning)

1. Keep the legacy `framework-sparring-session.tsx` for "More scenarios →" persona-grid browsing, or replace that path with a simpler chooser + Realtime? Leaning: replace.
2. `temperature: 0.8` on the Realtime session — tune higher/lower during smoke testing.
3. Does End Call automatically trigger scoring, or do we show a "Score this call?" prompt first? Leaning: automatic.
