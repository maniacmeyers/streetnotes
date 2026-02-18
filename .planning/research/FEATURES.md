# Feature Landscape: Voice-to-CRM / Field Sales Note Apps

**Domain:** Mobile-first voice-to-CRM for field sales (post-meeting note capture)
**Project:** StreetNotes.ai
**Researched:** 2026-02-18
**Overall confidence:** MEDIUM — competitive feature sets verified via official product pages and multiple review sources; UX patterns verified via user reviews and domain research

---

## Context: How StreetNotes Differs from the Competitive Landscape

Most competitors (Gong, Chorus, Otter.ai, Fireflies, Avoma) are **live-call recorders** that join video meetings as a bot. StreetNotes targets the **post-meeting, in-person gap**: the 30 seconds the field rep has while walking back to their car after a face-to-face customer visit.

This is a genuinely underserved use case:
- "Only 10% of in-person sales data is captured, compared to over 90% of inside sales data." (LeadBeam research, MEDIUM confidence)
- Virtual-first tools cannot join in-person meetings.
- Competitors that mention "in-person" typically mean audio recording during a meeting — not the post-meeting voice-note workflow.

The closest competitors in the actual niche are: **Hey DAN** (human-assisted voice-to-CRM), **snapAddy VisitReport** (field sales visit reports), and **leadbeam.ai** (field sales AI). General AI notetakers are not direct competitors but set UX expectations.

---

## Table Stakes

Features users expect. Missing = product feels broken or users churn.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Voice recording (mobile) | Core input method; reps won't type | Low | Browser MediaRecorder API works; native app-quality UX needed |
| Audio transcription | Without transcript, no AI structuring is possible | Low-Med | Whisper is the standard; latency matters (< 30s expectation) |
| AI-generated summary | Users expect a "what was discussed" paragraph, not raw transcript | Med | Claude or GPT-4 class model required; prompt engineering is the work |
| Contact name + company extraction | Reps name people in voice notes; AI must catch these | Med | NER + CRM context lookup; errors here destroy trust |
| Next steps / action items extraction | Every sales tool surfaces this; users feel blind without it | Med | Must be discrete, numbered list — not buried in summary |
| Deal stage update | Core reason reps use CRM at all; must be updateable | Med | Requires fetching user's actual deal stages from CRM via OAuth |
| Push to Salesforce OR HubSpot | These are the two dominant sales CRMs; supporting only one halves addressable market | High | Requires maintaining two OAuth integrations + field mappings |
| OAuth CRM connection (user-initiated) | Users won't trust API key entry; OAuth is expected | Med | Salesforce requires Connected App with `api` + `refresh_token` scopes; HubSpot requires `crm.objects.*` scopes |
| Editable review before CRM push | Reps need to correct AI errors before they pollute their CRM | Med | Non-negotiable: automated CRM writes without review destroy data trust |
| Mobile-first UI | Field reps are on phones, often one-handed | Med | Not just responsive — must be thumb-friendly, large tap targets, minimal typing |
| Basic auth (login/logout) | Obvious; can't ship without it | Low | Can be email+password or social login |

**Confidence: MEDIUM-HIGH.** Core features verified across Hey DAN, snapAddy, Otter.ai, Avoma, and field sales research. Editable review is specifically called out as critical in voice-to-CRM literature (280% accuracy improvement from post-meeting capture; users need correction UX).

---

## Expected-But-Not-Obvious Table Stakes

Features that aren't immediately obvious but become blocking issues quickly after launch.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Configurable deal stages (pulled from CRM) | Reps use custom stages; hardcoded stages break for 80% of accounts | Med | Must fetch pipeline stages via CRM API at connect time; store per-user |
| Create new contact in CRM | Rep meets someone new; if app can't create them, major friction | Med | Requires `contacts.write` scope; needs dupe-check logic |
| Create new opportunity / deal | Without this, reps must open CRM to create deal, defeating purpose | Med | Requires `deals.write` scope; need to associate with contact/company |
| Update existing deal | Most post-meeting notes update existing deals, not create new ones | Med | Requires searching CRM by contact/company name, then patching deal |
| Follow-up task / activity scheduling | "Follow up with Anna on Friday" is bread-and-butter for field reps | Med | Requires creating Tasks or Activities in CRM, date parsing from speech |
| Offline capability (partial) | Field reps lose signal; app must not lose recordings | Med | Record locally, queue upload when connection returns |
| Error state handling | CRM push fails, Whisper fails — reps need clear feedback | Med | Silent failures will destroy trust; must show status clearly |

**Confidence: MEDIUM.** Derived from Hey DAN feature list, snapAddy features, and field sales pain-point research. CRM field variety requirement is verified — MEDDIC, SPICED, custom fields are standard in Avoma and comparable tools.

---

## Differentiators

