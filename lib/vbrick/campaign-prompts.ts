/**
 * AI prompts for campaign messaging generation.
 *
 * One framework: The Maniac Method.
 * Five channels: cold call, voicemail, email sequence, LinkedIn, objection handling.
 *
 * The generation prompt takes extracted file text as context and produces
 * structured JSON for each channel. Rules are strict and non-negotiable.
 */

import type { ChannelType, FrameworkType } from './campaign-types'

/* ─── The Maniac Method: Complete Rule Set ─── */

const MANIAC_METHOD_RULES = `You are generating messaging using The Maniac Method. This is a strict cold outreach methodology. Every rule is non-negotiable. Violating any rule means the output is unusable.

THE 8 RULES:

1. NO PLEASANTRIES
Never say "How are you?" or "Hope you're well" or "Thanks for taking my call." Zero filler. You are not warming them up. You are a peer reaching out to a peer.

2. PEER-TO-PEER STATUS
You are an equal. Never use subordinate language. NEVER say: "I'd love to," "I was hoping," "I appreciate your time," "Sorry to bother you," "Would you be open to," "I know you're busy," "Thanks so much for taking my call." These are status-lowering phrases. You are not beneath them. You are not asking for permission to exist.

3. CALM, NEUTRAL TONALITY
Never be more emotional than the prospect. Speak calmly. Almost monotone. Peppy and enthusiastic = junior salesperson. Calm and direct = peer. No excitement. No urgency language. No fake enthusiasm.

4. PATTERN INTERRUPT
Skip every expected opener. No "the reason for my call," no "Could I get 30 seconds?" These are status-lowering cliches. Sound different or sound invisible.

5. ULTRA-BREVITY
Spear-like delivery. Say less. Pause more. Get the prospect talking 95% of the time. Your job is to ask one sharp question, then listen. Emails: 50 words max. Voicemails: 15 seconds max. Cold calls: 90 seconds max.

6. AGREE WITH EVERYTHING
When they object, agree first. "That's fair." "Makes sense." Agreement is a weapon. It disarms fight-or-flight. Then redirect with ONE question. Never argue. Never explain. Never justify.

7. DETACH FROM THE OUTCOME
You are not desperate for this meeting. Your genuine curiosity about their situation is more valuable than any pitch. If they say no, that's fine. Detachment signals confidence.

8. BINARY ASKS ONLY
"Tuesday morning or Wednesday afternoon?" Give two specific options. Never open-ended. Never "Would you be interested?" Never "When works for you?" Two concrete slots. Then silence.

KILL LIST — NEVER USE THESE PHRASES:
"How are you doing today?" | "The reason for my call..." | "Could I get 30 seconds?" | "I'd love to..." | "I was hoping..." | "I appreciate your time" | "Sorry to bother you" | "Thanks for taking my call" | "I know you're busy" | "Do you have a minute?" | "This is a cold call" | "Just checking in" | "Just following up" | "Does that make sense?" | "Would you be open to..." | "I really appreciate..." | "I think you'll find it valuable"

EMAIL SUBJECT LINES: Always lowercase. No capitalization. Signals casual internal communication. Under 6 words.`

const FRAMEWORK_RULES: Record<FrameworkType, string> = {
  maniac_method: MANIAC_METHOD_RULES,
}

/* ─── Channel-Specific Output Schemas ─── */

