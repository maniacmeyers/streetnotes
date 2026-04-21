# Domain Pitfalls: StreetNotes.ai

**Domain:** Voice-to-CRM field sales note capture (mobile-first web app)
**Researched:** 2026-02-18
**Stack in scope:** Next.js 14 App Router, Supabase, MediaRecorder API, Whisper API, Claude API, Salesforce OAuth, HubSpot OAuth

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or authentication failures in production.

---

### Pitfall 1: Safari iOS MediaRecorder Format Mismatch Breaks Whisper Transcription

**What goes wrong:**
Chrome on Android produces `audio/webm;codecs=opus`. Safari on iOS produces `audio/mp4` (AAC). If the app hardcodes a single MIME type or file extension, either Safari users get silent recording failures, or Whisper receives audio with the wrong content-type header and rejects it.

**Why it happens:**
Developers test primarily on Chrome desktop, ship, then discover iOS Safari uses a completely different codec stack. `MediaRecorder.isTypeSupported('audio/webm')` returns `false` on Safari — but many tutorials skip this check entirely.

**Consequences:**
- Silent recording failure on iOS (the recorder initializes but produces an unplayable blob)
- 400 errors from Whisper if the file extension doesn't match the actual codec
- Users lose their note with no recovery path

**Prevention:**
1. Always negotiate format at record-start using feature detection:
   ```typescript
   const PREFERRED_FORMATS = [
     'audio/webm;codecs=opus',   // Chrome, Firefox
     'audio/mp4',                 // Safari iOS
     'audio/ogg;codecs=opus',    // Firefox desktop fallback
   ];
   const mimeType = PREFERRED_FORMATS.find(f => MediaRecorder.isTypeSupported(f)) ?? '';
   ```
2. Map the resulting MIME type to the correct file extension when uploading to Whisper. Do NOT blindly append `.webm` to all uploads.
3. Test on a real iOS device (simulator behaves differently for audio) before any release.

**Detection (warning signs):**
- QA on Chrome passes but iOS users report "recording failed" or get empty transcriptions
- Whisper returns `Invalid file format` errors in logs

**Phase to address:** Phase 1 (Audio capture MVP). Get format negotiation right before building anything on top of it.

**Confidence:** HIGH — verified against MDN MediaStream Recording API docs and multiple community post-mortems.

---

### Pitfall 2: Whisper 25 MB File Size Limit Silently Fails for Long Field Recordings

**What goes wrong:**
Whisper API hard-limits uploads to 25 MB. A 5-minute WAV file at 44.1 kHz stereo easily exceeds this. The API returns a 413 or 400 error. If the app doesn't check size before upload, the user loses a long note with no feedback.

**Why it happens:**
Developers prototype with short test recordings (< 1 min). Field sales meetings run 15–30 minutes. The gap is only discovered in real use.

**Consequences:**
- Notes silently fail to transcribe; user doesn't know until they check the CRM
- 25 MB ≈ roughly 60 minutes of compressed audio (opus/AAC) — but WAV at high quality can hit this in under 3 minutes

**Prevention:**
1. Always check `blob.size` against 24 MB (safe margin) before uploading. Gate the upload client-side.
2. Use a compressed format by default (opus or AAC, not WAV). Opus at 32 kbps produces excellent speech quality at ~14 MB/hour.
3. For long recordings, implement time-based chunking at the recording layer (e.g., split every 10 minutes), not the file layer — splitting audio files on arbitrary byte boundaries breaks transcription continuity and may cut words mid-sentence.
4. Display recording duration live so users know how long they've been recording.

**Detection (warning signs):**
- Any test recording of "a normal sales call length" triggers a failed upload
- Whisper returns `File size exceeds limit` in API response

**Phase to address:** Phase 1 (Audio capture). Decide on format and duration strategy before the transcription layer is built.

**Confidence:** HIGH — 25 MB limit confirmed by OpenAI official FAQ and community threads.

---

### Pitfall 3: Salesforce OAuth Refresh Token Invalidated by Policy — Silent Authentication Failure

