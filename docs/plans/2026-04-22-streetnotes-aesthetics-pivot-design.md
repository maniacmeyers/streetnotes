# StreetNotes Aesthetics Pivot — Landing + App Design

**Date:** 2026-04-22
**Context:** `_brain/CONTEXT.md` — aesthetics beachhead vertical, 24-month build-to-sell, brand-deals-first revenue model. See `.planning/research/aesthetics-vertical-analysis.md` for vertical rationale.

---

## Decisions locked

1. **Audience:** dual (rep-first hero + visible brand-leader track, progressive disclosure).
2. **Vertical commitment:** full lockdown. Every headline, section, and proof point on `streetnotes.ai` is aesthetic-specific. Vbrick tenant at `vbrick.streetnotes.ai` stays horizontal.
3. **Hero angle:** Collier/Schwartz pain-memory angle — *"You cover 47 accounts. You remember 12."*
4. **Scope this session:** landing rewrite + minimum `/debrief` coherence + `/for-leaders` page. Everything else planned, not executed.
5. **Rule: no placeholders.** If a claim needs an asterisk, it doesn't ship. Kills "50 reps in beta" counters, mockup screenshots, fake case studies.

---

## Landing page — section map

Current site has 9 scroll sections. New map:

| # | Section | Action |
|---|---|---|
| 1 | Hero | Rewrite (new angle) |
| 2 | Problem: Old vs Better Way | Reframe with aesthetic pain |
| 3 | How It Works | Reframe examples (injector/unit/tox) |
| 4 | Competitive Intelligence | Keep + upgrade (aesthetic brand taxonomy) |
| 5 | Story Vault | Reframe as Injector Switch Stories |
| 6 | Free Tool CTA | Keep + recopy |
| 7 | Benefits | Rewrite all four cards |
| 8 | Brand Leader module | NEW — inline, not nav |
| 9 | Credibility | Upgrade (founder card + insider-language proof) |
| 10 | Final CTA | Dual: rep beta + Talk to Michael |

---

## Section copy

### Hero

Eyebrow: `FOR AESTHETIC REPS WHO CARRY THE BAG`

Headline:
> **You cover 47 accounts.**
> **You remember 12.**

"12" gets the volt-green glow (same visual as current "parking lot").

Sub:
> Every injector preference, every tox-to-filler ratio, every practice manager's kid's name — gone the minute you leave the parking lot. StreetNotes remembers so you can close.

Primary CTA card (glass-volt, existing pattern):
> **Free — no signup required**
> **Try it after your next injector call.**
> 60 seconds of voice → your CRM fields, a practice-specific next step, and the competitor objection you should expect at your next stop.
> [Start debrief →]

Secondary CTA (waitlist):
> Building with aesthetic reps before GA. Join the beta.

No numbers until they're real.

### Problem (Old vs Better)

Two-column frame stays. Copy:

**THE OLD WAY**
> Dr. Smith asked about Daxxify duration. You said you'd follow up. That was Tuesday.
> It's Thursday. You're in Dr. Patel's parking lot. You can't remember if Smith runs 50-unit or 100-unit tox patients. Your CRM says "tox user." That's it.
> You send a generic follow-up. Smith stays on Botox.

**THE STREETNOTES WAY**
> 60 seconds after Dr. Smith's visit, you said it out loud. Her patients run 40–60 units. She's price-sensitive on duration. Her front-desk manager is the gatekeeper, not the MA.
> Thursday, StreetNotes pulls all of it into your Patel brief before you walk in — plus the Daxxify vs Botox duration objection Smith raised.
> You show up ready. You close both.

### How It Works

Keep three-step structure. Rewrite examples so each step shows aesthetic rep reality (unit counts, modality, injector preferences).

### Competitive Intelligence

Keep the heatmap visual. One copy line above:
> Every competitor mention across your territory — Botox, Dysport, Xeomin, Jeuveau, Daxxify. Juvéderm, Restylane, RHA, Versa. Sculptra, Radiesse. Sentiment, pattern, pricing signals. Updated as your team talks.

Swap any demo data to aesthetic brand names.

### Story Vault — reframe as Injector Switch Stories

Frame as: library of repeatable, injector-usable narratives reps adapt for their own practices. Example content in-tool can include illustrative switch stories (not landing-page testimonials).

### Benefits (4 cards)

1. **Every injector, remembered.** Preferences, patient volume, tox-to-filler ratio, objection history. Across every practice on your territory.
2. **Pre-visit briefs that actually fit.** Walk into Dr. Patel's office with Dr. Smith's objection already answered. Daxxify vs Botox. RHA vs Juvéderm. The specific one you need.
3. **Territory-wide competitor intelligence.** Every competitor mention your team captures becomes territory-wide intelligence. Sentiment, pricing signals, objection patterns — surfaced as you and your team talk, not when someone has time to type it up.
4. **CRM that doesn't lie to your VP.** Voice in → fields out. No end-of-quarter data cleanup. Your pipeline is actually accurate.

### Brand Leader module (inline, between Benefits and Credibility)

> **For VPs of Sales at injectable and device brands.**
> 3,000 reps. 47 accounts each. You have no visibility into what happens between dial-in meetings. Neither do they.
> StreetNotes gives you the field intelligence layer Veeva can't — purpose-built for aesthetic reps, deployed at 150–200 seats.
> [Talk to Michael →]

Not a nav item. Inline only, so rep-first hero stays clean.

### Credibility

Two blocks only (no social-proof placeholder):

