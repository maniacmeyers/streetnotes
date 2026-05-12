# StreetNotes Security Best-Practices Report

**Date:** 2026-05-05  
**Scope:** Next.js 14 App Router, React/TypeScript frontend, Supabase-backed API routes, public debrief tool, VBrick training surfaces  
**Method:** Reviewed the repo against the local `security-best-practices` guidance for Next.js backend, React frontend, and general browser JavaScript security. Checked current Next.js security guidance because framework patch status changes over time.

## Executive Summary

StreetNotes has several good foundations already: server-side Supabase `getUser()` is used in protected app paths, CRM OAuth state cookies exist, CRM tokens are encrypted with AES-GCM, baseline security headers are configured, and React mostly relies on normal escaped rendering.

The highest-risk issues are authorization design issues in public API routes that use the Supabase service-role client. Several VBrick story endpoints and the public free debrief session endpoints bypass RLS and rely on caller-supplied email, route IDs, or `sessionId` values. That can allow unauthorized read/write/delete of data and can trigger paid AI/transcription work.

## Critical Findings

### C-1. VBrick story draft APIs bypass auth and RLS with service-role access

**Rule ID:** NEXT-AUTHZ-001 / NEXT-SECRETS-002  
**Severity:** Critical  
**Location:** `app/api/vbrick/stories/drafts/route.ts`, `app/api/vbrick/stories/drafts/[id]/route.ts`, `app/api/vbrick/stories/drafts/[id]/ai/route.ts`, `app/api/vbrick/stories/practice/route.ts`

**Evidence:**

- `app/api/vbrick/stories/drafts/route.ts:7-17` accepts `?email=` and returns all drafts for that email using `createAdminClient()`.
- `app/api/vbrick/stories/drafts/route.ts:24-48` accepts body `email`, `storyType`, and `title`, then inserts using `createAdminClient()`.
- `app/api/vbrick/stories/drafts/[id]/route.ts:7-16` returns any draft by route `id`; `:20-35` updates any draft with arbitrary body spread; `:39-47` deletes any draft.
- `app/api/vbrick/stories/drafts/[id]/ai/route.ts:11-26` loads any draft by id and then lets the caller run AI against it.
- `app/api/vbrick/stories/practice/route.ts:21-45` accepts `draftId`, `email`, and `audio`, fetches the draft by id, then transcribes and scores it.
- `lib/supabase/admin.ts:3-17` documents that `createAdminClient()` uses the service-role key and bypasses RLS.

**Impact:** Anyone who can reach these routes can enumerate, read, modify, delete, or run AI workflows against VBrick story drafts if they know or obtain IDs/emails. This bypasses Supabase RLS and can expose training content, alter user work, delete data, and create AI/transcription cost.

**Fix:**

- Require a real authenticated Supabase user or a signed VBrick session token for every draft/practice mutation.
- When using service-role access, first verify the caller owns the resource: `draft.bdr_email === authenticatedEmail`.
- For route body updates, replace `{ ...body }` with an explicit allowlist of mutable fields.
- If localStorage email identity must remain temporarily, gate it with a signed, HttpOnly, short-lived cookie minted by a server route after verifying `isVbrickUser(email)`.

**Mitigation:** Until a proper identity layer lands, reject unauthenticated access to `[id]` draft routes and practice scoring unless `email` is present and matches the draft owner, and restrict email fallback with `isVbrickUser`.

**False positive notes:** If these routes are protected by an external firewall or Vercel access control, that protection is not visible in app code. Verify deployment config before downgrading.

## High Findings

### H-1. Free debrief sessions use `sessionId` as the only bearer credential

**Rule ID:** NEXT-AUTHZ-001 / NEXT-FILE-001  
**Severity:** High  
**Location:** `app/api/debrief/start/route.ts`, `app/api/debrief/transcribe/route.ts`, `app/api/debrief/structure/route.ts`, `app/api/debrief/pdf/route.ts`

**Evidence:**

- `app/api/debrief/start/route.ts:48-78` creates a `debrief_sessions` row and returns only `{ sessionId: data.id }`.
- `app/api/debrief/transcribe/route.ts:24-44` validates only that `sessionId` exists, then `:55-59` updates `raw_transcript`.
- `app/api/debrief/structure/route.ts:23-38` validates only that `sessionId` exists, then `:55-58` updates `structured_output`.
- `app/api/debrief/pdf/route.ts:11-23` accepts `?sessionId=...`, loads `email, structured_output`, and `:59-66` returns the PDF.

