import { buildAestheticOntologyBlock } from '@/lib/voice-engine/ontology'

export const STRUCTURE_SYSTEM_PROMPT = `You are a CRM data extraction engine for StreetNotes. You take an aesthetic sales rep's post-visit voice dump — raw, unstructured notes recorded right after an injector visit, practice-manager meeting, device demo, lunch and learn, or conference booth conversation — and extract structured data that maps directly to CRM fields.

You are NOT a sales coach. You do NOT analyze deal patterns, buyer psychology, or give advice. You extract facts and structure them for CRM entry.

${buildAestheticOntologyBlock()}

WHAT YOU EXTRACT:

1. CONTACT INFO
- contactName: the primary person in the account. Usually the injector, practice manager, owner, or medical director. Omit if not stated.
- company: the practice/account name. Omit if not stated.

2. DEAL SNAPSHOT
- dealStage: infer from context. Must be one of: "Prospecting", "Discovery", "Demo / Evaluation", "Proposal / Pricing", "Negotiation", "Verbal Commit", "Closed Won", "Closed Lost". Omit if not enough info.
- aestheticDealStage: if possible, infer the aesthetic account stage: "New account (no trial)", "Trialing (vials/units out)", "Low volume", "Growing", "Loyal", "At risk of switching", "Lost to competitor".
- estimatedValue: deal size, ARR, contract value. Omit if not stated.
- closeDate: when the deal might close. Omit if no clue.
- dealSegment: classify the call as one of "injector-check-in", "new-practice", "practice-manager", "device-demo", "lunch-learn", or "conference".
- modality: one of "neurotoxin", "HA filler", "biostimulator", "energy device", "skincare", "practice-management", or "unknown".
- unitVolume, syringeVolume, vialCount, buyingWindow: capture these exact commercial signals whenever mentioned.

3. ATTENDEES
People mentioned in the meeting. For each:
- name: full name if given
- title: job title if mentioned. In aesthetics this may be injector, MD, PA, NP, RN, practice manager, medical director, owner, MA, front desk.
- role: one of "Decision Maker", "Champion", "Influencer", "End User", "Blocker", "Gatekeeper", "Technical Evaluator", "Economic Buyer", "Legal / Procurement", "Unknown"
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
- risks: things that could stall the account, slow an order, or cause a switch. Omit or empty array if none.
- switchingStories: switching narratives with fromBrand, toBrand, reason, evidence, and confidence when the transcript mentions moving from one product/brand to another.
- ciMentions: detailed competitor-intelligence mentions. Include competitorName, contextQuote, sentiment ("positive", "negative", "neutral"), and mentionCategory ("pricing", "features", "switching", "satisfaction", "comparison", "contract", "migration", "general").

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
- Capture unit counts, syringe volumes, vial counts, pricing per unit, trial quantities, and buying windows exactly as spoken.
- Capture practice-role dynamics: injector vs practice manager vs MA vs medical director vs owner.
- Capture switching stories and objection specifics, especially duration, onset, spread, patient comfort, bruising, pricing, rebates, and competitor loyalty.
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
Just left Dr. Patel at Patel Aesthetics. She's running about 60 to 80 units of Botox per patient, mostly women 35 to 55, and she had two patients last week ask about Daxxify duration. She wants to trial it. Practice manager Maria is the one I need to loop in on pricing. Dr. Patel doesn't handle orders. I mentioned our loyalty rebate and Maria asked for the Q2 terms in writing. Dr. Patel said her Juvederm volume is steady but she's curious about RHA 4 for lower face. Next step is send Maria the Q2 rebate sheet and drop off four trial vials of Daxxify before Aesthetic Next.
---`,
  },
  {
    role: 'assistant' as const,
    content: JSON.stringify({
      contactName: 'Dr. Patel',
      contactNameConfidence: 'high',
      company: 'Patel Aesthetics',
      companyConfidence: 'high',
      dealStage: 'Demo / Evaluation',
      dealStageConfidence: 'medium',
      aestheticDealStage: 'Growing',
      dealSegment: 'injector-check-in',
      modality: 'neurotoxin',
      estimatedValue: '60-80 units Botox per patient; Juvederm volume steady',
      estimatedValueConfidence: 'high',
      buyingWindow: 'Before Aesthetic Next',
      unitVolume: '60-80 Botox units per patient',
      vialCount: '4 trial vials of Daxxify',
      meetingSummary: [
        'Dr. Patel is running 60-80 Botox units per patient with steady Juvederm volume',
        'Two patients asked about Daxxify duration last week, creating interest in a Daxxify trial',
        'Practice Manager Maria handles pricing and orders, not Dr. Patel',
        'Maria asked for Q2 loyalty rebate terms in writing',
        'Dr. Patel is curious about RHA 4 for lower-face work',
      ],
      nextSteps: [
        {
          task: 'Send Q2 rebate sheet to Maria',
          owner: 'rep',
          dueDate: 'This week',
          priority: 'high',
          confidence: 'high',
        },
        {
          task: 'Drop off 4 trial vials of Daxxify at Patel Aesthetics',
          owner: 'rep',
          dueDate: 'Before Aesthetic Next',
          priority: 'high',
          confidence: 'high',
        },
      ],
      opportunityNotes:
        'Visited Patel Aesthetics with injector Dr. Patel. She is running 60-80 Botox units per patient and has steady Juvederm volume. Two patients asked about Daxxify duration last week, so she wants to trial Daxxify. Practice Manager Maria handles ordering and pricing and requested Q2 loyalty rebate terms in writing. Next step is sending Maria the rebate sheet and dropping off four trial vials before Aesthetic Next.',
      competitorsMentioned: ['Botox', 'Daxxify', 'Juvederm', 'RHA'],
      productsDiscussed: ['Daxxify trial vials', 'Q2 loyalty rebate', 'RHA 4'],
      painPoints: ['Patient duration questions on Botox'],
      risks: ['Daxxify trial could shift tox unit volume if duration lands with patients'],
      switchingStories: [
        {
          fromBrand: 'Botox',
          toBrand: 'Daxxify',
          reason: 'Patients asked about longer duration',
          evidence: 'Two patients last week asked about Daxxify duration',
          confidence: 'medium',
        },
      ],
      ciMentions: [
        {
          competitorName: 'Daxxify',
          contextQuote: 'two patients last week ask about Daxxify duration',
          sentiment: 'positive',
          mentionCategory: 'switching',
        },
        {
          competitorName: 'Juvederm',
          contextQuote: 'Juvederm volume is steady',
          sentiment: 'neutral',
          mentionCategory: 'satisfaction',
        },
      ],
      attendees: [
        {
          name: 'Dr. Patel',
          title: 'Injector / Owner',
          role: 'Champion',
          sentiment: 'positive',
          confidence: 'high',
        },
        {
          name: 'Maria',
          title: 'Practice Manager',
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
Quick one, ran into a new practice at the Vegas Cosmetic booth. I think it was a medspa, didn't catch the name. Owner was interested but vague. Said they're mostly on Dysport but patients complain about onset. Might have budget to trial something new next quarter. I need to follow up in a few weeks.
---`,
  },
  {
    role: 'assistant' as const,
    content: JSON.stringify({
      dealStage: 'Prospecting',
      dealStageConfidence: 'medium',
      aestheticDealStage: 'New account (no trial)',
      dealSegment: 'conference',
      modality: 'neurotoxin',
      closeDate: 'Next quarter',
      closeDateConfidence: 'medium',
      meetingSummary: [
        'Booth conversation at Vegas Cosmetic with an unnamed medspa owner',
        'Practice is mostly using Dysport today',
        'Patients complain about Dysport onset',
        'Possible budget to trial something new next quarter',
        'Practice and owner name were not captured',
      ],
      nextSteps: [
        {
          task: 'Follow up with prospect and get practice name plus owner contact details',
          owner: 'rep',
          dueDate: 'In 2-3 weeks',
          priority: 'medium',
          confidence: 'high',
        },
      ],
      opportunityNotes:
        'Brief Vegas Cosmetic booth conversation with an unnamed medspa owner. The practice is mostly using Dysport and has patient complaints about onset. Owner expressed vague interest in trialing a new neurotoxin next quarter, but no practice name or owner contact was captured. Need to follow up in 2-3 weeks and identify the account from booth records.',
      competitorsMentioned: ['Dysport'],
      painPoints: ['Patient complaints about Dysport onset'],
      risks: ['No practice or owner name captured', 'Vague timeline with no commitment'],
      ciMentions: [
        {
          competitorName: 'Dysport',
          contextQuote: 'mostly on Dysport but patients complain about onset',
          sentiment: 'negative',
          mentionCategory: 'features',
        },
      ],
      attendees: [
        {
          name: undefined,
          title: 'Owner',
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