**Founder card**
> *Michael Hervis. Ex-VP at Symplast. Spent 4 years building software for aesthetic practices. Watched reps get handed pharma CRMs that didn't fit the work. So I built what you actually need.*

**Insider-language proof grid — "StreetNotes knows…"**
- 40 units vs 100 units is a different patient conversation
- Daxxify duration objection ≠ Xeomin objection
- "Filler fatigue" is a real buying signal
- Practice manager ≠ MA ≠ injector — different asks, different timing
- RHA, Restylane, Juvéderm, Versa are not the same conversation
- Aesthetic Next, AMWC, Vegas Cosmetic — buying windows, not just conferences

### Final CTA

> **Reps:** [Join the beta →] (waitlist form, existing behavior)
> **Sales leaders:** [Talk to Michael →] (Cal.com or similar)

---

## `/debrief` coherence pass

Two file changes, both contained.

### Segment selector

Replace generic segments (Discovery / Demo / Closing) with six aesthetic call types:

1. Injector check-in (routine visit, regular account)
2. New practice intro (first visit / prospecting)
3. Practice manager / buyer meeting (ordering-side, not clinical)
4. Device demo or injector training
5. Lunch & learn
6. Conference / event booth

### Structure prompt (`lib/debrief/prompts.ts`)

Additive changes. No schema breakage.

- **Aesthetic vocabulary:** injector, MA, practice manager, medical director; units (20/40/50/100), syringes, vials; modality (neurotox / HA filler / biostimulator / energy device).
- **Competitor taxonomy (named, no generalizations):**
  - Neurotox: Botox, Dysport, Xeomin, Jeuveau, Daxxify
  - HA filler: Juvéderm, Restylane, RHA, Versa, Belotero
  - Biostimulator: Sculptra, Radiesse
  - Energy device: Morpheus8, BBL, Sofwave, Ultherapy, CoolSculpting, EmSculpt Neo
- **Extraction hints:** unit counts, syringe counts, switching stories, objection specifics (duration, onset, pricing, patient comfort).

Existing Zod schema unchanged this pass. Schema evolution is plan-only.

---

## `/for-leaders` page

Single long-scroll page. Ships this session.

1. **Hero:** *"The aesthetic sales team you can't see — until now."*
2. **The gap:** Veeva is pharma. Salesforce is horizontal. Symplast/PatientNow/Nextech serve the practice. No one built for the rep.
3. **How it deploys at brand level:** 150–200 seats, Michael-led rollout, 60-day pilot.
4. **What a VP sees Monday morning:** text description of the data model — rep → territory → account → injector; weekly rollup; objection frequency by region; competitor mention trend. No mockup.
5. **Pilot structure:** 25 seats, 60 days, success criteria defined upfront.
6. **Pricing:** $179/seat at 10+. Manager seat free. Annual.
7. **Michael, in depth:** longer founder story. Symplast context.
8. **FAQ:** data security; Veeva comparison; CRM integrations (Salesforce + HubSpot live, others on request); opt-in recording legal.
9. **CTA (repeated twice, top and bottom):** Talk to Michael.

---

## App reorientation — plan only

Not coded this session. Documented for next phase. Ship order:

### 1. CI dictionary (`lib/ci/`)

First because lowest blast radius and biggest signal impact. Replace generic competitor taxonomy with aesthetic brand list (same as `/debrief` above). Category taxonomy: Neurotox / HA filler / Biostimulator / Energy device / Practice management. Sentiment dictionary tuned for aesthetic objections.

### 2. Authenticated app prompts (`lib/notes/prompts.ts`, `lib/notes/input-schema.ts`)

Same vocabulary + taxonomy as `/debrief`, applied to signed-in pipeline. Larger blast radius — existing users have live notes. Needs schema-compatible evolution.

### 3. User memory (`lib/user-memory/`)

Retrain entity aggregation to recognize injectors as first-class entities. Modality-level rollups per account. 5-min cache survives; scoring changes.

### 4. Schema migration (`014_aesthetic_entities.sql`)

Nullable fields on notes: `injector_name`, `modality`, `unit_count`, `competitor_brand`, `switch_story_id`. Backfill script for existing notes. No breakage.

### 5. Stage mapper (`lib/crm/push/stage-mapper.ts`)

Aesthetic sales cycle stages: Not buying / Evaluating / Trialing / Low volume / Growing / Loyal / At risk. Fuzzy-match existing Salesforce/HubSpot aesthetic-brand pipelines.

### 6. Vbrick aesthetic tenant (Phase 2 decision)

If a brand pilot requests a branded practice/sparring surface, Vbrick tenant pattern supports it. Not scoped here.

### Feature flag

All app-side changes behind `ENABLE_AESTHETIC_EXTRACTION`. Fallback to current behavior if flag off. Existing users protected.

---

## What we're NOT doing

- Changing the Zod schema on `/debrief` this session
- Touching authenticated `/api/structure` prompts this session
- Adding a nav item for the brand-leader track (stays inline only)
- Any placeholder content, mockup screenshots, or invented case studies
- Shipping `/for-leaders` with a pilot customer list until one exists
- Migrating Vbrick tenant to aesthetics

---

## Success criteria (landing ships when)

- Every landing-page claim is defensible without an asterisk
- `/debrief` segment selector shows six aesthetic call types
- `/debrief` extraction recognizes named aesthetic brands and unit counts
- `/for-leaders` page live with Cal.com CTA wired
- No remaining generic "reps who'd rather sell than type" copy anywhere on `streetnotes.ai`
- Existing `/api/notes` and authenticated app behavior unchanged
