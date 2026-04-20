/**
 * VBRICK BDR Cold Call Framework Training Module
 * 
 * This module implements the specific call framework VBRICK BDRs use:
 * 
 * FRAMEWORK STEPS:
 * 1. Get First & Last Name: "Great, I was hoping you could help me out."
 * 2. Qualify: "Are you on the team responsible for [company's] X?"
 *    - If YES: "The reason I'm calling is Y"
 *    - If NO: "Oh, sorry about that. Who do you feel the best person to speak with about Y is?"
 *    - Then: "Thanks so much! May I tell her hi for you?"
 * 
 * ACCENT CONSIDERATIONS:
 * - Irish accent (BDR 1): Fast, musical intonation, tends to drop final consonants
 * - New Zealand accent (BDR 2): Flat vowels, "i" sounds like "u", fast speech
 * 
 * WHISPER handles both well, but we implement accent-aware coaching tips
 */

import { type ProspectPersona } from './sparring-personas'

export const BDR_CALL_FRAMEWORK = {
  name: 'VBRICK Discovery Framework',
  steps: [
    {
      id: 'name_capture',
      order: 1,
      name: 'Name Capture',
      objective: 'Get first and last name, establish friendly tone',
      script: "First and last name? (inquisitive tone)",
      transition: "Great, I was hoping you can help me out real quick.",
      note: "After they say their name, say 'Great, I was hoping you can help me out real quick'. Then move to qualification.",
      successCriteria: [
        'Got full name',
        'Friendly tone established',
        'No resistance to giving name'
      ],
      coachingTips: {
        irishAccent: [
          'Slow down slightly - Irish accents can blur words together',
          'Emphasize consonants at word endings (dropped in Irish accent)',
          'Example: "Ver-brick" not "Veh-brih"'
        ],
        newZealandAccent: [
          'Flatten the "i" sounds - "VBRICK" not "VBRUCK"',
          'Slow down initial company name pronunciation',
          'Practice: "six" should sound like "six" not "sux"'
        ]
      }
    },
    {
      id: 'qualification',
      order: 2,
      name: 'Qualification Question',
      objective: 'Identify if they own the video/streaming responsibility',
      script: "Are you on the team responsible for {company}'s {x}?",
      variables: {
        x: [
          'video communications',
          'internal streaming platform',
          'employee communications video',
          'all-hands meetings and events',
          'enterprise video strategy',
          'virtual events platform'
        ]
      },
      successCriteria: [
        'Clear yes/no or transfer',
        'Identified the right person if not them',
        'Maintained friendly, helpful tone'
      ],
      coachingTips: {
        irishAccent: [
          'Be careful with "responsible" - Irish accent can make it sound like "reh-SPON-sibul"',
          'Pause after company name for clarity',
          'Practice: "video" has clear V sound, not "wideo"'
        ],
        newZealandAccent: [
          'Emphasize "team" - can sound like "tum"',
          'Slow down "responsible" - complex word',
          'Make {x} very clear - this is the key qualification'
        ]
      }
    },
    {
      id: 'yes_path',
      order: 3,
      name: 'Yes Path - Reason for Call',
      when: 'When they say YES to qualification',
      objective: 'Deliver value prop relevant to their role',
      script: "Great, the reason I'm calling is because {y}",
      valueProps: {
        it_manager: 'we help IT teams consolidate their video platforms into one secure, manageable system - eliminating the bandwidth and support headaches',
        cto: 'we provide an API-first video platform that your engineering team can integrate, while marketing gets their live streaming',
        cfo: 'we help companies reduce their video vendor spend by 30-40% by consolidating overlapping contracts',
        exec_assistant: 'we power executive communications with broadcast-quality town halls that work for 50,000+ employees',
        ciso: 'we provide enterprise-grade security with complete audit trails and data residency controls for regulated industries',
        legal: 'we offer comprehensive eDiscovery, legal hold, and retention policy automation for all video content',
        procurement: 'we consolidate video spend with transparent public-sector pricing and multi-year rate locks',
        general: 'we help enterprise teams deliver secure, high-quality video communications at scale'
      },
      successCriteria: [
        'Delivered relevant value prop',
        'Connected to their pain points',
        'Opened door for discovery'
      ],
      coachingTips: {
        irishAccent: [
          'Clear separation: reason - I\'m - calling',
          'Emphasize quantifiable benefits (percentages, dollar amounts)',
          'Watch "calling" - can sound rushed as "cawlin"'
        ],
        newZealandAccent: [
          'Careful with "reason" - can sound like "ruseon"',
          'Stress dollar amounts: "thirty percent" clear, not "thutty"',
          'End with upward inflection? No - keep it statement'
        ]
      }
    },
    {
      id: 'no_path',
      order: 3,
      name: 'No Path - Redirect',
      when: 'When they say NO to qualification',
      objective: 'Get referral to right person, gather intelligence',
      script: "Who do you feel would be the best person to speak with about {x}?",
      fallback: "Would you mind pointing me in their direction?",
      bridge: "Thanks! May I tell them hello from you?",
      note: "No 'oh sorry!' - go directly into the redirect question. Then use the bridge to ask permission to name-drop.",
      successCriteria: [
        'Got name of right contact',
        'Maintained rapport (didn\'t burn bridge)',
        'Got permission to use their name'
      ],
      coachingTips: {
        irishAccent: [
          '"Sorry" should sound sympathetic, not rushed',
          'Clear Enunciation: "person to speak with" - each word distinct',
          '"Who do you feel" - make it genuine, not scripted'
        ],
        newZealandAccent: [
          '"Sorry" - careful not to sound flat/apologetic',
          'Practice: "speak" should have clear long E, not "spick"',
          'Emphasize "best person" - shows respect for their opinion'
        ]
      }
    },
    {
      id: 'bridge',
      order: 4,
      name: 'Bridge / Permission',
      objective: 'Build rapport, get permission to name-drop',
      script: "Thanks! May I tell them hello from you?",
      variants: [
        "Thanks so much! May I tell {name} you said hello?",
        "I really appreciate that. Can I mention you connected me?",
        "Thank you! Is it okay if I let them know you pointed me their way?"
      ],
      successCriteria: [
        'Got permission to name-drop',
        'Left positive impression',
        'Created warm intro opportunity'
      ],
      coachingTips: {
        irishAccent: [
          '"Thanks so much" - emphasize gratitude, can sound casual otherwise',
          '"Tell her hi" - clear H sound, not dropped',
          'Warmth in tone is key - Irish accent carries this naturally'
        ],
        newZealandAccent: [
          '"Thanks" - flat vowel, add warmth through pitch not tone',
          '"Tell her" - clear "h" in "her", can disappear',
          'Upward inflection on question should be subtle'
        ]
      }
    }
  ]
}