const CHANNEL_SCHEMAS: Record<ChannelType, string> = {
  cold_call: `{
  "opener": "EXACTLY this format: '[PROSPECT FIRST AND LAST NAME]?' — said in an inquisitive tone. That's the entire opener. Just their name as a question. Nothing else. Wait for their response.",
  "pattern_interrupt": "After they respond, deliver this: 'Great. I know you weren't expecting my call, but real quick — [ONE QUESTION about whether they manage the relevant area, e.g. 'do you head up the team responsible for the enterprise video platform?' or 'are you the one managing your ServiceNow portal?']' This must be under 25 words after 'Great. I know you weren't expecting my call, but real quick —'. End with a question. Wait for response.",
  "value_statement": "Only if they engage. Measured pace. No excitement. State what's happening as fact, connect to their environment, frame it as exclusive. Under 40 words. Never start with 'I' or 'We'd love to.' Example structure: 'Good. We've been working with a few [industry/platform] customers on [use case] and there are some things we're showing at [event] that tie directly into what your team is running. Easier to walk through in person.'",
  "binary_ask": "Direct. Two options. Not a question about WHETHER they want to meet — a question about WHEN. Example: 'We've got availability Tuesday morning or Wednesday afternoon. Which works better for your team?' Never 'Would you like to meet?'",
  "closing_booked": "Confirm and get off the phone. Do not oversell the meeting you just booked. Example: 'Done. I'll send the calendar invite today. See you at [event], [NAME].' Under 15 words.",
  "closing_follow_up": "If they say follow up later. No pleading. State what you'll do. Example: 'Got it. I'll send the details and a couple of time options. Talk soon.' Under 15 words.",
  "closing_no": "If they say no. No guilt trip. Clean exit. Example: 'Fair enough. If anything changes, you've got my line. Take care.' Under 15 words.",
  "module_variants": {
    "ITSM": { "pattern_interrupt": "...", "value_statement": "..." },
    "HRSD": { "pattern_interrupt": "...", "value_statement": "..." },
    "CSM": { "pattern_interrupt": "...", "value_statement": "..." },
    "SecOps": { "pattern_interrupt": "...", "value_statement": "..." },
    "ServiceNow Portal": { "pattern_interrupt": "...", "value_statement": "..." }
  }
}

CRITICAL COLD CALL RULES:
- The opener is ONLY the prospect's name said as a question. Nothing else. No "Alex from Vbrick." Just "[First Last]?"
- After they respond, say "Great. I know you weren't expecting my call, but real quick —" then a qualifying question.
- The value statement references their specific ServiceNow module and a concrete use case.
- The binary ask gives exactly two time slots. Period.
- Three closing variants: booked, follow-up, and no. All under 15 words. All peer-to-peer.
- Total call: 90 seconds max.`,

  voicemail: `{
  "script": "15 seconds max when spoken aloud. Format: '[PROSPECT NAME], [BDR NAME] with [COMPANY]. We're a [PARTNER CREDENTIAL]. Quick one about [EVENT/TOPIC]. We're setting up meetings with a few [CUSTOMER TYPE], and [THEIR COMPANY] was on the list. I'll send details over email. [PHONE NUMBER].' That's it. No 'give me a call back.' No 'when you get a chance.' Peer to peer.",
  "duration_target": "15 seconds",
  "module_variants": {
    "ITSM": "GENERATE a complete 15-second voicemail that references video-enabled knowledge articles and reduced ticket volume. Not a description — an actual script.",
    "HRSD": "GENERATE a complete 15-second voicemail that references onboarding video libraries and HR training content. Not a description — an actual script.",
    "CSM": "GENERATE a complete 15-second voicemail that references video case resolution for customer service. Not a description — an actual script.",
    "SecOps": "GENERATE a complete 15-second voicemail that references secure, compliant enterprise video. Not a description — an actual script.",
    "ServiceNow Portal": "GENERATE a complete 15-second voicemail that references live town halls and broadcasts through the employee portal. Not a description — an actual script."
  }
}

CRITICAL: Each module_variant must be a COMPLETE voicemail script ready to read aloud, not a description of what the variant should reference. Follow the same format as the main script.

CRITICAL VOICEMAIL RULES:
- 15 seconds maximum. Count the words. If it takes more than 15 seconds to say aloud, it's too long.
- Same calm, neutral tone as a live call. No energy spike. No "Hey! This is..."
- Structure: Name, company, partner credential, purpose, next step. Done.
- Never say "give me a call back when you get a chance."`,

  email_sequence: `{
  "emails": [
    {
      "subject": "lowercase, no caps, under 6 words. Looks like an internal email, not marketing.",
      "body": "50 words MAXIMUM. No greeting. No 'Hi [Name].' No 'Hope you're well.' One observation about their situation, one ask. End with a binary choice (two specific options). No sign-off pleasantries. No 'Best,' or 'Thanks,' — just your name.",
      "send_day": 1,
      "purpose": "Initial spear — one specific observation about their environment + binary ask"
    },
    {
      "subject": "lowercase, under 6 words",
      "body": "50 words MAXIMUM. Reference the first email indirectly. New angle or proof point. Different value prop. Still ends with binary ask or soft next step.",
      "send_day": 3,
      "purpose": "Bridge — new angle, connects to proof, not a follow-up to email 1"
    },
    {
      "subject": "lowercase, under 6 words",
      "body": "50 words MAXIMUM. Final value drop. NOT a breakup email. No 'I haven't heard back' or 'Just checking in.' Offer something useful (resource, insight, specific data point). Leave door open.",
      "send_day": 7,
      "purpose": "Gift — high-value resource or insight, zero pressure"
    }
  ]
}

CRITICAL EMAIL RULES:
- 50 words MAXIMUM per email body. Count them. If it's 51 words, cut one.
- Subject lines: always lowercase. No capitalization at all. Under 6 words.
- No greetings. No "Hi [Name]," or "Hey [Name],". Start with the observation.
- No "Hope you're well" or "Hope this finds you well" or any variation.
- No "Just following up" or "Just checking in" — these are on the kill list.
- No sign-off pleasantries. No "Best," "Thanks," "Cheers," "Looking forward." Just your first name.
- Every email ends with a binary ask or a clear next step. Never open-ended.
- Emails should look like they were sent from a peer, not a marketing tool.`,

  linkedin: `{
  "connection_request": "Blank or under 10 words. No pitch. No company description. Creates curiosity. Higher acceptance rate.",
  "inmail": "Under 50 words. No greeting beyond their name. One observation about their company or ServiceNow environment, one specific ask. Binary choice. Same Maniac Method rules as email. No pleasantries.",
  "follow_up": "Under 25 words. Reference the connection. Peer-to-peer. No 'Thanks for connecting!' or 'Great to be in your network!' — those are status-lowering.",
  "video_inmail_script": "30-second script for a personalized video. Same calm, neutral tone. Reference one specific thing about their company. State what you'd walk them through. End with binary ask. Under 60 words."
}

CRITICAL LINKEDIN RULES:
- Connection request: blank is best. If you must write something, under 10 words.
- Never start InMail with "I came across your profile" or "I noticed you're in [role]" — these are what every other salesperson writes.
- No "I'd love to connect" or "Would love to pick your brain" — kill list phrases.
- Same peer-to-peer tone as every other channel.`,

  objection_handling: `{
  "objections": [
    {
      "objection": "The exact words the prospect says",
      "response": "AGREE FIRST. Use their words. 'That's fair.' 'Makes sense.' 'Sure.' Then ONE redirect — either a question or a brief statement + next step. Under 25 words.",
      "follow_up_question": "ONE question that reopens the conversation naturally. Low-threat. Genuine curiosity. No rebuttals, no features, no value dumps.",
      "reframe": "If they engage with the follow-up, how to pivot back to the meeting. Brief. Peer-to-peer. Under 20 words."
    }
  ]
}

Generate these EXACT 6 objections plus any campaign-specific ones:

1. "Can you just email me the details?"
   Response pattern: Agree, ask for email, then ask a low-threat question that reopens conversation about the event or their environment. Example: "Sure. What's the best email? ... Got it. While I have you, quick question — is [COMPANY] sending a team to [EVENT] this year or still deciding?"

2. "Not sure we're going to [event] this year."
   Response pattern: Validate. Pivot from event to business problem. "Makes sense. A lot of [customer type] are still figuring that out. Separate from [event], is [topic] something your team has looked at, or is that not on the radar right now?"

3. "We already have a video solution" / "We're good on video."
   Response pattern: "That's fine. How's that working out for you?" Full stop. Pause. Let them talk. Then follow-up: "Does it plug into ServiceNow natively, or is your team managing that separately?" This is the killer question — most video platforms don't integrate natively.

4. "I don't know [your company]. Who are you?"
   Response pattern: Three sentences max. Company description, partner credibility, social proof with one use case. Then redirect back to the ask. No 60-second company overview. No apologies for them not knowing you.

5. "I don't have time right now."
   Response pattern: Agree. Offer to send details and a tentative time. "Totally fine. I'll shoot over a quick summary and pencil in a tentative slot. If it doesn't work, we adjust."

6. "We're locked into a contract with another vendor."
   Response pattern: "That makes sense. When does that come up for review?" Genuine curiosity. If they give a date, offer to reconnect closer to that window.

CRITICAL OBJECTION RULES:
- ALWAYS agree first. Every single time. No exceptions.
- ONE question per objection. Not two. Not a question followed by a pitch. One question.
- Never argue. Never explain. Never justify. Never list features as a rebuttal.
- The prospect can feel your intent. Genuine curiosity works. Trying to "overcome" their objection does not.
- Silence after your question. Do not fill the gap. Let them talk.`,
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

  const system = `You are generating outbound sales messaging for a BDR team using The Maniac Method. This is not a suggestion — it is a strict framework. Every rule must be followed exactly.

${frameworkRules}

Your output must be valid JSON matching the exact schema provided. No markdown, no explanation, no preamble. Just the JSON object.

QUALITY CHECKS BEFORE RETURNING:
- Count every email body. If any exceed 50 words, rewrite until they don't.
- Check every opener, subject line, and response against the kill list. If any banned phrase appears, remove it.
- Verify cold call opener is ONLY the prospect's name as a question. Nothing else.
- Verify voicemail is 15 seconds when spoken aloud (roughly 35-40 words max).
- Verify every ask is binary (two specific options), never open-ended.
- Verify no subordinate language appears anywhere ("I'd love to," "I was hoping," "Would you be open to," etc.).

If the output violates any Maniac Method rule, it is unusable. Rewrite it until it doesn't.`

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

  const system = `You are personalizing campaign messaging for a specific contact using The Maniac Method.

${frameworkRules}

Take the base campaign messaging and customize it for this specific person. Reference their company name, title, ServiceNow module stack, and any relevant details. The output must feel like it was written specifically for them, not generated from a template.

CRITICAL: Maintain all Maniac Method rules in the personalized version. If the base content violates any rule, fix it in the personalized version. Word limits still apply. Kill list still applies. Peer-to-peer tone still applies.

Return a single string: the personalized script/message ready to use. No JSON wrapper needed.`

  const user = `CONTACT: ${contactName}
TITLE: ${contactTitle || 'Unknown'}
COMPANY: ${company}
MODULE STACK: ${moduleStack.length > 0 ? moduleStack.join(', ') : 'Unknown'}
${companySize ? `COMPANY SIZE: ${companySize}` : ''}
${industry ? `INDUSTRY: ${industry}` : ''}

BASE ${channelType.replace(/_/g, ' ').toUpperCase()} MESSAGING:
${baseContent}

Generate a personalized version for ${contactName} at ${company}. Make it specific to their modules (${moduleStack.join(', ') || 'general'}) and role (${contactTitle || 'decision maker'}). Follow every Maniac Method rule exactly.`

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
