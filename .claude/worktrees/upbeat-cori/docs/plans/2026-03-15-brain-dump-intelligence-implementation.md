# Brain Dump Intelligence Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic AI note-reorganizer output with four intelligence layers (deal pattern recognition, commitment language analysis, objection diagnostics, mutual next steps flag), redesign the results display for verdict-first hierarchy, and rebuild the PDF as a polished deal intelligence report.

**Architecture:** The GPT-4o prompt gets a major rewrite with segment-aware pattern libraries and diagnostic reasoning. New TypeScript types replace the old schema. The results display is rebuilt top-to-bottom with new sections and visual hierarchy. The PDF is a full redesign with a one-pager hero page. A new deal segment selector step is added between email gate and recording.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, GPT-4o (JSON mode), @react-pdf/renderer, Framer Motion, react-icons

---

## Task 1: Update TypeScript Types

**Files:**
- Modify: `lib/debrief/types.ts`

**Step 1: Replace the DebriefStructuredOutput interface and add DealSegment type**

Replace the entire contents of `lib/debrief/types.ts` with:

```typescript
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type DealSegment = 'smb' | 'mid-market' | 'enterprise' | 'partner-channel'

export type BANTStatus = 'confirmed' | 'implied' | 'missing'

export type NextStepsStatus = 'confirmed' | 'one-sided' | 'none'

export interface DealPattern {
  name: string
  description: string
  evidence: string[]
  gapAnalysis: {
    budget: BANTStatus
    authority: BANTStatus
    need: BANTStatus
    timeline: BANTStatus
  }
  recommendedActions: string[]
}

export interface MutualNextSteps {
  status: NextStepsStatus
  repActions: Array<{ action: string; dueDate?: string }>
  prospectActions: Array<{ action: string; dueDate?: string }>
  recoveryScript?: string
}

export interface CommitmentAnalysis {
  realCommitments: Array<{
    quote: string
    significance: string
  }>
  fillerSignals: Array<{
    quote: string
    meaning: string
    recoveryMove: string
  }>
}

export interface ObjectionDiagnostic {
  surfaceObjection: string
  realBlocker: string
  evidence: string[]
  recoveryPlay: string
}

export interface DebriefStructuredOutput {
  dealSegment: DealSegment
  dealPattern: DealPattern
  mutualNextSteps: MutualNextSteps
  commitmentAnalysis: CommitmentAnalysis
  objectionDiagnostics: ObjectionDiagnostic[]
  dealSnapshot: {
    companyName: string
    contactName: string
    contactTitle: string
    dealStage: string
    estimatedValue: string
    timeline: string
  }
  callSummary: string[]
  decisionMakers: Array<{
    name: string
    role: string
    sentiment: 'positive' | 'neutral' | 'negative' | 'unknown'
  }>
  competitorsMentioned: string[]
  buyingSignals: string[]
  risks: string[]
  overallConfidence: ConfidenceLevel
}

export type DebriefStep = 'email' | 'segment' | 'record' | 'review' | 'processing' | 'results'

export interface DebriefSessionState {
  step: DebriefStep
  sessionId: string | null
  email: string | null
  dealSegment: DealSegment | null
  audioBlob: Blob | null
  transcript: string | null
  editedTranscript: string | null
  structured: DebriefStructuredOutput | null
  error: string | null
  isLoading: boolean
}
```

