# Architecture Patterns: StreetNotes.ai

**Domain:** Voice-to-CRM field sales note capture (mobile-first web app)
**Researched:** 2026-02-18
**Overall confidence:** HIGH (verified against official Next.js, Anthropic, HubSpot, and MDN documentation)

---

## Recommended Architecture

StreetNotes.ai is a **sequential processing pipeline** embedded inside a Next.js App Router monorepo. The browser captures audio, the server handles all external API calls (Whisper, Claude, CRM), and Supabase serves as the persistence and auth layer. There is no separate backend — all server logic lives in Next.js Route Handlers under `app/api/`.

```
BROWSER (mobile PWA)
  │
  │  1. MediaRecorder → audio Blob (webm/mp4/ogg)
  │  2. POST FormData → /api/transcribe
  │
  └──► NEXT.JS API LAYER (app/api/)
          │
          ├─ /api/transcribe
          │     │  receives FormData, extracts File
          │     │  calls OpenAI Whisper API
          │     └─ returns { transcript: string }
          │
          ├─ /api/structure
          │     │  receives { transcript, userId }
          │     │  calls Claude API (output_config.format = json_schema)
          │     └─ returns { structured_note: CRMNote }
          │
          ├─ /api/crm/push
          │     │  receives { structured_note, userId, crmType }
          │     │  reads CRM tokens from Supabase
          │     │  refreshes token if expired
          │     │  calls Salesforce or HubSpot REST API
          │     └─ returns { crm_record_id, crm_url }
          │
          ├─ /api/auth/salesforce/callback  (OAuth handler)
          ├─ /api/auth/salesforce/connect
          ├─ /api/auth/hubspot/callback
          └─ /api/auth/hubspot/connect
                    │
                    └─ stores tokens in Supabase crm_connections table
  │
  └──► SUPABASE
          ├─ auth.users            (Supabase Auth — user identity)
          ├─ notes                 (transcript + structured note + metadata)
          ├─ crm_connections       (access_token, refresh_token, expires_at, crm_type, user_id)
          └─ deal_stage_cache      (CRM pipeline stages per user, TTL-invalidated)
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Browser recording layer | MediaRecorder setup, format detection, blob collection, upload | `/api/transcribe` via fetch |
| `/api/transcribe` route handler | Receive audio FormData, forward to Whisper API, return raw transcript | OpenAI Whisper API |
| `/api/structure` route handler | Send transcript to Claude, enforce JSON schema, return typed CRMNote | Anthropic Claude API |
| `/api/crm/push` route handler | Read tokens from Supabase, call CRM REST API, handle errors | Supabase (tokens), Salesforce/HubSpot APIs |
| `/api/auth/[crm]/connect` | Build OAuth authorization URL, redirect user to CRM login | CRM OAuth server |
| `/api/auth/[crm]/callback` | Exchange authorization code for tokens, store in Supabase | CRM OAuth server, Supabase |
| Supabase `crm_connections` table | Persist access + refresh tokens per user per CRM | Read by `/api/crm/push`, written by `/api/auth/[crm]/callback` |
| Supabase `notes` table | Persist raw transcript, structured output, push status | Read/written by `/api/structure` and `/api/crm/push` |
| Client UI (Next.js pages) | Recording controls, note review/edit, CRM push trigger, OAuth connect buttons | All `/api/` routes |

**Critical constraint:** The browser never holds CRM tokens. All token operations happen server-side in Route Handlers. CRM API calls never originate from the client.

---

## Data Flow

### Primary Pipeline: Voice Note to CRM Record

```
Step 1: RECORD
  User taps record in browser
  MediaRecorder.start() collects ondataavailable chunks
  Format detection: MediaRecorder.isTypeSupported() in priority order:
    1. audio/webm;codecs=opus  (Chrome/Firefox desktop + Android)
    2. audio/mp4               (Safari iOS — primary mobile target)
    3. audio/ogg;codecs=opus   (Firefox desktop fallback)
  User taps stop → chunks assembled into Blob

