/**
 * AI prompts for campaign messaging generation.
 *
 * Two frameworks: JMM (Justin Michael Method) and Career Maniacs.
 * Five channels: cold call, voicemail, email sequence, LinkedIn, objection handling.
 *
 * The generation prompt takes extracted file text as context and produces
 * structured JSON for each channel.
 */

import type { ChannelType, FrameworkType } from './campaign-types'

/* ─── Framework Definitions ─── */

const JMM_RULES = `You are generating messaging using the Justin Michael Method (JMM). Follow these rules exactly:
1. No pleasantries. No "How are you?" or "Hope you're well." Skip straight to the point.
2. Peer-to-peer positioning. Speak as an equal, not a vendor. Calm, neutral, direct.
3. Under 90 seconds for calls, under 40 words for emails. Brevity is non-negotiable.
4. Binary asks only. "Tuesday morning or Wednesday afternoon?" Never open-ended.
5. Agree with every objection first. Then ask ONE question to redirect.
6. No "I" statements in openers. Start with an observation about their world.
7. Subject lines: lowercase, no capitalization. Signals casual internal communication.`

const CAREER_MANIACS_RULES = `You are generating messaging using the Career Maniacs framework. Follow these rules exactly:
1. The opposite of standard cold-calling. No scripts that sound like scripts.
2. Peer-to-peer positioning. You are a peer who happens to have relevant information, not a salesperson.
3. Calm, neutral tone. No excitement, no urgency language, no fake enthusiasm.
4. Under 90 seconds for calls, under 40 words for emails. Every word earns its place.
5. Binary asks. Give two specific options, never ask "would you be interested?"
6. Agree with every objection. Then ask ONE follow-up question. Listen 95% of the time.
7. No "I" statements in openers. Lead with their situation, their company, their challenge.`

const FRAMEWORK_RULES: Record<FrameworkType, string> = {
  jmm: JMM_RULES,
  career_maniacs: CAREER_MANIACS_RULES,
}

/* ─── Channel-Specific Output Schemas ─── */

const CHANNEL_SCHEMAS: Record<ChannelType, string> = {
  cold_call: `{
  "opener": "The first 5-10 seconds. Name, company, one sentence about why you're calling. Under 20 words.",
  "value_prop": "The core reason to meet. Reference specific campaign details. Under 30 words.",
  "binary_ask": "Two specific time options. Never open-ended.",
  "closing": "What to say after they agree or push back. Under 15 words.",
  "module_variants": {
    "ITSM": { "opener": "...", "value_prop": "...", "binary_ask": "..." },
    "HRSD": { "opener": "...", "value_prop": "...", "binary_ask": "..." },
    "CSM": { "opener": "...", "value_prop": "...", "binary_ask": "..." },
    "SecOps": { "opener": "...", "value_prop": "...", "binary_ask": "..." }
  }
}`,

  voicemail: `{
  "script": "Complete voicemail script. 15-20 seconds when spoken. Include: name, company, reason, next step (email follow-up).",
  "duration_target": "15-20 seconds",
  "module_variants": {
    "ITSM": "Module-specific voicemail variant...",
    "HRSD": "Module-specific voicemail variant...",
    "CSM": "Module-specific voicemail variant...",
    "SecOps": "Module-specific voicemail variant..."
  }
}`,

  email_sequence: `{
  "emails": [
    {
      "subject": "lowercase, no caps, under 6 words. Looks like internal email.",
      "body": "Under 40 words. No greeting. One observation, one ask. End with binary choice.",
      "send_day": 1,
      "purpose": "Initial spear — penetration via technical pain"
    },
    {
      "subject": "...",
      "body": "Under 40 words. Reference the first email indirectly. New angle or proof point.",
      "send_day": 3,
      "purpose": "Bridge — connect first touch to proof"
    },
    {
      "subject": "...",
      "body": "Under 40 words. Final value drop. Not a breakup email — leave door open.",
      "send_day": 7,
      "purpose": "Gift — high-value resource, no pressure"
    }
  ]
}`,

  linkedin: `{
  "connection_request": "Blank or under 10 words. Higher acceptance rate. Creates curiosity.",
  "inmail": "Under 50 words. Professional but direct. One observation about their company, one specific ask.",
  "follow_up": "Under 30 words. Reference the connection. Light touch, not pushy.",
  "video_inmail_script": "30-45 second script for a personalized video InMail. Show effort. Reference something specific about their company."
}`,

  objection_handling: `{
  "objections": [
    {
      "objection": "The exact words the prospect says",
      "response": "Agree first. Then redirect with context from the campaign. Under 30 words.",
      "follow_up_question": "ONE question to ask after the response. Keeps the conversation going.",
      "reframe": "How to pivot this objection into a reason to meet."
    }
  ]
}

Generate at least 5 objections:
1. "Can you just email me?"
2. "I'm not sure I'm attending [event]."
3. "We're happy with what we have."
4. "We already have a solution for that."
5. "I don't have time right now."
Plus any campaign-specific objections based on the materials.`,
}