**What goes wrong:**
Salesforce Connected App token policies can be set to "Immediately expire refresh token" or to short-lived refresh windows. If this policy is active, the app's stored refresh token becomes invalid immediately or after a short window, causing every subsequent API call to fail with `invalid_grant`. The user appears logged in (they have a Supabase session) but all CRM writes silently fail.

**Why it happens:**
Developers create a Connected App in a developer sandbox with default settings. Admins in customer orgs configure stricter policies. The integration breaks the moment a real org with tighter security is connected.

**Consequences:**
- Sales rep enters a note, sees "saved" in the app, but nothing appears in Salesforce
- Debugging is hard because the Supabase session is valid — the failure is at the CRM token layer
- Some orgs require token refresh to trigger re-authentication (new login flow), not a silent refresh

**Prevention:**
1. Always store both `access_token` AND `refresh_token` AND `instance_url` per-user (not globally). Salesforce instance URLs are per-org (e.g., `https://mycompany.my.salesforce.com`) — hardcoding `login.salesforce.com` for all API calls will fail for most production orgs.
2. Implement explicit token refresh error handling: catch `invalid_grant` and `expired_access/refresh_token` separately. On `invalid_grant`, invalidate the stored token and prompt the user to reconnect Salesforce — do NOT silently retry.
3. Surface CRM connection health in the UI. A persistent indicator ("Salesforce connected / disconnected") prevents "where did my note go?" support tickets.
4. During development, test with a Connected App configured with "Refresh token is valid until revoked" (default), but document that customer orgs may restrict this.

**Detection (warning signs):**
- CRM writes succeed in dev sandbox, fail in customer org
- Logs show `invalid_grant` response from `https://login.salesforce.com/services/oauth2/token`
- User reports notes aren't appearing in Salesforce despite the app saying "synced"

**Phase to address:** Phase 2 (Salesforce integration). Must handle at the point of implementing OAuth, not retrofitted later.

**Confidence:** MEDIUM — token policy behavior confirmed by Salesforce developer docs and nango.dev post-mortem; exact org-level behavior depends on admin configuration.

---

### Pitfall 4: Next.js Server Component Parallel Requests Cause Token Refresh Race Condition

**What goes wrong:**
In Next.js 14 App Router, middleware and multiple Server Components can fire simultaneously. If the CRM access token expires while several server-side requests are in flight, multiple components each try to refresh the token using the same refresh token. The first refresh succeeds and invalidates the refresh token. All subsequent refresh attempts fail with `invalid_grant`. The user is logged out of their CRM connection unexpectedly.

**Why it happens:**
This is a structural property of Next.js App Router's parallel rendering model, not a bug in the integration code. It does not surface during single-request testing.

**Consequences:**
- Intermittent, hard-to-reproduce authentication failures in production
- Users spontaneously lose their Salesforce/HubSpot connection mid-session
- Race condition is impossible to reproduce reliably in development

**Prevention:**
1. Do NOT perform CRM token refresh inside every server component individually. Centralize refresh logic in a single API route or server action with a mutex/lock.
2. Implement proactive refresh: refresh the token before it expires (check `expires_at` timestamp, refresh if < 5 minutes remain) rather than refreshing on 401. This avoids multiple simultaneous refresh attempts.
3. Store `expires_at` (timestamp) alongside the token in the database, not just `expires_in` (duration). This lets any request check freshness without doing math from an unknown start time.
4. For the refresh operation itself: wrap it in a database-level advisory lock or use Supabase's `select for update` pattern to prevent concurrent refreshes for the same user.

**Detection (warning signs):**
- Users intermittently report CRM disconnection that resolves after re-connecting
- Logs show multiple simultaneous calls to the token refresh endpoint for the same user within milliseconds
- Issue only appears under load or on pages with multiple data-fetching server components

**Phase to address:** Phase 2 (CRM OAuth integration). Design the token storage and refresh architecture correctly from the start — this is the most architecturally expensive pitfall to fix after the fact.

**Confidence:** HIGH — confirmed by multiple Next.js/next-auth GitHub discussions and Auth.js documentation on refresh token rotation.

---

### Pitfall 5: Storing CRM OAuth Tokens in Supabase Without Encryption at Rest

