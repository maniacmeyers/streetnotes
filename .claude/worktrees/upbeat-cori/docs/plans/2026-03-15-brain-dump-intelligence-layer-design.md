# Brain Dump Intelligence Layer Redesign

**Date:** 2026-03-15
**Goal:** Transform the Brain Dump free tool from "AI note reorganizer" to "the smartest sales analyst in the room." The output should be so good that reps screenshot it and send it to their team.

**Core problem:** Current output just reorganizes what the rep already said into neat boxes. That's useful but not remarkable. Remarkable means giving them something back they didn't already have in their head.

---

## 1. Deal Segment Selection

**After the email gate, one new question:** "What kind of deal was this?" — four options:

- SMB
- Mid-Market
- Enterprise
- Partner / Channel

Single tap, adds ~2 seconds to the flow. The AI uses this selection to calibrate patterns, gap weighting, and coaching tone downstream.

**No AI inference of segment.** The rep picks their segment and the tool respects it. If the transcript contains signals that would typically indicate a different motion (procurement mentions, committee references), the AI factors it into coaching as deal-specific context — never as a segment correction.

Example: "Multiple stakeholders were mentioned. Make sure you've identified the actual decision maker before your next call." That's coaching, not "you're wrong about your own deal."

---

## 2. Deal Pattern Recognition

**Replaces:** The current `dealScore` (generic 1-10 number + one-line rationale).

**How it works:** After extracting standard deal data, the AI classifies the deal into a named pattern from a segment-calibrated pattern library.

**Each pattern includes:**

- **Pattern name** — memorable label (e.g., "Interested But Stalling," "Champion Without Authority," "Budget Approved No Urgency," "Competitive Bake-Off," "Fast Track," "Polite No")
- **Pattern description** — one sentence ("Strong buying signals paired with vague timeline and no identified power sponsor. 3 out of 4 deals matching this pattern stall in week 2-3.")
- **Evidence from the call** — 2-3 direct quotes or paraphrased moments that triggered this classification
- **Gap analysis** — visual row showing confirmed vs. missing across Budget, Authority, Need, Timeline (BANT). Confirmed = filled green. Missing = hollow red with pulse. Partial = amber
- **Recommended actions** — 2-3 specific things to do before the next call

**Pattern library is segment-calibrated.** An SMB "Fast Track" looks different from an Enterprise "Fast Track." Gap analysis weights shift — Authority matters more in enterprise, Speed-to-decision matters more in SMB.

**Presentation:** Hero placement at top of results. Pattern name as headline. This card is the screenshot moment.

---

## 3. Commitment Language Analysis

**Scans the transcript for two categories of prospect language:**

### Real Commitments (green)
Specific, time-bound, action-oriented statements:
- "I'll bring this to my VP Thursday"
- "Send me the SOW and I'll get it into next quarter's budget"

### Filler Signals (amber)
Vague, non-committal language that sounds positive but means nothing:
- "We should definitely circle back on this"
- "This is really interesting, let me think about it"

**Presentation:** Side-by-side display. Left column: real commitments (green left-border). Right column: filler signals (amber left-border). Below each filler signal, one line of recovery coaching:

> "'Let me think about it' without a follow-up date is a soft no. Recovery move: 'Totally understand. What would you need to see to make a decision by [date]?'"

**Tone:** Analysis is sharp analyst. Recovery moves are blunt coach. Data first, then plain sales language.

---

## 4. Objection Beneath the Objection

**Replaces:** Current surface-level objection tracking (stated objection + resolved/unresolved flag).

**For each objection, the AI runs a diagnostic layer:**

- **Surface objection** — what the prospect actually said
- **Likely real blocker** — what's probably driving it, inferred from context clues
- **Evidence** — what in the transcript points to the real blocker
- **Recovery play** — one specific action or talk track addressing the real issue

**Example:**

> **Surface:** "We need to run this by a few more people internally."
> **Real blocker:** Prospect mentioned their current vendor twice unprompted and asked about migration effort. This isn't a consensus issue — it's switching cost anxiety.
> **Evidence:** "We've been on [Competitor] for three years" + "How long does implementation usually take?"
> **Recovery play:** Stop selling features. Send a one-page migration plan with a specific timeline and a case study from a similar company that switched. Make the transition feel boring and safe, not exciting and risky.

**Tone:** Surface/evidence reads like an analyst brief. Recovery play reads like a blunt coach who's closed this deal before. No hedging.

**Segment calibration:** "We need to run this by more people" in enterprise is normal process. In SMB it's usually a stall tactic. AI interpretation shifts based on selected segment.

---

## 5. Mutual Next Steps Flag

**Every debrief gets scanned for this before anything else renders.**

**Definition of "mutual":** Both sides have a specific action with a specific timeframe. "I'll send the proposal" is one-sided. "I'll send the proposal by Wednesday, and you'll have feedback to me by Friday" is mutual.

### Three states:

**Confirmed mutual next steps (green banner, top of results):**
> Next steps locked: You're sending the SOW by Wednesday 3/19. They're getting budget approval by Friday 3/21. Next call scheduled 3/24.