**Step 2: Verify the build compiles (will have errors — that's expected at this stage)**

Run: `npx tsc --noEmit 2>&1 | head -5`
Expected: Type errors in files that reference old fields (dealScore, keyTakeaways, etc.). This confirms the types propagated.

**Step 3: Commit**

```bash
git add lib/debrief/types.ts
git commit -m "refactor(debrief): replace structured output types with intelligence layer schema

New types: DealPattern, MutualNextSteps, CommitmentAnalysis, ObjectionDiagnostic.
Removed: dealScore, keyTakeaways, summary, old objections/nextSteps formats.
Added: DealSegment type and 'segment' step to DebriefStep."
```

---

## Task 2: Rewrite GPT-4o Prompt

**Files:**
- Modify: `lib/debrief/prompts.ts`

**Step 1: Replace the entire prompts file**

Replace all contents of `lib/debrief/prompts.ts` with:

```typescript
export const DEBRIEF_SYSTEM_PROMPT = `You are a senior sales analyst who reads deal conversations the way a poker player reads tells. You don't just organize what was said — you surface what it means, what's really happening underneath, and what the rep should do next.

You will receive a transcript of a sales rep's post-call brain dump and the deal segment they selected (SMB, Mid-Market, Enterprise, or Partner/Channel). Your job is to produce a deal intelligence report, not a summary.

TONE:
- Analysis sections: sharp, precise, data-first. No hedging, no "you might consider."
- Recovery plays and coaching: blunt, direct, plain sales language. "Here's what you do." Like advice from a manager who's closed 500 deals.
- Never use corporate buzzwords. Write like a VP of Sales talks behind closed doors.

DEAL PATTERN RECOGNITION:
Classify the deal into ONE named pattern based on the signals in the transcript. Calibrate for the deal segment.

Pattern library (adapt based on segment):
- "Fast Track" — Strong buying signals, clear timeline, identified decision maker, budget confirmed. Low friction.
- "Champion Without Authority" — Enthusiastic contact who lacks decision-making power. Keeps referencing others who need to approve.
- "Interested But Stalling" — Positive signals but vague timeline, no specific next steps, noncommittal language. Momentum is fading.
- "Budget Approved, No Urgency" — Money is there but no pain driving speed. Risk of indefinite delay.
- "Competitive Bake-Off" — Actively evaluating alternatives. Mentions competitors, asks comparison questions.
- "Polite No" — Courteous but disengaged. Vague, short answers, no specifics, no follow-up commitment.
- "Early Discovery" — Genuine interest but very early. Exploring, not buying yet.
- "Switching Cost Anxiety" — Wants to move but afraid of transition pain. Current vendor is entrenched.
- "Committee Gridlock" — Multiple stakeholders with conflicting priorities. No single champion driving consensus.
- "Renewal Risk" — Existing customer showing churn signals. Complaints, competitor mentions, contract questions.

For each pattern, provide:
- name: the exact pattern label
- description: one sentence explaining what this pattern means and the typical outcome if unaddressed. Reference the deal segment. Example for enterprise: "Strong buying signals paired with vague timeline and no identified power sponsor. In enterprise deals, this pattern stalls in weeks 2-3 when the champion can't sell internally."
- evidence: 2-3 specific quotes or paraphrased moments from the transcript that triggered this classification
- gapAnalysis: assess Budget, Authority, Need, Timeline (BANT) — each is "confirmed" (explicitly stated), "implied" (strongly suggested), or "missing" (not mentioned or contradicted). Weight differently by segment: Authority matters more in enterprise, Speed-to-decision matters more in SMB.
- recommendedActions: 2-3 specific, actionable things the rep should do before their next interaction. Not generic advice — specific to THIS deal and THIS pattern.

MUTUAL NEXT STEPS:
Scan for whether this call ended with mutual accountability.
- "confirmed": Both sides have specific actions with timeframes. "I'll send the proposal by Wednesday, they'll get budget approval by Friday."
- "one-sided": Rep has actions but prospect committed to nothing specific.
- "none": No next meeting, no mutual actions, no timeline.

For one-sided or none: write a recoveryScript — a specific outreach message or action the rep should take within 24 hours. Reference the strongest buying signal from the call as the hook. Write it in the rep's voice, ready to send.

Segment calibration: Enterprise deals get more tolerance for process-heavy next steps ("legal review in progress" counts as forward motion). SMB deals with no next step get flagged harder.

COMMITMENT LANGUAGE ANALYSIS:
Scan the transcript for prospect language the rep reported:

realCommitments — specific, time-bound, action-oriented statements:
- "I'll bring this to my VP Thursday"
- "Send me the SOW and I'll get it into next quarter's budget"
For each: quote the statement and explain its significance in one sentence.

fillerSignals — vague, non-committal language that sounds positive but carries no weight:
- "We should definitely circle back on this"
- "This is really interesting, let me think about it"
For each: quote it, explain what it actually means (the meaning field), and provide a recoveryMove — a specific thing the rep can say or do to convert this filler into a real commitment. Write recoveryMoves in second person, ready to use.

OBJECTION DIAGNOSTICS:
For each objection the prospect raised (stated or implied):
- surfaceObjection: what the prospect said
- realBlocker: what's probably driving it, inferred from context elsewhere in the conversation. This is the insight — what the rep doesn't see. Calibrate interpretation by segment (e.g., "need to check with team" is normal process in enterprise, likely a stall in SMB).
- evidence: 1-2 specific quotes or observations from the transcript that point to the real blocker
- recoveryPlay: one specific action or talk track addressing the REAL issue, not the surface objection. Written in blunt coach voice. No hedging.

RETAINED FIELDS:
- dealSnapshot: companyName, contactName, contactTitle, dealStage, estimatedValue, timeline. Use "Not mentioned" if not stated.
- callSummary: 3-5 bullet points combining key takeaways and summary. Concise, punchy.
- decisionMakers: name, role, sentiment (positive/neutral/negative/unknown)
- competitorsMentioned: string array
- buyingSignals: string array — look for urgency, budget mentions, timeline commitments, exec involvement, competitive urgency
- risks: string array — vague timelines, missing stakeholders, competitor entrenchment, budget uncertainty
- overallConfidence: "high" (transcript detailed and clear), "medium" (some gaps), "low" (very sparse)

QUALITY RULES:
- Extract ONLY what is explicitly stated or strongly implied. NEVER hallucinate company names, contact names, or deal values.
- If a field cannot be determined, use "Not mentioned" for strings, [] for arrays, "unknown" for sentiment.
- The dealPattern, commitmentAnalysis, and objectionDiagnostics are your INTELLIGENCE — this is where you add value beyond what the rep already knows. Be insightful, not just observational.
- Keep text concise, punchy, and professional.

EXAMPLE INPUT:
"Just got out of a meeting with Sarah Chen, she's the VP of Engineering at Acme Corp. Great call. They're using Datadog right now but she said they're frustrated with the pricing — paying about 200K a year. She wants to see a demo next week with her team. Budget is there, they already have approval for a replacement tool. Main concern is migration complexity. I need to send her the migration playbook by Friday. Her boss is Tom Rodriguez, the CTO — she said he's supportive but wants to see ROI numbers. Deal could be around 150K ARR."

EXAMPLE OUTPUT (for segment "enterprise"):
{
  "dealSegment": "enterprise",
  "dealPattern": {
    "name": "Switching Cost Anxiety",
    "description": "Budget approved and champion identified, but the real friction is transition fear — not the product. In enterprise deals, migration anxiety kills more budgeted deals than competitor pressure.",
    "evidence": [
      "Main concern is migration complexity",
      "They're using Datadog right now — paying about 200K a year (3-year entrenchment)",
      "She wants to see a demo next week — interested but hasn't committed beyond exploration"
    ],
    "gapAnalysis": {
      "budget": "confirmed",
      "authority": "implied",
      "need": "confirmed",
      "timeline": "implied"
    },
    "recommendedActions": [
      "Send the migration playbook by Friday as promised — but add a 1-page timeline showing exactly how long each phase takes and who does what. Make the transition feel boring and predictable.",
      "Before the demo, prepare ROI numbers for Tom Rodriguez. Frame it as cost of staying vs. cost of switching, not just your product value.",
      "In the demo, show a live migration example or case study from a company of similar size that switched from Datadog. Proof kills anxiety."
    ]
  },
  "mutualNextSteps": {
    "status": "one-sided",
    "repActions": [
      { "action": "Send migration playbook to Sarah", "dueDate": "Friday" },
      { "action": "Schedule demo with Sarah's team", "dueDate": "Next week" },
      { "action": "Prepare ROI analysis for CTO review", "dueDate": "Before demo" }
    ],
    "prospectActions": [],
    "recoveryScript": "Sarah — great talking today. Sending the migration playbook by Friday as discussed. Quick question: would it help to have Tom join the demo next week so we can walk through the ROI numbers together? That way he gets answers directly instead of secondhand. What day works for both of you?"
  },
  "commitmentAnalysis": {
    "realCommitments": [
      {
        "quote": "She wants to see a demo next week with her team",
        "significance": "Willing to invest team time — signals this is past casual exploration."
      }
    ],
    "fillerSignals": [
      {
        "quote": "He's supportive but wants to see ROI numbers",
        "meaning": "CTO hasn't committed to anything. 'Supportive' is a secondhand report from the champion, not a direct signal. Until Tom says it himself, treat this as unverified.",
        "recoveryMove": "Get Tom in the demo directly. Don't rely on Sarah to sell internally. Ask Sarah: 'Would it make sense to have Tom join for 15 minutes so we can address the ROI question in real time?'"
      }
    ]
  },
  "objectionDiagnostics": [
    {
      "surfaceObjection": "Migration complexity concerns",
      "realBlocker": "Three years on Datadog means deep integration, team familiarity, and switching cost anxiety. The migration objection isn't about technical difficulty — it's about the fear of disruption and being blamed if the switch goes wrong.",
      "evidence": ["They're using Datadog right now — paying about 200K a year", "Main concern is migration complexity"],
      "recoveryPlay": "Stop selling features. Send a one-page migration plan with a specific timeline, clear ownership of each phase, and a case study from a similar-sized company that switched. Make the transition feel boring and safe, not exciting and risky. The goal is to de-risk Sarah's internal reputation, not just prove your product works."
    }
  ],
  "dealSnapshot": {
    "companyName": "Acme Corp",
    "contactName": "Sarah Chen",
    "contactTitle": "VP of Engineering",
    "dealStage": "Discovery",
    "estimatedValue": "$150K ARR",
    "timeline": "Demo next week, decision timeline not specified"
  },
  "callSummary": [
    "Acme Corp VP of Engineering frustrated with Datadog pricing ($200K/yr) — budget pre-approved for replacement",
    "Migration complexity is the primary blocker, not product fit or budget",
    "CTO Tom Rodriguez reported as supportive but needs ROI justification — not yet directly engaged",
    "Demo scheduled next week with Sarah's team — need to get CTO in the room",
    "Rep owes migration playbook by Friday — critical trust-building moment"
  ],
  "decisionMakers": [
    { "name": "Sarah Chen", "role": "VP of Engineering — Champion", "sentiment": "positive" },
    { "name": "Tom Rodriguez", "role": "CTO — Economic Buyer", "sentiment": "neutral" }
  ],
  "competitorsMentioned": ["Datadog"],
  "buyingSignals": ["Budget pre-approved for replacement", "Active frustration with current vendor pricing", "Willing to schedule demo with team"],
  "risks": ["CTO not directly engaged — secondhand support only", "Migration anxiety could stall even with budget approved", "No decision timeline established"],
  "overallConfidence": "high"
}

EXAMPLE INPUT 2:
"Quick one — talked to somebody at some startup, I think they said they were series B. The guy seemed interested but was pretty vague. Said they might have budget next quarter. I need to follow up in a few weeks. Not sure who else is involved."

EXAMPLE OUTPUT 2 (for segment "smb"):
{
  "dealSegment": "smb",
  "dealPattern": {
    "name": "Polite No",
    "description": "Vague interest with zero specifics — no name, no company, no timeline, no commitment. In SMB sales, if a prospect can't give you a company name or a next step, they're being polite, not buying.",
    "evidence": [
      "The guy seemed interested but was pretty vague",
      "Said they might have budget next quarter — no specific timeline or amount",
      "Not sure who else is involved — prospect didn't volunteer org structure"
    ],
    "gapAnalysis": {
      "budget": "missing",
      "authority": "missing",
      "need": "missing",
      "timeline": "missing"
    },
    "recommendedActions": [
      "Before following up, get the basics: company name, contact name, what problem they're trying to solve. If you can't reconstruct these from memory, this lead is effectively dead.",
      "If you do follow up, lead with a specific pain point question, not 'checking in.' Something like: 'Last time we talked you mentioned [X]. Has that gotten worse or better?'",
      "Set a hard deadline: if no response after 2 follow-ups in 3 weeks, move on. Don't let this phantom deal sit in your pipeline."
    ]
  },
  "mutualNextSteps": {
    "status": "none",
    "repActions": [
      { "action": "Follow up with prospect", "dueDate": "In a few weeks" }
    ],
    "prospectActions": [],
    "recoveryScript": "This call ended without forward motion. You don't have a company name, a specific problem to solve, or a next meeting. Before following up, decide: can you reconstruct enough detail to write a relevant follow-up? If not, this isn't a deal — it's a conversation that went nowhere. Spend your time on prospects who gave you something to work with."
  },
  "commitmentAnalysis": {
    "realCommitments": [],
    "fillerSignals": [
      {
        "quote": "Might have budget next quarter",
        "meaning": "'Might' + 'next quarter' = no budget and no timeline. This is the most common brush-off in sales. The prospect is being polite.",
        "recoveryMove": "If you follow up, don't reference budget. Instead ask what problem they're trying to solve. If they can't articulate a problem, there's no deal here regardless of budget."
      },
      {
        "quote": "Seemed interested but was pretty vague",
        "meaning": "Vague interest without specifics is social courtesy, not buying intent. Real interest comes with questions, details, and next steps.",
        "recoveryMove": "Next time a prospect is vague, test it: 'What would need to be true for this to be worth your time in the next 30 days?' Their answer tells you everything."
      }
    ]
  },
  "objectionDiagnostics": [],
  "dealSnapshot": {
    "companyName": "Not mentioned",
    "contactName": "Not mentioned",
    "contactTitle": "Not mentioned",
    "dealStage": "Early Discovery",
    "estimatedValue": "Not mentioned",
    "timeline": "Possible budget next quarter"
  },
  "callSummary": [
    "Extremely early conversation with an unnamed Series B startup — minimal details captured",
    "No company name, no contact name, no specific problem identified",
    "Vague budget reference ('might have budget next quarter') with no specifics",
    "Rep plans to follow up in a few weeks but has no concrete hook"
  ],
  "decisionMakers": [],
  "competitorsMentioned": [],
  "buyingSignals": ["Series B — likely has budget capacity"],
  "risks": ["No company or contact name captured", "No specific problem or pain identified", "Vague timeline with no commitment", "No decision-making structure known"],
  "overallConfidence": "low"
}

Respond with valid JSON matching this exact schema. No markdown, no explanation, just the JSON object.`

export const DEBRIEF_USER_PROMPT_TEMPLATE = (transcript: string, segment: DealSegment) =>
  `Extract deal intelligence from this post-call brain dump. The rep selected "${segment}" as the deal segment. Calibrate your pattern recognition, gap analysis weighting, and coaching tone accordingly.

Return JSON matching the schema shown in the system prompt examples.

TRANSCRIPT:
---
${transcript}
---`

type DealSegment = 'smb' | 'mid-market' | 'enterprise' | 'partner-channel'
```

**Step 2: Commit**

```bash
git add lib/debrief/prompts.ts
git commit -m "refactor(debrief): rewrite GPT-4o prompt for intelligence layer

Adds deal pattern recognition, mutual next steps analysis, commitment
language detection, and objection diagnostics. Prompt now accepts deal
segment parameter. Two full few-shot examples included."
```

---

## Task 3: Add Deal Segment Selector Component

**Files:**
- Create: `components/debrief/segment-selector.tsx`

**Step 1: Create the segment selector component**

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import type { DealSegment } from '@/lib/debrief/types'

interface SegmentSelectorProps {
  onSelect: (segment: DealSegment) => void
}

const SEGMENTS: Array<{ value: DealSegment; label: string; desc: string }> = [
  { value: 'smb', label: 'SMB', desc: 'Small business, short sales cycle' },
  { value: 'mid-market', label: 'Mid-Market', desc: 'Growing company, 2-4 week cycle' },
  { value: 'enterprise', label: 'Enterprise', desc: 'Large org, long cycle, committee' },
  { value: 'partner-channel', label: 'Partner', desc: 'Channel sale or referral' },
]

export default function SegmentSelector({ onSelect }: SegmentSelectorProps) {
  const [selected, setSelected] = useState<DealSegment | null>(null)

  function handleSelect(segment: DealSegment) {
    setSelected(segment)
    // Brief delay so the selection is visually confirmed
    setTimeout(() => onSelect(segment), 200)
  }

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2
          className="font-display text-[28px] sm:text-[48px] uppercase leading-[0.85] text-white mb-2 sm:mb-3"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          What kind of
          <br />
          <span className="text-volt">deal</span> was this?
        </h2>
        <p className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-gray-500 mb-6 sm:mb-8">
          This calibrates your analysis.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-2 sm:gap-3 max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {SEGMENTS.map((seg) => (
          <button
            key={seg.value}
            type="button"
            onClick={() => handleSelect(seg.value)}
            className={`border-2 sm:border-4 border-black p-3 sm:p-4 text-left transition-colors duration-100 min-h-[44px] ${
              selected === seg.value
                ? 'bg-volt text-black shadow-none'
                : 'bg-white text-black shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:bg-gray-50 active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
            }`}
          >
            <span className="font-display text-base sm:text-lg uppercase block">
              {seg.label}
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-black/50 block mt-0.5">
              {seg.desc}
            </span>
          </button>
        ))}
      </motion.div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/debrief/segment-selector.tsx
git commit -m "feat(debrief): add deal segment selector component

Four-option grid (SMB, Mid-Market, Enterprise, Partner) shown between
email gate and recording. Brutalist style matching existing design."
```

---

## Task 4: Update Flow Orchestrator

**Files:**
- Modify: `components/debrief/debrief-flow.tsx`

**Step 1: Add segment state, import new component, and wire the new step into the flow**

In `debrief-flow.tsx`, make the following changes:

1. Add import for SegmentSelector and DealSegment type:

Replace:
```typescript
import type { DebriefStep, DebriefStructuredOutput } from '@/lib/debrief/types'
import EmailGate from './email-gate'
```

With:
```typescript
import type { DebriefStep, DebriefStructuredOutput, DealSegment } from '@/lib/debrief/types'
import EmailGate from './email-gate'
import SegmentSelector from './segment-selector'
```

2. Add dealSegment state. After the `email` state line:

```typescript
const [dealSegment, setDealSegment] = useState<DealSegment | null>(null)
```

3. Update `handleEmailComplete` to go to segment step instead of record:

Replace:
```typescript
const handleEmailComplete = useCallback((sid: string, em: string) => {
    setSessionId(sid)
    setEmail(em)
    setStep('record')
  }, [])
```

With:
```typescript
const handleEmailComplete = useCallback((sid: string, em: string) => {
    setSessionId(sid)
    setEmail(em)
    setStep('segment')
  }, [])

  const handleSegmentSelect = useCallback((segment: DealSegment) => {
    setDealSegment(segment)
    setStep('record')
  }, [])
```

4. Pass dealSegment to the structure API call. In `handleTranscriptConfirm`, update the fetch body:

Replace:
```typescript
body: JSON.stringify({
            sessionId,
            transcript: editedTranscript,
          }),
```

With:
```typescript
body: JSON.stringify({
            sessionId,
            transcript: editedTranscript,
            dealSegment: dealSegment || 'smb',
          }),
```

5. Reset dealSegment in `handleStartOver`:

Add `setDealSegment(null)` to the handleStartOver callback body, after `setEmail(null)`.

6. Add the segment step to the JSX render. After the email AnimatePresence block and before the record block, add:

```tsx
{step === 'segment' && (
  <motion.div key="segment" {...pageTransition}>
    <SegmentSelector onSelect={handleSegmentSelect} />
  </motion.div>
)}
```

7. Pass `dealSegment` to ResultsDisplay (we'll need it later for the segment badge):

Replace:
```tsx
<ResultsDisplay
  structured={structured}
  sessionId={sessionId!}
  email={email!}
  durationSec={durationSec}
  onStartOver={handleStartOver}
/>
```

With:
```tsx
<ResultsDisplay
  structured={structured}
  sessionId={sessionId!}
  email={email!}
  durationSec={durationSec}
  dealSegment={dealSegment || 'smb'}
  onStartOver={handleStartOver}
/>
```

**Step 2: Commit**

```bash
git add components/debrief/debrief-flow.tsx
git commit -m "feat(debrief): wire segment selector into flow orchestrator

New 'segment' step between email gate and recording. DealSegment
passed to structure API and results display."
```

---

## Task 5: Update Structure API Route

**Files:**
- Modify: `app/api/debrief/structure/route.ts`

**Step 1: Accept dealSegment in request body and pass to prompt**

Replace the destructuring and prompt usage:

Replace:
```typescript
const { sessionId, transcript } = await request.json()
```

With:
```typescript
const { sessionId, transcript, dealSegment } = await request.json()
```

Replace:
```typescript
const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: DEBRIEF_SYSTEM_PROMPT },
        {
          role: 'user',
          content: DEBRIEF_USER_PROMPT_TEMPLATE(transcript),
        },
      ],
      temperature: 0.3,
    })