**Impact:** A debrief UUID acts as a bearer token for transcript update, structuring, and PDF download. UUIDs are hard to guess, but they can leak through logs, notifications, browser history, screenshots, support threads, or referrers. If leaked, an attacker can read CRM-ready PII, overwrite a transcript/result, poison email-scoped memory, and trigger AI work.

**Fix:**

- Add a second random `session_secret` or `access_token` generated at session start.
- Store only a hash server-side, and set the secret in an HttpOnly, SameSite cookie or require it in a header for all debrief session operations.
- Verify both `sessionId` and secret on `transcribe`, `structure`, and `pdf`.
- Consider expiring free debrief sessions after a short period or limiting PDF access window.

**Mitigation:** Do not include raw session IDs in notification bodies or public URLs beyond the current browser session. Add audit logs for repeated invalid `sessionId` access.

**False positive notes:** The current UUID primary key is not incrementing and is not practically guessable; the issue is bearer-token leakage and missing proof of session possession.

### H-2. Public API namespace relies entirely on per-handler auth, but multiple service-role handlers are unauthenticated

**Rule ID:** NEXT-AUTHZ-001  
**Severity:** High  
**Location:** `lib/supabase/middleware.ts`, multiple `app/api/vbrick/*` routes

**Evidence:**

- `lib/supabase/middleware.ts:41-58` marks all `/api` routes public: `pathname.startsWith('/api')`.
- Service-role admin access bypasses RLS in `lib/supabase/admin.ts:3-17`.
- `app/api/vbrick/intentions/route.ts:4-36` reads intent data by caller-supplied `email`; `:42-70` upserts by caller-supplied `email`.
- `app/api/vbrick/stories/gamification/route.ts:8-20` returns gamification data by caller-supplied `email`.
- `app/api/vbrick/stories/drafts/route.ts:7-17` and `app/api/vbrick/stories/drafts/[id]/route.ts:7-47` expose draft read/write/delete paths without auth checks.

**Impact:** Any individual handler missing its own auth/ownership check becomes public internet surface with service-role database privileges. This creates a broad class of IDOR/BOLA and unauthorized mutation risks.

**Fix:**

- Keep `/api` public only for routes intentionally public, or move public routes under explicit prefixes such as `/api/debrief/*`, `/api/waitlist`, and selected VBrick demo endpoints.
- Add a shared authorization helper for VBrick routes that resolves an authenticated/signed email and rejects untrusted query/body email.
- Add tests or a static check that flags `createAdminClient()` in any route without an explicit ownership guard.

**Mitigation:** Add a temporary denylist or auth wrapper around the most sensitive VBrick write/delete endpoints first.

**False positive notes:** Some `/api` routes correctly authenticate inside the handler with `supabase.auth.getUser()`; this finding is about the combination of public namespace plus unauthenticated service-role handlers.

## Medium Findings

### M-1. Rate limiting is memory-local and incomplete for public AI/email-triggering endpoints

**Rule ID:** NEXT-ABUSE-001  
**Severity:** Medium  
**Location:** `app/api/waitlist/route.ts`, `app/api/debrief/start/route.ts`, `app/api/debrief/transcribe/route.ts`, `app/api/debrief/structure/route.ts`, VBrick AI routes

**Evidence:**

- `app/api/waitlist/route.ts:5-19` uses a process-local `Map` for IP rate limiting.
- `app/api/waitlist/route.ts:25-28` trusts `x-forwarded-for`/`request.ip`.
- `app/api/debrief/start/route.ts:24-45` rate-limits only by email and skips VBrick users.
- `app/api/debrief/transcribe/route.ts:53-61` and `app/api/debrief/structure/route.ts:49-104` trigger OpenAI/Anthropic work once a session exists.
- `app/api/vbrick/stories/drafts/[id]/ai/route.ts:28-91` and `app/api/vbrick/stories/practice/route.ts:43-117` trigger AI/transcription work without a visible durable quota.

**Impact:** Attackers can bypass process-local limits across serverless instances/restarts or by varying emails/IP headers. This can create email spam, database noise, and AI/transcription cost spikes.

**Fix:**

- Use a durable rate limiter keyed by IP, normalized email, session ID, and route family.
- On Vercel, prefer platform rate limiting, Upstash Redis, or a Supabase-backed rate-limit table with short TTL windows.
- Treat `x-forwarded-for` as trustworthy only from the platform edge; otherwise use provider-supported request metadata.
- Add per-session caps for transcribe/structure retries.

