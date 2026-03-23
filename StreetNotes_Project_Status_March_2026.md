# StreetNotes.ai — Project Status & Roadmap

**ForgeTime.ai Venture Studio**
Jeff Meyers & Michael Hervis
March 11, 2026

---

## The One-Liner

Voice-to-CRM for sales reps who'd rather sell than type. Press the mic. Talk. Your CRM updates itself.

---

## Scorecard

| Metric | Score | Notes |
|--------|-------|-------|
| Opportunity | 9/10 | $48.4B AI-CRM market by 2033 |
| Pain Severity | 9/10 | Reps waste 6-8 hrs/week on CRM entry |
| Builder Confidence | 8/10 | Domain expertise + proven tech stack |
| Revenue Potential | $$$ | $1M-$10M ARR — $49/user/mo wedge, $299/team expansion |
| Timing | Perfect | Voice AI mature + CRM frustration at peak |

---

## What's Done

### Phase 1 — Foundation COMPLETE

- Offer Definition: Transformation statement, ICP, pricing ($49/user/mo), competitive positioning, lead magnet seed, GTM motion
- Brand DNA: Voice profile — direct, battle-tested, anti-corporate. "VP of Sales in a hoodie." Full vocabulary rules, tone calibration, rhythm guide
- ICP Document: Primary: mid-market AEs/SDRs, 6-10 calls/day, Salesforce/HubSpot. Secondary: Sales Managers, VPs. Bottom-up buying motion

### Phase 2 — Build the Funnel (IN PROGRESS)

COMPLETED:
- Landing Page Copy: 7-section waitlist page — Hero, Problem, Process Blueprint, Benefits, Credibility, CTA, Footer. On-brand voice
- Landing Page Build: Neo-Brutalist design (Next.js 14, Tailwind, Motion.js). Volt accent, Ranchers display font, 4px/8px borders, mobile-first
- Waitlist Form to Supabase: Email capture to PostgreSQL storage. Duplicate handling. Clean UX with success/error states
- Email Notifications via Resend: Every signup emails jeff@forgetime.ai instantly. Verified domain (streetnotes.ai)
- Vercel Deployment: Production deploy, clean build. All env vars configured (Supabase, Resend, OpenAI)
- Custom Domain: streetnotes.ai live with SSL. www.streetnotes.ai DNS configured

NOT STARTED:
- Lead Magnet: Free post-call voice debrief to PDF summary + deal mind map. Drives $49/mo conversion
- Email Nurture Sequence: Welcome + nurture series from waitlist signup to paid conversion

---

## What's Live Right Now

streetnotes.ai — Waitlist landing page

Full pipeline working:
1. Visitor hits streetnotes.ai
2. Enters email and clicks "Join Waitlist"
3. Email saved to Supabase (permanent, de-duped)
4. Jeff notified instantly via Resend
5. Visitor sees "You're in. We'll hit you up when it's go time."

---

## What's Next — Priority Order

### Immediate (This Week)

1. Email Nurture Sequence (Email Wizard skill): Waitlist signups go cold without follow-up. Need automated welcome + value drip
2. Lead Magnet Design (Lead Magnet Legend skill): Free voice debrief to PDF is the conversion bridge to $49/mo. Creates friction that drives paid signups

### Near-Term (Weeks 2-3)

3. Competitive Analysis: Sharpen positioning against Gong, Fireflies, Chorus with live data. Inform ad copy and sales conversations
4. ACP Framework: Audience-centric content strategy — where to show up, what to say, how to build pipeline
5. Pricing Strategy (Master Money Model): Lock expansion tiers ($49 to $299/team), model cohort economics, project revenue milestones

### Build Phase (Month 2-3)

6. MVP (PWA): Voice capture to AI debrief to CRM push. Core product: Post-call voice note to structured data to Salesforce/HubSpot auto-update
7. CRM Integrations: Salesforce + HubSpot APIs. Table stakes — reps won't switch without their CRM connected
8. Deal Mind Map: Visual deal narrative. Differentiator — living story of every deal, updated with each meeting

---

## Tech Stack

- Frontend: Next.js 14, React 18, Tailwind CSS, Motion.js
- Backend: Next.js API Routes, Supabase (PostgreSQL + Auth)
- Voice: OpenAI Whisper API
- Email: Resend (verified domain: streetnotes.ai)
- Hosting: Vercel (Production)
- Domain: streetnotes.ai (GoDaddy to Vercel DNS)

---

## Competitive Position

We are NOT a transcription tool. We're rep-first, not recording-first.

- Gong: Records + analyzes calls for managers. Manager-first. Heavy. Expensive. Reps feel surveilled.
- Fireflies.ai: Transcribes meetings. Transcription only — doesn't touch the CRM.
- Fathom: AI meeting notes. Notes are not CRM updates. Rep still types.
- Chorus: Conversation intelligence. Acquired by ZoomInfo. Enterprise-only. Very expensive.
- StreetNotes.ai: Voice to structured CRM data. Rep presses mic, talks, CRM updates. 45 years of quota-carrying experience built into the AI.

---

## GTM Strategy

Motion: Bottom-up adoption

1. Individual AE buys at $49/mo (can expense without VP approval)
2. AE becomes internal champion as pipeline data improves
3. Manager notices. Rolls out to team at $299/mo
4. VP sees clean org-wide forecast data. Enterprise deal

Channels:
- r/sales (429K members) — CRM complaints are constant
- LinkedIn (founder-led content + ads targeting sales directors)
- Sales communities, RevOps Slack groups
- CRM training program partnerships

---

## Key Metrics to Watch

- Waitlist signups: Target 100 in first 30 days (tracking, just launched)
- Email open rate (nurture): Target >40% (pending — sequence not built yet)
- Landing page conversion: Target >8% visitor-to-signup (pending — need analytics)
- Time to MVP launch: 8 weeks from today (on track)

---

## Budget & Resources

- Jeff (GTM/Story/Revenue): Active — ~30% capacity
- Michael (Strategy/Ops): Active — ~70% capacity
- Development: Jeff via Claude Code
- Infrastructure costs: <$50/mo (Vercel free tier, Supabase free tier, Resend free tier)
- Ad/tooling budget: Michael covers

---

## Summary

Where we are: Waitlist is live at streetnotes.ai. Foundation is locked — offer, brand, ICP, landing page all shipping. Pipeline works end to end.

What's working: The positioning ("rep-first, not recording-first") resonates. The brand voice is sharp. The tech stack is lean and fast.

Biggest gap: No email nurture yet. Signups are captured but not warmed. This is the #1 priority this week.

Next milestone: Email sequence live + lead magnet designed. Then we have a complete funnel before we build the MVP.

---

Built by ForgeTime.ai — micro-SaaS for people who actually work for a living.
