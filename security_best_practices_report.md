# Security Best Practices Report

## Executive Summary

This full-repo security review found **2 Critical**, **3 High**, **2 Medium**, and **1 Low** findings.

The highest-risk issues are:

1. A public API route that returns a raw provider API key.
2. Multiple Supabase tables configured with `USING (true)` / `WITH CHECK (true)` RLS policies, which allows anonymous read/write access when used with the public publishable key.

These two together create meaningful data exposure and integrity risk, especially across debrief, CI, and story surfaces.

---

## Critical Findings

### SEC-001 (Critical): Public API key exposure in browser token endpoint

- **Location:** `app/api/vbrick/coaching/token/route.ts`
- **Evidence:**
  - `13`: `const key = process.env.DEEPGRAM_API_KEY`
  - `21`: `return NextResponse.json({ key })`
- **Impact:** Any unauthenticated caller can retrieve the raw `DEEPGRAM_API_KEY` and use it outside your app, causing quota abuse, data access, and billing risk.
- **Fix:**
  - Require authenticated user checks before issuing any token.
  - Replace raw key return with short-lived scoped tokens from provider key-management APIs.
  - Add rate limiting per user/IP.
- **Mitigation (if immediate fix is hard):**
  - Rotate `DEEPGRAM_API_KEY` now.
  - Restrict provider key scope and usage limits.

### SEC-002 (Critical): Anonymous full read/write RLS policies on core data tables

- **Locations (examples):**
  - `supabase/migrations/003_debrief_sessions.sql`
    - `23`: `FOR SELECT USING (true);`
    - `27`: `FOR UPDATE USING (true);`
  - `supabase/migrations/005_ci_dashboard.sql`
    - `57`: `CREATE POLICY "Allow all ci_mentions" ... USING (true) WITH CHECK (true);`
    - `60`: `CREATE POLICY "Allow all ci_aliases" ... USING (true) WITH CHECK (true);`
    - `63`: `CREATE POLICY "Allow all ci_team_config" ... USING (true) WITH CHECK (true);`
  - `supabase/migrations/006_story_vault.sql`
    - `89`: `CREATE POLICY "Allow all story_drafts" ... USING (true) WITH CHECK (true);`
    - `95`: `CREATE POLICY "Allow all story_vault_entries" ... USING (true) WITH CHECK (true);`
  - `supabase/migrations/012_story_challenges.sql`
    - `17`: `CREATE POLICY "Allow all story_challenges" ... USING (true) WITH CHECK (true);`
- **Impact:** Anonymous clients can read/modify data directly through Supabase APIs using the public key, enabling data exfiltration and tampering.
- **Fix:**
  - Replace permissive policies with ownership- or role-based checks.
  - For public flows, use narrowly scoped insert-only policies with strict `WITH CHECK` constraints.
  - Move privileged reads/writes behind server routes with explicit authz checks.
- **Mitigation:**
  - Immediately audit exposed rows and add monitoring for unusual anonymous traffic.

---

## High Findings

### SEC-003 (High): Unauthenticated email-based data access to story vault

- **Locations:**
  - `app/api/vbrick/stories/vault/route.ts`
    - `9`: `const email = searchParams.get('email')`
    - `17`: `.eq('bdr_email', email)`
  - `app/api/vbrick/stories/vault/team/route.ts`
    - `59`: `const fallbackEmail = searchParams.get('email')`
    - `60`: `const callerEmail = user?.email || fallbackEmail`
    - `76`: `.ilike('bdr_email', \`%@${domain}\`)`
- **Impact:** Any caller can query stories by arbitrary email/domain, exposing internal sales content and metadata.
- **Fix:**
  - Require authenticated user for these endpoints.
  - Derive query identity from session user only, never querystring fallback.
  - Add tenant/team membership checks server-side.
- **False-positive note:** If this is intentionally public demo behavior, isolate it to a separate demo dataset and host.

### SEC-004 (High): Unauthenticated mutation endpoint for CI mentions

- **Location:** `app/api/ci/servicenow/route.ts`
- **Evidence:**
  - `47`: `export async function PATCH(request: Request)`
  - `48`: reads `{ mentionId, acknowledgedBy }` directly from body
  - `56-62`: updates `ci_mentions` by `id` without auth checks
- **Impact:** Anyone can mark mentions acknowledged and alter audit-relevant metadata.
- **Fix:**
  - Require auth and enforce ownership/team authorization before updates.
  - Add validation for allowed `acknowledgedBy` source (server-trusted identity only).

### SEC-005 (High): Unsupported/outdated Next.js major line

- **Location:** `package.json`
- **Evidence:**
  - `19`: `"next": "14.2.35"`
- **Impact:** Older framework versions can miss current security patches and may remain exposed to known vulnerabilities.
- **Fix:**
  - Plan upgrade to a currently supported Next.js release line and apply latest patch.
  - Run security regression checks after upgrade.
- **False-positive note:** Exact exploitability depends on deployment/runtime and published advisories for this version.

---

## Medium Findings

### SEC-006 (Medium): Untrusted forwarded host used in auth redirect construction

- **Location:** `app/auth/callback/route.ts`
- **Evidence:**
  - `15`: `const forwardedHost = request.headers.get('x-forwarded-host')`
  - `21`: `` `https://${forwardedHost}${next}` ``
- **Impact:** If upstream host headers are spoofable/misconfigured, callback redirects can be poisoned to attacker-controlled hosts.
- **Fix:**
  - Use a canonical allowlisted app origin from environment (for example `APP_ORIGIN`).
  - Do not build redirects directly from `x-forwarded-host` without strict validation.

### SEC-007 (Medium): Public waitlist endpoint lacks abuse controls

- **Location:** `app/api/waitlist/route.ts`
- **Evidence:**
  - No rate limiting or bot controls in `POST`.
  - `25-28`: always sends notification email.
- **Impact:** Endpoint can be abused for spam/notification flooding and operational noise.
- **Fix:**
  - Add IP/email rate limiting and bot friction (e.g., challenge/honeypot).
  - Add basic email format validation and cooldown windows.

---

## Low Findings

### SEC-008 (Low): Missing explicit security headers/CSP configuration in app config

- **Location:** `next.config.mjs`
- **Evidence:**
  - `2`: `const nextConfig = {};`
- **Impact:** No app-level evidence of CSP/security-header baseline; this increases XSS/clickjacking exposure if not enforced at edge/platform.
- **Fix:**
  - Add explicit baseline headers (CSP, `X-Content-Type-Options`, clickjacking protection, referrer policy) in app or edge config.
- **False-positive note:** Headers may be set externally (CDN/WAF/platform); verify runtime responses.

---

## Priority Fix Order (Recommended)

1. **SEC-001** rotate and stop exposing provider key.
2. **SEC-002** replace permissive RLS policies on sensitive tables.
3. **SEC-003 / SEC-004** enforce authz on story/CI endpoints.
4. **SEC-006** remove unvalidated host-based redirect construction.
5. **SEC-007 / SEC-008 / SEC-005** hardening and platform hygiene.

---

## Scope Notes

- Review covered app/API routes, auth flows, middleware, Supabase migrations/policies, and framework config.
- Findings are evidence-based from repository code and migrations only; runtime infrastructure controls (WAF/CDN/header injection) were not directly inspected.
