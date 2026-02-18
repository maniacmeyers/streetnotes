# Technology Stack

**Project:** StreetNotes.ai
**Researched:** 2026-02-18
**Research mode:** Stack dimension — verified versions for voice-to-CRM mobile-first web app

---

## Confirmed Stack (User Decisions)

These are locked decisions. Research below confirms choices and fills in sub-library selections.

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 14 + App Router + Tailwind CSS | LOCKED |
| Backend | Next.js API Routes (monorepo) | LOCKED |
| Database | Supabase (auth + PostgreSQL) | LOCKED |
| Voice capture | MediaRecorder API | LOCKED |
| Transcription | OpenAI Whisper API (whisper-1) | LOCKED |
| AI structuring | Anthropic Claude API | LOCKED |
| CRM targets | Salesforce + HubSpot via OAuth | LOCKED |

---

## Recommended Sub-Libraries

### Supabase Client Setup

| Library | Version | Purpose | Confidence |
|---------|---------|---------|-----------|
| `@supabase/supabase-js` | `^2.97.0` | Core Supabase client (auth, DB, storage) | HIGH |
| `@supabase/ssr` | `^0.8.0` | Server-side rendering support for App Router | HIGH |

**Why these two:** `@supabase/ssr` is the current Supabase-endorsed approach for Next.js App Router. The older `@supabase/auth-helpers-nextjs` package is deprecated — do not use it. The `@supabase/ssr` package exports `createBrowserClient` (for Client Components) and `createServerClient` (for Server Components and Route Handlers), with cookie-based session management.

**Critical setup detail:** Next.js App Router requires a middleware file (`middleware.ts`) to refresh Supabase sessions on every request. Without this, server-side session reads will miss recently refreshed tokens.