Step 2: UPLOAD TO TRANSCRIBE
  Client: FormData.append('audio', blob, 'recording.[ext]')
  POST /api/transcribe (multipart/form-data)
  Server: const formData = await request.formData()
          const file = formData.get('audio') as File
          const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1'
          })
  Response: { transcript: string }

Step 3: STRUCTURE
  Client: POST /api/structure { transcript, userId }
  Server: Claude API call with output_config.format = json_schema
          Schema targets: contact_name, company, deal_value, next_action,
                         pipeline_stage, notes_summary, follow_up_date
  Claude returns guaranteed-valid JSON (no parse errors)
  Server saves note to Supabase notes table
  Response: { structured_note: CRMNote, note_id: string }

Step 4: REVIEW (optional — UI gate)
  User reviews/edits structured fields in browser
  User selects target CRM and pipeline stage

Step 5: PUSH TO CRM
  Client: POST /api/crm/push { note_id, crm_type, user_id }
  Server:
    1. Fetch tokens from Supabase crm_connections for user_id + crm_type
    2. Check token expiry: if expires_at < now + 5min → refresh
    3. POST refresh to CRM token endpoint → store new tokens in Supabase
    4. Call CRM REST API:
       Salesforce: POST /services/data/v59.0/sobjects/Opportunity/
       HubSpot:    POST https://api.hubapi.com/crm/v3/objects/deals
    5. Save crm_record_id back to Supabase notes table
  Response: { crm_record_id, crm_url }
```

### OAuth Connection Flow (Salesforce)

```
Step 1: User clicks "Connect Salesforce"
  Browser → GET /api/auth/salesforce/connect
  Server builds authorization URL:
    https://login.salesforce.com/services/oauth2/authorize
      ?response_type=code
      &client_id=[SALESFORCE_CLIENT_ID]
      &redirect_uri=[APP_URL]/api/auth/salesforce/callback
      &scope=api refresh_token
      &state=[CSRF_TOKEN stored in httpOnly cookie]
  Server: return Response.redirect(authorizationUrl)

Step 2: User authorizes in Salesforce
  Salesforce redirects to:
    /api/auth/salesforce/callback?code=AUTH_CODE&state=...

Step 3: Callback handler
  Server: validate state matches cookie (CSRF check)
          POST to https://login.salesforce.com/services/oauth2/token
            grant_type=authorization_code, code, client_id, client_secret, redirect_uri
          Salesforce returns: { access_token, refresh_token, instance_url, expires_in }
          INSERT into Supabase crm_connections:
            { user_id, crm_type: 'salesforce', access_token, refresh_token,
              instance_url, expires_at: now() + expires_in }
  Response: redirect to dashboard with success indicator
```

### OAuth Connection Flow (HubSpot)

```
Step 1: User clicks "Connect HubSpot"
  Authorization URL:
    https://app.hubspot.com/oauth/authorize
      ?client_id=[HUBSPOT_CLIENT_ID]
      &redirect_uri=[APP_URL]/api/auth/hubspot/callback
      &scope=crm.objects.deals.write crm.objects.contacts.write
      &state=[CSRF_TOKEN]

Step 2: Callback handler
  POST to https://api.hubapi.com/oauth/v1/token
    grant_type=authorization_code, code, client_id, client_secret, redirect_uri
  HubSpot returns: { access_token, refresh_token, expires_in (1800 = 30 min) }
  INSERT into Supabase crm_connections

Step 3: Token refresh (HubSpot access tokens expire every 30 minutes)
  POST https://api.hubapi.com/oauth/v1/token
    grant_type=refresh_token, refresh_token, client_id, client_secret
  HubSpot may issue new refresh token — always update stored value
```

---

## Route Handler Structure

Recommended `app/api/` layout:

```
app/api/
  transcribe/
    route.ts          # POST: audio upload → Whisper → transcript
  structure/
    route.ts          # POST: transcript → Claude → CRMNote JSON
  crm/
    push/
      route.ts        # POST: structured note → CRM API
    stages/
      route.ts        # GET: fetch pipeline stages from CRM (cached in Supabase)
  auth/
    salesforce/
      connect/
        route.ts      # GET: redirect to Salesforce OAuth
      callback/
        route.ts      # GET: exchange code, store tokens
    hubspot/
      connect/
        route.ts      # GET: redirect to HubSpot OAuth
      callback/
        route.ts      # GET: exchange code, store tokens
