# Cold Call Sparring Partner — VBRICK BDR Training Module

## Overview

A voice-enabled cold call practice system where VBRICK BDRs can practice against AI-generated prospect personas. Each persona has unique pain points, objections, and personality traits based on real VBRICK sales scenarios.

## Features

### 8 Prospect Personas

1. **Marcus** — Disinterested IT Manager (Healthcare, 2,500 employees)
   - Overworked, skeptical, default mode is "get off my phone"
   - Pain points: Bandwidth issues, too many video platforms

2. **Jennifer** — Budget-Conscious CFO (Manufacturing, 5,000 employees)
   - Numbers-focused, wants hard ROI data
   - Pain points: Overlapping vendor contracts, shadow IT

3. **David** — Overwhelmed CTO (Tech Startup, 800 employees)
   - Spread thin, 47 active projects, technical
   - Pain points: Engineering wants async, Marketing wants webinars

4. **Sarah** — Skeptical CISO (Financial Services, 10,000 employees)
   - Security-first, compliance-focused
   - Pain points: Shadow IT tools, video data governance

5. **Alex** — Enthusiastic Innovator (Retail, 15,000 employees)
   - Early adopter, wants cutting-edge features
   - Pain points: Outdated infrastructure, wants AI features

6. **Patricia** — Busy Executive Assistant (Fortune 500 Telecom)
   - Gatekeeper extraordinaire, protective of CEO time
   - Pain points: CEO frustrated with all-hands video quality

7. **Robert** — Compliance-Heavy Legal (Pharma, 8,000 employees)
   - Risk-averse, thorough, eDiscovery concerns
   - Pain points: Marketing posting without legal review

8. **Linda** — Price-Shopping Procurement (State Government)
   - Process-driven, comparing 5 competitors
   - Pain points: Current vendor raising prices 40%

### Scoring System (6 Dimensions)

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Opening | 20% | Hook quality, permission-based opener |
| Discovery | 25% | Question quality, listening skills |
| Objection Handling | 25% | Response to pushback |
| Value Articulation | 15% | VBRICK positioning |
| Confidence/Flow | 10% | Filler words, pacing |
| Close | 5% | Next steps, call control |

### Gamification

- **Streak Tracking** — Daily practice streaks (freeze available)
- **XP Points** — Earned per session, bonus for improvement
- **Achievement Badges** — 10 badges including "Perfect Game" (90+), "Closer", "Master of Disguises"
- **Leaderboard** — Team rankings and peer comparison

### Voice Integration

- Real-time TTS for AI persona responses
- STT for BDR voice capture (integrates with existing Whisper pipeline)
- Natural conversation flow with context memory

## Technical Implementation

### New Files Created

```
lib/vbrick/sparring-personas.ts      # Persona definitions & prompts
lib/vbrick/sparring-scoring.ts       # Scoring rubric & functions
app/api/vbrick/spar/route.ts         # API endpoint (start/respond/score)
components/vbrick/sparring-session.tsx   # Active call UI
components/vbrick/sparring-dashboard.tsx # Stats & history UI
app/vbrick/dashboard/sparring/page.tsx   # Main page
supabase/migrations/20260419_sparring_partner.sql  # Database schema
```

### Database Schema

Table: `sparring_sessions`
- `user_id` — BDR identifier
- `persona_id` — Which persona they practiced against
- `total_score` — Overall 0-100 score
- `dimensions` — JSONB array of dimension scores
- `transcription` — Full call transcript
- `would_meet` — Boolean: did AI agree to meeting?
- `meeting_likelihood` — 0-100 probability

### API Endpoints

**POST /api/vbrick/spar**
- `action: 'start'` — Initialize session, get AI opening line
- `action: 'respond'` — Send BDR message, get AI response
- `action: 'score'` — End session, get detailed scoring

**GET /api/vbrick/spar**
- Fetch user's session history and stats

## Usage Flow

1. BDR navigates to "Sparring" in dashboard
2. Selects a persona based on who they're calling next
3. AI answers with realistic opening line (voice + text)
4. BDR responds via voice input
5. Natural conversation continues (3-6 exchanges typical)
6. BDR ends call or AI hangs up if handled poorly
7. Detailed scorecard appears with:
   - 6-dimension breakdown
   - Specific strengths & improvements
   - Key exchange analysis with coach feedback
   - "Would they have taken the meeting?"

## Integration with Existing VBRICK Stack

- Uses existing Whisper transcription endpoint
- Leverages existing OpenAI client setup
- Integrates with VBRICK dashboard sidebar
- Follows existing Supabase auth pattern
- Uses same UI component library (Neu design system)

## Future Enhancements

- [ ] Whisper real-time streaming instead of text input
- [ ] Scenario-based training ("You have a meeting with CIO tomorrow")
- [ ] Manager review mode with coaching comments
- [ ] Competitive objection library ("We're already using Kaltura")
- [ ] Call recording analysis against persona responses
- [ ] Team challenges and tournaments

## Moat Builder

This feature creates a **uniquely defensible asset**:

1. **Proprietary Persona Library** — 8 detailed personas tuned to VBRICK ICP
2. **Per-Session Training Data** — Every call improves the scoring model
3. **Competitive Intelligence** — Common objections emerge from transcripts
4. **Behavioral Data** — Which BDRs practice, how often, improvement curves

Most competitors (Gong, Chorus) analyze *real* calls. This creates *practice* calls — a new category entirely.