Sources: [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs), [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

---

### AI/ML APIs

| Library | Version | Purpose | Confidence |
|---------|---------|---------|-----------|
| `openai` | `^6.22.0` | Whisper transcription API client | HIGH |
| `@anthropic-ai/sdk` | `^0.76.0` | Claude API for AI structuring | HIGH |

**OpenAI SDK:** Version 6.x is the current major version, last published 4 days ago. Use the `audio.transcriptions.create()` method with `model: "whisper-1"`. The SDK handles streaming and retries.

**Anthropic SDK:** Version 0.76.0 released 2026-02-18 (today). The SDK requires Node.js 20 LTS or later. The package is `@anthropic-ai/sdk` — do not confuse with `@ai-sdk/anthropic` which is the Vercel AI SDK wrapper (different API surface).

**Whisper API constraints (verified):**
- Maximum file size: **25 MB** per request
- Supported formats: `m4a`, `mp3`, `webm`, `mp4`, `mpga`, `wav`, `mpeg`
- Browser MediaRecorder default output is `webm` — this IS supported by Whisper
- Field sales notes should be < 5 minutes, keeping well under 25 MB limit

Sources: [openai npm](https://www.npmjs.com/package/openai), [anthropic-sdk GitHub releases](https://github.com/anthropics/anthropic-sdk-typescript/releases), [OpenAI Audio API FAQ](https://help.openai.com/en/articles/7031512-audio-api-faq)

---

### CRM Client Libraries

#### Salesforce

| Library | Version | Purpose | Confidence |
|---------|---------|---------|-----------|
| `jsforce` | `^3.10.14` | Salesforce REST API client | HIGH |

**Why jsforce v3 (not v1/v2):** jsforce v1 and v2 are EOL with no further security patches. v3 is GA (generally available), actively maintained (published 20 hours ago as of research date), and is the only supported branch going forward.

**Breaking changes in v3 vs v2:**
- Requires Node.js >= 18 (Next.js 14 meets this)
- OAuth2 auto-refreshes access tokens when refresh token is provided in constructor
- All HTTP requests auto-retry on network errors
- SOAP login() API will be retired Summer 2027 (API v65.0) — only use OAuth2 flows

**OAuth2 flow for Salesforce:** Use `Connection` with `oauth2` option. The `refreshToken` should be stored in Supabase (encrypted) and passed to the Connection constructor. jsforce fires a `refresh` event when tokens are renewed — capture this to update stored tokens.

**Objects needed for StreetNotes:** `Contact`, `Account`, `Opportunity` (deal), and `Task` (follow-up next steps). All are standard Salesforce REST API objects accessible via jsforce's `conn.sobject('Contact').create(...)` pattern.

Sources: [jsforce npm](https://www.npmjs.com/package/jsforce), [jsforce v3 GA announcement](https://github.com/jsforce/jsforce/discussions/1529), [jsforce migration guide](https://github.com/jsforce/jsforce/blob/main/MIGRATING_V2-V3.md)

#### HubSpot

| Library | Version | Purpose | Confidence |
|---------|---------|---------|-----------|
| `@hubspot/api-client` | `^13.4.0` | HubSpot V3 API client | HIGH |

**Why the official client:** `@hubspot/api-client` is the officially maintained HubSpot library for Node.js (V3 API). The older `hubspot` package is unmaintained — do not use it.

**HubSpot CRM scopes needed:**
- `crm.objects.contacts.read` + `crm.objects.contacts.write`
- `crm.objects.companies.read` + `crm.objects.companies.write`
- `crm.objects.deals.read` + `crm.objects.deals.write`
- `crm.schemas.contacts.read` (for field mapping)

**Important:** HubSpot updated its contacts scope model — the old broad `contacts` scope is being migrated to granular per-object scopes. Use the granular scopes listed above.

Sources: [@hubspot/api-client npm](https://www.npmjs.com/package/@hubspot/api-client), [HubSpot contacts scope migration](https://developers.hubspot.com/docs/api/oauth/contacts-scope-migration)

---

### OAuth Handling in Next.js

**Recommendation: Auth.js v5 (next-auth@5)**

| Library | Version | Purpose | Confidence |
|---------|---------|---------|-----------|
| `next-auth` | `^5.0.0-beta` | OAuth orchestration for Salesforce + HubSpot | MEDIUM |

**Status:** Auth.js v5 (next-auth@5) is beta but has not shipped a stable release as of 2026-02-18. It is widely deployed in production. Auth.js has now been absorbed by the Better Auth team, and both will continue to be maintained. The v5 beta is stable enough for production use.

**Why Auth.js over better-auth for this project:**
- Auth.js has **built-in Salesforce and HubSpot providers** — no custom provider code needed
- better-auth's Salesforce support requires custom scopes (open GitHub issue) and HubSpot has no official provider (only genericOAuth workaround)
- Auth.js v5 requires Next.js 14+ — StreetNotes meets this

**Critical OAuth architecture decision for this project:** Standard Auth.js session management handles user authentication. However, CRM tokens are **different** from the user's auth session — they are per-CRM-connection tokens that need to be stored separately in Supabase so they can be used server-side in API routes for CRM writes.

**Pattern for CRM OAuth tokens:**
1. Use Auth.js for the Salesforce/HubSpot OAuth flows to get initial tokens
2. In the `jwt` callback, capture the `access_token` and `refresh_token` from the provider account
3. Store these tokens in a `crm_connections` Supabase table (encrypted at rest)
4. Use jsforce / @hubspot/api-client with stored tokens in API routes for CRM operations
5. Handle token refresh: jsforce does this automatically; HubSpot client requires manual refresh logic

**Scopes to request for Salesforce via Auth.js:**
Override the default Salesforce provider scopes to include `api refresh_token offline_access` — without `refresh_token`, you cannot make background API calls after the user's session expires.

Sources: [Auth.js Salesforce provider](https://authjs.dev/getting-started/providers/salesforce), [next-auth npm](https://www.npmjs.com/package/next-auth), [better-auth Salesforce issue](https://github.com/better-auth/better-auth/issues/6660)

---

### Voice Recording in the Browser

| Library | Version | Purpose | Confidence |
|---------|---------|---------|-----------|
| `react-media-recorder` | `^1.7.2` | React hook for MediaRecorder API | MEDIUM |

**Why react-media-recorder:** 23,797 weekly downloads, actively maintained (latest version < 6 months old as of research), provides typed React hook with `startRecording`, `stopRecording`, `mediaBlobUrl`, and `status` state. It wraps the native `MediaRecorder` API with minimal abstraction.

**Why NOT react-audio-voice-recorder:** Last published 2 years ago, effectively unmaintained. The maintained fork `@fixhq/react-audio-voice-recorder` exists but adds an unnecessary dependency chain.

**Alternative: Roll your own hook.** For a production app, a custom `useVoiceRecorder` hook using native `MediaRecorder` is only ~80 lines of code and eliminates a dependency. This is viable and recommended if the team has React experience. Benefits: no third-party bundle weight, full control over encoding options, no maintenance risk.

**Audio format recommendation:** Request `audio/webm;codecs=opus` from MediaRecorder — it is the most widely supported format that Whisper accepts, and opus codec gives good compression for voice. Safari may fall back to `audio/mp4` — both are Whisper-compatible.

Sources: [react-media-recorder npm](https://www.npmjs.com/package/react-media-recorder), [react-audio-voice-recorder npm](https://www.npmjs.com/package/react-audio-voice-recorder)

---

### Schema Validation

| Library | Version | Purpose | Confidence |
|---------|---------|---------|-----------|
| `zod` | `^4.3.6` | Runtime schema validation for AI-structured output and API routes | HIGH |

**Why zod:** Claude's structured output will be JSON — zod validates and types it before it reaches the database or CRM. Also essential for validating API route inputs. Zod v4 is the current major version (up from v3) with improved performance. Use it throughout: Claude response schema, CRM payload schema, API route input validation.

Sources: [zod npm](https://www.npmjs.com/package/zod), [zod releases](https://github.com/colinhacks/zod/releases)

---

### File Upload Pattern for Audio

No external library needed. Next.js 14 App Router handles multipart FormData natively.

**Pattern:**
```typescript
// app/api/transcribe/route.ts
export async function POST(req: Request) {
  const formData = await req.formData()
  const audioFile = formData.get('audio') as File
  // Forward to Whisper API
}
```

The `req.formData()` method on `Request` in App Router Route Handlers handles multipart uploads without bodyParser configuration or external libraries like multer or formidable.

Sources: [Next.js route.js docs](https://nextjs.org/docs/app/api-reference/file-conventions/route)

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Supabase Next.js auth | `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | Deprecated by Supabase team |
| Salesforce client | `jsforce` v3 | `@salesforce/core` | Designed for Salesforce CLI plugins, not general API use |
| HubSpot client | `@hubspot/api-client` | `hubspot` (npm) | Unmaintained legacy package |
| OAuth | `next-auth` v5 | `better-auth` | better-auth lacks official Salesforce/HubSpot providers |
| Audio recording | `react-media-recorder` OR custom hook | `react-audio-voice-recorder` | 2 years unmaintained |
| AI structuring | `@anthropic-ai/sdk` direct | `@ai-sdk/anthropic` (Vercel) | Direct SDK gives full control, Vercel AI SDK is overkill |
| Validation | `zod` v4 | `yup`, `valibot` | Zod has best TypeScript inference and ecosystem integration |

---

## Full Installation Commands

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# AI APIs
npm install openai @anthropic-ai/sdk

# CRM clients
npm install jsforce @hubspot/api-client

# Auth
npm install next-auth@beta

# Voice recording (if using library — or skip and write custom hook)
npm install react-media-recorder

# Validation
npm install zod

# TypeScript types (dev)
npm install -D @types/node @types/react @types/react-dom typescript
```

---

## Version Summary Table

| Package | Version | Published | Source |
|---------|---------|-----------|--------|
| `@supabase/supabase-js` | 2.97.0 | ~4 hours before research | WebSearch verified |
| `@supabase/ssr` | 0.8.0 | ~3 months before research | WebSearch verified |
| `openai` | 6.22.0 | ~4 days before research | WebSearch verified |
| `@anthropic-ai/sdk` | 0.76.0 | 2026-02-18 (same day) | GitHub releases verified |
| `jsforce` | 3.10.14 | ~20 hours before research | WebSearch verified |
| `@hubspot/api-client` | 13.4.0 | ~5 months before research | WebSearch verified |
| `next-auth` | 5.0.0-beta | Active beta | WebSearch verified |
| `react-media-recorder` | 1.7.2 | ~6 months before research | WebSearch verified |
| `zod` | 4.3.6 | ~1 month before research | WebSearch verified |

---

## Open Questions / Flags for Phase Research

1. **jsforce v3 OAuth2 token refresh event in Next.js App Router:** The `refresh` event fires on the jsforce Connection object — research how to capture this in a stateless serverless route handler and persist the new token back to Supabase.

2. **Salesforce sandbox vs production endpoints:** jsforce's `loginUrl` must be configured differently for sandbox vs production. Confirm environment variable strategy before building the connection module.

3. **HubSpot private vs public app OAuth:** StreetNotes will need a **public app** (users connect their own HubSpot accounts). Private apps use API keys, not OAuth. Confirm app type during CRM integration phase.

4. **Supabase encrypted token storage:** CRM tokens (access + refresh) stored in Supabase should be encrypted at rest. Supabase's built-in column encryption (Transparent Column Encryption) is in early access — evaluate availability before implementing, or use application-level encryption with a KMS key.

5. **Auth.js beta stability:** next-auth@5 is beta. Monitor for stable release during project. The Better Auth acquisition introduces organizational uncertainty but both maintainers have committed to continued maintenance.

---

## Sources

| Source | URL | Confidence |
|--------|-----|-----------|
| Supabase SSR docs | https://supabase.com/docs/guides/auth/server-side/nextjs | HIGH |
| Supabase client for SSR | https://supabase.com/docs/guides/auth/server-side/creating-a-client | HIGH |
| jsforce npm | https://www.npmjs.com/package/jsforce | HIGH |
| jsforce v3 GA | https://github.com/jsforce/jsforce/discussions/1529 | HIGH |
| jsforce v3 migration | https://github.com/jsforce/jsforce/blob/main/MIGRATING_V2-V3.md | HIGH |
| @hubspot/api-client npm | https://www.npmjs.com/package/@hubspot/api-client | HIGH |
| HubSpot scope migration | https://developers.hubspot.com/docs/api/oauth/contacts-scope-migration | HIGH |
| openai npm | https://www.npmjs.com/package/openai | HIGH |
| OpenAI Audio FAQ | https://help.openai.com/en/articles/7031512-audio-api-faq | HIGH |
| @anthropic-ai/sdk releases | https://github.com/anthropics/anthropic-sdk-typescript/releases | HIGH |
| Auth.js Salesforce | https://authjs.dev/getting-started/providers/salesforce | HIGH |
| Auth.js HubSpot | https://next-auth.js.org/providers/hubspot | HIGH |
| Auth.js v5 migration | https://authjs.dev/getting-started/migrating-to-v5 | HIGH |
| better-auth Salesforce issue | https://github.com/better-auth/better-auth/issues/6660 | MEDIUM |
| react-media-recorder npm | https://www.npmjs.com/package/react-media-recorder | MEDIUM |
| zod npm | https://www.npmjs.com/package/zod | HIGH |
| Next.js route.js docs | https://nextjs.org/docs/app/api-reference/file-conventions/route | HIGH |