```

---

## Supabase Schema

```sql
-- User CRM token storage (one row per user per CRM)
CREATE TABLE crm_connections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  crm_type    text NOT NULL CHECK (crm_type IN ('salesforce', 'hubspot')),
  access_token  text NOT NULL,  -- store encrypted at rest
  refresh_token text NOT NULL,  -- store encrypted at rest
  instance_url  text,           -- Salesforce-specific: org URL
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, crm_type)
);

-- Notes storage
CREATE TABLE notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  raw_transcript  text NOT NULL,
  structured_note jsonb,        -- CRMNote object
  crm_type        text,
  crm_record_id   text,         -- set after successful push
  crm_record_url  text,
  status          text DEFAULT 'draft', -- draft | pushed | failed
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Cached deal stages per user per CRM (avoid repeated API calls)
CREATE TABLE deal_stage_cache (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  crm_type    text NOT NULL,
  pipeline_id text,
  stages      jsonb NOT NULL,   -- array of { id, label, order }
  fetched_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, crm_type, pipeline_id)
);
```

**RLS policy:** All tables require `auth.uid() = user_id`. CRM tokens are never readable by browser clients — only server-side Route Handlers (using service role key from env) read the `crm_connections` table.

---

## Patterns to Follow

### Pattern 1: Format-First Audio Negotiation

**What:** Test MIME types client-side before starting MediaRecorder. Map MIME type to file extension for the upload filename — Whisper uses the extension to determine codec.

**When:** Always, because iPhone Safari only supports `audio/mp4` and will produce silence or errors if you assume `audio/webm`.

```typescript
// Priority order matters — test most capable first
const MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/webm',
];

function getSupportedMimeType(): string {
  return MIME_TYPES.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
}

const MIME_TO_EXT: Record<string, string> = {
  'audio/webm;codecs=opus': 'webm',
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/ogg;codecs=opus': 'ogg',
};
```

**Source:** MDN MediaRecorder API (HIGH confidence — official spec documentation)

### Pattern 2: Server-Side Token Refresh Before CRM Call

**What:** In `/api/crm/push`, always check `expires_at` before making a CRM API call. If within 5 minutes of expiry, refresh proactively. Use Supabase service role key (never anon key) to read/write `crm_connections`.

**When:** Every CRM API call.

```typescript
async function getValidAccessToken(userId: string, crmType: string) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { data } = await supabase
    .from('crm_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('crm_type', crmType)
    .single();

  if (!data) throw new Error('CRM not connected');

  // Refresh if expiring within 5 minutes
  const expiringAt = new Date(data.expires_at);
  if (expiringAt < new Date(Date.now() + 5 * 60 * 1000)) {
    return await refreshAndStoreToken(data, supabase);
  }

  return data.access_token;
}
```

**Source:** HubSpot official OAuth docs (30-min token lifespan confirmed — HIGH confidence)

### Pattern 3: Claude Structured Output with Zod

**What:** Define the CRMNote schema with Zod, use `zodOutputFormat()` helper from the Anthropic SDK, call `client.messages.parse()`. This gives type-safe output with zero parse error risk.

**When:** In `/api/structure` route handler.

```typescript
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

const CRMNoteSchema = z.object({
  contact_name:    z.string().nullable(),
  company_name:    z.string().nullable(),
  deal_value:      z.number().nullable(),
  currency:        z.string().default('USD'),
  next_action:     z.string().nullable(),
  pipeline_stage:  z.string().nullable(),
  follow_up_date:  z.string().nullable(), // ISO date string
  summary:         z.string(),
  key_topics:      z.array(z.string()),
});

const response = await anthropic.messages.parse({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: `Structure this sales note:\n\n${transcript}` }],
  output_config: { format: zodOutputFormat(CRMNoteSchema) },
});