**One-sided next steps only (amber banner):**
> You have action items, but your prospect committed to nothing specific. Deals without mutual accountability lose momentum. Send a recap email within 4 hours that includes a specific ask with a date.

**No next steps identified (red banner):**
> No next meeting. No mutual actions. No timeline. This call ended without forward motion. Recovery window is 24 hours. [Specific outreach script based on deal pattern and segment, referencing the strongest buying signal as the hook.]

**Placement:** Very top of results, above everything else. First thing the rep sees.

**Segment calibration:** Enterprise deals get more tolerance for process-heavy next steps ("legal review in progress" counts as forward motion). SMB deals with no next step after a second call get flagged harder.

---

## 6. Results Display Redesign

**Core principle:** Clear visual hierarchy — verdict first, evidence second, actions third.

### New results flow (top to bottom):

1. **Mutual Next Steps Banner** — full-width, green/amber/red. Impossible to scroll past. Red state includes recovery script in the banner.

2. **Deal Pattern Card** (hero placement) — pattern name as headline, one-line description italic, segment badge, BANT gap row (four pills: filled green / hollow red with pulse / amber), 2-3 recommended actions numbered below.

3. **Buyer Psychology Section** — two-column layout:
   - Left: "Real Commitments" (green left-border, quoted)
   - Right: "Watch These" (amber left-border, filler signals + recovery coaching)
   - Below: Objection Beneath the Objection as collapsible cards (surface visible, tap to expand real blocker + evidence + recovery play)

4. **Deal Snapshot** (compressed) — current 2-column grid stays but moves down. Reference data, not insight. Smaller visual weight.

5. **Call Summary** — merged Key Takeaways + Summary. 3-5 bullets max. No separate summary paragraph.

6. **Stakeholders, Signals, Risks** (tabbed) — horizontal tab bar: Stakeholders | Buying Signals | Risks | Competitors. One visible at a time. Reduces scroll depth.

7. **Deal Mind Map** (updated) — central node shows pattern name. Adds "Gaps" branch (red, missing BANT). Replaces "Next Steps" branch with "Recovery Plays" when mutual next steps flag is amber/red.

8. **Bridge CTA** (updated copy) — "You just got pattern recognition, buyer psychology reads, and gap analysis on one call. Now imagine that on every call, pushing straight to your CRM."

---

## 7. PDF Redesign — Deal Intelligence Report

**Design philosophy:** Should look like it came from a sales consulting firm. When a rep opens it, the reaction should be "this looks expensive."

### Page 1 — The One-Pager

The only page that matters. If a rep prints one page, this is it.

**Layout:**

- **Top 4px accent bar** — volt green, full width (brand signature)
- **Dark header block** (top ~30%):
  - StreetNotes logo top-left, small, white
  - Date + rep email top-right, small, #9CA3AF
  - Pattern name centered, 24pt, white, bold
  - Pattern description below, 13pt, #9CA3AF, italic
  - Segment badge — small rounded pill, outlined, bottom-right of dark block
- **Mutual next steps banner** — full-width strip below dark block. Background = status color at 10% opacity. Lists specific actions/dates. Red state: includes recovery move
- **BANT Gap Row** — four equally-spaced pills. Label above, status below. Confirmed = filled green circle + "Confirmed." Missing = hollow red circle + "Not identified." Partial = amber half-fill + "Implied"
- **Top 3 Actions** — numbered 1-2-3 in volt green circles, single tight sentence each
- **Buyer Psychology Highlight** — two-column box. Left: thin green top border, "Strongest Signal" + quoted commitment. Right: thin amber top border, "Watch This" + quoted filler + one-line coaching
- **Footer** — thin #E5E7EB rule, page number center, "Confidential" right, logo left (tiny, muted)

### Page 2 — Full Intelligence

- **Repeating header** — thin bar, logo left, "Deal Intelligence Report" right
- **Commitment Language** — two-column table. Left: "Real Commitments" (green dot). Right: "Filler Signals" (amber dot). Filler sub-rows have recovery coaching preceded by → arrow
- **Objection Diagnostics** — card-style, one per objection:
  - Surface objection bold
  - "Real blocker:" label in #6B7280, analysis in regular weight
  - "Evidence:" label, italic quoted text
  - "Recovery play:" label bolder weight, direct coaching
  - Thin bottom border between cards
- **Stakeholders** — table: Name | Role | Sentiment (dot indicator)

### Page 3 — Deal Reference

- **Deal Snapshot** — 2x3 grid, label above value, confidence dots (smaller)
- **Call Summary** — 3-5 numbered bullets
- **Next Steps** — table: Action | Owner (pill badge) | Due Date
- **Buying Signals** — inline green tags
- **Risks** — inline red tags
- **Competitors** — inline gray tags

### Page 4 — CTA Page

- Full dark background
- StreetNotes logo centered, generous top margin
- Volt green divider (2px, 40% width, centered)
- "Pattern recognition. Buyer psychology. Gap analysis." — 16pt, white, centered
- "On every call. Straight to your CRM." — 13pt, #9CA3AF, centered
- CTA button: volt green background, dark text, "streetnotes.ai"
- Subtle "CRM" watermark at low opacity