**What goes wrong:**
OAuth `access_token` and `refresh_token` for Salesforce/HubSpot grant write access to a user's CRM. If stored as plaintext in a Supabase table (even with RLS), a database breach exposes credentials that allow an attacker to write arbitrary data to the user's Salesforce org or HubSpot account.

**Why it happens:**
Teams treat Supabase RLS as equivalent to "secure storage." RLS controls row access for application queries — it doesn't protect against a compromised service role key or a database administrator.

**Consequences:**
- Breach of CRM credentials exposes all customer data the sales rep has access to
- Salesforce and HubSpot tokens may remain valid until manually revoked
- GDPR/SOC2 implications if the app is used by enterprise customers

**Prevention:**
1. Encrypt `access_token` and `refresh_token` values before writing to the database using a server-side encryption key (e.g., AES-256-GCM with a key from environment variables, never stored in the database).
2. Alternatively, store tokens in a secrets manager (e.g., Supabase Vault, which uses `pgsodium` for column-level encryption) — this keeps the key outside the database entirely.
3. Use RLS AND encryption as defense-in-depth, not either/or.
4. Implement token rotation: whenever a refresh produces a new access token, write the new token and delete the old one atomically.

**Detection (warning signs):**
- Security audit reveals plaintext OAuth tokens in the `crm_connections` table
- No encryption key management documented in the architecture

**Phase to address:** Phase 2 (CRM OAuth). Non-negotiable before shipping any real user data.

**Confidence:** MEDIUM — security pattern is well-established; Supabase Vault availability confirmed by Supabase docs.

---

## Moderate Pitfalls

Mistakes that cause delays, failed CRM writes, or degraded user experience.

---

### Pitfall 6: Salesforce Instance URL Hardcoded — Fails for All Non-Developer Orgs

**What goes wrong:**
Developer sandboxes use `login.salesforce.com` and `test.salesforce.com`. Production orgs use custom My Domain URLs like `https://mycompany.my.salesforce.com`. If the app hardcodes the Salesforce base URL, API calls to production orgs return authentication errors or redirect failures.

**Prevention:**
- During OAuth callback, always capture and store the `instance_url` returned in the token response (not just the `access_token`).
- Use the stored `instance_url` as the base for all subsequent API calls for that user.
- Never construct Salesforce API URLs from a hardcoded domain.
- Use separate environment variables for sandbox (`test.salesforce.com`) and production (`login.salesforce.com`) authorization endpoints.

**Phase to address:** Phase 2 (Salesforce integration). Fix in the OAuth callback handler before any Salesforce API calls are made.

**Confidence:** HIGH — confirmed by Salesforce developer documentation.

---

### Pitfall 7: HubSpot Treating 401 as Signal to Refresh Token — Causes Infinite Loop

**What goes wrong:**
HubSpot explicitly documents that a 401 response does NOT mean the access token needs refresh. The access token may simply lack the required scope, or the endpoint may have changed. If the app treats every 401 as "refresh and retry," it enters an infinite loop that hammers the HubSpot token endpoint and exhausts rate limits.

**Why it happens:**
The 401 → refresh → retry pattern works correctly for many other OAuth providers. Developers apply it uniformly without reading HubSpot's specific guidance.

**Prevention:**
- Follow HubSpot's documented approach: track `expires_in` from the token response and proactively refresh before expiration, not reactively on 401.
- On a 401 response, check: (1) Is the token expired? Refresh. (2) Is the scope insufficient? Surface an error and prompt re-authorization with correct scopes. Do NOT blindly retry.
- HubSpot OAuth tokens expire after 6 hours. Refresh tokens are long-lived but revoke the previous access token immediately on use.

**Phase to address:** Phase 3 (HubSpot integration).

**Confidence:** HIGH — explicitly documented in HubSpot developer guidelines.

---

### Pitfall 8: HubSpot Rate Limits Hit Faster Than Expected for Batch CRM Updates