const structured = response.parsed_output; // fully typed, guaranteed valid
```

**Source:** Anthropic official structured outputs docs — `output_config.format` parameter (HIGH confidence — fetched from platform.claude.com 2026-02-18)

### Pattern 4: Separate Transcribe and Structure Endpoints

**What:** Keep `/api/transcribe` and `/api/structure` as separate Route Handlers rather than one combined endpoint.

**Why:** Allows the UI to show the transcript to the user before structuring, letting them correct misheard words. Also allows retrying Claude independently of Whisper. Both operations have different timeout characteristics — Whisper is fast (5-30s), Claude is fast (<5s for extraction).

**When:** Always in this architecture.

### Pattern 5: CSRF Protection for OAuth Callbacks

**What:** Generate a random state token before redirecting to CRM OAuth, store in an httpOnly secure cookie, validate it matches in the callback.

**When:** Both Salesforce and HubSpot OAuth flows.

```typescript
// /api/auth/salesforce/connect/route.ts
export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const authUrl = new URL('https://login.salesforce.com/services/oauth2/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.SALESFORCE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', `${process.env.APP_URL}/api/auth/salesforce/callback`);
  authUrl.searchParams.set('scope', 'api refresh_token');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('sf_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });
  return response;
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing CRM Tokens in Browser Storage

**What:** Saving access_token or refresh_token to localStorage, sessionStorage, or client-accessible cookies.

**Why bad:** CRM tokens grant write access to production Salesforce/HubSpot data. XSS vulnerability = full CRM compromise. Supabase's own documentation warns that provider tokens should not be accessible in the browser.

**Instead:** Store tokens only in Supabase `crm_connections` table, read only by Route Handlers using the service role key. The browser never sees raw CRM tokens.

### Anti-Pattern 2: Combining Audio Upload and CRM Push into One Request

**What:** One long-running POST that records → transcribes → structures → pushes in a single API call.

**Why bad:** Mobile networks drop connections. A 60-second recording + Whisper + Claude + CRM push could exceed serverless function timeouts (Vercel default: 10s for Hobby, configurable up to 60s Pro). Any failure requires restarting the entire pipeline.

**Instead:** Use the 5-step pipeline with intermediate state saved to Supabase `notes`. Each step is independently retryable. The user can review the transcript before structuring, and the structured note before pushing.

### Anti-Pattern 3: Assuming webm Format on All Mobile Devices

**What:** Hardcoding `mimeType: 'audio/webm'` in MediaRecorder configuration without feature detection.

**Why bad:** iPhone Safari (iOS 14.3+) does not support `audio/webm`. It requires `audio/mp4`. Hardcoding webm will silently produce a recording that Whisper cannot parse on iOS.

**Instead:** Use `MediaRecorder.isTypeSupported()` to detect the best available format before instantiating MediaRecorder. See Pattern 1.

**Source:** Community-confirmed iOS Safari limitation; WebKit blog on MediaRecorder API confirms format differences. OpenAI community thread explicitly documents this Whisper failure mode. (MEDIUM confidence — multiple sources, no official Apple statement)

### Anti-Pattern 4: Not Caching CRM Pipeline Stages

**What:** Fetching Salesforce/HubSpot pipeline stages from the CRM API on every note push or every page load.

**Why bad:** Unnecessary API calls burn CRM rate limits. Salesforce API daily limits are per-org. Pipeline stages rarely change.

**Instead:** Store stages in Supabase `deal_stage_cache` with a `fetched_at` timestamp. Refresh on demand (user can force refresh) or after 24 hours. Load from cache for the note-structuring and review UI.

### Anti-Pattern 5: Using Anon Key for Token Table Access

**What:** Using the Supabase anon key in Route Handlers to read `crm_connections`.

**Why bad:** The anon key's RLS policies run in the context of the authenticated user. While RLS can protect tokens, it adds complexity and risk. The service role key bypasses RLS entirely and is the correct tool for server-side token management.

**Instead:** Use `SUPABASE_SERVICE_KEY` (never exposed to browser) only in Route Handlers when accessing `crm_connections`. The anon key is fine for the `notes` table with RLS.

---

## Suggested Build Order

The pipeline has strict dependencies — each component builds on the previous.

```
Phase 1: Auth Foundation
  Supabase Auth + Next.js session middleware
  Reason: Every API route needs to authenticate the caller.
          Without auth, tokens cannot be user-scoped.

Phase 2: Audio Recording Layer
  MediaRecorder component with format detection
  Upload to /api/transcribe → Whisper
  Reason: Core value proposition. Proves the mobile audio pipeline works
          before building any downstream components.

Phase 3: Structuring Pipeline
  /api/structure → Claude with Zod schema
  Supabase notes table
  Reason: Requires transcript (Phase 2). Defines the CRMNote type
          that all downstream CRM pushes depend on.

Phase 4: CRM OAuth Connections
  Salesforce OAuth flow (/api/auth/salesforce/*)
  HubSpot OAuth flow (/api/auth/hubspot/*)
  Supabase crm_connections table
  Reason: Must be complete before any CRM push. OAuth flows can
          be built and tested with mock push calls.

Phase 5: CRM Push
  /api/crm/push with token refresh logic
  Salesforce REST API calls
  HubSpot REST API calls
  Reason: Requires Phase 3 (structured note schema) and Phase 4 (tokens).

Phase 6: Deal Stage Sync
  /api/crm/stages with Supabase cache
  Reason: Enhancement to Phase 5. Allows user to pick correct pipeline
          stage during note review rather than Claude guessing.
```

**Dependency graph:**
```
Auth → Audio Recording → Structuring → CRM OAuth → CRM Push → Stage Sync
```

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Whisper latency | Direct API call fine | Direct API call fine | Consider batching or streaming STT |
| Claude API calls | Direct API call fine | May need request queuing | Worker queue pattern |
| CRM token refresh | On-demand refresh per request | On-demand fine | Background refresh worker recommended |
| Supabase notes table | No index needed beyond user_id | Index on (user_id, created_at) | Partitioning by created_at |
| Next.js serverless timeouts | Vercel Hobby 10s may be tight for Whisper | Upgrade to Pro (60s) | Edge + background job split |
| Audio file size | Direct in-memory fine | Consider streaming upload | Presigned URL to S3, then server fetches |

**Immediate concern:** Vercel Hobby plan has a 10-second timeout on serverless functions. A 2-minute audio file through Whisper typically takes 10-30 seconds. Set `export const maxDuration = 60` in the transcribe route handler (requires Vercel Pro or self-hosted).

---

## Sources

| Source | Confidence | URL |
|--------|-----------|-----|
| Next.js App Router Route Handlers (official, v16.1.6, 2026-02-16) | HIGH | https://nextjs.org/docs/app/api-reference/file-conventions/route |
| Next.js proxyClientMaxBodySize config (official, v16.1.6, 2026-02-16) | HIGH | https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize |
| Anthropic Claude Structured Outputs (official, fetched 2026-02-18) | HIGH | https://platform.claude.com/docs/en/docs/build-with-claude/structured-outputs |
| MDN MediaStream Recording API | HIGH | https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API |
| HubSpot OAuth Quickstart Guide (official) | HIGH | https://developers.hubspot.com/docs/api/oauth-quickstart-guide |
| HubSpot token lifespan: 30 minutes (expires_in: 1800) | HIGH | Confirmed in official HubSpot OAuth docs |
| Supabase: provider tokens not stored by default, manage manually | HIGH | https://github.com/orgs/supabase/discussions/22578 |
| Salesforce OAuth Web Server Flow | MEDIUM | https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm |
| iOS Safari audio/mp4 requirement for MediaRecorder | MEDIUM | https://webkit.org/blog/11353/mediarecorder-api/ + community confirmation |
| OpenAI community: MediaRecorder + Whisper mobile failures | MEDIUM | https://community.openai.com/t/mediarecorder-api-w-whisper-not-working-on-mobile-browsers/866019 |
| Voice-to-CRM cascading pipeline pattern | MEDIUM | https://smallest.ai/blog/voice-crm-revolution-ai-agents |
