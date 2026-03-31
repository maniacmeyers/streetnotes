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
  'Conversation Fundamentals',
  'Call Execution',
  'Outreach Strategy',
  'Sales Mindset',
] as const

export const playbookCards: PlaybookCard[] = [
  // ─── PRODUCT KNOWLEDGE ────────────────────────────────────
  {
    id: 'what-vbrick-does',
    title: 'What Vbrick Does (Plain English)',
    subtitle: 'The core value prop without jargon',
    icon: 'Lightbulb',
    category: 'Product Knowledge',
    sections: [
      {
        heading: 'The One-Sentence Version',
        body: 'Vbrick helps large organizations use video internally without breaking their network or risking security.',
      },
      {
        heading: 'When Things Break at Scale',
        body: 'Most companies use Teams, Zoom, or Webex for small-scale video. These break when 5,000+ employees join at once — network gets crushed, buffering and lag everywhere, some employees can\'t connect, IT gets flooded with tickets. Vbrick delivers smooth CDN delivery with no congestion. Everyone watches without issues.',
      },
      {
        heading: 'When Security and Compliance Matter',
        body: 'Think healthcare: 20,000 employees need HIPAA compliance training. They need encrypted, access-controlled, audit-logged, regulation-compliant video. Consumer tools have security gaps, compliance risks, and legal exposure. Vbrick provides enterprise-grade security, full compliance controls, and audit trails for everything.',
      },
      {
        heading: 'When Bandwidth Is Limited',
        body: 'Global companies with remote offices on expensive, limited bandwidth. Regular video eats all available bandwidth, other apps slow down, productivity tanks. Vbrick uses adaptive bitrate streaming and bandwidth optimization — video works without killing the network.',
      },
      {
        heading: 'The Real Problem We Solve',
        body: 'It\'s not about features. It\'s about risk. Companies come to us when:',
        items: [
          'Their CEO town hall crashed last quarter',
          'They got flagged in a compliance audit',
          'Their network can\'t handle video at scale',
          'They\'re worried about the next big event failing',
        ],
      },
      {
        heading: 'Who Needs Vbrick',
        body: 'Companies that DO need us:',
        items: [
          'Enterprise (5,000+ employees)',
          'Global organizations',
          'Highly regulated industries (healthcare, finance, government)',
          'Companies with frequent CEO/leadership broadcasts',
          'Organizations with bandwidth constraints',
        ],
        tip: 'Companies under 500 employees or without large-scale internal video needs are NOT our market.',
      },
      {
        heading: 'Handling Common Misconceptions',
        items: [
          '"Isn\'t this just YouTube for companies?" — YouTube isn\'t secure enough for internal content, doesn\'t integrate with enterprise systems, and doesn\'t handle live broadcasts at enterprise scale.',
          '"Can\'t they just use Teams?" — Teams breaks at 10,000+ concurrent viewers, doesn\'t have enterprise video management features, and isn\'t optimized for bandwidth-constrained environments.',
          '"Sounds expensive. Is it worth it?" — Compare the cost to a failed CEO town hall, a compliance violation, or lost productivity from network outages. For the right companies, it\'s a no-brainer.',
        ],
      },
      {
        heading: 'How to Think About It',
        body: 'Vbrick is insurance + infrastructure. Insurance: your CEO broadcast won\'t fail, your compliance audit won\'t flag video, your network won\'t crash. Infrastructure: reliable video delivery at any scale, secure storage and management, integration with existing enterprise systems.',
      },
      {
        heading: 'The Elevator Pitch',
        script: {
          label: 'Your 30-Second Pitch',
          lines: [
            '"We help large companies use video internally without breaking their network or risking security.',
            'Think CEO town halls, training videos, global broadcasts — stuff that needs to work for thousands of people at once.',
            'Teams and Zoom break at that scale. We don\'t."',
          ],
        },
        tip: 'Test this on a friend or family member who doesn\'t work in tech. If they get it, you\'re ready.',
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
            ['Cold Calls', '20', '50'],
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
          '2. Pattern interrupt: "Hey [Name], this is [Your Name] from Vbrick — I know you weren\'t expecting my call."',
          '3. Value: "We help enterprises reduce video streaming costs by 40%."',
          '4. Qualification: "Do you head up the team that handles enterprise video?"',
          '5. If yes: Brief conversation, book meeting',
          '6. If no: "Who might that be?"',
          '7. Log in Salesforce immediately',
          '8. Next call',
        ],
        tip: 'Pacing: 3-5 minutes per call. 20 calls = 60-90 minutes. Break every 10 calls.',
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
    title: 'The Triple Play: Your Outreach Sequence',
    subtitle: 'Three channels, 48 hours, impossible to ignore',
    icon: 'Layers',
    category: 'Outreach Strategy',
    sections: [
      {
        heading: 'What Is the Triple Play?',
        body: 'A coordinated, multi-touch outreach sequence that hits a prospect across three channels in rapid succession. The goal is not to overwhelm — it is to be impossible to ignore. One touch is easy to miss. Three touches across three channels in 48 hours creates pattern interruption.',
        items: [
          '1. Phone call (with voicemail if no answer)',
          '2. Email (sent within 5 minutes of the call)',
          '3. LinkedIn message (sent within 24 hours of the email)',
        ],
      },
      {
        heading: 'Touch 1 — The Call (Day 1, within 5 min of inbound)',
        body: 'Call the person who submitted the inbound immediately. If they answer, do not go into pitch mode.',
        script: {
          label: 'If They Answer',
          lines: [
            '"Hey [Name], this is [Your Name] from Vbrick. I saw you reached out — I wanted to call you directly instead of sending an automated email. What\'s going on on your end?"',
            '',
            'Let them talk. Your job is to understand the context, not to sell.',
            'Ask: What prompted them to reach out? What are they trying to solve? Who else is involved?',
          ],
        },
      },
      {
        heading: '',
        script: {
          label: 'If Voicemail',
          lines: [
            '"Hey [Name], [Your Name] at Vbrick. Saw your note come through — wanted to call you directly.',
            'I\'ll shoot you a quick email, but if it\'s easier, my direct line is [number]. Talk soon."',
          ],
        },
        tip: 'Keep it under 20 seconds. Do not pitch in a voicemail.',
      },
      {
        heading: 'Touch 2 — The Email (Day 1, within 5 min of call)',
        body: 'Send a short, direct email immediately after the call. Do not use a template that looks like a template. Write it like a human.',
        script: {
          label: 'Email Script',
          lines: [
            'Subject: Re: your Vbrick inquiry',
            '',
            '[Name],',
            '',
            'Just tried you — left a voicemail. Wanted to reach out directly rather than send you a form confirmation.',
            '',
            'Quick question: what\'s driving the interest right now? Is this a current project or more exploratory?',
            '',
            'Either way, happy to have a real conversation — not a demo pitch. Just want to understand what\'s going on.',
            '',
            '[Your Name]',
            '[Direct line]',
          ],
        },
        tip: 'This email does NOT include a Calendly link, does NOT say "I\'d love to schedule 30 minutes," does NOT attach a product brochure. It asks one question and invites a reply.',
      },
      {
        heading: 'Touch 3 — LinkedIn Message (Day 2)',
        body: 'Connect on LinkedIn with a short note. If already connected, send a DM.',
        script: {
          label: 'LinkedIn Message',
          lines: [
            '"Hey [Name] — tried you yesterday by phone and email. Saw your inquiry come through and wanted to connect directly. No pitch — just wanted to understand what you\'re working on. Happy to chat whenever."',
          ],
        },
      },
      {
        heading: 'The Pod Sequence',
        body: 'After completing the Triple Play on Tier 1 contacts, begin the sequence on Tier 2 contacts on Day 3. Do not wait for Tier 1 to respond before starting Tier 2. You are running parallel threads across the account.',
        tip: 'The goal is not to get one person on a call. The goal is to create multiple conversations across the buying committee simultaneously.',
      },
      {
        heading: 'Triple Play Timing Chart',
        table: {
          headers: ['Day', 'Action'],
          rows: [
            ['Day 1 (within 5 min)', 'Call + voicemail to inbound contact'],
            ['Day 1 (within 5 min of call)', 'Email to inbound contact'],
            ['Day 2', 'LinkedIn message to inbound contact'],
            ['Day 3', 'Start Triple Play on Tier 2 (HR, Comms, L&D)'],
            ['Day 5', 'Follow-up call to inbound if no response'],
            ['Day 7', 'Start Triple Play on Tier 3 (executive sponsors)'],
            ['Day 10', 'Final breakup email to non-responders'],
          ],
        },
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
