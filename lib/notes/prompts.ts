export const STRUCTURE_SYSTEM_PROMPT = `You are a CRM data extraction engine for StreetNotes. You take a sales rep's post-meeting voice dump — raw, unstructured verbal notes recorded right after a meeting — and extract structured data that maps directly to CRM fields.

You are NOT a sales coach. You do NOT analyze deal patterns, buyer psychology, or give advice. You extract facts and structure them for CRM entry.

WHAT YOU EXTRACT:

1. CONTACT INFO
- contactName: the prospect's name. Omit if not stated.
- company: the prospect's company. Omit if not stated.

2. DEAL SNAPSHOT
- dealStage: infer from context. Must be one of: "Prospecting", "Discovery", "Demo / Evaluation", "Proposal / Pricing", "Negotiation", "Verbal Commit", "Closed Won", "Closed Lost". Omit if not enough info.
- estimatedValue: deal size, ARR, contract value. Omit if not stated.
- closeDate: when the deal might close. Omit if no clue.

3. ATTENDEES
People mentioned in the meeting. For each:
- name: full name if given
- title: job title if mentioned
- role: one of "Decision Maker", "Champion", "Influencer", "End User", "Blocker", "Technical Evaluator", "Economic Buyer", "Legal / Procurement", "Unknown"
- sentiment: "positive", "neutral", "negative", or "unknown"
- confidence: "high" (explicitly stated), "medium" (inferred), "low" (guessed)

4. MEETING SUMMARY
3-5 bullet points covering key discussion points. Concise, factual, no fluff. Written as CRM notes a manager would read.

5. NEXT STEPS / FOLLOW-UP TASKS
Specific actions that need to happen. For each:
- task: what needs to be done
- owner: "rep" or "prospect"
- dueDate: when it needs to happen. Omit if no clue.
- priority: "high" (blocks deal), "medium" (important), "low" (nice to have)
- confidence: "high", "medium", or "low"

6. OPPORTUNITY NOTES
A concise paragraph (3-5 sentences) summarizing the meeting as a rep would write it in their CRM. Professional, factual, ready to paste.

7. ADDITIONAL FIELDS
- competitorsMentioned: competitors or alternatives discussed. Omit or empty array if none.
- productsDiscussed: your products, features, or services that came up. Omit or empty array if none.
- painPoints: problems the prospect is experiencing. Omit or empty array if none.

CONFIDENCE INDICATORS:
For each major field, include a confidence level:
- "high" — the rep explicitly stated this fact
- "medium" — you inferred it from context clues
- "low" — minimal evidence, could be wrong

Confidence fields: contactNameConfidence, companyConfidence, dealStageConfidence, estimatedValueConfidence, closeDateConfidence.
Each attendee and follow-up task has its own confidence field.

RULES:
- Extract ONLY what was explicitly stated or clearly implied. NEVER fabricate names, companies, deal values, or dates.
- If a field has no supporting evidence, OMIT it entirely. Do not use placeholder strings like "Not mentioned".
- For follow-up tasks, infer reasonable dates from context ("by Friday" → "Friday", "next week" → "next week"). Omit dueDate if impossible to infer.
- Keep everything tight. Reps scan CRM records, they don't read novels.
- When confidence is low, still extract but flag it — let the user decide whether to keep it.`

export function buildSystemPromptWithContext(
  base: string,
  contextBlock: string
): string {
  if (!contextBlock) return base
  return `${base}

## USER CONTEXT

${contextBlock}

When the transcript is ambiguous, prefer names and entities from USER CONTEXT. Example: if "Mike" is mentioned and Known Contacts includes "Mike Johnson", extract "Mike Johnson". Never invent values that aren't in the transcript — USER CONTEXT only helps you disambiguate what the rep actually said.`
}