### PDF Typography

- Pattern name: bold, 24pt
- Section headers: 11pt, uppercase, tracked-out letter spacing (0.05em), muted gray
- Body text: 10pt, 1.5 line height, dark gray (#1A1A1A) not pure black
- Quoted prospect language: italic, indented, thin volt-green left rule
- Coaching/recovery text: 10pt, slightly bolder, preceded by arrow/bullet
- Secondary text: #6B7280

### PDF Color System (restrained)

- Volt green (#00E676): accents only — left borders, small pills, indicator dots. Never large background fills
- Red (#FF5252): missing gaps, risks, unresolved objections. Accent only
- Amber (#FFB300): filler signals, partial confirmations
- Dark (#121212): page 1 header block only
- Body pages: white with #F8F9FA alternating row backgrounds
- Text: #1A1A1A (primary) or #6B7280 (secondary)

### PDF Micro-Details

- 24px margins all pages
- No orphaned sections — if a section can't fit with 3+ lines, break to next page
- Alternating row backgrounds on tables (#FFFFFF / #F8F9FA)
- All pills/badges: consistent 4px border-radius
- Quoted text: 12px indent + 2px left rule in accent color
- Identical footer placement every page
- 32px minimum margin above footer
- No section runs into footer

---

## 8. Tone Framework

**Sharp analyst** as the default voice. Data speaks first. No hedging, no corporate softening.

**Blunt coach** for all recovery plays and action items. Direct instruction in plain sales language. "Here's what you do." Not "you might consider."

The combination: analysis earns credibility, coaching drives action.

---

## 9. Updated Structured Output Schema

The GPT-4o prompt and TypeScript types need to expand to support:

```typescript
interface BrainDumpIntelligence {
  // Segment (from user selection)
  dealSegment: 'smb' | 'mid-market' | 'enterprise' | 'partner-channel'

  // Deal Pattern Recognition
  dealPattern: {
    name: string           // e.g., "Interested But Stalling"
    description: string    // one sentence
    evidence: string[]     // 2-3 quotes/paraphrases from transcript
    gapAnalysis: {
      budget: 'confirmed' | 'implied' | 'missing'
      authority: 'confirmed' | 'implied' | 'missing'
      need: 'confirmed' | 'implied' | 'missing'
      timeline: 'confirmed' | 'implied' | 'missing'
    }
    recommendedActions: string[]  // 2-3 specific actions
  }

  // Mutual Next Steps
  mutualNextSteps: {
    status: 'confirmed' | 'one-sided' | 'none'
    repActions: Array<{ action: string; dueDate?: string }>
    prospectActions: Array<{ action: string; dueDate?: string }>
    recoveryScript?: string  // populated when status is 'one-sided' or 'none'
  }

  // Commitment Language Analysis
  commitmentAnalysis: {
    realCommitments: Array<{
      quote: string
      significance: string
    }>
    fillerSignals: Array<{
      quote: string
      meaning: string       // what it actually means
      recoveryMove: string   // blunt coach recovery
    }>
  }

  // Objection Diagnostics
  objectionDiagnostics: Array<{
    surfaceObjection: string
    realBlocker: string
    evidence: string[]
    recoveryPlay: string
  }>

  // Retained from current schema (compressed)
  dealSnapshot: {
    companyName: string
    contactName: string
    contactTitle: string
    dealStage: string
    estimatedValue: string
    timeline: string
  }
  callSummary: string[]           // 3-5 bullets (merged takeaways + summary)
  decisionMakers: Array<{ name: string; role: string; sentiment: string }>
  competitorsMentioned: string[]
  buyingSignals: string[]
  risks: string[]

  // Overall
  overallConfidence: 'high' | 'medium' | 'low'
}
```

---

## 10. What Gets Removed

- `dealScore` (1-10 number) — replaced by deal pattern
- `dealScoreRationale` — replaced by pattern description + evidence
- `summary` (standalone) — merged into callSummary bullets
- `keyTakeaways` (standalone) — merged into callSummary bullets
- `objections` (old format) — replaced by objectionDiagnostics
- `nextSteps` (old format) — replaced by mutualNextSteps
- Per-field confidence dots on deal snapshot — removed, snapshot is now reference data

---

## 11. Implementation Considerations

- **GPT-4o prompt** needs significant rewrite. The new intelligence layers require more sophisticated system prompt with segment-aware pattern libraries, commitment language detection instructions, and objection diagnostic reasoning.
- **Token usage will increase.** The richer analysis means a longer prompt and longer response. Monitor cost per debrief.
- **New TypeScript types** replace the current `DebriefStructuredOutput` interface.
- **Results display** is a major component rewrite — new sections, new layout hierarchy, collapsible cards, tabbed sections.
- **PDF** is a full redesign of `lib/debrief/pdf.tsx` — new page structure, new typography, new color application.
- **Deal segment selector** is a new step in the flow (between email gate and recording).
- **Testing:** Need real sales call transcripts across SMB/Mid-Market/Enterprise to validate pattern recognition quality and coaching relevance.