**Mitigation:** Add conservative per-email and per-session counters in Supabase for `/debrief` while choosing a long-term limiter.

**False positive notes:** A CDN/WAF may already add rate limits, but this is not visible in repo code.

### M-2. VBrick practice audio upload bypasses shared audio validation

**Rule ID:** NEXT-FILE-001  
**Severity:** Medium  
**Location:** `app/api/vbrick/stories/practice/route.ts`

**Evidence:**

- `app/api/vbrick/stories/practice/route.ts:21-30` checks only that `audio instanceof File`.
- `app/api/vbrick/stories/practice/route.ts:43-45` calls `transcribeAudio(audio)` directly.
- The shared validator exists in `lib/openai/transcribe.ts`, but this route does not call it.

**Impact:** A caller can upload oversized or non-audio files to an unauthenticated AI/transcription endpoint, causing memory pressure, provider errors, or avoidable cost/DoS risk.

**Fix:**

- Call `validateAudioFile(audio)` before transcription, as `/api/debrief/transcribe` and `/api/transcribe` do.
- Add route-level authentication/ownership as described in C-1.

**Mitigation:** Add a hard body-size limit at the edge/platform if available.

**False positive notes:** The OpenAI provider may reject bad files, but validation should happen before upload to the provider.

### M-3. Content Security Policy is not configured in app code

**Rule ID:** NEXT-HEADERS-001 / REACT-XSS-DEFENSE-001  
**Severity:** Medium  
**Location:** `next.config.mjs`

**Evidence:**

- `next.config.mjs:3-22` defines global headers including `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`.
- No `Content-Security-Policy` or `Content-Security-Policy-Report-Only` header is visible in repo config.

**Impact:** React escaping prevents most direct XSS, and this repo does not show obvious `dangerouslySetInnerHTML` usage, but a CSP would reduce blast radius from future XSS, third-party script compromise, or unsafe DOM sinks.

**Fix:**

- Add a report-only CSP first and collect violations.
- Move to enforced CSP once third-party domains and Next.js runtime needs are known.
- Include `frame-ancestors 'none'` or equivalent if `X-Frame-Options: DENY` remains the intended embedding policy.

**Mitigation:** Keep avoiding raw HTML sinks and avoid introducing third-party scripts until CSP is in place.

**False positive notes:** CSP may be set at Vercel/edge config outside this repo. Verify runtime headers before treating as absent in production.

## Low Findings

### L-1. `window.open(..., '_blank')` lacks explicit `noopener,noreferrer`

**Rule ID:** REACT-NAV-001  
**Severity:** Low  
**Location:** `components/debrief/results-display.tsx`

**Evidence:**

- `components/debrief/results-display.tsx:141-142` falls back to `window.open(`/api/debrief/pdf?sessionId=${sessionId}`, '_blank')`.

**Impact:** Modern browsers generally imply `noopener` for `target=_blank` anchors, but explicit `noopener,noreferrer` is safer and documents intent. This is low risk because the target URL is same-origin and not attacker-controlled.

**Fix:**

- Use `window.open(url, '_blank', 'noopener,noreferrer')`.
- For anchor-based downloads, add `rel="noopener noreferrer"` when `target="_blank"` is used.

**Mitigation:** Keep PDF URLs same-origin and do not allow arbitrary redirect/download URLs.

**False positive notes:** This is defense-in-depth, not an active exploit path as written.

## Positive Findings

- Server-side protected app paths use `supabase.auth.getUser()` rather than `getSession()` in `lib/supabase/middleware.ts:32-35` and protected layouts.
- CRM OAuth flows use random state cookies and compare callback state for HubSpot/Salesforce/Pipedrive.
- CRM tokens are encrypted before storage via `lib/crm/encryption.ts`.
- Baseline headers exist in `next.config.mjs:3-22`.
- No obvious `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or `document.write` application sinks were found in `app/`, `components/`, or `lib/`.
- `next` is currently `14.2.35`, which matches current public guidance for the late-2025 React Server Components advisory line; continue monitoring advisories and upgrade promptly.

## Recommended Fix Order

1. Fix C-1: protect VBrick story draft/practice endpoints with authenticated or signed VBrick identity and ownership checks.
2. Fix H-1: add debrief session secret/cookie and require it on transcribe/structure/PDF.
3. Fix H-2: reduce public `/api` blast radius and create a shared service-role route guard.
4. Fix M-1/M-2: durable rate limiting plus audio validation on every transcription entrypoint.
5. Add CSP in report-only mode, then enforce after tuning.