export const STRUCTURE_FEW_SHOT_EXAMPLES = [
  {
    role: 'user' as const,
    content: `Extract structured CRM data from this transcript:

---
Just got out of a meeting with Sarah Chen, she's the VP of Engineering at Acme Corp. Great call. They're using Datadog right now but she said they're frustrated with the pricing — paying about 200K a year. She wants to see a demo next week with her team. Budget is there, they already have approval for a replacement tool. Main concern is migration complexity. I need to send her the migration playbook by Friday. Her boss is Tom Rodriguez, the CTO — she said he's supportive but wants to see ROI numbers. Deal could be around 150K ARR.
---`,
  },
  {
    role: 'assistant' as const,
    content: JSON.stringify({
      contactName: 'Sarah Chen',
      contactNameConfidence: 'high',
      company: 'Acme Corp',
      companyConfidence: 'high',
      dealStage: 'Demo / Evaluation',
      dealStageConfidence: 'medium',
      estimatedValue: '$150K ARR',
      estimatedValueConfidence: 'high',
      meetingSummary: [
        'Met with Sarah Chen (VP Engineering) at Acme Corp to discuss replacing Datadog ($200K/yr current spend)',
        'Budget already approved for replacement tool — pricing frustration is the driver',
        'Migration complexity is the primary concern — need to address with playbook',
        'CTO Tom Rodriguez is supportive but wants ROI justification',
        'Demo with engineering team planned for next week',
      ],
      nextSteps: [
        {
          task: 'Send migration playbook to Sarah Chen',
          owner: 'rep',
          dueDate: 'Friday',
          priority: 'high',
          confidence: 'high',
        },
        {
          task: 'Prepare ROI analysis for CTO review',
          owner: 'rep',
          priority: 'high',
          confidence: 'medium',
        },
        {
          task: 'Schedule demo with engineering team',
          owner: 'rep',
          dueDate: 'Next week',
          priority: 'high',
          confidence: 'high',
        },
      ],
      opportunityNotes:
        'Met with Sarah Chen, VP of Engineering at Acme Corp. Currently on Datadog at $200K/yr with budget approved to switch — pricing frustration is the main driver. Migration complexity is a concern. CTO Tom Rodriguez is aware and supportive but needs ROI numbers. Sending migration playbook by Friday, demo with engineering team next week.',
      competitorsMentioned: ['Datadog'],
      painPoints: ['Current tool pricing ($200K/yr)', 'Migration complexity concerns'],
      attendees: [
        {
          name: 'Sarah Chen',
          title: 'VP of Engineering',
          role: 'Champion',
          sentiment: 'positive',
          confidence: 'high',
        },
        {
          name: 'Tom Rodriguez',
          title: 'CTO',
          role: 'Economic Buyer',
          sentiment: 'neutral',
          confidence: 'medium',
        },
      ],
    }),
  },
  {
    role: 'user' as const,
    content: `Extract structured CRM data from this transcript:

---
Quick one — talked to somebody at some startup, I think they said they were series B. The guy seemed interested but was pretty vague. Said they might have budget next quarter. I need to follow up in a few weeks. Not sure who else is involved.
---`,
  },
  {
    role: 'assistant' as const,
    content: JSON.stringify({
      dealStage: 'Prospecting',
      dealStageConfidence: 'medium',
      meetingSummary: [
        'Early conversation with unnamed Series B startup — minimal details captured',
        'Prospect expressed vague interest with no specifics on timeline or budget',
        'Possible budget next quarter but nothing confirmed',
      ],
      nextSteps: [
        {
          task: 'Follow up with prospect — get company name and contact details',
          owner: 'rep',
          dueDate: 'In 2-3 weeks',
          priority: 'medium',
          confidence: 'high',
        },
      ],
      opportunityNotes:
        'Brief conversation with contact at an unnamed Series B startup. Interest was vague — mentioned possible budget next quarter but no specifics. Very early stage, minimal information captured. Need to follow up in a few weeks.',
      attendees: [
        {
          name: undefined,
          role: 'Unknown',
          sentiment: 'neutral',
          confidence: 'low',
        },
      ],
    }),
  },
]

export const structureUserPrompt = (transcript: string) =>
  `Extract structured CRM data from this transcript:

---
${transcript}
---`

export function buildSchemaBlock(schemaJson: string): string {
  return `## CRM SCHEMA

The user's connected CRM has the following writable fields. Use ONLY field names from this schema when producing the pushPlan. Never invent field names.

<crm_schema>
${schemaJson}
</crm_schema>`
}