```

With:
```typescript
const segment = dealSegment || 'smb'
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: DEBRIEF_SYSTEM_PROMPT },
        {
          role: 'user',
          content: DEBRIEF_USER_PROMPT_TEMPLATE(transcript, segment),
        },
      ],
      temperature: 0.3,
    })
```

Update the notification to use new schema fields. Replace:

```typescript
const company = structured.dealSnapshot?.companyName || 'Unknown'
    const score = structured.dealScore ?? '?'
    await sendNotification(
      `Brain Dump completed: ${session.email} — ${company} (${score}/10)`,
      [
        'Brain Dump completed!',
        '',
        `Email: ${session.email}`,
        `Company: ${company}`,
        `Deal Score: ${score}/10`,
        `Contact: ${structured.dealSnapshot?.contactName || 'Not mentioned'}`,
        `Stage: ${structured.dealSnapshot?.dealStage || 'Not mentioned'}`,
        `Next Steps: ${structured.nextSteps?.length || 0}`,
        `Objections: ${structured.objections?.length || 0}`,
        '',
        `Session: ${sessionId}`,
        `Time: ${new Date().toISOString()}`,
      ].join('\n')
    )
```

With:

```typescript
const company = structured.dealSnapshot?.companyName || 'Unknown'
    const pattern = structured.dealPattern?.name || 'Unknown'
    const nextStepsStatus = structured.mutualNextSteps?.status || 'unknown'
    await sendNotification(
      `Brain Dump completed: ${session.email} — ${company} (${pattern})`,
      [
        'Brain Dump completed!',
        '',
        `Email: ${session.email}`,
        `Company: ${company}`,
        `Deal Pattern: ${pattern}`,
        `Segment: ${segment}`,
        `Next Steps Status: ${nextStepsStatus}`,
        `Contact: ${structured.dealSnapshot?.contactName || 'Not mentioned'}`,
        `Objection Diagnostics: ${structured.objectionDiagnostics?.length || 0}`,
        `Real Commitments: ${structured.commitmentAnalysis?.realCommitments?.length || 0}`,
        `Filler Signals: ${structured.commitmentAnalysis?.fillerSignals?.length || 0}`,
        '',
        `Session: ${sessionId}`,
        `Time: ${new Date().toISOString()}`,
      ].join('\n')
    )