// Framework scoring rubric specifically for this call structure
export const FRAMEWORK_SCORING_RUBRIC = {
  // Did they follow the framework steps?
  framework_adherence: {
    weight: 0.30,
    criteria: [
      'Captured first and last name with friendly opener',
      'Asked qualification question clearly',
      'Pivoted correctly based on yes/no response',
      'Attempted bridge/permission step'
    ]
  },
  
  // Accent clarity - are they compensating well?
  accent_clarity: {
    weight: 0.15,
    criteria: [
      'Spoke at appropriate pace for clarity',
      'Enunciated key words (VBRICK, responsible, video)',
      'Used pauses effectively',
      'Compensated for accent with clear structure'
    ],
    irishSpecific: [
      'Didn\'t drop final consonants',
      'Separated words clearly',
      'Didn\'t rush the musical flow'
    ],
    newZealandSpecific: [
      'Flattened vowels appropriately managed',
      'Made "i" sounds clear: video, think, platform',
      'Avoided upward inflection on statements'
    ]
  },
  
  // Standard BDR metrics
  tonality: {
    weight: 0.20,
    criteria: [
      'Friendly, helpful tone throughout',
      'Sounded genuinely curious, not robotic',
      'Handled redirect/no with grace',
      'Conveyed confidence in value prop'
    ]
  },
  
  objection_handling: {
    weight: 0.20,
    criteria: [
      'Didn\'t get flustered by "not me"',
      'Got referral without being pushy',
      'Didn\'t burn bridge when redirected',
      'Maintained control of conversation flow'
    ]
  },
  
  information_gathering: {
    weight: 0.15,
    criteria: [
      'Got accurate name spelling',
      'Identified correct role/responsibilities',
      'Got referral name if applicable',
      'Got permission to name-drop'
    ]
  }
}

// Accent-specific coaching prompts for the sparring AI
export const ACCENT_COACHING_PROMPTS = {
  irish: `The BDR has an Irish accent. When evaluating their call:
- Check they spoke slowly enough for clarity (Irish accents tend to be fast)
- Listen for enunciation of key words: VBRICK, responsible, video
- Note if they dropped final consonants (common in Irish accent)
- Did they maintain the friendly, approachable tone typical of Irish speakers?
- Were pauses used effectively to compensate for natural speed?`,

  newZealand: `The BDR has a New Zealand accent. When evaluating their call:
- Check their "i" sounds are clear: video, digital, think (not "ideo", "degital", "thunk")
- Listen for flat vowel sounds - did they add warmth through delivery?
- Did they avoid upward inflection on statements ("Australian question intonation")?
- Were complex words enunciated clearly: "responsible", "communications"?
- Did company name "VBRICK" come through clearly?`
}