**What goes wrong:**
HubSpot's default rate limit is 110 requests per 10 seconds for public apps. The Search API has a separate, stricter limit of 4 requests per second. If the app searches for a contact, then updates it, then logs an engagement, that's 3 calls per note submission. With a team of 10 active reps, it's easy to hit 30+ requests per 10 seconds — approaching the limit with no headroom.

**Prevention:**
- Implement exponential backoff with jitter for all HubSpot API calls. Handle `429 Too Many Requests` explicitly.
- Batch lookups where possible (HubSpot Batch API). Do not make individual contact-search calls per note if the contact is already known.
- Cache contact IDs locally after first lookup — avoid re-searching for the same contact on each note submission.
- Use HubSpot's `X-HubSpot-RateLimit-Remaining` response header to monitor remaining capacity and throttle proactively.

**Phase to address:** Phase 3 (HubSpot integration). Rate limit handling must be in place before any load or multi-user testing.

**Confidence:** HIGH — rate limits confirmed by official HubSpot developer docs.

---

### Pitfall 9: Claude Structured Extraction Schema Too Rigid — Fails on Ambiguous Notes

**What goes wrong:**
If the extraction schema requires all fields (e.g., `contact_name`, `company`, `next_action`, `deal_amount`), Claude may hallucinate values for missing information or mark the request as a refusal when the note doesn't contain all expected data. A voice note that says "Follow up with Sarah about the renewal" contains no company name, no deal amount — an overly strict schema makes this unextractable.

**Why it happens:**
Developers design schemas for ideal, complete notes. Real field notes are incomplete, informal, and context-dependent.

**Prevention:**
- Make all CRM fields `optional` in the extraction schema. Only `raw_text` (the transcript) should be required.
- Use Claude's structured output format (now generally available with `output_config.format`) with a Zod schema in TypeScript. Use `z.optional()` for all CRM-specific fields.
- Include a `confidence` field per extracted value so the UI can flag low-confidence extractions for user review before CRM sync.
- Provide 3–5 few-shot examples in the system prompt showing both complete and incomplete notes being handled gracefully.
- Monitor `stop_reason` in the Claude response. `refusal` means the prompt triggered a safety guardrail — log these separately and alert.

**Phase to address:** Phase 2 (AI extraction layer). Schema design is foundational — changing it later requires migrating stored extractions.

**Confidence:** HIGH — confirmed against official Anthropic structured outputs documentation (fetched directly).

---

### Pitfall 10: Audio Recording Interrupted by iOS Background / Screen Lock

**What goes wrong:**
On iOS, when the screen locks or the browser tab loses focus, the MediaRecorder pauses or stops entirely. A sales rep who locks their phone mid-meeting loses the recording from that point forward. The app may not surface any error.

**Why it happens:**
iOS imposes strict background execution limits on web apps. Safari does not maintain active audio capture when the tab is backgrounded or the screen locks.

**Prevention:**
- Use the Page Visibility API (`document.visibilitychange`) to detect when the tab is backgrounded.
- On visibility loss, immediately call `mediaRecorder.requestData()` to flush the current chunk, then pause (not stop) the recorder if possible.
- On return to foreground, resume recording and append a clear timestamp/gap marker in the note.
- Display a persistent warning: "Keep screen awake while recording" or use `navigator.wakeLock.request('screen')` to request a screen wake lock. Note: wake lock is not supported on all iOS versions — fail gracefully.
- Test explicitly: start recording, lock the phone for 30 seconds, unlock, and verify the behavior.

**Phase to address:** Phase 1 (Audio capture). Must be validated before shipping.

**Confidence:** MEDIUM — iOS background audio behavior for browser MediaRecorder is well-documented in community posts but specific behavior may vary across Safari versions.

---

### Pitfall 11: Supabase getSession() Used in Server Code — Spoofable

**What goes wrong:**
Supabase's `supabase.auth.getSession()` trusts the client-provided session cookie without re-validating the JWT against Supabase's public keys. In server components or API routes, calling `getSession()` can be spoofed — a malicious client can craft a session cookie that passes the check.