Features that set StreetNotes apart. Users don't expect these, but they create retention and word-of-mouth.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Post-meeting mode (optimized UX) | No competitor has a UX built specifically for the "walking to car" moment; 30-second voice note workflow | Low-Med | Minimal tap-to-record, auto-starts, auto-stops on silence — not a general recorder |
| AI field mapping with confidence indicators | Show rep which fields the AI is confident in vs guessing; builds trust faster | Med | Flag low-confidence extractions (e.g., "I think the contact was Maria — correct?") |
| Meeting context from CRM pre-loaded | Pull existing deal/contact info before recording; AI knows context before transcription | Med | "Who did you just meet?" disambiguated by existing CRM data |
| Speed-to-complete metric | Show "CRM updated in 45 seconds" — makes the value visceral | Low | Pure UX, no backend work; just timestamps |
| Smart dupe prevention | Before creating contact/deal, check if they exist; suggest merge | Med | Avoma and snapAddy do this; reps hate duplicates in CRM |
| Bulk review queue | Process multiple meetings at once at end of day | Med | Some reps do 6-10 visits; single-at-a-time flow creates friction |
| Audio playback in review | Let rep listen to specific sections while editing | Low-Med | Granola-style audio-only approach; useful when AI made a mistake |
| Multi-language transcription | Field reps in non-English markets | Med | Whisper handles 50+ languages; the prompt/structuring must adapt |
| Push notifications for unreviewed notes | Gentle nudge if rep hasn't reviewed within X hours | Low | Simple notification; high retention value |
| Team admin view | Manager sees reps' activity; drives adoption in enterprise | High | Separate product surface; out of MVP scope but key for enterprise sales |

**Confidence: MEDIUM.** Post-meeting UX differentiation is an inference from the gap in competitor positioning (verified: Otter.ai, Gong, Avoma all focus on live call recording). AI confidence indicators are a UX pattern from research into user trust with AI-generated content (LOW-MEDIUM confidence).

---

## Anti-Features

Features to explicitly NOT build. These are traps that kill focus, add complexity, and rarely deliver ROI.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Live call recording / bot joining | This is Gong/Chorus/Otter's core product; can't out-resource them; wrong use case for field sales | Double down on post-meeting, in-person workflow |
| Real-time transcription during meetings | Reps are in-person; phone in pocket; this creates no value and massive complexity | Transcribe after the meeting, asynchronously |
| Sales coaching / conversation analytics | Requires large corpus of recordings, team-level data, and is a separate product | Let Gong own this; StreetNotes owns capture |
| General AI meeting notes (non-sales) | Dilutes positioning; makes product worse for the target user | Stay CRM-field-specific; don't try to be Notion AI |
| Email drafting | Sounds useful; in practice, reps use their existing email client; low adoption | Surface next steps clearly; let rep write their own email |
| Zapier / webhook marketplace | Engineering distraction at MVP; reps don't configure these | Ship direct CRM integrations with opinionated field mapping |
| Custom CRM beyond Salesforce + HubSpot | Long tail; each CRM is months of work | Get two right first; add Pipedrive/Dynamics as expansion |
| Desktop app | Field reps are on phones; desktop adds maintenance burden | Progressive Web App (PWA) is sufficient for desktop fallback |
| Full-text search of past notes | Useful feature but low urgency; reps find past notes in their CRM | Use CRM as the record; don't build a parallel notes database |
| Note sharing / collaboration | Enterprise feature that requires team management surface | Ship single-user first; collaboration = v2 |

**Confidence: MEDIUM-HIGH.** Anti-features derived from competitive analysis (Gong/Chorus pricing at $1,200-1,400/seat/year shows the investment required) and field sales researcher findings about where tool adoption breaks down.

---

## Feature Dependencies

Dependencies determine build order. Features lower in the graph must ship before features above them.

```
Auth (login / session management)
  └── CRM OAuth connection (Salesforce or HubSpot)
        ├── Fetch user's deal stages & pipelines → configurable stage dropdown
        ├── Fetch existing contacts/companies → contact lookup in review
        │     └── Dupe prevention on create
        └── CRM push (write operations)
              ├── Create contact
              ├── Create/update opportunity/deal
              ├── Schedule follow-up task
              └── Update deal stage

Voice recording (browser MediaRecorder)
  └── Whisper transcription (async, server-side)
        └── Claude AI structuring (contact, company, summary, next steps, deal stage)
              └── Review UI (editable fields, accept/reject each field)
                    └── CRM push (triggered by user after review)
                          └── Confirmation + success state
```

**Critical path:** Auth → CRM OAuth → Voice → Transcription → AI Structuring → Review → Push.
Every other feature is an enhancement on top of this loop.

**Offline dependency:** Voice recording must work without network. Upload + transcription require network. Design for: record always, upload when connected.

---

## MVP Recommendation

Given the StreetNotes.ai project context (MVP scope already defined), this analysis confirms and sharpens the MVP feature set.