/* ─── Main Generation Prompt ─── */

export function getCampaignGenerationPrompt(
  framework: FrameworkType,
  channelType: ChannelType,
  campaignContext: string,
  campaignName: string,
  eventName?: string,
  targetAudience?: string
): { system: string; user: string } {
  const frameworkRules = FRAMEWORK_RULES[framework]
  const outputSchema = CHANNEL_SCHEMAS[channelType]

  const system = `You are an elite B2B sales messaging strategist specializing in enterprise technology outbound.

${frameworkRules}

Your output must be valid JSON matching the exact schema provided. No markdown, no explanation, no preamble. Just the JSON object.

Every piece of messaging you generate must:
- Sound like a real person wrote it, not a template engine
- Reference specific details from the campaign materials (company names, product features, event details)
- Be immediately usable by a BDR without editing
- Follow the framework rules exactly`

  const user = `Generate ${channelType.replace(/_/g, ' ')} messaging for the following campaign.

CAMPAIGN: ${campaignName}
${eventName ? `EVENT: ${eventName}` : ''}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}

CAMPAIGN MATERIALS (extracted from uploaded files):
---
${campaignContext}
---

OUTPUT FORMAT (return ONLY valid JSON matching this schema):
${outputSchema}`

  return { system, user }
}

/* ─── Contact Personalization Prompt ─── */

export function getContactPersonalizationPrompt(
  framework: FrameworkType,
  channelType: ChannelType,
  baseContent: string,
  contactName: string,
  contactTitle: string,
  company: string,
  moduleStack: string[],
  companySize?: string,
  industry?: string
): { system: string; user: string } {
  const frameworkRules = FRAMEWORK_RULES[framework]

  const system = `You are personalizing campaign messaging for a specific contact using the ${framework === 'jmm' ? 'Justin Michael Method' : 'Career Maniacs'} framework.

${frameworkRules}

Take the base campaign messaging and customize it for this specific person. Reference their company name, title, module stack, and any relevant details. The output should feel like it was written specifically for them, not generated from a template.

Return a single string: the personalized script/message ready to use. No JSON wrapper needed.`

  const user = `CONTACT: ${contactName}
TITLE: ${contactTitle || 'Unknown'}
COMPANY: ${company}
MODULE STACK: ${moduleStack.length > 0 ? moduleStack.join(', ') : 'Unknown'}
${companySize ? `COMPANY SIZE: ${companySize}` : ''}
${industry ? `INDUSTRY: ${industry}` : ''}

BASE ${channelType.replace(/_/g, ' ').toUpperCase()} MESSAGING:
${baseContent}

Generate a personalized version of this messaging for ${contactName} at ${company}. Make it specific to their modules (${moduleStack.join(', ') || 'general'}) and role (${contactTitle || 'decision maker'}).`

  return { system, user }
}

/* ─── Campaign Analysis Prompt (extracts metadata from files) ─── */

export function getCampaignAnalysisPrompt(extractedText: string): { system: string; user: string } {
  const system = `You are a campaign analyst. Extract structured information from uploaded campaign materials.

Return valid JSON with this exact schema:
{
  "event_details": "Brief description of the event/campaign (1-2 sentences)",
  "key_themes": ["theme1", "theme2", "theme3"],
  "value_props": ["value prop 1", "value prop 2", "value prop 3"],
  "integration_angles": {
    "ITSM": "How the product integrates with or adds value to ITSM",
    "HRSD": "How the product integrates with or adds value to HRSD",
    "CSM": "How the product integrates with or adds value to CSM"
  },
  "brand_voice": "Brief description of the brand voice and tone in the materials",
  "target_audience": "Who these materials are targeting",
  "objection_themes": ["common objection 1", "common objection 2"]
}

Only include fields where you find relevant information. Return valid JSON only.`

  const user = `Analyze these campaign materials and extract structured metadata:

---
${extractedText}
---`

  return { system, user }
}
