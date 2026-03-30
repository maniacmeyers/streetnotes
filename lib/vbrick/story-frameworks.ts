import type { StoryFrameworkConfig } from './story-types'

export const STORY_FRAMEWORKS: StoryFrameworkConfig[] = [
  {
    type: 'elevator_pitch',
    name: 'Elevator Pitch',
    description: 'A 30-60 second pitch that answers: what do you do and why should I care?',
    icon: 'Rocket',
    targetDurationSec: 60,
    questions: [
      {
        key: 'problem',
        label: 'The Problem',
        hint: 'What is the one problem your prospect cares about most?',
        placeholder: 'e.g. Sales reps lose 60% of call intelligence because they can\'t update CRM fast enough...',
        maxLength: 500,
      },
      {
        key: 'solution',
        label: 'What You Do',
        hint: 'What does your solution do about it — in one sentence?',
        placeholder: 'e.g. We turn a 60-second voice note into a structured CRM update...',
        maxLength: 300,
      },
      {
        key: 'proof',
        label: 'The Proof',
        hint: 'One specific result or customer example that proves it works.',
        placeholder: 'e.g. One customer went from 40% CRM accuracy to 92% in 30 days...',
        maxLength: 400,
      },
      {
        key: 'ask',
        label: 'The Ask',
        hint: 'What do you want them to do next? Be specific.',
        placeholder: 'e.g. I\'d like to show you a 15-minute demo — what does Thursday look like?',
        maxLength: 300,
      },
    ],
  },
  {
    type: 'feel_felt_found',
    name: 'Feel / Felt / Found',
    description: 'Handle any objection with empathy, social proof, and resolution.',
    icon: 'Shield',
    targetDurationSec: 45,
    questions: [
      {
        key: 'objection',
        label: 'The Objection',
        hint: 'What objection do you hear most often? Type it exactly as prospects say it.',
        placeholder: 'e.g. "We already have a solution for that" or "We don\'t have budget right now"',
        maxLength: 300,
      },
      {
        key: 'feel',
        label: 'FEEL — Acknowledge',
        hint: 'Mirror their exact concern with genuine empathy. Show you heard them.',
        placeholder: 'e.g. I totally get that. Budget conversations are tough, especially mid-cycle...',
        maxLength: 400,
      },
      {
        key: 'felt',
        label: 'FELT — Social Proof',
        hint: 'A specific customer or prospect who felt the same way. Name their situation.',
        placeholder: 'e.g. A VP of Sales at a 200-person fintech told us the same thing last quarter...',
        maxLength: 400,
      },
      {
        key: 'found',
        label: 'FOUND — Resolution',
        hint: 'What happened after they moved forward? Specific result.',
        placeholder: 'e.g. They found that reps saved 45 minutes per day, which more than covered the cost...',
        maxLength: 400,
      },
    ],
  },
  {
    type: 'abt_customer_story',
    name: 'Customer Story (ABT)',
    description: 'Tell a customer success story using And, But, Therefore — the most persuasive structure in sales.',
    icon: 'BookOpen',
    targetDurationSec: 90,
    questions: [
      {
        key: 'context',
        label: 'The Customer',
        hint: 'Industry, size, role of the person you worked with. Make it relatable.',
        placeholder: 'e.g. Mid-market SaaS company, 150 reps, VP of Revenue Ops was our champion...',
        maxLength: 400,
      },
      {
        key: 'and',
        label: 'AND — The Setup',
        hint: 'Establish their situation. What was normal? What was working?',
        placeholder: 'e.g. They had a solid Salesforce instance AND their reps were hitting activity targets...',
        maxLength: 400,
      },
      {
        key: 'but',
        label: 'BUT — The Conflict',
        hint: 'What problem created urgency? What was breaking? This is the tension.',
        placeholder: 'e.g. BUT pipeline data was garbage — reps were entering notes 3 days after calls...',
        maxLength: 400,
      },
      {
        key: 'therefore',
        label: 'THEREFORE — The Resolution',
        hint: 'What action did they take, and what measurable result happened?',
        placeholder: 'e.g. THEREFORE they rolled out voice-to-CRM for the whole team, and within 30 days...',
        maxLength: 400,
      },
    ],
  },
]

export function getFramework(type: string): StoryFrameworkConfig | undefined {
  return STORY_FRAMEWORKS.find((f) => f.type === type)
}