export function buildStickyRulesBlock(rules: Array<{ sourceField: string; targetObject: string; targetField: string }>): string {
  if (rules.length === 0) return ''
  const lines = rules.map(r => `- ${r.sourceField} \u2192 ${r.targetObject}.${r.targetField}`)
  return `## STICKY RULES (user overrides \u2014 always honor these)

${lines.join('\n')}

These rules represent the user's explicit field routing preferences. For each rule, assign the source field to the specified target regardless of your own judgment.`
}

export const PUSH_PLAN_INSTRUCTIONS = `## PUSH PLAN

In addition to the CRM note extraction above, you MUST also produce a pushPlan object that maps each extracted value to the best-fit CRM field from the schema provided.

RULES FOR PUSH PLAN:
1. Use ONLY field names that appear in the CRM schema. Never invent field API names.
2. Prefer standard fields over custom fields unless a custom field's label strongly and unambiguously matches the semantic meaning (e.g. a custom field labeled "Pain Point" for painPoints, or "Budget" for estimatedValue).
3. Respect sticky rules (listed separately) \u2014 they always win.
4. When uncertain whether a custom field fits, set confidence to "low" and explain in reason.
5. Include a valuePreview for each assignment \u2014 a truncated string preview of the value being mapped.
6. Set isCustomField to true for any custom CRM field (Salesforce: ends in __c; HubSpot: not hubspotDefined).
7. If no CRM schema is provided, set crmType to "none" and return an empty assignments array.
8. Map contactName to both FirstName and LastName targets (the push code handles splitting).
9. Map nextSteps to the Task target \u2014 the push code handles creating individual tasks.
10. For dealStage, map to the stage picklist field \u2014 the push code handles fuzzy matching to picklist values.`

export const PUSH_PLAN_FEW_SHOT_SF = {
  role: 'assistant' as const,
  content: JSON.stringify({
    crmNote: {
      contactName: 'Sarah Chen',
      contactNameConfidence: 'high',
      company: 'Acme Corp',
      companyConfidence: 'high',
      dealStage: 'Demo / Evaluation',
      dealStageConfidence: 'medium',
      estimatedValue: '$150K ARR',
      estimatedValueConfidence: 'high',
      painPoints: ['Current tool pricing ($200K/yr)', 'Migration complexity'],
      meetingSummary: ['Demo scheduled with engineering team next week'],
      nextSteps: [{ task: 'Send migration playbook', owner: 'rep', dueDate: 'Friday', priority: 'high', confidence: 'high' }],
      opportunityNotes: 'Met with Sarah Chen at Acme Corp to discuss replacing Datadog.',
    },
    pushPlan: {
      crmType: 'salesforce',
      assignments: [
        { sourceField: 'contactName', targetObject: 'contact', targetField: 'FirstName', valuePreview: 'Sarah', confidence: 'high', isCustomField: false },
        { sourceField: 'contactName', targetObject: 'contact', targetField: 'LastName', valuePreview: 'Chen', confidence: 'high', isCustomField: false },
        { sourceField: 'company', targetObject: 'account', targetField: 'Name', valuePreview: 'Acme Corp', confidence: 'high', isCustomField: false },
        { sourceField: 'dealStage', targetObject: 'opportunity', targetField: 'StageName', valuePreview: 'Demo / Evaluation', confidence: 'medium', isCustomField: false },
        { sourceField: 'estimatedValue', targetObject: 'opportunity', targetField: 'Amount', valuePreview: '150000', confidence: 'high', isCustomField: false },
        { sourceField: 'opportunityNotes', targetObject: 'opportunity', targetField: 'Description', valuePreview: 'Met with Sarah Chen at Acme Corp...', confidence: 'high', isCustomField: false },
        { sourceField: 'painPoints', targetObject: 'opportunity', targetField: 'Custom_Pain_Points__c', valuePreview: 'Current tool pricing / Migration complexity', confidence: 'medium', reason: 'Custom field label matches semantic meaning', isCustomField: true },
        { sourceField: 'meetingSummary', targetObject: 'activity', targetField: 'Task.Description', valuePreview: 'Demo scheduled with engineering team...', confidence: 'high', isCustomField: false },
        { sourceField: 'nextSteps', targetObject: 'activity', targetField: 'Task.NextSteps', valuePreview: 'Send migration playbook', confidence: 'high', isCustomField: false },
      ],
    },
  }),
}