```

Also update the import to include `DEBRIEF_USER_PROMPT_TEMPLATE` (already imported, but verify it matches the new signature).

**Step 2: Increase maxDuration since the richer prompt takes longer**

Replace:
```typescript
export const maxDuration = 30
```

With:
```typescript
export const maxDuration = 45
```

**Step 3: Commit**

```bash
git add app/api/debrief/structure/route.ts
git commit -m "feat(debrief): pass deal segment to GPT-4o prompt

Structure API now accepts dealSegment in request body and passes
it to the prompt template. Notification updated for new schema fields.
Max duration increased to 45s for richer analysis."
```

---

## Task 6: Rebuild Results Display

**Files:**
- Modify: `components/debrief/results-display.tsx`

This is the largest change. The entire component needs to be rewritten with the new visual hierarchy.

**Step 1: Rewrite results-display.tsx**

Replace the entire file with the new implementation. The new results display has:

1. Mutual Next Steps Banner (top, full-width, color-coded)
2. Deal Pattern Card (hero, with BANT gap pills)
3. Buyer Psychology Section (commitments vs. filler, objection diagnostics)
4. Deal Snapshot (compressed, moved down)
5. Call Summary (merged bullets)
6. Tabbed reference section (Stakeholders | Signals | Risks | Competitors)
7. Deal Mind Map (updated)
8. Bridge CTA (updated copy)

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  FaDownload,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa'
import type {
  DebriefStructuredOutput,
  DealSegment,
  BANTStatus,
  NextStepsStatus,
} from '@/lib/debrief/types'
import DealMindMap from './deal-mind-map'
import BridgeCTA from './bridge-cta'

interface ResultsDisplayProps {
  structured: DebriefStructuredOutput
  sessionId: string
  email: string
  durationSec: number
  dealSegment: DealSegment
  onStartOver: () => void
}

/* ─── BANT Gap Pill ─── */
function BANTGapPill({ label, status }: { label: string; status: BANTStatus }) {
  const styles: Record<BANTStatus, string> = {
    confirmed: 'bg-volt/20 border-volt text-volt',
    implied: 'bg-yellow-400/20 border-yellow-400 text-yellow-400',
    missing: 'bg-red-500/20 border-red-500 text-red-500',
  }
  const statusLabels: Record<BANTStatus, string> = {
    confirmed: 'Confirmed',
    implied: 'Implied',
    missing: 'Not identified',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.1em] text-gray-400">
        {label}
      </span>
      <div className={`flex items-center gap-1.5 border px-2 py-0.5 sm:px-2.5 sm:py-1 ${styles[status]}`}>
        <span className={`w-2 h-2 rounded-full ${
          status === 'confirmed' ? 'bg-volt' :
          status === 'implied' ? 'bg-yellow-400' :
          'bg-red-500 animate-pulse'
        }`} />
        <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider">
          {statusLabels[status]}
        </span>
      </div>
    </div>
  )
}

/* ─── Mutual Next Steps Banner ─── */
function NextStepsBanner({
  status,
  repActions,
  prospectActions,
  recoveryScript,
}: {
  status: NextStepsStatus
  repActions: Array<{ action: string; dueDate?: string }>
  prospectActions: Array<{ action: string; dueDate?: string }>
  recoveryScript?: string
}) {
  const bannerStyles: Record<NextStepsStatus, string> = {
    confirmed: 'bg-volt/10 border-volt',
    'one-sided': 'bg-yellow-400/10 border-yellow-400',
    none: 'bg-red-500/10 border-red-500',
  }
  const titleStyles: Record<NextStepsStatus, string> = {
    confirmed: 'text-volt',
    'one-sided': 'text-yellow-400',
    none: 'text-red-500',
  }
  const titles: Record<NextStepsStatus, string> = {
    confirmed: 'NEXT STEPS LOCKED',
    'one-sided': 'ONE-SIDED NEXT STEPS',
    none: 'NO NEXT STEPS',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 sm:border-4 ${bannerStyles[status]} p-3 sm:p-4`}
    >
      <p className={`font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold ${titleStyles[status]} mb-2`}>
        {titles[status]}
      </p>

      {status === 'confirmed' && (
        <div className="space-y-1">
          {repActions.map((a, i) => (
            <p key={`r${i}`} className="font-body text-[13px] sm:text-sm text-black/80">
              <span className="font-mono text-[9px] uppercase tracking-wider text-volt font-bold mr-2">You:</span>
              {a.action}{a.dueDate ? ` — ${a.dueDate}` : ''}
            </p>
          ))}
          {prospectActions.map((a, i) => (
            <p key={`p${i}`} className="font-body text-[13px] sm:text-sm text-black/80">
              <span className="font-mono text-[9px] uppercase tracking-wider text-blue-400 font-bold mr-2">Them:</span>
              {a.action}{a.dueDate ? ` — ${a.dueDate}` : ''}
            </p>
          ))}
        </div>
      )}

      {status === 'one-sided' && (
        <div>
          <p className="font-body text-[13px] sm:text-sm text-black/70 mb-2">
            You have action items, but your prospect committed to nothing specific. Deals without mutual accountability lose momentum.
          </p>
          {recoveryScript && (
            <div className="border-l-2 border-yellow-400 pl-3 mt-2">
              <p className="font-mono text-[9px] uppercase tracking-wider text-yellow-600 mb-1">Recovery move:</p>
              <p className="font-body text-xs sm:text-sm text-black/80 italic">{recoveryScript}</p>
            </div>
          )}
        </div>
      )}

      {status === 'none' && (
        <div>
          <p className="font-body text-[13px] sm:text-sm text-black/70 font-medium mb-2">
            No next meeting. No mutual actions. No timeline. This call ended without forward motion.
          </p>
          {recoveryScript && (
            <div className="border-l-2 border-red-500 pl-3 mt-2">
              <p className="font-mono text-[9px] uppercase tracking-wider text-red-500 mb-1">Recovery — send within 24 hours:</p>
              <p className="font-body text-xs sm:text-sm text-black/80 italic">{recoveryScript}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

/* ─── Collapsible Objection Card ─── */
function ObjectionCard({
  surfaceObjection,
  realBlocker,
  evidence,
  recoveryPlay,
}: {
  surfaceObjection: string
  realBlocker: string
  evidence: string[]
  recoveryPlay: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-l-3 sm:border-l-4 border-l-red-500 bg-red-500/5 pl-3 py-2 sm:py-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-start justify-between gap-2 min-h-[44px]"
      >
        <div className="flex-1">
          <p className="font-mono text-[9px] uppercase tracking-wider text-red-400 mb-0.5">Surface objection</p>
          <p className="font-body text-[13px] sm:text-sm text-black font-medium">{surfaceObjection}</p>
        </div>
        <span className="text-gray-400 mt-1 flex-shrink-0">
          {expanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Real blocker</p>
                <p className="font-body text-xs sm:text-sm text-black/80">{realBlocker}</p>
              </div>
              {evidence.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Evidence</p>
                  {evidence.map((e, i) => (
                    <p key={i} className="font-body text-xs text-black/60 italic border-l-2 border-volt/30 pl-2 mb-1">
                      &ldquo;{e}&rdquo;
                    </p>
                  ))}
                </div>
              )}
              <div className="bg-black/5 p-2 sm:p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-black/50 mb-0.5">Recovery play</p>
                <p className="font-body text-xs sm:text-sm text-black/90 font-medium">{recoveryPlay}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Section wrapper ─── */
function Section({
  children,
  index,
  title,
}: {
  children: React.ReactNode
  index: number
  title: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.35 }}
    >
      <div className="border-2 sm:border-4 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
        <div className="border-b-2 sm:border-b-4 border-black px-3 py-2 sm:px-4 sm:py-3">
          <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
            {title}
          </h3>
        </div>
        <div className="p-3 sm:p-5">{children}</div>
      </div>
    </motion.div>
  )
}

/* ─── Tabbed reference section ─── */
type ReferenceTab = 'stakeholders' | 'signals' | 'risks' | 'competitors'

function TabbedReference({ data }: { data: DebriefStructuredOutput }) {
  const [activeTab, setActiveTab] = useState<ReferenceTab>('stakeholders')

  const tabs: Array<{ key: ReferenceTab; label: string; count: number }> = [
    { key: 'stakeholders', label: 'Stakeholders', count: data.decisionMakers.length },
    { key: 'signals', label: 'Signals', count: data.buyingSignals.length },
    { key: 'risks', label: 'Risks', count: data.risks.length },
    { key: 'competitors', label: 'Competitors', count: data.competitorsMentioned.length },
  ].filter(t => t.count > 0)

  if (tabs.length === 0) return null

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b-2 border-black overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] px-3 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap border-b-2 -mb-[2px] transition-colors min-h-[44px] ${
              activeTab === tab.key
                ? 'border-volt text-volt font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-3 sm:p-5">
        {activeTab === 'stakeholders' && (
          <div className="space-y-2">
            {data.decisionMakers.map((dm, i) => {
              const sentimentColors: Record<string, string> = {
                positive: 'border-l-volt',
                neutral: 'border-l-gray-400',
                negative: 'border-l-red-500',
                unknown: 'border-l-gray-600',
              }
              return (
                <div key={i} className={`border-l-3 sm:border-l-4 pl-3 py-1 ${sentimentColors[dm.sentiment] || sentimentColors.unknown}`}>
                  <p className="font-body text-[13px] sm:text-sm text-black font-medium">{dm.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-body text-xs text-black/60">{dm.role}</span>
                    <span className={`font-mono text-[9px] uppercase tracking-wider ${
                      dm.sentiment === 'positive' ? 'text-volt' :
                      dm.sentiment === 'negative' ? 'text-red-500' : 'text-gray-400'
                    }`}>{dm.sentiment}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {data.buyingSignals.map((signal, i) => (
              <span key={i} className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-volt border-2 border-volt/40 bg-volt/10 px-2.5 sm:px-3 py-1">
                {signal}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {data.risks.map((risk, i) => (
              <span key={i} className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-red-400 border-2 border-red-500/40 bg-red-500/10 px-2.5 sm:px-3 py-1">
                {risk}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {data.competitorsMentioned.map((comp, i) => (
              <span key={i} className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-600 border-2 border-gray-300 bg-gray-50 px-2.5 sm:px-3 py-1">
                {comp}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Segment badge ─── */
const SEGMENT_LABELS: Record<DealSegment, string> = {
  'smb': 'SMB',
  'mid-market': 'Mid-Market',
  'enterprise': 'Enterprise',
  'partner-channel': 'Partner',
}

/* ─── Main results component ─── */
export default function ResultsDisplay({
  structured,
  sessionId,
  email,
  durationSec,
  dealSegment,
  onStartOver,
}: ResultsDisplayProps) {
  const [downloading, setDownloading] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const inlineDownloadRef = useRef<HTMLDivElement>(null)
  const d = structured

  useEffect(() => {
    const target = inlineDownloadRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/debrief/pdf?sessionId=${sessionId}`)
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `streetnotes-debrief-${new Date().toISOString().split('T')[0]}.pdf`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(`/api/debrief/pdf?sessionId=${sessionId}`, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  let sIdx = 0

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <motion.div className="text-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-3">
          <span className="inline-block bg-white border-2 sm:border-3 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 -rotate-1 font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
            Deal Intelligence Report
          </span>
        </div>
        <h2
          className="font-display text-[28px] sm:text-[48px] uppercase leading-[0.85] text-white mb-2"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          {d.dealSnapshot.companyName !== 'Not mentioned' ? d.dealSnapshot.companyName : 'Deal Intel'}
        </h2>
        <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-gray-500">
          {email} &middot; {Math.round(durationSec / 60)}m{durationSec % 60}s &middot; {SEGMENT_LABELS[dealSegment]}
        </p>
      </motion.div>

      {/* Quick download + start over */}
      <motion.div ref={inlineDownloadRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} className="flex gap-3">
        <button type="button" onClick={handleDownloadPDF} disabled={downloading} className="brutalist-btn bg-volt text-black flex-1 flex items-center justify-center gap-2">
          <FaDownload className="text-sm" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
        <button type="button" onClick={onStartOver} className="brutalist-btn bg-white text-black flex items-center justify-center">
          New
        </button>
      </motion.div>

      {/* 1. Mutual Next Steps Banner */}
      <NextStepsBanner
        status={d.mutualNextSteps.status}
        repActions={d.mutualNextSteps.repActions}
        prospectActions={d.mutualNextSteps.prospectActions}
        recoveryScript={d.mutualNextSteps.recoveryScript}
      />

      {/* 2. Deal Pattern Card (hero) */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}>
        <div className="border-2 sm:border-4 border-black bg-white shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000]">
          <div className="border-b-2 sm:border-b-4 border-black px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between">
            <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">Deal Pattern</h3>
            <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 border border-gray-300 px-2 py-0.5">
              {SEGMENT_LABELS[dealSegment]}
            </span>
          </div>
          <div className="p-4 sm:p-6">
            <h2 className="font-display text-[22px] sm:text-[32px] uppercase leading-[0.9] text-black mb-2">
              {d.dealPattern.name}
            </h2>
            <p className="font-body text-[13px] sm:text-sm text-black/60 italic mb-4 sm:mb-5">
              {d.dealPattern.description}
            </p>

            {/* BANT Gap Row */}
            <div className="flex justify-between gap-2 sm:gap-4 mb-4 sm:mb-5">
              <BANTGapPill label="Budget" status={d.dealPattern.gapAnalysis.budget} />
              <BANTGapPill label="Authority" status={d.dealPattern.gapAnalysis.authority} />
              <BANTGapPill label="Need" status={d.dealPattern.gapAnalysis.need} />
              <BANTGapPill label="Timeline" status={d.dealPattern.gapAnalysis.timeline} />
            </div>

            {/* Evidence */}
            {d.dealPattern.evidence.length > 0 && (
              <div className="mb-4 sm:mb-5">
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Evidence</p>
                {d.dealPattern.evidence.map((e, i) => (
                  <p key={i} className="font-body text-xs text-black/60 italic border-l-2 border-volt/30 pl-2 mb-1">
                    &ldquo;{e}&rdquo;
                  </p>
                ))}
              </div>
            )}

            {/* Recommended Actions */}
            {d.dealPattern.recommendedActions.length > 0 && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">What to do next</p>
                {d.dealPattern.recommendedActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2.5 mb-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-volt border-2 border-black flex items-center justify-center font-mono text-[10px] font-bold text-black">
                      {i + 1}
                    </span>
                    <p className="font-body text-[13px] sm:text-sm text-black/80 flex-1">{action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3. Buyer Psychology */}
      <Section index={sIdx++} title="Buyer Psychology">
        {/* Commitment Analysis — two columns on desktop, stacked on mobile */}
        {(d.commitmentAnalysis.realCommitments.length > 0 || d.commitmentAnalysis.fillerSignals.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
            {/* Real Commitments */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-volt font-bold mb-2">Real Commitments</p>
              {d.commitmentAnalysis.realCommitments.length > 0 ? (
                <div className="space-y-2">
                  {d.commitmentAnalysis.realCommitments.map((c, i) => (
                    <div key={i} className="border-l-2 border-volt pl-2">
                      <p className="font-body text-xs sm:text-sm text-black/80 italic">&ldquo;{c.quote}&rdquo;</p>
                      <p className="font-body text-[11px] text-black/50 mt-0.5">{c.significance}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-xs text-black/40 italic">No real commitments detected.</p>
              )}
            </div>

            {/* Filler Signals */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-yellow-500 font-bold mb-2">Watch These</p>
              {d.commitmentAnalysis.fillerSignals.length > 0 ? (
                <div className="space-y-3">
                  {d.commitmentAnalysis.fillerSignals.map((f, i) => (
                    <div key={i} className="border-l-2 border-yellow-400 pl-2">
                      <p className="font-body text-xs sm:text-sm text-black/80 italic">&ldquo;{f.quote}&rdquo;</p>
                      <p className="font-body text-[11px] text-black/50 mt-0.5">{f.meaning}</p>
                      <p className="font-body text-[11px] text-black/70 mt-1 font-medium">
                        <span className="text-yellow-600">→</span> {f.recoveryMove}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-xs text-black/40 italic">No filler signals detected.</p>
              )}
            </div>
          </div>
        )}

        {/* Objection Diagnostics */}
        {d.objectionDiagnostics.length > 0 && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-2 mt-2">Objection Diagnostics</p>
            <div className="space-y-2">
              {d.objectionDiagnostics.map((obj, i) => (
                <ObjectionCard key={i} {...obj} />
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* 4. Deal Snapshot (compressed) */}
      <Section index={sIdx++} title="Deal Snapshot">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-4">
          {[
            { label: 'Company', value: d.dealSnapshot.companyName },
            { label: 'Contact', value: d.dealSnapshot.contactName },
            { label: 'Title', value: d.dealSnapshot.contactTitle },
            { label: 'Stage', value: d.dealSnapshot.dealStage },
            { label: 'Value', value: d.dealSnapshot.estimatedValue },
            { label: 'Timeline', value: d.dealSnapshot.timeline },
          ].map((field) => (
            <div key={field.label}>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-gray-400 block mb-0.5">
                {field.label}
              </span>
              <p className={`font-body text-[13px] sm:text-sm ${
                field.value === 'Not mentioned' ? 'text-gray-400 italic' : 'text-black font-medium'
              }`}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Call Summary */}
      {d.callSummary.length > 0 && (
        <Section index={sIdx++} title="Call Summary">
          <ul className="space-y-2">
            {d.callSummary.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-volt mt-2" />
                <span className="font-body text-[13px] sm:text-sm text-black/80">{bullet}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 6. Tabbed Reference (Stakeholders | Signals | Risks | Competitors) */}
      {(d.decisionMakers.length > 0 || d.buyingSignals.length > 0 || d.risks.length > 0 || d.competitorsMentioned.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + sIdx++ * 0.06, duration: 0.35 }}
        >
          <div className="border-2 sm:border-4 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
            <TabbedReference data={d} />
          </div>
        </motion.div>
      )}

      {/* 7. Mind Map */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 + sIdx * 0.06, duration: 0.35 }}
      >
        <div className="border-2 sm:border-4 border-black shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000] overflow-hidden">
          <div className="border-b-2 sm:border-b-4 border-black px-3 py-2 sm:px-4 sm:py-3 bg-white">
            <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
              Deal Mind Map
            </h3>
          </div>
          <DealMindMap data={d} />
        </div>
      </motion.div>

      {/* 8. Bridge CTA */}
      <BridgeCTA />

      {/* Bottom spacer for sticky bar on mobile */}
      <div className="h-16 sm:hidden" />

      {/* Sticky download bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 bg-dark/95 backdrop-blur-sm border-t-2 border-volt/30 px-4 py-3 pb-safe">
          <button type="button" onClick={handleDownloadPDF} disabled={downloading} className="brutalist-btn bg-volt text-black w-full flex items-center justify-center gap-2 border-2">
            <FaDownload className="text-xs" />
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/debrief/results-display.tsx
git commit -m "feat(debrief): rebuild results display with intelligence layer

New layout: mutual next steps banner (top) → deal pattern card (hero)
→ buyer psychology (commitments vs. filler + objection diagnostics)
→ deal snapshot (compressed) → call summary → tabbed reference section.
Verdict-first visual hierarchy replaces equal-weight scrolling."
```

---

## Task 7: Update Deal Mind Map

**Files:**
- Modify: `components/debrief/deal-mind-map.tsx`

**Step 1: Update the mind map to use new schema**

The mind map needs to use the new data structure. The central node shows the pattern name instead of company name. The branches reflect the new intelligence — adds a "Gaps" branch for missing BANT and replaces "Next Steps" branch with "Recovery Plays" when mutual next steps are amber/red.

Replace the branch-building logic in the default export function (the bottom of the file, starting at `export default function DealMindMap`):

```typescript
export default function DealMindMap({ data }: DealMindMapProps) {
  const patternName = data.dealPattern?.name || 'Deal'
  const companyName = data.dealSnapshot?.companyName || 'Deal'

  // Use company name as the central label, pattern name as subtitle
  const centralLabel = companyName !== 'Not mentioned' ? companyName : patternName

  // No score anymore — use pattern name coloring
  const statusColor = data.mutualNextSteps?.status === 'confirmed' ? '#00E676'
    : data.mutualNextSteps?.status === 'one-sided' ? '#FFD600'
    : '#FF5252'

  const branches: Branch[] = []

  // BANT Gaps (red) — only missing items
  const gaps: string[] = []
  const ga = data.dealPattern?.gapAnalysis
  if (ga) {
    if (ga.budget === 'missing') gaps.push('Budget — Not identified')
    if (ga.authority === 'missing') gaps.push('Authority — Not identified')
    if (ga.need === 'missing') gaps.push('Need — Not identified')
    if (ga.timeline === 'missing') gaps.push('Timeline — Not identified')
  }
  if (gaps.length > 0) {
    branches.push({ label: 'Gaps', items: gaps, color: '#FF5252' })
  }

  // Next Steps or Recovery Plays
  if (data.mutualNextSteps?.status === 'confirmed') {
    const steps = [
      ...data.mutualNextSteps.repActions.map(a => `You: ${a.action}`),
      ...data.mutualNextSteps.prospectActions.map(a => `Them: ${a.action}`),
    ]
    if (steps.length > 0) {
      branches.push({ label: 'Next Steps', items: truncateItems(steps, 4), color: '#00E676' })
    }
  } else if (data.dealPattern?.recommendedActions?.length > 0) {
    branches.push({
      label: 'Recovery Plays',
      items: truncateItems(data.dealPattern.recommendedActions, 4),
      color: '#FFD600',
    })
  }

  if (data.objectionDiagnostics?.length > 0) {
    branches.push({
      label: 'Objections',
      items: truncateItems(
        data.objectionDiagnostics.map(o => o.surfaceObjection),
        4
      ),
      color: '#FF5252',
    })
  }
  if (data.decisionMakers?.length > 0) {
    branches.push({
      label: 'Stakeholders',
      items: truncateItems(
        data.decisionMakers.map(d => `${d.name} — ${d.role}`),
        4
      ),
      color: '#448AFF',
    })
  }
  if (data.buyingSignals?.length > 0) {
    branches.push({
      label: 'Buying Signals',
      items: truncateItems(data.buyingSignals, 4),
      color: '#00E676',
    })
  }
  if (data.risks?.length > 0) {
    branches.push({
      label: 'Risks',
      items: truncateItems(data.risks, 4),
      color: '#FF5252',
    })
  }

  return (
    <div className="w-full bg-[#0A0A0A]">
      <div className="block sm:hidden">
        <MobileMindMap
          companyName={centralLabel}
          score={0}
          scoreColor={statusColor}
          branches={branches}
        />
      </div>
      <div className="hidden sm:block">
        <DesktopMindMap
          companyName={centralLabel}
          score={0}
          scoreColor={statusColor}
          branches={branches}
        />
      </div>
    </div>
  )
}
```

Note: The `score` prop is now unused visually (we removed the numeric score). Update the mobile and desktop mind map components to hide the score pill when `score === 0`. In `MobileMindMap`, wrap the score pill `<rect>` and `<text>` in `{score > 0 && (...)}`. Same for `DesktopMindMap`'s score `<circle>` and `<text>`.

**Step 2: Commit**

```bash
git add components/debrief/deal-mind-map.tsx
git commit -m "feat(debrief): update mind map for new intelligence schema

Central node shows company name. Adds 'Gaps' branch for missing BANT.
Uses 'Recovery Plays' instead of 'Next Steps' when mutual next steps
are not confirmed. Removes numeric score display."
```

---

## Task 8: Update Bridge CTA Copy

**Files:**
- Modify: `components/debrief/bridge-cta.tsx`

**Step 1: Update the copy to reference intelligence features**

Replace the headline, free list, and missing list in `bridge-cta.tsx`:

Replace:
```tsx
<h3
  className="font-display text-[22px] sm:text-[40px] uppercase leading-[0.85] text-black mb-2 sm:mb-3"
>
  Now imagine this
  <br />
  pushed straight
  <br className="sm:hidden" />
  {' '}to your CRM.
</h3>

<p className="font-body text-base sm:text-xl text-black/70 mb-1.5 sm:mb-2">
  That&apos;s StreetNotes.
</p>
```

With:
```tsx
<h3
  className="font-display text-[22px] sm:text-[40px] uppercase leading-[0.85] text-black mb-2 sm:mb-3"
>
  Pattern recognition.
  <br />
  Buyer psychology.
  <br className="sm:hidden" />
  {' '}Every call.
</h3>

<p className="font-body text-base sm:text-xl text-black/70 mb-1.5 sm:mb-2">
  Now imagine it straight in your CRM. That&apos;s StreetNotes.
</p>
```

Replace the free list items:
```typescript
'Structured notes',
'Deal mind map',
'Branded PDF',
'Objection tracking',
```

With:
```typescript
'Deal pattern recognition',
'Buyer psychology reads',
'BANT gap analysis',
'Objection diagnostics',
```

Replace the missing list items:
```typescript
'CRM auto-sync',
'Deal history',
'Living mind map',
'Pipeline analytics',
```

With:
```typescript
'CRM auto-sync',
'Deal history across calls',
'Team-wide pattern analytics',
'Pipeline risk scoring',
```

**Step 2: Commit**

```bash
git add components/debrief/bridge-cta.tsx
git commit -m "feat(debrief): update bridge CTA copy for intelligence layer

References new capabilities: pattern recognition, buyer psychology,
BANT gap analysis. Updates paid feature gap list."
```

---

## Task 9: Rebuild PDF for Intelligence Layer

**Files:**
- Modify: `lib/debrief/pdf.tsx`

This is a full rewrite of the PDF. The new structure is:

- **Page 1 (One-Pager):** Dark header with pattern name, mutual next steps banner, BANT gap row, top 3 actions, buyer psychology highlight
- **Page 2 (Full Intelligence):** Commitment language table, objection diagnostics cards, stakeholders
- **Page 3 (Deal Reference):** Deal snapshot, call summary, buying signals, risks, competitors
- **Page 4 (CTA):** Updated copy

**Step 1: Rewrite the entire pdf.tsx file**

This is a large file. Replace the entire contents of `lib/debrief/pdf.tsx` with the new implementation. The key changes:

- Remove `scoreColor` function (no more numeric score)
- Add `bantStatusLabel` and `bantStatusColor` helpers
- Add `nextStepsStatusColor` helper
- Page 1: Dark header block with pattern name centered, segment badge. Below: mutual next steps strip, BANT gap row, top 3 actions, buyer psychology highlight box
- Page 2: Commitment language two-column table, objection diagnostics card-style, stakeholders table
- Page 3: Deal snapshot grid, call summary bullets, signal/risk/competitor tags
- Page 4: Updated CTA copy
- Typography: 11pt uppercase tracked section headers, 10pt body at 1.5 line height, quoted text italic with left rule
- Color: Restrained use of volt green, red, amber as accents only. #F8F9FA alternating rows. #1A1A1A primary text, #6B7280 secondary

Due to the size of this file (900+ lines), write it as a complete replacement. The implementer should use the existing `pdf.tsx` as reference for @react-pdf/renderer patterns (StyleSheet.create, View/Text/Page/Document, `wrap={false}`, fixed headers/footers).

Key structural elements to implement:

```typescript
// Page 1 layout (pseudocode)
<Page size="A4" style={s.coverPage}>
  <View style={s.topAccent} />              // 4px volt green bar
  <View style={s.darkHeader}>               // Dark block, ~30% of page
    // Logo top-left, date+email top-right
    // Pattern name centered, 24pt, white, bold
    // Pattern description, 13pt, gray, italic
    // Segment badge bottom-right
  </View>
  <View style={s.nextStepsBanner}>           // Color-coded strip
    // Status + action items
  </View>
  <View style={s.bantRow}>                   // Four equally-spaced pills
    // Budget | Authority | Need | Timeline with status
  </View>
  <View style={s.actionsSection}>            // Numbered 1-2-3
    // Top 3 recommended actions
  </View>
  <View style={s.psychHighlight}>            // Two-column box
    // Left: strongest real commitment
    // Right: most dangerous filler signal + coaching
  </View>
  <Footer />
</Page>
```

The implementer should reference the design doc at `docs/plans/2026-03-15-brain-dump-intelligence-layer-design.md` Section 7 for exact spacing, colors, and typography specs.

**Step 2: Verify PDF renders**

Run: `npm run build`
Expected: Build passes. PDF endpoint should work with the new structured output.

**Step 3: Commit**

```bash
git add lib/debrief/pdf.tsx
git commit -m "feat(debrief): rebuild PDF as deal intelligence report

Page 1: one-pager with pattern name hero, BANT gaps, top actions,
buyer psychology highlight. Page 2: full commitment analysis and
objection diagnostics. Page 3: deal reference data. Page 4: updated CTA.
Consulting-firm polish with restrained color and professional typography."
```

---

## Task 10: Update PDF API Route

**Files:**
- Modify: `app/api/debrief/pdf/route.ts`

**Step 1: Update the PDF route to pass dealSegment**

The PDF route needs to pass `dealSegment` to the PDF component. The segment is stored in the structured output's `dealSegment` field, so we can read it from there.

In `app/api/debrief/pdf/route.ts`, update the props passed to `DebriefPDF`:

Replace:
```typescript
const pdfElement = React.createElement(DebriefPDF, {
      data: structured,
      email: session.email,
      date,
    })
```

With:
```typescript
const pdfElement = React.createElement(DebriefPDF, {
      data: structured,
      email: session.email,
      date,
      dealSegment: structured.dealSegment || 'smb',
    })
```

Update the PDFProps interface in `lib/debrief/pdf.tsx` to include `dealSegment`:

```typescript
interface PDFProps {
  data: DebriefStructuredOutput
  email: string
  date: string
  dealSegment: DealSegment
}
```

**Step 2: Commit**

```bash
git add app/api/debrief/pdf/route.ts lib/debrief/pdf.tsx
git commit -m "feat(debrief): pass deal segment to PDF renderer"
```

---

## Task 11: Build Verification

**Step 1: Run lint**

Run: `npm run lint`
Expected: No errors (warnings OK)

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Fix any type errors or lint issues**

Address each error individually. Common issues:
- Old field references (dealScore, keyTakeaways, etc.) in any file not yet updated
- Missing imports for new types
- `motion/react` import paths

**Step 4: Commit fixes**

```bash
git add -A
git commit -m "fix(debrief): resolve build errors from intelligence layer migration"
```

---

## Task 12: Manual Smoke Test

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test the full flow**

1. Go to `localhost:3000/debrief`
2. Enter an email → should see segment selector (new step)
3. Select a segment → should go to recording
4. Record a brain dump (or use a test recording)
5. Review transcript → confirm
6. Wait for processing → should complete
7. Check results display — verify:
   - Mutual next steps banner appears at top
   - Deal pattern card shows pattern name, BANT gaps, actions
   - Buyer psychology section shows commitments vs. filler
   - Objection diagnostics are collapsible
   - Tabbed reference section works
   - Download PDF works and shows new layout
8. Verify mobile layout at 375px width

**Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "fix(debrief): polish from manual smoke testing"
```

---

## Dependency Map

```
Task 1 (Types) ← everything depends on this
Task 2 (Prompts) ← Task 5 (API route)
Task 3 (Segment selector) ← Task 4 (Flow orchestrator)
Task 4 (Flow orchestrator) ← depends on Tasks 1, 3
Task 5 (API route) ← depends on Tasks 1, 2
Task 6 (Results display) ← depends on Tasks 1, 7, 8
Task 7 (Mind map) ← depends on Task 1
Task 8 (Bridge CTA) ← independent after Task 1
Task 9 (PDF) ← depends on Task 1
Task 10 (PDF route) ← depends on Tasks 1, 9
Task 11 (Build verification) ← depends on all above
Task 12 (Smoke test) ← depends on Task 11
```

**Recommended execution order:** 1 → 2 → 3 → 4 → 5 → 7 → 8 → 6 → 9 → 10 → 11 → 12

**Parallelizable groups:**
- After Task 1: Tasks 2, 3, 7, 8 can run in parallel
- After Tasks 2+3: Tasks 4, 5 can run in parallel
- After Tasks 4+5+7+8: Task 6 can run
- After Task 6: Tasks 9, 10 can run

---

## Notes for Implementer

- **Token usage will increase.** The new GPT-4o prompt is much longer with two full few-shot examples. Monitor cost per debrief.
- **The PDF is the most complex task.** @react-pdf/renderer has quirks — `wrap={false}` prevents section splitting, absolute positioning for headers/footers, no flexbox gap support (use marginBottom instead).
- **Test with real transcripts.** The pattern recognition quality depends heavily on the prompt. Test with varied inputs: detailed enterprise call, vague SMB call, competitive bake-off, etc.
- **Processing time may increase.** The richer output means GPT-4o needs more time. The maxDuration bump to 45s should handle it, but watch for timeouts.
- **The DebriefStep type now includes 'segment'.** Make sure the processing-steps component doesn't need updating (it only cares about 'transcribing' and 'extracting' phases, which are unchanged).