**Prevention:**
- Always use `supabase.auth.getUser()` (not `getSession()`) in server-side code (Server Components, API routes, middleware) to validate the user's identity.
- `getSession()` is safe only on the client side where the session is managed by the browser.
- For server-side reads of CRM tokens, pair `getUser()` with an RLS-enforced query so the token can only be read by the authenticated user's own row.

**Phase to address:** Phase 1 (Auth setup). Fix before any user-sensitive data is read server-side.

**Confidence:** HIGH — explicitly called out in Supabase official documentation.

---

## Minor Pitfalls

Mistakes that cause friction but are fixable without architectural changes.

---

### Pitfall 12: Whisper Transcription Quality Degrades for Sales Jargon and Acronyms

**What goes wrong:**
Whisper handles general English well but struggles with domain-specific terms: "MEDDIC," "BANT," CRM field names, product-specific acronyms, or names of contacts. It may transcribe "Salesforce SFDC" as "Salesforce SFDC" correctly but mangle "Zoura" for "Zuora" or miss "NRR" entirely.

**Prevention:**
- Pass a `prompt` parameter to the Whisper API endpoint (the initial prompt field) containing common sales terms, company names, and product names. Whisper uses this as a warm-up context. Example: "CRM, SFDC, NRR, ARR, MQL, SQL, AE, SDR, ACV..."
- Provide a UI for users to flag and correct transcription errors. This also becomes training data for future improvements.
- Do not block CRM extraction on perfect transcription — let the AI extraction layer handle noise.

**Phase to address:** Phase 2 (Transcription quality tuning).

**Confidence:** MEDIUM — Whisper prompt parameter behavior documented by OpenAI; effectiveness for domain jargon is confirmed in community posts but varies.

---

### Pitfall 13: CRM Sync Fails Silently — User Thinks Note is Saved

**What goes wrong:**
A network timeout or CRM API error during sync causes the note to save locally but fail to reach Salesforce or HubSpot. The UI shows "Saved" (true for the local/Supabase state) but shows nothing in the CRM (the sync failed). The rep discovers this hours later when the data isn't in Salesforce.

**Prevention:**
- Separate "note saved" status from "CRM synced" status in both the data model and the UI. Show two distinct states: `saved` and `crm_synced: pending | success | failed`.
- Implement a retry queue (e.g., a Supabase `crm_sync_queue` table) for failed CRM pushes. Background retry with exponential backoff.
- Display sync status prominently in the note list. A `!` badge on "CRM sync failed" notes with a manual retry button.
- Notify the user (push or in-app) when a sync fails after all retries are exhausted.

**Phase to address:** Phase 2 (CRM sync). The sync status data model must be built into the initial schema, not added later.

**Confidence:** MEDIUM — pattern is standard for offline-first apps; specific CRM failure modes confirmed by field sales tool post-mortems.

---

### Pitfall 14: Salesforce Connected App Not Requesting `refresh_token` Scope Explicitly

**What goes wrong:**
Without the `refresh_token` scope explicitly included in the OAuth request, Salesforce does not issue a refresh token. The access token expires (typically after 2 hours for web server OAuth), and the app cannot renew the session without prompting the user to log in again.

**Prevention:**
- In the OAuth authorization URL, always include `scope=api refresh_token offline_access`. Confirm the Connected App's OAuth policies also allow `Refresh token` as a permitted scope.
- After the initial OAuth exchange, verify the token response contains `refresh_token`. If it does not, the Connected App configuration is incorrect — surface this as a setup error, not a silent failure.

**Phase to address:** Phase 2 (Salesforce integration setup).

**Confidence:** HIGH — Salesforce OAuth scope documentation confirmed this behavior.

---

### Pitfall 15: HubSpot Scope Creep — Requesting Broad Scopes Fails OAuth App Review

**What goes wrong:**
HubSpot's OAuth app review (required for apps listed in the HubSpot marketplace) requires that scopes requested match actual usage. Requesting `contacts`, `deals`, `engagements`, `crm.schemas.read` "in case we need it later" will fail review and may confuse users during the consent screen.

