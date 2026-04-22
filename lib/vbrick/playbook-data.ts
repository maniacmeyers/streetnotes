/**
 * Playbook content for the Vbrick BDR Command Center.
 * Each card maps to a training module. Content is static — no API needed.
 */

export interface PlaybookSection {
  heading: string
  body?: string
  items?: string[]
  script?: { label: string; lines: string[] }
  table?: { headers: string[]; rows: string[][] }
  tip?: string
}

export interface PlaybookCard {
  id: string
  title: string
  subtitle: string
  icon: string
  category: string
  sections: PlaybookSection[]
}

export const playbookCategories = [
  'Product Knowledge',
  'Outreach Strategy',
  'Conversation Fundamentals',
  'Call Execution',
  'Sales Mindset',
] as const

export const playbookCards: PlaybookCard[] = [
  // ─── PRODUCT KNOWLEDGE ────────────────────────────────────
  {
    id: 'what-vbrick-does',
    title: 'What Vbrick Does (2026 Positioning)',
    subtitle: 'The enterprise video intelligence layer',
    icon: 'Lightbulb',
    category: 'Product Knowledge',
    sections: [
      {
        heading: 'The One-Sentence Version',
        body: 'Vbrick is the enterprise video intelligence layer — it turns your company\'s video library and live streams into structured, queryable data that feeds AI agents like Copilot, Claude, Agentforce, and ServiceNow Now Assist.',
      },
      {
        heading: 'The Big Idea',
        body: '"Instead of sitting idle in storage, video libraries and live streams become active knowledge engines that power agentic workflows." — Vbrick CEO. Vbrick owns the end-to-end EVP category and reframes every competitor (Panopto, Kaltura, Brightcove) as a legacy storage play.',
      },
      {
        heading: 'Five Messaging Pillars',
        items: [
          'Multimodal AI — first EVP with facial recognition, now adding vision models and computer vision to analyze what is said and shown on screen',
          'Agentic integration via MCP — Vbrick\'s Model Context Protocol server connects video to Copilot, Claude, OpenAI, ServiceNow Now Assist, and Salesforce Agentforce',
          'Live + recorded intelligence — extends beyond VOD into live streams (CCTV, operational monitoring) for real-time sentiment, compliance, and safety intervention',
          'Global accessibility — audio translation across 100+ languages, including right-to-left, for international workforces',
          'Trust & governance — content credentials track origin and modifications; enterprise-grade security layered over AI innovation',
        ],
      },
      {
        heading: 'Who Buys Vbrick',
        body: 'Enterprise IT, security, and AI transformation leaders who already own Copilot, Agentforce, or ServiceNow investments and need video data to feed those agents. The Video at Work podcast series targets practitioners scaling video integration org-wide.',
      },
      {
        heading: 'Old Vbrick vs. New Vbrick (2026)',
        table: {
          headers: ['Old Vbrick', 'New Vbrick (2026)'],
          rows: [
            ['Enterprise video platform', 'Enterprise intelligence layer'],
            ['Streaming + VOD library', 'Active knowledge engine for AI agents'],
            ['Transcripts + search', 'Multimodal — vision + audio + context'],
            ['Standalone platform', 'MCP-connected to Copilot, Claude, Agentforce, ServiceNow'],
          ],
        },
        tip: 'The strategic tell: Vbrick is no longer selling video — they\'re selling the data substrate underneath every enterprise AI agent.',
      },
      {
        heading: 'Your 30-Second Pitch',
        script: {
          label: 'The Elevator Pitch',
          lines: [
            '"We\'re the enterprise video intelligence layer.',
            'Your video library becomes structured, queryable data that feeds whatever AI agents you\'re already running — Copilot, Claude, Agentforce, ServiceNow.',
            'Not a storage tool. A knowledge engine your agents plug into."',
          ],
        },
        tip: 'Test this on a colleague outside the video industry. If they get it, you\'re ready.',
      },
    ],
  },

  // ─── CONVERSATION FUNDAMENTALS ────────────────────────────
  {
    id: 'how-conversations-work',
    title: 'How Real Conversations Work',
    subtitle: 'Tone, status, and genuine curiosity',
    icon: 'MessageCircle',
    category: 'Conversation Fundamentals',
    sections: [
      {
        heading: 'The Foundation: Calm Energy',
        body: 'Good conversations are calm. Not rushed, not frantic, not desperate, not defensive. When you\'re calm, the prospect relaxes. When you\'re rushed, they feel pressured. When you\'re defensive, they get suspicious. Your energy sets the tone for the entire conversation.',
      },
      {
        heading: 'Tone Matters More Than Words',
        body: 'The same words land completely differently based on tone. "Is that something you\'re dealing with right now?" said with a voice that goes up at the end sounds needy. Said with a level, genuinely curious tone — it sounds confident. The words are identical. The impact is completely different.',
        tip: 'Think of it like sports. Nervous energy = tight muscles, rushed movements, mistakes. Calm confidence = smooth execution, good decisions, peak performance.',
      },
      {
        heading: 'The Status Problem',
        body: 'Lowering your status kills trust. When you position yourself as less important than the prospect, desperate for their time, or grateful they\'re even talking to you — they stop trusting you.',
        items: [
          '"I know you\'re super busy, so I\'ll be really quick..." — lowers status',
          '"Is this a good time? I don\'t want to bother you..." — lowers status',
          '"Can I just have 5 minutes? I promise it\'ll be worth it..." — lowers status',
          '"I\'d love to pick your brain if you have a second..." — lowers status',
        ],
        tip: 'If you don\'t value your own time, why should they? Enterprise buyers want to talk to peers, not beggars.',
      },
      {
        heading: 'The Peer-to-Peer Approach',
        body: 'You are allowed to ask direct questions. You\'re not bothering them. You\'re offering clarity.',
        items: [
          '"Is internal video breaking at scale something you\'re dealing with?"',
          '"Are you the right person to talk to about this, or should I connect elsewhere?"',
          '"Does this sound relevant, or should we not waste each other\'s time?"',
        ],
        tip: 'No apologies. No permission-seeking. No lowering status. Just direct, honest questions.',
      },
      {
        heading: 'The Confidence Paradox',
        body: 'The less you need the "yes," the more likely you get it. A desperate BDR needs the meeting, sounds needy, the prospect feels pressured, and says no. A confident BDR wants to find the truth, sounds curious, the prospect feels respected, and opens up. Chasing truth works better than chasing meetings.',
      },
      {
        heading: 'Real-World Examples',
        script: {
          label: 'Opening — Bad vs. Good',
          lines: [
            'BAD: "Hey, is this a good time? I know you\'re probably super busy, but I was hoping I could just get a few minutes to tell you about what we do..."',
            '',
            'GOOD: "We typically help companies when internal video starts breaking at scale. Is that something you\'re dealing with right now?"',
          ],
        },
      },
      {
        heading: 'Handling Objections',
        script: {
          label: 'Objection Response — Bad vs. Good',
          lines: [
            'BAD: "Wait, no, it\'s not like that! Let me explain why we\'re different..."',
            '',
            'GOOD: "Got it. Sounds like it\'s not a fit right now. Out of curiosity, is that because your current setup is working fine, or is video just not a priority?"',
          ],
        },
      },
      {
        heading: 'Closing',
        script: {
          label: 'Close — Bad vs. Good',
          lines: [
            'BAD: "So can we set up a time to talk? I have some slots open this week. Does Thursday work? Or Friday? Or I can do next week..."',
            '',
            'GOOD: "Based on what you\'re describing, it sounds like there might be a fit. Want to set up 15 minutes to explore that, or would you rather I just send some info?"',
          ],
        },
      },
      {
        heading: 'Pre-Call Tone Checklist',
        items: [
          'Am I calm?',
          'Am I speaking at a normal pace (not rushed)?',
          'Am I maintaining peer status (not apologizing)?',
          'Am I genuinely curious (not interrogating)?',
          'Am I okay with a "no" (not desperate for a "yes")?',
        ],
        tip: 'If you can\'t check all five boxes, don\'t make the call yet. Take a breath. Reset. Then dial.',
      },
    ],
  },
  {
    id: 'conversation-vs-demo',
    title: 'Conversation vs. Demo',
    subtitle: 'Start relationships, not presentations',
    icon: 'MessagesSquare',
    category: 'Conversation Fundamentals',
    sections: [
      {
        heading: 'The Demo Trap',
        body: 'A demo is a presentation. One-directional. The prospect sits back and watches. No discovery, no relationship, no urgency. Easy to cancel, easy to reschedule, easy to ghost.',
      },
      {
        heading: 'What a Real Conversation Is',
        items: [
          'Two-directional',
          'You learn something',
          'They learn something',
          'You establish yourself as a peer, not a vendor',
          'Conversations are harder to cancel because they feel personal',
        ],
        tip: 'Book a demo and you\'ve scheduled an event. Start a conversation and you\'ve started a relationship.',
      },
      {
        heading: 'Converting Demo Requests Into Conversations',
        body: 'When someone requests a demo, call them first instead of sending a Calendly link.',
        script: {
          label: 'The Redirect',
          lines: [
            '"Before I get you set up with a demo, I want to make sure we\'re showing you the right things. Can I ask you two quick questions?"',
            '',
            '1. "What\'s the main thing you\'re trying to solve right now?"',
            '2. "Who else on your team is involved in this decision?"',
          ],
        },
        tip: 'These two questions show you\'re not an order-taker, give you discovery info that makes the eventual demo more relevant, and reveal the buying committee so you can expand the pod.',
      },
      {
        heading: 'Handling "Just Send Me Information"',
        body: 'When a prospect says this, they\'re not asking for information — they\'re trying to end the conversation. Don\'t send a PDF.',
        script: {
          label: 'Your Response',
          lines: [
            '"I can do that. Before I do, help me understand what you\'re specifically trying to figure out — that way I can send you exactly what\'s relevant instead of a generic deck."',
          ],
        },
      },
      {
        heading: 'Handling "We\'re Just Exploring"',
        body: 'This is a gift — they\'re telling you they\'re in an early buying stage. Best time to establish yourself as the trusted resource.',
        script: {
          label: 'Your Response',
          lines: [
            '"Perfect timing then. Most of the best conversations I have are at the exploration stage — before people have locked into a direction. What\'s prompting the exploration?"',
          ],
        },
      },
      {
        heading: 'Conversation Scorecard',
        body: 'After every inbound response, score yourself:',
        table: {
          headers: ['Criteria', 'Target'],
          rows: [
            ['Responded within 5 minutes', 'Yes'],
            ['Asked what prompted their inquiry', 'Yes'],
            ['Identified who else is involved', 'Yes'],
            ['Avoided sending a generic deck or Calendly link first', 'Yes'],
            ['Expanded the pod by at least 3 new contacts', 'Yes'],
          ],
        },
        tip: 'Perfect score is 5/5. Consistently below 4/5? Review your response mechanics with your manager.',
      },
    ],
  },

  // ─── CALL EXECUTION ───────────────────────────────────────
  {
    id: 'simple-call-structure',
    title: 'A Simple Call Structure',
    subtitle: 'Four steps that eliminate uncertainty',
    icon: 'Phone',
    category: 'Call Execution',
    sections: [
      {
        heading: 'The Structure',
        body: 'Every cold call follows four steps:',
        items: [
          '1. Why you\'re reaching out',
          '2. The problem you often help with',
          '3. A direct question',
          '4. Accept the answer',
        ],
        script: {
          label: 'Example',
          lines: [
            '"We typically help companies when internal video starts breaking at scale.',
            'Is that something you\'re dealing with right now?"',
            '',
            'If they say no: "Got it. Then this probably isn\'t relevant."',
            '',
            'That\'s confidence.',
          ],
        },
      },
      {
        heading: 'Opening #1: Direct Qualification',
        script: {
          label: 'Script',
          lines: [
            '"[First] [Last]?"',
            '[Wait for confirmation]',
            '',
            '"Do you head up the team that handles [Company]\'s enterprise video?"',
            '',
            '[If YES]:',
            '"We help companies like [Similar Company] prevent video outages during town halls. When can we talk about whether that\'s relevant for you?"',
            '',
            '[If NO]:',
            '"Oh, okay. Hey, who might that be?"',
          ],
        },
      },
      {
        heading: 'Opening #2: Problem-First',
        script: {
          label: 'Script',
          lines: [
            '"[First] [Last]?"',
            '[Wait for confirmation]',
            '',
            '"Quick question — is internal video breaking at scale something you\'re dealing with right now?"',
            '',
            '[If YES]: "We typically help with that. When can we hop on a call?"',
            '[If NO]: "Got it. Then this probably isn\'t relevant. Appreciate your time."',
          ],
        },
      },
      {
        heading: 'Voicemail Template',
        script: {
          label: 'Mystery + Cliffhanger',
          lines: [
            '"Hey [Name], I\'ve got some ideas on how we could help you prevent video outages during company-wide events based on how we\'re helping [Their Largest Competitor].',
            'Let\'s find some time so I can share the why and the how.',
            'I\'ll follow up with a quick note."',
          ],
        },
        tip: 'Keep it under 20 seconds. Do not pitch in a voicemail.',
      },
      {
        heading: 'Key Principles',
        items: [
          'Pattern interrupt — Direct name confirmation breaks expectations',
          'No permission-based language — Never "Is this a good time?"',
          'Peer status — Confident, direct questions',
          'Accept the no — "Got it. Then this probably isn\'t relevant."',
        ],
        tip: 'This is like making a tackle — commit fully or don\'t go in at all.',
      },
      {
        heading: 'Lead with Problems, Not Features',
        body: '"We\'re a leading provider of blah blah blah." Your prospect checked out at "we\'re a leading..." Because your pitch is about you. No one cares.',
        items: [
          'Crap reps sell features.',
          'Good reps sell benefits.',
          'Pros lead with problems.',
        ],
      },
      {
        heading: 'The Problem Hierarchy',
        script: {
          label: 'Feature vs. Benefit vs. Problem',
          lines: [
            'FEATURE: "We have an AI-powered CRM with automated pipeline tracking."',
            '',
            'BENEFIT: "We\'ll help you close more deals and clean up your pipeline."',
            '',
            'PROBLEM: "Most sales managers I talk to say their reps hide behind email and LinkedIn instead of picking up the phone. Or they do call, but they\'re timid and never press an objection. Either way, the pipeline\'s a mess and growth is a coin flip."',
          ],
        },
        tip: 'Stop telling prospects what you do. Start naming what\'s broken in their world. When the problem lands, it\'s not a cold call anymore. It\'s a real conversation.',
      },
    ],
  },
  {
    id: 'live-work',
    title: 'Live Work: Execution Day',
    subtitle: 'Activity targets and block structure',
    icon: 'Target',
    category: 'Call Execution',
    sections: [
      {
        heading: 'Activity Targets',
        table: {
          headers: ['Channel', 'Minimum', 'Stretch'],
          rows: [
            ['Cold Calls', '100', '200'],
            ['Emails', '20', '50'],
            ['LinkedIn Messages', '10', '20'],
            ['Video Messages', '2', '5'],
          ],
        },
        tip: 'Success = hitting activity numbers. Responses are bonus.',
      },
      {
        heading: 'Pre-Work: Set Up for Success (30 min)',
        items: [
          'Build target list (50-100 accounts from Salesforce)',
          'Prepare tools (Salesforce, LinkedIn, email templates, call script)',
          'Set environment (close distractions, silence phone, water bottle)',
          'Get into state (10 deep breaths, shoulders back, "Go for the no")',
        ],
      },
      {
        heading: 'The Cold Calling Block (60-90 min)',
        body: 'Structure for each call:',
        items: [
          '1. Dial number',
          '2. Pattern interrupt: "[BDR first name] with Vbrick — I was hoping you could help me out."',
          '3. Value: "We help enterprises reduce video streaming costs by 40%."',
          '4. Qualification: "Are you on the team that handles enterprise video?"',
          '5. If yes: Brief conversation, book meeting',
          '6. If no: "Who might that be?" → "May I tell [first name] you said hi?"',
          '7. Log in Salesforce immediately',
          '8. Next call',
        ],
        tip: 'Pacing: 3-5 minutes per call. Break every 10 calls.',
      },
      {
        heading: 'Common Objections',
        items: [
          '"We\'re all set" → "Got it. What are you using now?"',
          '"Send me an email" → "Happy to. Quick question — are you the right person making decisions?"',
          '"Not interested" → "No problem. Is it timing, or is video just not a priority?"',
        ],
      },
      {
        heading: 'The Email Block (60 min)',
        body: 'Use the SPEARS format:',
        script: {
          label: 'SPEARS Email Template',
          lines: [
            'Subject: [First Name] - [Specific Observation]',
            '',
            '[First Name],',
            '',
            '[Specific observation about their company].',
            '',
            'We help [companies like yours] [outcome]. [Brief case study].',
            '',
            'Worth a quick conversation?',
            '',
            '[Your Name]',
          ],
        },
        tip: 'Pacing: 2-3 minutes per email. 20 emails = 40-60 minutes.',
      },
      {
        heading: 'The LinkedIn Block (45 min)',
        script: {
          label: 'Connection Request (max 300 characters)',
          lines: [
            '[Name] - noticed [observation]. We help [companies like yours] [outcome]. Worth connecting?',
          ],
        },
        tip: 'Pacing: 4-5 minutes per prospect. 10 messages = 40-50 minutes.',
      },
      {
        heading: 'Managing Energy',
        items: [
          'Start with calls (highest energy required)',
          'Move to emails (medium energy)',
          'Finish with LinkedIn (lowest energy)',
          'Take 5-minute breaks every hour',
        ],
      },
      {
        heading: 'End-of-Day Checklist',
        items: [
          'Hit minimum activity targets',
          'Logged all activities in Salesforce',
          'Updated real-time tracking sheet',
          'Scheduled follow-ups for tomorrow',
          'Reviewed wins and learnings',
        ],
      },
    ],
  },

  // ─── OUTREACH STRATEGY ────────────────────────────────────
  {
    id: 'triple-play',
    title: 'The Triple Play: 2-Week Trigger Event Outreach',
    subtitle: '3 touches, 3 channels, 2 weeks — for Fortune 500 trigger-event accounts',
    icon: 'Layers',
    category: 'Outreach Strategy',
    sections: [
      {
        heading: 'The Golden Rule',
        body: '3 touches, 3 channels, 5 minutes per touch. No breakup emails. Ever.',
      },
      {
        heading: 'Sequence at a Glance',
        table: {
          headers: ['Touch', 'Week 1 (The Entry)', 'Week 2 (The Proof)'],
          rows: [
            ['1', 'LinkedIn connection request (blank)', 'LinkedIn DM / InMail with personalized video'],
            ['2', 'Initial email via Outreach', 'Follow-up email via Outreach'],
            ['3', 'Cold call via Intelligence App', 'Cold call via Intelligence App'],
          ],
        },
        tip: 'Week 1 establishes presence. Week 2 differentiates with personalization and video.',
      },
      {
        heading: 'Tools and Roles',
        table: {
          headers: ['Tool', 'Role'],
          rows: [
            ['GTM Intelligence Dashboard', 'Trigger events, script generation, stakeholder intel, CSV upload, real-time coaching, voice debrief'],
            ['LinkedIn Sales Navigator', 'Contact discovery via Boolean title searches; 3-list pipeline'],
            ['LinkedIn', 'Connection requests (Week 1); DMs / InMails with video (Week 2)'],
            ['Outreach', 'Email sequencing, send tracking, automated follow-ups'],
            ['Salesforce', 'CRM logging and source of truth'],
          ],
        },
      },
      {
        heading: 'The Pod Sequence — 25+ Contacts per Account',
        body: 'For every target account, build a pod of 25+ contacts using three Boolean searches in Sales Navigator. Set seniority filter to Director, VP, CXO, Owner, Partner.',
        items: [
          'Search 1 — IT & Technology Leaders: CIO OR "Chief Information Officer" OR CTO OR "Chief Technology Officer" OR "VP of IT" OR "IT Director" OR "Enterprise Applications" OR "Unified Communications" OR "Network Director" OR "Enterprise Architect" OR "IT Manager"',
          'Search 2 — Communications & HR Leaders: "Internal Communications" OR "Corporate Communications" OR "Employee Communications" OR "Employee Engagement" OR CHRO OR "VP of HR" OR "Learning and Development" OR "L&D" OR "Training Director" OR "HR Technology"',
          'Search 3 — Marketing & Executive Leaders: CMO OR "Chief Marketing Officer" OR "VP of Marketing" OR "Digital Marketing" OR "Content Marketing" OR "Video Production" OR CEO OR COO OR "Chief Digital Officer"',
        ],
        tip: 'Save all contacts to the "1 - To Prospect" list. If under 25, temporarily loosen the seniority filter or try alternate title variants.',
      },
      {
        heading: 'Contact Tiering',
        table: {
          headers: ['Tier', 'Who', 'Count', 'Why'],
          rows: [
            ['Tier 1', 'C-suite and VPs tied directly to the trigger event', '5-8', 'Decision-makers who feel the pain'],
            ['Tier 2', 'Directors and senior managers in IT, Comms, HR', '8-10', 'Evaluators and champions who touch the tools daily'],
            ['Tier 3', 'Adjacent leaders in Marketing, Facilities, L&D', 'Rest', 'Expansion contacts for multi-threading the account'],
          ],
        },
      },
      {
        heading: 'Triple Play Timing Chart',
        table: {
          headers: ['Day', 'Activity', 'Tool', 'Time'],
          rows: [
            ['Mon (W1)', 'Blank LinkedIn connection requests — all Tier 1 & 2', 'Sales Nav', '20 min'],
            ['Tue-Wed (W1)', 'Initial personalized emails — Tier 1 first, then Tier 2', 'Outreach + Intel App', '30-45 min'],
            ['Wed-Thu (W1)', 'Cold calls — Tier 1 first, no voicemails', 'Intel App + SF', '60-90 min'],
            ['Fri (W1)', 'Review results: opens, clicks, acceptances. Plan Week 2.', 'SF + Outreach + LI', '20 min'],
            ['Mon (W2)', 'Record + send personalized video DMs/InMails', 'LinkedIn + Vidyard/Loom', '45-60 min'],
            ['Tue-Wed (W2)', 'Follow-up emails via Outreach', 'Outreach + Intel App', '20-30 min'],
            ['Wed-Thu (W2)', 'Cold calls (reference video + email). Voicemail OK under 30s.', 'Intel App + SF', '60-90 min'],
            ['Fri (W2)', 'Wrap-up: log everything, update lists, categorize outcomes', 'SF + Sales Nav + Dashboard', '30 min'],
          ],
        },
      },
      {
        heading: 'Week 1 — The Entry',
        items: [
          'Connection requests: ALWAYS blank. Your profile does the selling, and blank requests convert higher.',
          'Initial email: lowercase subject, no greeting, under 40 words, one observation + one ask. Send 7-8:30 AM or 4-5:30 PM prospect local time.',
          'Cold calls: reference the trigger event on-screen before dialing. Under 2 minutes. Ask for a 15-minute meeting.',
          'NO voicemails in Week 1. Hang up if no answer — voicemails reduce callback rates on cold outreach.',
          'After every call: use voice debrief to record a 30-second outcome summary in the Intel App.',
        ],
      },
      {
        heading: 'Week 2 — The Proof',
        items: [
          'Personalized video DM/InMail (30-45 sec): their name, the trigger event, one specific VBrick value point for their role. Upload to Vidyard/Loom; paste link into LinkedIn.',
          'Accepted your Week 1 connection? DM them. Did not accept? InMail them — InMails show the video thumbnail and convert better on cold.',
          'Follow-up email: reference previous touches ("I reached out last week about [trigger event]"). Still under 40 words. End with a binary ask.',
          'Cold call: reference the video and email ("I sent you a video on LinkedIn earlier — wanted to put a voice to the name."). Brief voicemail under 30 seconds is allowed in Week 2.',
        ],
      },
      {
        heading: 'Transition Matrix — Week 1 to Week 2',
        table: {
          headers: ['Signal', 'Week 2 Action'],
          rows: [
            ['Meeting booked', 'STOP sequence. Prep for meeting.'],
            ['Positive reply', 'Respond directly. Do NOT continue automated sequence.'],
            ['Connection accepted', 'Send personalized video DM (Touch 1 of Week 2).'],
            ['Email opened 3+', 'Accelerate: send follow-up email sooner.'],
            ['No response', 'Execute standard Week 2 Triple.'],
            ['Email bounced', 'Find alternate email via Intel App. Re-send.'],
            ['Connection rejected', 'Skip LinkedIn DM. Focus on email + call only.'],
          ],
        },
      },
      {
        heading: 'Post-Sequence Outcomes',
        table: {
          headers: ['Outcome', 'Next Step'],
          rows: [
            ['Meeting booked', 'Prep discovery call. Generate account plan from Intel Dashboard. Export to Salesforce.'],
            ['Positive reply (no meeting yet)', 'Respond within 2 hours. Offer specific times.'],
            ['Engaged but not ready', 'Add to monthly nurture sequence. Monitor for new trigger events.'],
            ['No response after 6 touches', 'Add to long-term nurture (quarterly). Do NOT send a breakup email.'],
          ],
        },
      },
      {
        heading: 'Top 10 Failure Points',
        items: [
          'Sending a connection request with a note → Always blank. Your profile does the selling.',
          'Sending a breakup email → Never. Add to nurture. Circle back on next trigger.',
          'Not logging activity in Salesforce → Log immediately after each touch. Use Outreach auto-sync.',
          'Using generic scripts not from the Intel App → Always pull trigger-specific scripts.',
          'Calling without reviewing the trigger → Spend 60 seconds on the finding before every call.',
          'Emails over 40 words → Edit ruthlessly. One question, one value point.',
          'Waiting too long between Week 1 and Week 2 → Start Week 2 exactly 7 days after Week 1 Day 1.',
          'Skipping the Week 2 video → 95% of BDRs skip it. This is your #1 differentiator.',
          'Skipping the voice debrief → It takes 30 seconds and preserves critical context.',
          'Not checking email open data before Week 2 → Always review opens/clicks on Friday of Week 1.',
        ],
      },
      {
        heading: 'Salesforce Logging Protocol',
        table: {
          headers: ['Activity', 'SF Subject', 'Required Details'],
          rows: [
            ['LinkedIn connection request', 'LI Connect Sent', 'Date, contact, status (Sent)'],
            ['Email (initial)', 'Email - Week 1', 'Date, contact, subject, sequence step'],
            ['Cold call', 'Call - Week [1/2]', 'Date, contact, outcome (No Answer / VM / Spoke / Meeting)'],
            ['LinkedIn DM/InMail', 'LI Video DM - Week 2', 'Date, contact, video link, DM vs InMail'],
            ['Email (follow-up)', 'Email - Week 2', 'Date, contact, subject, sequence step'],
            ['Meeting booked', 'Event + Opportunity (Discovery)', 'Date/time, attendees, agenda'],
          ],
        },
        tip: 'Every single touch gets logged. No exceptions. This is how pipeline is attributed and performance is measured.',
      },
      {
        heading: 'Key Reminders',
        items: [
          'Connection requests: ALWAYS blank',
          'Emails: Under 40 words, lowercase subject, no greeting',
          'Calls Week 1: No voicemail. Hang up.',
          'Calls Week 2: Brief voicemail OK (under 30 seconds)',
          'Video DM/InMail: 30-45 seconds, personalized, reference trigger',
          'NEVER send a breakup email',
          'Log EVERY touch in Salesforce immediately',
          'Goal per account: 25+ contacts, 6 touches per Tier 1 over 2 weeks',
          'Email send windows (prospect local time): 7:00-8:30 AM or 4:00-5:30 PM',
        ],
      },
    ],
  },

  // ─── SALES MINDSET ────────────────────────────────────────
  {
    id: 'go-for-the-no',
    title: 'Go for the No',
    subtitle: 'Invite rejection. Get more yes.',
    icon: 'ShieldCheck',
    category: 'Sales Mindset',
    sections: [
      {
        heading: 'The Paradox',
        body: 'When you\'re comfortable with "no," prospects feel it. They relax. They give you honest answers. And ironically, you get more "yes" responses. Because you\'re not pressuring them. You\'re offering them an easy out. That makes them want to stay in the conversation.',
      },
      {
        heading: 'Most BDRs vs. You',
        table: {
          headers: ['Most BDRs', 'You'],
          rows: [
            ['Avoid giving prospects an easy out', 'Actively invite "no"'],
            ['Keep pushing for "yes"', 'Make it easy to say "not interested"'],
            ['Make prospects feel trapped', 'Prospects feel respected'],
            ['Prospects shut down or ghost', 'Prospects open up'],
          ],
        },
      },
      {
        heading: 'What It Sounds Like — On a Call',
        script: {
          label: 'Example',
          lines: [
            '"Based on what you\'re describing, it sounds like this might not be relevant right now. Should we just call it here, or is there something I\'m missing?"',
          ],
        },
        tip: 'Gives them permission to end the call. Shows you\'re not desperate. Often prompts them to say "No wait, let me explain..."',
      },
      {
        heading: 'What It Sounds Like — In an Email',
        script: {
          label: 'Example',
          lines: [
            '"If this isn\'t a priority, totally get it. Should I stop following up, or is there a better time to check back?"',
          ],
        },
        tip: 'Respects their time. Forces a real answer (not a ghost). Either they say "stop" or they engage.',
      },
      {
        heading: 'What It Sounds Like — After an Objection',
        script: {
          label: 'Example',
          lines: [
            '"Got it. Sounds like you\'re all set with your current setup. Should I just take you off my list, or is there a scenario where this might be relevant down the road?"',
          ],
        },
        tip: 'Accepts their objection without arguing. Keeps the door open for the future.',
      },
      {
        heading: 'The Athlete Mindset',
        body: 'Hesitant players lose. They\'re afraid to make mistakes, play safe, don\'t make the big plays. Confident players win. They commit fully, aren\'t afraid to fail, make the plays that matter. Sales is the same. If you\'re afraid of "no," you\'ll hesitate. If you embrace "no," you\'ll be confident. Confidence wins.',
      },
      {
        heading: 'Common Mistakes',
        items: [
          'Sounding passive-aggressive: "Well, if you\'re not interested, I guess I\'ll just leave you alone then..." — sounds bitter. Instead: "Got it. Should I check back in Q3, or would you prefer I don\'t follow up?"',
          'Giving up too early: "Okay, no problem. Have a great day!" and never following up — you didn\'t learn anything. Instead: "Out of curiosity, is that because you\'re handling this internally, or is video just not a priority right now?"',
          'Arguing after they say no: "But wait, you didn\'t let me explain why we\'re different..." — you invited the no, then argued with it. That\'s manipulative. Instead: "Fair enough. Appreciate your time."',
        ],
      },
      {
        heading: 'What Happens When You Master This',
        items: [
          'Prospects relax — they stop feeling pressured and give you real answers',
          'You get faster feedback — no more ghosting, they either engage or tell you',
          'You sound more confident — because you\'re not desperate for a "yes"',
          'You build better relationships — even when they say no, they respect you',
          'You get more "yes" responses — because you\'re not chasing. Paradox.',
        ],
      },
      {
        heading: 'Your Commitment',
        body: 'Starting today:',
        items: [
          'I will invite "no" in every conversation',
          'I will not argue when someone says "not interested"',
          'I will respect their answer and move on',
          'I will use "no" as information, not failure',
        ],
        tip: 'The BDRs who are afraid of "no" get ghosted. The BDRs who invite "no" get real conversations. Which one do you want to be?',
      },
    ],
  },
]
