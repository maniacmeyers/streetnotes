# Phase 2: Voice Capture + Transcription - Research Brief

**Prepared:** 2026-03-07  
**Scope:** VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05

## Key Decisions For Execution

1. Use a custom `useVoiceRecorder` hook (no third-party recorder dependency) for tighter control over MIME negotiation and errors.
2. Always negotiate MIME type at runtime with `MediaRecorder.isTypeSupported()` using this priority:
   - `audio/webm;codecs=opus`
   - `audio/mp4`
   - `audio/ogg;codecs=opus`
3. Validate file size client-side before upload (`<25MB`) and re-validate server-side.
4. Implement `/api/transcribe` as a separate Route Handler (not merged with future AI structuring) for retry isolation and better UX.
5. Use OpenAI Whisper `whisper-1` with a sales vocabulary `prompt` to improve acronym and domain term accuracy.
6. Keep this phase transcript-only. No Claude structuring or CRM writes in Phase 2.

## Runtime And Env Requirements

- Add `OPENAI_API_KEY` to `.env.local` and `.env.local.example`.
- Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` configured for authenticated routes.
- Set `export const runtime = 'nodejs'` in `/api/transcribe`.
- Set `export const maxDuration = 60` in `/api/transcribe` for longer audio processing on supported hosting plans.

## Minimum API Contract

### `POST /api/transcribe`
- Auth: required (must have Supabase user session)
- Request: `multipart/form-data` with `audio` file
- Success: `200` `{ transcript: string, mimeType: string, sizeBytes: number }`
- Failure:
  - `401` unauthenticated
  - `400` missing file / unsupported type
  - `413` file too large
  - `502` upstream transcription provider error

## Critical Pitfalls To Guard Against

1. iOS Safari format mismatch (`audio/mp4` vs hardcoded webm).
2. 25MB limit failures without pre-upload feedback.
3. Missing extension mapping causing Whisper format rejection.
4. Silent microphone permission denial with no recovery message.
5. Long transcription requests timing out on low serverless limits.

## Done Definition For Phase 2

1. Authenticated user can record on mobile and desktop browsers.
2. Duration updates every second during recording.
3. Oversized audio is blocked with clear user-facing guidance.
4. Stopped recording can be uploaded and transcribed through `/api/transcribe`.
5. Transcript is shown in UI within the dashboard flow.