**Prevention:**
- Start with minimal scopes for MVP: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.notes.write`.
- Add deal/pipeline scopes only when those features are built.
- Document scope requirements per feature so future additions are intentional.

**Phase to address:** Phase 3 (HubSpot integration).

**Confidence:** MEDIUM — HubSpot marketplace review requirements sourced from developer docs; specific review criteria may change.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Audio capture (Phase 1) | Safari iOS format mismatch | Implement `isTypeSupported()` negotiation on day 1, test on real device |
| Audio capture (Phase 1) | iOS screen lock stops recording | Validate wake lock + visibility API behavior before shipping |
| Auth setup (Phase 1) | `getSession()` spoofable server-side | Use `getUser()` in all server code from the start |
| AI extraction (Phase 2) | Schema too rigid for incomplete notes | All CRM fields optional, confidence scores, few-shot examples |
| AI extraction (Phase 2) | `stop_reason: refusal` unhandled | Always check `stop_reason`, log refusals, surface to user |
| Salesforce integration (Phase 2) | Token refresh race condition in App Router | Centralize refresh with proactive expiry check, not reactive 401 retry |
| Salesforce integration (Phase 2) | Instance URL hardcoded | Capture and store `instance_url` from every OAuth token response |
| Salesforce integration (Phase 2) | `refresh_token` scope missing | Verify scope list in Connected App and OAuth request |
| Salesforce integration (Phase 2) | Tokens stored plaintext | Encrypt at rest before storing any real user credential |
| CRM sync (Phase 2) | Silent sync failure | Build two-state UI (saved vs. CRM synced) into initial data model |
| HubSpot integration (Phase 3) | 401 → infinite refresh loop | Proactive refresh, not reactive; treat 401 as scope error first |
| HubSpot integration (Phase 3) | Search API rate limit (4 req/s) | Cache contact IDs, batch lookups, backoff on 429 |
| HubSpot integration (Phase 3) | Broad scope requests | Minimum viable scopes, expand per feature |
| Whisper integration (Phase 1/2) | 25 MB limit on long recordings | Format + duration validation before upload, compressed codec default |
| Whisper integration (Phase 2) | Sales jargon transcription errors | Use Whisper `prompt` parameter with domain vocabulary |

---

## Sources

- [MediaStream Recording API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API) | HIGH confidence
- [iPhone Safari MediaRecorder Audio Recording — buildwithmatija.com](https://www.buildwithmatija.com/blog/iphone-safari-mediarecorder-audio-recording-transcription) | MEDIUM confidence
- [WebKit MediaRecorder API announcement](https://webkit.org/blog/11353/mediarecorder-api/) | HIGH confidence
- [Whisper API FAQ — OpenAI Help Center](https://help.openai.com/en/articles/7031512-whisper-api-faq) | HIGH confidence
- [Whisper 25 MB limit community discussion — OpenAI Forum](https://community.openai.com/t/whisper-api-increase-file-limit-25-mb/566754) | MEDIUM confidence
- [Salesforce OAuth Refresh Token Flow — Salesforce Developer Docs](https://developer.salesforce.com/docs/platform/mobile-sdk/guide/oauth-refresh-token-flow.html) | HIGH confidence
- [Salesforce OAuth refresh token invalid_grant — Nango Blog](https://nango.dev/blog/salesforce-oauth-refresh-token-invalid-grant) | MEDIUM confidence
- [Salesforce Connected App Settings Mismatch — Salesforce Help](https://help.salesforce.com/s/articleView?id=000396526&language=en_US&type=1) | HIGH confidence
- [HubSpot API Usage Guidelines and Rate Limits — HubSpot Docs](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines) | HIGH confidence
- [Auth.js Refresh Token Rotation Guide](https://authjs.dev/guides/refresh-token-rotation) | HIGH confidence
- [Next.js Token Refresh Race Condition — next-auth GitHub Discussion](https://github.com/nextauthjs/next-auth/discussions/3940) | MEDIUM confidence
- [Claude Structured Outputs — Anthropic Official Docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) | HIGH confidence (fetched directly)
- [Supabase Server-Side Auth Advanced Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide) | HIGH confidence
- [Salesforce API Rate Limits — Salesforce Developer Docs](https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_platform_api.htm) | HIGH confidence