**Must ship in MVP (confirmed table stakes):**
1. Auth (email/password or OAuth social)
2. CRM OAuth connection — Salesforce + HubSpot
3. Fetch and store user's deal stages from CRM
4. Voice recording — mobile browser (MediaRecorder)
5. Whisper transcription (async, server-side)
6. Claude AI structuring → contact, company, summary, next steps, deal stage
7. Review UI — all fields editable before push
8. CRM push — create contact, create/update deal, schedule follow-up task, update deal stage
9. Offline recording queue (basic — record locally, upload on reconnect)
10. Clear error states for transcription/push failures

**Defer to post-MVP (avoid scope creep):**
- Multi-language transcription: Whisper supports it but prompts need tuning; ship English first
- Bulk review queue: useful but adds complexity; single-note flow first
- Audio playback in review: nice-to-have; adds storage complexity
- Push notifications: needs native-app or PWA install; defer to beta
- Smart dupe prevention: add after seeing real CRM write patterns
- Team admin view: requires separate product surface; enterprise v2
- Third CRM (Pipedrive, Dynamics): expansion round

**One differentiator to ship in MVP:**
- Deal stages pulled from user's actual CRM (not hardcoded) — this alone closes the "this doesn't match my CRM" objection that kills adoption for competitors.

---

## Competitive Snapshot (Feature Comparison)

| Feature | StreetNotes MVP | Otter.ai | Gong | Fireflies | Hey DAN | snapAddy |
|---------|----------------|----------|------|-----------|---------|---------|
| Post-meeting voice note (primary UX) | Yes | Partial | No | No | Yes | Yes |
| In-person meeting support | Yes | Partial | No | No | Yes | Yes |
| Live call recording | No (intentional) | Yes | Yes | Yes | No | No |
| Whisper/ASR transcription | Yes | Proprietary | Proprietary | Proprietary | Human+AI | Voice AI |
| AI field structuring | Yes (Claude) | Yes | Yes | Yes | Human QA | Questionnaire |
| CRM push (Salesforce) | Yes | Yes | Yes | Yes | Yes | Yes |
| CRM push (HubSpot) | Yes | Yes | Yes | Yes | Yes | Yes |
| User-configurable deal stages | Yes | Unknown | Yes | Unknown | Unknown | No |
| Editable review before push | Yes | No (auto-push) | No | No | No (human QA) | Yes |
| Mobile-first | Yes | Partial | No | No | Yes | Yes |
| Price point | TBD | $17+/mo | $1,400+/seat/yr | $10+/mo | Unknown | Unknown |
| Target user | Field sales (in-person) | Remote sales | Enterprise sales teams | All meetings | Field sales | Trade shows / field |

**Confidence: MEDIUM.** Gong/Chorus/Otter pricing verified via multiple review sources. Feature presence for competitors is MEDIUM confidence — based on official pages and review sites, not exhaustive QA.

---

## Sources

- [Hey DAN Voice-to-CRM — What Is Voice to CRM](https://heydan.ai/what-is-voice-to-crm) — MEDIUM confidence (official product page)
- [snapAddy VisitReport Features](https://www.snapaddy.com/en/snapaddy-visitreport/features.html) — MEDIUM confidence (official product page)
- [Avoma AI Meeting Assistant](https://www.avoma.com/ai-meeting-assistant) — MEDIUM confidence (official product page)
- [Otter.ai Sales Agent](https://otter.ai/sales-agent) — MEDIUM confidence (official product page)
- [LeadBeam — Common Challenges for Outside Sales Reps](https://www.leadbeam.ai/blog/common-challenges-for-outside-sales-reps-and-how-ai-can-help) — LOW-MEDIUM confidence (vendor blog with cited statistics)
- [LeadBeam — What is Voice to CRM](https://www.leadbeam.ai/blog/what-is-voice-to-crm) — LOW-MEDIUM confidence (vendor blog)
- [Arrows.to — Side-by-Side Comparison of 22 AI Notetakers for Sales](https://arrows.to/guide/top-ai-notetakers/a-side-by-side-comparison-of-22-ai-notetakers-for-sales) — MEDIUM confidence (multi-tool review)
- [MaxIQ — Best AI Note Takers for Sales Calls 2026](https://www.getmaxiq.com/blog/best-ai-note-takers-for-sales) — MEDIUM confidence (multi-tool review)
- [Gong vs Chorus vs Fireflies pricing and features (via Fireflies blog)](https://fireflies.ai/blog/gong-vs-chorus-ai) — MEDIUM confidence (competitor's blog; verified against other sources)
- [Salesforce OAuth Scopes — Developer Docs](https://developer.salesforce.com/docs/platform/mobile-sdk/guide/oauth-scope-parameter-values.html) — HIGH confidence (official Salesforce docs)
- [HubSpot OAuth Scopes — Developer Docs](https://developers.hubspot.com/docs/apps/legacy-apps/authentication/scopes) — HIGH confidence (official HubSpot docs)
- [Acto — Voice to CRM overview](https://www.heyacto.com/en/blog/voice-to-crm) — LOW-MEDIUM confidence (vendor blog)