// Expected persona responses to the framework
export function getFrameworkResponse(
  persona: ProspectPersona,
  step: string
): string {
  const responses: Record<string, Record<string, string[]>> = {
    'disinterested-it-manager': {
      name_capture: [
        "This is Marcus. What do you need?",
        "Marcus Johnson. I'm kind of in the middle of something.",
        "Yeah, Marcus. Make it quick."
      ],
      qualification: [
        "Yeah, I handle the video stuff. We've got Zoom, Vimeo, and some legacy thing. It's a mess.",
        "I guess? I mean, I manage the infrastructure. What platform?",
        "Video communications? Yeah, among about 50 other things. Why?"
      ],
      yes_path: [
        "Consolidate? Look, I'm not looking to rip and replace right now. What does that even mean?",
        "Bandwidth issues? Yeah, town halls are a nightmare. But we've got 18 months left on our Zoom contract.",
        "I'm listening, but I don't have budget authority. That's procurement."
      ],
      no_path: [
        "No, that would be our CTO, David. He makes those decisions.",
        "Not me - talk to David in Engineering. He cares about APIs and integration.",
        "Wrong person. You want the CTO. David Chen."
      ],
      bridge: [
        "Uh... sure, I guess? Just tell him Marcus said to expect your call.",
        "Yeah, you can mention me. Not that it'll help - David's swamped.",
        "If you think it'll make a difference. Good luck getting through to him though."
      ]
    },
    
    'budget-conscious-cfo': {
      name_capture: [
        "Jennifer Martinez. I'm between meetings. What is this?",
        "This is Jennifer, CFO. Can you make this quick?",
        "Jennifer. You have 30 seconds."
      ],
      qualification: [
        "Video? Yes, I'm looking at that spend right now actually. $340K across five vendors.",
        "I oversee all vendor contracts. Video is one of about 200 lines in my budget.",
        "Yes. Why? Are you trying to sell me something?"
      ],
      yes_path: [
        "30-40% reduction? Show me the numbers. I need a 3-year TCO analysis.",
        "Consolidation sounds good, but what's the switching cost?",
        "I'm interested in cost savings, but I need hard data. Email me a proposal."
      ],
      no_path: [
        "I'm the wrong person. You want our CTO, David. He handles video platform decisions.",
        "I see the bills, but David makes the call on what platforms we use.",
        "Technically yes, but practically no. Talk to Engineering."
      ],
      bridge: [
        "You can mention I sent you, but David knows we're looking at budgets.",
        "Sure. Tell him Jennifer said to take the call.",
        "If you think it'll help. Just don't waste his time - or mine."
      ]
    },
    
    'busy-exec-assistant': {
      name_capture: [
        "This is Patricia. I'm the CEO's assistant. What is this regarding?",
        "Patricia speaking. How can I help you?",
        "You've reached Patricia. I'm screening calls for the CEO."
      ],
      qualification: [
        "The CEO doesn't handle day-to-day video decisions. That's our CTO.",
        "Executive communications? Yes, the CEO does the town halls. But I screen all vendor calls.",
        "I coordinate the CEO's schedule. What company did you say this was?"
      ],
      yes_path: [
        "Broadcast quality for 50,000 employees? That's actually relevant. The CEO complains about current quality.",
        "The CEO is frustrated with video, but we're locked into a contract. When does it end?",
        "I'm not authorized to set meetings. What's your value proposition for the CEO specifically?"
      ],
      no_path: [
        "For video platforms, you'd want David, our CTO. He handles those decisions.",
        "The CEO doesn't get involved in vendor selection. Talk to David in Engineering.",
        "Wrong level. You want the CTO. I can transfer you to his office."
      ],
      bridge: [
        "Yes, you can mention I suggested the call. It might help.",
        "Feel free. But David gets a lot of vendor calls.",
        "I'll make a note. No promises on whether he takes the call."
      ]
    }
  }
  
  // Default response if persona not found
  const defaultResponses: Record<string, string[]> = {
    name_capture: ["This is them. What do you need?"],
    qualification: ["Yes, that's me. What is this about?"],
    yes_path: ["Interesting. Tell me more."],
    no_path: ["No, you'd want [Name]. They're the right person."],
    bridge: ["Sure, you can mention me."]
  }
  
  const personaResponses = responses[persona.id] || defaultResponses
  const stepResponses = personaResponses[step] || defaultResponses[step]
  
  return stepResponses[Math.floor(Math.random() * stepResponses.length)]
}

// Framework tracking for sparring sessions
export interface FrameworkTracker {
  currentStep: string
  stepsCompleted: string[]
  nameCaptured?: string
  qualified: boolean
  redirectName?: string
  bridgePermissionGranted: boolean
  frameworkScore: number
  notes: string[]
}

export function createFrameworkTracker(): FrameworkTracker {
  return {
    currentStep: 'name_capture',
    stepsCompleted: [],
    qualified: false,
    bridgePermissionGranted: false,
    frameworkScore: 0,
    notes: []
  }
}
