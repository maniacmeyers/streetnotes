import type { PersonaId } from './sparring-personas'

export type BDRAccent = 'irish' | 'newZealand' | 'general'

export interface ScenarioScriptStep {
  label: string
  hint: string
}

export interface SparringScenario {
  id: string
  title: string
  subtitle: string
  estimatedMinutes: number
  defaultPersonaId: PersonaId
  defaultAccent: BDRAccent
  scenarioContext: string
  hardModeContext: string
  cheatCard: ScenarioScriptStep[]
  /** 1-10 difficulty rating. Optional. */
  difficultyScore?: number
  /** Short reason this prospect is a good Vbrick fit. Optional. */
  whyVbrickFits?: string
  /** What the rep is trying to accomplish on this call. Optional. */
  repGoal?: string
  /** The first sentence after "Ok, cool. I'm calling because..." — keeps the rep primed. Optional. */
  openingContinuation?: string
  /** One-line tone descriptor for the prospect. Optional. */
  prospectTone?: string
  /** 6-10 realistic prospect responses / pushbacks. Optional. */
  likelyProspectResponses?: string[]
  /** 4-6 strong rep responses to practice. Optional. */
  strongRepResponses?: string[]
  /** 3 weak responses to avoid. Optional. */
  weakRepResponses?: string[]
  /** The desired outcome of the call. Optional. */
  desiredOutcome?: string
  /** Coaching takeaway — what the rep should learn. Optional. */
  coachingNote?: string
  /** Top 3 mistakes new BDRs make in this scenario. Optional. */
  topMistakes?: string[]
  /** Top 3 things a great BDR would do well. Optional. */
  topWinMoves?: string[]
}

export const SPARRING_SCENARIOS: Record<string, SparringScenario> = {
  'brightcove-friction': {
    id: 'brightcove-friction',
    title: 'Brightcove Friction — Bending Spoons Acquisition',
    subtitle:
      'Call a Brightcove customer. Run the full VBRICK framework. Pitch VBrick as the alternative.',
    estimatedMinutes: 3,
    defaultPersonaId: 'disinterested-it-manager',
    defaultAccent: 'general',
    difficultyScore: 4,
    scenarioContext: [
      'CALL CONTEXT:',
      'Your company is a current Brightcove customer. Brightcove was recently acquired by Bending Spoons. The integration has been noisy — tooling disruption, support changes, pricing uncertainty.',
      'The BDR is calling from VBrick (a Brightcove competitor). They will pitch VBrick as an alternative and ask if you are experiencing friction from the Bending Spoons acquisition of Brightcove.',
      '',
      'REACT HONESTLY based on your personality. You can be any of:',
      '- Frustrated and open to discussing alternatives',
      '- Dismissive and too busy',
      '- Skeptical and want proof before engaging',
      '- Genuinely unaware of the acquisition',
      '- Already mid-evaluation',
      '',
      'Do NOT volunteer the Brightcove or Bending Spoons angle yourself. Only react once the BDR raises it during the value prop step.',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You have been contacted multiple times this month about the Bending Spoons / Brightcove situation by consultants and VBrick competitors. You are protective of your time.',
      'Push back on generic openers. You expect specifics — which Brightcove product, what kind of friction, concrete differentiation.',
      'You will end the call within 30 seconds if the BDR has not given you a concrete reason to stay on the line.',
    ].join('\n'),
    cheatCard: [
      {
        label: '1. Name confirmation',
        hint:
          'They answer with "Hello?" (or similar). You say their first and last name in an inquisitive tone ("Dana Whitfield?"). They confirm with "Yeah."',
      },
      {
        label: '2. Help request',
        hint: '"Great, [first name], I was hoping you could help me out for a moment."',
      },
      {
        label: '3. Qualification',
        hint: '"[First name], are you on the team responsible for your company\'s enterprise video initiatives?"',
      },
      {
        label: '4a. YES path — value prop',
        hint:
          '"Okay cool. I\'m with VBrick. We have a lot of customers coming to us lately due to friction from the Bending Spoons acquisition of Brightcove. Are you experiencing similar friction, or looking at alternatives?"',
      },
      {
        label: '4b. NO path — referral + bridge',
        hint:
          '"Oh sorry. Would you happen to know who the best person at your company would be?" → "Great, thanks. Can I tell [name] you said hello?"',
      },
      {
        label: '5. Soft close',
        hint:
          '"Either way, would it be useful if I sent you a 2-minute overview of how we replaced Brightcove at [peer customer], plus one customer reference at your scale? You can decide if it\'s worth 15 minutes after that."',
      },
    ],
  },

  'google-no-ebb-program': {
    id: 'google-no-ebb-program',
    title: 'Google — No EVP Program',
    subtitle:
      'Cold-call a Google infrastructure PM. They say Google has no EVP program. Use discovery to surface the real gap without getting dismissed.',
    estimatedMinutes: 4,
    defaultPersonaId: 'google-corp-eng-pm',
    defaultAccent: 'general',
    difficultyScore: 5,
    scenarioContext: [
      'CALL CONTEXT:',
      'The prospect is a Staff TPM in Google\'s Corporate Engineering org. She is cross-functional across Communications, Learning, and IT — she knows how internal video actually works at Google.',
      'She will be polite for about 30 seconds. After that she needs a reason to stay on the line.',
      '',
      'THE DISCOVERY CHALLENGE:',
      'Google does NOT have a formal "EVP program" (Enterprise Video Platform — a centralized, governed platform for company-wide live + on-demand video broadcast, training, and internal video). Instead, different parts of Google solve the same problem differently: TGIF runs on one stack, regional all-hands on another, product-org events on a third, training on Internal YouTube + Drive.',
      'The prospect knows this patchwork exists. She will NOT volunteer it.',
      'If the BDR asks generically about "enterprise video," she will deflect: "We handle that internally."',
      'If the BDR asks sharp discovery questions — who runs TGIF, how do you scale captions, what happens when a VP needs to broadcast to 50,000 — she will answer ONE piece of truth per question.',
      'If the BDR names "EVP program" directly, she will answer honestly: "We don\'t have a formal EVP program."',
      '',
      'WHAT "GOOD" LOOKS LIKE FOR THE BDR:',
      '- Get her to state (in her own words) that Google has no centralized EVP capability',
      '- Surface at least one concrete consequence (governance, captions at scale, retention, cost, scattered ownership)',
      '- End with a next step — NOT a demo booking, but a followup with a specific artifact (reference customer, 2-minute overview, intro to the right person internally)',
      '',
      'YOU WILL NOT:',
      '- Volunteer gaps in Google\'s tooling until asked specifically',
      '- Pretend to have authority you don\'t (you\'re a PM, not a buyer)',
      '- Agree to a demo in the first two minutes',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You have been cold-called by three enterprise video vendors in the last month. You are pattern-matching. The BDR needs to say something specific in the first minute that differentiates — if they stay generic, push back with "I\'ve heard this one before" and give them a second chance.',
      'You mildly dislike the word "platform." When a vendor uses it, push back once ("what does your platform actually do?") rather than exiting.',
      'If the BDR uses "EVP program" without explaining it, ask: "What do you mean by that? I\'ve seen different definitions." Use this to help them anchor the conversation, not to trap them.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: 'They answer with a short greeting. You say their first and last name inquisitive ("Priya Nair?"). They confirm briefly.' },
      { label: '2. Help request', hint: '"Great, [first name], I was hoping you could help me out for a moment."' },
      {
        label: '3. Qualification',
        hint:
          '"Are you on the team responsible for how Google handles internal video — things like all-hands, leadership comms, or org-wide training?"',
      },
      {
        label: '4. The EVP anchor',
        hint:
          '"Okay cool. Quick context — most companies at Google\'s scale have what we call an EVP program, an Enterprise Video Platform. One governed platform that runs TGIF-style broadcasts, leadership Q&As, training, with captions and governance at scale. Does Google have something like that in place?"',
      },
      {
        label: '5. Discovery (if they say NO)',
        hint:
          'Follow up with ONE sharp question at a time — pick based on what they said:\n' +
          '  • "So how do TGIF broadcasts run today — is it one stack or per-region?"\n' +
          '  • "When a VP needs to go to 50,000 employees live, who owns that?"\n' +
          '  • "How do captions and multilingual support work across all of it?"\n' +
          '  • "Where does training video actually live — and is it searchable?"\n' +
          'Goal: get her to name the patchwork in her own words.',
      },
      {
        label: '6. Reframe the risk',
        hint:
          '"Got it. What we see — and you can push back on this — is that the lack of a centralized EVP usually surfaces as either governance risk, scale failures during major broadcasts, or cost sprawl across the toolchain. Which of those would matter most if it landed on your desk?"',
      },
      {
        label: '7. Soft close',
        hint:
          '"Here\'s what I\'d love to do — send you a 2-minute overview of how [reference customer at similar scale] runs theirs, and let you decide if it\'s worth a 15-minute follow-up. Fair?"',
      },
    ],
  },

  'wrong-person-referral': {
    id: 'wrong-person-referral',
    title: 'Wrong Person → Right Person Referral',
    subtitle:
      'The contact is adjacent to video but not the buyer. Earn the referral naturally — without sounding robotic.',
    estimatedMinutes: 3,
    defaultPersonaId: 'video-adjacent-coordinator',
    defaultAccent: 'general',
    difficultyScore: 2,
    whyVbrickFits:
      'Not a direct fit for THIS prospect, but his org is a classic Vbrick target: 22,000 employees, scattered video tooling, no clear video strategy owner.',
    repGoal:
      'Earn a named referral to the right buyer and a soft intro (or permission to drop the referrer\'s name) — WITHOUT burning the relationship by pitching the wrong person.',
    openingContinuation:
      '"...we work with enterprises your size to consolidate how they run internal video — town halls, training, executive comms. Before I go further, does any of that actually sit with you?"',
    prospectTone:
      'Friendly, helpful, mildly in a hurry. Wants to be useful and then off the phone.',
    likelyProspectResponses: [
      '"Yeah, that\'s not really me — I handle our collaboration stack."',
      '"We have someone for that but honestly I\'m not sure what her title is."',
      '"You probably want Internal Comms."',
      '"I can give you the name if you\'re quick."',
      '"Priya Anand — she runs internal comms."',
      '"I can\'t promise she\'ll pick up."',
      '"Yeah, tell her I said hi."',
      '"Look, I\'m happy to pass it along but I can\'t commit her to anything."',
    ],
    strongRepResponses: [
      '"Totally fair. Who do you feel would be the best person to have this conversation with?"',
      '"Great, thank you. Would you like me to tell Priya you said hi? Makes it a warmer intro."',
      '"Perfect — Trevor said you could help me find the right person. Is that fair to say?"',
      '"Appreciate that. I promise I won\'t drag you back in — I just want to make sure I show up prepared with her."',
    ],
    weakRepResponses: [
      '"Well, maybe you\'d still want to hear this — we have a lot of value for IT too."',
      '"Can you transfer me to her right now?"',
      '"What\'s her direct email?"',
    ],
    desiredOutcome:
      'A clean named referral, permission to say the referrer said hello, and zero relationship damage with the referrer.',
    coachingNote:
      'The referral ask is a skill, not a phrase. You are asking someone to lend you their reputation — make it easy, specific, and ungreedy. "Would you like me to tell [Name] you said hi?" works because it flips the transaction: YOU are doing THEM a favor by warming the intro. Never ask for a transfer or a direct email — that turns a helpful contact into a gatekeeper.',
    topMistakes: [
      'Trying to pitch the wrong person anyway instead of pivoting to the referral',
      'Demanding a transfer, a direct number, or an email forward',
      'Forgetting to ask permission to use the referrer\'s name',
    ],
    topWinMoves: [
      'Accepting the "no" fast and pivoting cleanly to the referral ask',
      'Using the "tell them you said hi" framing to warm the next call',
      'Thanking the referrer and exiting quickly — they remember the rep who didn\'t waste their time',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are adjacent to video strategy but do not own it. You know the right person is Priya Anand, Director of Internal Communications. You are happy to hand off the referral if the BDR asks cleanly.',
      '',
      'OPENING STRUCTURE the BDR will run:',
      '"[First] [Last]?" → wait for confirmation → "I was hoping you could help me out, real quick." → "Are you on the team responsible for your company\'s video strategy — internal, external, or both?"',
      '',
      'Your honest answer to the qualification is NO. You handle collaboration tools, not video strategy.',
      '',
      'If the BDR handles the NO well and asks "who would be the best person?" — name Priya Anand, Director of Internal Communications.',
      'If the BDR then asks "can I tell her you said hello?" — say yes warmly.',
      'If the BDR tries to pitch you anyway or asks to be transferred, push back politely: "I really don\'t own this."',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You are mid-email with your CFO when the call comes in. You are polite but pivoting to end the call quickly. Give the BDR a minute to land the referral ask; if they stumble, prompt them once ("was there something else?") to help them recover.',
      'You will give Priya\'s name and role if asked. You will not give her direct email or phone number, but you are willing to "pass along" a hello.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Trevor Ashford?" → wait for "Yeah."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Pivot on NO', hint: '"Oh, sorry \'bout that. Who do you feel would be the best person to have this conversation with?"' },
      { label: '5. Warm the intro', hint: '"Great, thank you. Would you like me to tell [Name] you said hi?"' },
      { label: '6. Clean exit', hint: '"Appreciate the help. I\'ll reach out to [Name] today."' },
    ],
  },

  'corp-comms-townhalls': {
    id: 'corp-comms-townhalls',
    title: 'Corporate Communications — Town Hall Pain',
    subtitle:
      'Director of Internal Comms at a financial services firm. Uncover event scale, tool sprawl, and the engagement-reporting gap.',
    estimatedMinutes: 4,
    defaultPersonaId: 'internal-comms-director',
    defaultAccent: 'general',
    difficultyScore: 4,
    whyVbrickFits:
      'Owns exactly the problems Vbrick solves: polished live events at scale, unified live+on-demand, engagement analytics she can report to leadership, captions and multilingual delivery.',
    repGoal:
      'Uncover current tool stack, most recent town-hall friction, and what "good" would look like. Land a followup — not a demo — with a concrete artifact (e.g., a peer reference at similar scale).',
    openingContinuation:
      '"...we work with internal comms leaders at firms your size who are running monthly town halls and leadership broadcasts. Most of them tell us the same three things — and I\'m curious if any of it resonates. Can I ask you two quick questions?"',
    prospectTone:
      'Professional, time-aware, polite but firm. Will engage with specifics, dismiss generic platform pitches fast.',
    likelyProspectResponses: [
      '"We use Zoom for town halls — it mostly works."',
      '"How is this different from Zoom Webinar?"',
      '"I have 15 minutes before my next meeting, go."',
      '"Honestly, live events are fine. Engagement reporting is the gap."',
      '"Caption quality has been a problem in EMEA."',
      '"We tried Vimeo Enterprise and it didn\'t land."',
      '"I\'m not the IT buyer — this would need to go through them eventually."',
      '"Send me something I can show my team."',
    ],
    strongRepResponses: [
      '"Fair. Where most of our customers hit the wall with Zoom is scale — audio drops, caption inconsistency in non-US regions. Does that match what you see?"',
      '"Okay, so two quick questions — how many town halls do you run a month, and roughly how many employees are you broadcasting to?"',
      '"That\'s actually what we hear most — engagement reporting. Would it help to see how [peer firm] reports engagement back to their CEO?"',
      '"I don\'t want to send you a generic deck. Let me send you one-page on the EMEA caption use case specifically."',
    ],
    weakRepResponses: [
      '"Oh, Vbrick is totally different — we\'re the leading enterprise video platform."',
      '"Let me set up a 30-minute demo so I can show you everything."',
      '"Our AI-powered search is a game-changer for your intranet."',
    ],
    desiredOutcome:
      'A 15-minute followup (not a demo), agreement to receive a one-pager on a specific pain point she named, and permission to loop in her IT counterpart when relevant.',
    coachingNote:
      'Rachel is the ideal buyer-influencer. You do not close her on a demo — you earn her trust by being specific, concise, and credible. Ask fewer discovery questions and make them sharper. "How many town halls a month?" beats "tell me about your video strategy." When she raises the EMEA caption issue, do NOT jump to a solution — ask ONE more question ("how often has that happened this quarter?") and THEN bridge to a customer reference.',
    topMistakes: [
      'Using "platform" in the first sentence after "Ok, cool"',
      'Pitching features before understanding her town-hall cadence and scale',
      'Jumping to a demo booking instead of a focused followup',
    ],
    topWinMoves: [
      'Asking one sharp discovery question and letting silence do the work',
      'Using a peer-reference story instead of a feature pitch',
      'Sending a one-pager on HER pain, not a generic Vbrick overview',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You own internal comms at a 28K-employee financial services firm. Your last town hall had a caption failure in EMEA that the CEO noticed. You use Zoom for live events, Vimeo Enterprise for on-demand (underused), a legacy CMS for the intranet.',
      'You will engage with a BDR who is specific and concise. You will disengage fast from a generic pitch.',
      '',
      'OPENING STRUCTURE the BDR will run — your answer to qualification is YES, internal side.',
      '',
      'SHARE (only when earned):',
      '- Town hall cadence: monthly global, quarterly ELT live',
      '- Scale: ~28K employees broadcasting live',
      '- Tools: Zoom, Vimeo Enterprise, legacy CMS',
      '- Pain: caption failure in EMEA last town hall, engagement reporting is weak',
      '- You do NOT volunteer the CEO noticing — only if the rep earns specific trust.',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You have 12 minutes before the CHRO call. You will test the BDR with "How is this different from Zoom?" in the first 30 seconds. If they answer with buzzwords, push back once with "that\'s a lot of words — what does it actually do differently?" — give them a second chance, do not exit.',
      'You will share the EMEA caption story if the BDR asks about any friction, live-event quality, or captions — you do not require them to name it perfectly.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Rachel Brennan?" → wait for "Yes."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Opening', hint: 'After YES: "Ok, cool. I\'m calling because we work with internal comms leaders running monthly town halls at scale. Can I ask two quick questions?"' },
      { label: '5. Discovery (sharp, specific)', hint: '"How many town halls a month?" → "How many employees do you broadcast to?" → "What\'s the biggest pain you\'ve hit in the last quarter?"' },
      { label: '6. Bridge to peer reference', hint: '"That matches what [peer firm] was hitting. Would it help to see how they report engagement back to their CEO?"' },
      { label: '7. Soft close', hint: '"Let me send you a one-pager on the specific pain you named — no generic deck. Fair?"' },
    ],
  },

  'it-infrastructure-ecdn': {
    id: 'it-infrastructure-ecdn',
    title: 'IT / Infrastructure — eCDN & Scale',
    subtitle:
      'IT Infrastructure Manager at a healthcare network. Sound credible on bandwidth, eCDN, SSO, and governance. Do NOT sound like a marketer.',
    estimatedMinutes: 4,
    defaultPersonaId: 'disinterested-it-manager',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Classic Vbrick IT buyer: bandwidth strain during all-hands, multiple video tools, needs SSO + governance + eCDN for internal distribution at scale.',
    repGoal:
      'Earn credibility with a technical buyer in the first 60 seconds by leading with infrastructure language (not marketing). Uncover bandwidth and tooling pain. Land a short technical followup.',
    openingContinuation:
      '"...we work with IT leaders at healthcare orgs running large live events internally — and what we usually hear is that bandwidth, eCDN, and SSO end up being bigger headaches than the video itself. Any of that ring true for you?"',
    prospectTone:
      'Tired, guarded, skeptical of vendors. Will warm up only if the rep speaks his language — otherwise polite exit within 30 seconds.',
    likelyProspectResponses: [
      '"We\'re fine with what we have."',
      '"I don\'t have time for this right now."',
      '"Send me an email and I\'ll review it."',
      '"What\'s your eCDN architecture?"',
      '"Does it integrate with our SSO?"',
      '"Honestly, Zoom town halls have been crushing our network."',
      '"We evaluated video solutions last year."',
      '"Who handles this at [peer healthcare org]?"',
    ],
    strongRepResponses: [
      '"Makes sense. Quick question — when you run a 2,500-employee live event, what\'s happening to your WAN?"',
      '"Our eCDN supports a peer-assisted model — think multicast without the IGMP headache. We integrate with Kollective and Hive if you already have them."',
      '"SAML 2.0 and OIDC, scoped role-based permissions, full audit trail — happy to send the technical overview."',
      '"Not asking for a meeting. Would you benefit from a peer reference at a healthcare network your size?"',
    ],
    weakRepResponses: [
      '"Our platform empowers your enterprise video strategy."',
      '"We\'re the leader in enterprise video."',
      '"Let me book a discovery call with our solutions team."',
    ],
    desiredOutcome:
      'A technical overview sent to his inbox, permission for a 20-minute followup with a VBrick solutions engineer, and a peer reference lined up.',
    coachingNote:
      'Marcus does not care about your product. He cares about his network and his help desk ticket count. Lead with infrastructure terms (eCDN, SSO, WAN, multicast, peer-assisted) in the first 30 seconds. Using marketing language signals you don\'t understand his world — and he will polite-exit. If you don\'t know what "IGMP" is, don\'t pretend — but be ready to bridge to a solutions engineer fast.',
    topMistakes: [
      'Using marketing language ("platform," "transformation," "empower") with a technical buyer',
      'Skipping the network/bandwidth pain and jumping to features',
      'Trying to close a 30-minute demo instead of offering a technical followup',
    ],
    topWinMoves: [
      'Opening with a sharp infrastructure question (bandwidth during live events)',
      'Naming the eCDN integrations already in his stack (Kollective, Hive)',
      'Offering a peer reference at a healthcare org of similar scale',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You own IT infrastructure at a 2,500-employee healthcare network. Last month\'s all-hands crushed the WAN and generated 60+ help desk tickets. You have 3 video tools (Zoom, Vimeo, a legacy on-prem system) and executives are complaining.',
      'You will warm up ONLY if the BDR speaks infrastructure language.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES, technical/IT side.',
      '',
      'SHARE (only when earned):',
      '- Bandwidth problem during last all-hands',
      '- 3 video tools, no consolidation',
      '- No eCDN today, has heard of Kollective',
      '- You will NOT share help desk ticket volume unless specifically asked',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You are troubleshooting a VPN issue when the call comes in. You are crankier than usual — lean into short, clipped replies and a slightly tired tone. Do not exit for small mistakes; just push back and give the BDR a chance to recover.',
      'Share the bandwidth problem if the BDR asks about any infrastructure or scale issue. You do not require them to use the word "WAN" or "multicast" — any sign they care about the infrastructure side is enough.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Marcus Delgado?" → "Yeah."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Technical opener', hint: '"Ok, cool. I\'m calling because we work with IT leaders in healthcare where bandwidth and eCDN become the real bottleneck during large live events."' },
      { label: '5. Sharp discovery', hint: '"When you run a 2,500-employee live event, what\'s happening to your WAN?"' },
      { label: '6. Credibility moves', hint: 'Name eCDN partners (Kollective, Hive). Reference SAML/OIDC. Offer a peer reference, not a demo.' },
      { label: '7. Soft close', hint: '"Not asking for a meeting. Want me to send you the technical overview and one peer reference at a healthcare org your size?"' },
    ],
  },

  'ld-training-outcomes': {
    id: 'ld-training-outcomes',
    title: 'HR / L&D — Training Outcomes',
    subtitle:
      'L&D Director at a multi-state healthcare system. Tie Vbrick to measurable outcomes (completion rates, compliance, mobile experience) — not "better video."',
    estimatedMinutes: 4,
    defaultPersonaId: 'ld-director-healthcare',
    defaultAccent: 'general',
    difficultyScore: 4,
    whyVbrickFits:
      'Onboarding and compliance video scattered across LMS, YouTube, Drive. Completion reporting is weak. Clinical workforce needs mobile-first video. Vbrick integrates with the LMS rather than replacing it.',
    repGoal:
      'Reframe Vbrick from "video library" to "measurable training outcomes." Earn a followup conversation with her head of Learning Technology.',
    openingContinuation:
      '"...we work with healthcare L&D leaders who have a strong LMS in place but are losing completion rate and audit reporting on the video side. I\'m curious — where do your training videos actually live today?"',
    prospectTone:
      'Pragmatic, warm, outcomes-focused. Allergic to edtech jargon. Will engage on completion rates, compliance reporting, and mobile experience.',
    likelyProspectResponses: [
      '"We already have an LMS — Cornerstone."',
      '"Is this another video library?"',
      '"Compliance training has to live in the LMS for audit."',
      '"Budget for L&D tech is frozen until Q3."',
      '"Our completion rates are fine."',
      '"Mobile is the real problem — clinical staff can\'t watch on shift."',
      '"We tried Kaltura, didn\'t stick."',
      '"This sounds like another platform we\'d have to train managers on."',
    ],
    strongRepResponses: [
      '"Not asking you to replace Cornerstone — we integrate into it. Quick question — do you know your current completion rate on compliance training?"',
      '"Mobile is exactly where most of our healthcare customers found the biggest lift — bedside staff can actually finish a 12-minute module on shift instead of saving it for later."',
      '"What if I could show you a customer at your scale whose compliance reporting satisfied their auditors without changing LMS?"',
      '"Not a demo — 15 minutes with your head of Learning Tech to map it against Cornerstone. Fair?"',
    ],
    weakRepResponses: [
      '"Our AI-powered learning platform transforms training."',
      '"Let me show you the full Vbrick platform — we do way more than video."',
      '"We\'re the leader in enterprise learning technology."',
    ],
    desiredOutcome:
      'A 15-minute followup with Keisha + her Learning Technology counterpart, mapped specifically against Cornerstone integration, with a peer reference at a healthcare system of similar scale.',
    coachingNote:
      'Keisha buys outcomes, not features. She does NOT want a new LMS. The WIN move is to position Vbrick as the layer that makes her existing LMS perform better — measured in completion rate lift and auditor-ready reporting. If you cannot speak to "how this integrates with Cornerstone," you will not get past the first objection.',
    topMistakes: [
      'Positioning Vbrick as an LMS replacement',
      'Leading with AI or "transformation" language',
      'Asking her to spell out her compliance requirements rather than demonstrating you understand them',
    ],
    topWinMoves: [
      'Naming Cornerstone specifically and framing the integration',
      'Asking about completion rates and mobile experience early',
      'Offering a healthcare peer reference with concrete outcome numbers',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You own L&D at a 45K-employee multi-state healthcare system. You have Cornerstone LMS. Compliance training completion is ~78%. Clinical staff complain mobile video is broken. Budget is frozen until Q3.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES, but only for training/learning video (NOT corporate comms). Say so: "Yeah, for training and onboarding — not corporate comms."',
      '',
      'SHARE (only when earned):',
      '- LMS: Cornerstone',
      '- Completion rate: ~78% (only if asked specifically)',
      '- Pain: mobile experience for bedside staff',
      '- You will NOT share budget info',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You have been pitched by three "learning platforms" this month. You are skeptical by default. If the BDR tries to replace Cornerstone, push back clearly — "I\'m not replacing the LMS" — and give them a chance to reframe. If they use "transformation" or other jargon, call it out gently: "skip the buzzwords — what does it actually do?"',
      'You will share your completion-rate pain and mobile-experience pain to a BDR who asks about outcomes, even if they do not name Cornerstone perfectly.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Keisha Martin?" → "Speaking."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Reframe', hint: '"Ok, cool. I\'m calling because we work with healthcare L&D leaders who have a strong LMS in place but are losing completion rate and audit reporting on the video side."' },
      { label: '5. Anchor question', hint: '"Do you know your current completion rate on compliance training?" — then shut up.' },
      { label: '6. Integration credibility', hint: '"We integrate directly into Cornerstone — I\'m not asking you to replace anything."' },
      { label: '7. Soft close', hint: '"15 minutes with your head of Learning Tech, mapped against Cornerstone. Fair?"' },
    ],
  },

  'regulated-industry-governance': {
    id: 'regulated-industry-governance',
    title: 'Regulated Industry — Governance & Trust',
    subtitle:
      'CISO at a financial services firm. Handle objections around security, governance, and "we already use Teams."',
    estimatedMinutes: 4,
    defaultPersonaId: 'skeptical-security-officer',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Shadow IT video across Loom/Vimeo/Vidyard creates compliance gaps. No audit trails. Data residency concerns. Vbrick offers governance, on-prem/private cloud, SOC 2 Type II, and auditable access logs.',
    repGoal:
      'Establish credibility on security in the first 60 seconds. Avoid being lumped with "generic video platforms." Land a formal security review — not a demo — with her team.',
    openingContinuation:
      '"...we work with CISOs in financial services who are discovering shadow video tools across the org — Loom in sales, Vimeo in marketing, Vidyard in HR — and trying to pull that under a single governance model without ripping out Microsoft. Is any of that landing?"',
    prospectTone:
      'Formal, careful, risk-averse. Will pepper the BDR with security questions within the first minute. Zero tolerance for marketing fluff.',
    likelyProspectResponses: [
      '"What\'s your SOC 2 Type II status?"',
      '"Where is video data stored and processed?"',
      '"We\'re a Microsoft shop — Teams handles this."',
      '"Our compliance team reviews everything first."',
      '"Can you host on-prem or in our private cloud?"',
      '"What\'s your data retention and deletion policy?"',
      '"How does this interact with our DLP stack?"',
      '"Send me the security docs — I\'ll have my team review."',
    ],
    strongRepResponses: [
      '"SOC 2 Type II current, ISO 27001 certified. Can send the attestation letter today. Data residency — US, EU, APAC regions available separately. What\'s your residency requirement?"',
      '"We support on-prem and private cloud. Most of our financial services customers run private cloud with SAML SSO and SCIM provisioning."',
      '"Not replacing Teams — Teams is your collaboration layer. Vbrick sits underneath for governed broadcast and on-demand, with audit trails Teams doesn\'t provide."',
      '"Happy to go straight to your compliance team — I don\'t need to own the conversation. Want the security docs and a contact for your team to drive?"',
    ],
    weakRepResponses: [
      '"Our platform is enterprise-grade and secure."',
      '"Let me show you our AI features first."',
      '"We\'re trusted by thousands of companies."',
    ],
    desiredOutcome:
      'Security documentation sent (SOC 2, ISO 27001 attestation, DPA), handoff to her compliance team lead, and permission to propose a formal security review session.',
    coachingNote:
      'Sarah will test you on certifications in the first 30 seconds. If you don\'t know your own SOC 2 status, she loses respect immediately. The WIN move is to concede the tech deep-dive to her team ("I don\'t need to own this — send me your security lead\'s email") and move the conversation into her formal review process. Attempting to close her yourself is a trust-breaker.',
    topMistakes: [
      'Not knowing SOC 2 Type II status off the top of your head',
      'Trying to position Vbrick as a Teams replacement',
      'Trying to close her directly instead of routing to her compliance team',
    ],
    topWinMoves: [
      'Naming SOC 2 Type II + ISO 27001 in the first 30 seconds',
      'Positioning Vbrick as "underneath Teams, not replacing it"',
      'Offering to route the conversation to her security lead instead of asking her to close',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are CISO at a 10K-employee financial services firm in a regulated industry. You recently discovered Sales uses Loom, Marketing has Vimeo, HR bought Vidyard — all unapproved. You are in audit prep. Regulators are asking about video data handling.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES but security-scoped: "Yes, from a security and governance perspective."',
      '',
      'SHARE (only when earned):',
      '- Shadow IT discovery across Loom/Vimeo/Vidyard',
      '- In audit prep mode',
      '- Data residency: you need US + EU',
      '- You will NOT share which regulators or specific audit details',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You will open the call with "What\'s your SOC 2 Type II status?" within the first minute. If the BDR does not know the exact answer, you accept "I\'ll confirm and send that over today" — you do not exit for an imperfect answer, but you do mentally note it.',
      'You will push on "Teams already does this." If the BDR positions Vbrick as complementary to Teams (not a replacement), you engage. If they try to replace Teams, push back firmly but give them one chance to reframe.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Sarah O\'Brien?" → "Speaking."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Security-led opener', hint: '"Ok, cool. I\'m calling because we work with CISOs in financial services pulling shadow video tools under a single governance model without replacing Microsoft."' },
      { label: '5. Credentials upfront', hint: 'Name SOC 2 Type II + ISO 27001 in the first 30 seconds unprompted.' },
      { label: '6. "Not replacing Teams"', hint: '"Teams is your collaboration layer. We sit underneath for governed broadcast + audit."' },
      { label: '7. Soft close', hint: '"Who on your security team should I route the documentation to? I don\'t need to own this."' },
    ],
  },

  'we-already-have-teams': {
    id: 'we-already-have-teams',
    title: 'Objection — "We Already Have Teams"',
    subtitle:
      'Digital Workplace Manager at a global tech company. Position Vbrick as enterprise-grade infrastructure — not another video tool competing with Microsoft.',
    estimatedMinutes: 4,
    defaultPersonaId: 'digital-workplace-manager',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Two all-hands failures on Teams Live Events in the last year. Stream search is broken. No cross-BU governance. Vbrick complements M365 with scale, governance, and analytics — does not replace it.',
    repGoal:
      'Break the Microsoft-shop reflex. Acknowledge Teams. Uncover the specific failures. Position Vbrick as a complement, not a competitor. Earn a scoped followup around scale + governance.',
    openingContinuation:
      '"...we work with digital workplace leaders in big M365 shops who love Teams for collaboration but hit a wall on large broadcasts — scale failures, Stream search gaps, governance across BUs. Not replacing Teams — complementing it. Any of that showing up for you?"',
    prospectTone:
      'Guarded, Microsoft-loyal, defensive. Will dismiss anything that smells like "replace your stack." Engages only with rep who respects the M365 investment.',
    likelyProspectResponses: [
      '"We already use Teams and SharePoint for this."',
      '"Stream does what we need."',
      '"We\'re a Microsoft shop — why add another tool?"',
      '"I\'m not going to push another platform on our users."',
      '"Our CIO just signed the M365 renewal."',
      '"Teams Live Events has had some issues but Microsoft\'s working on it."',
      '"Honestly, Stream search is bad but we work around it."',
      '"What specifically does Vbrick do that Teams doesn\'t?"',
    ],
    strongRepResponses: [
      '"Fair. Not here to replace Teams. Quick question — have you had any all-hands or leadership broadcasts where Teams Live struggled with scale?"',
      '"Most of our M365 customers use Vbrick alongside Teams, not instead of. Teams for collab, Vbrick underneath for broadcast scale + governance."',
      '"Stream search is the gap we hear most often. We index, transcribe, and search across all your exec video — searchable in seconds, not days."',
      '"Not a demo. 20 minutes with your Teams admin to map the scale + governance gap. Fair?"',
    ],
    weakRepResponses: [
      '"Teams is honestly not built for enterprise video."',
      '"Microsoft can\'t match us on analytics."',
      '"You need a real video platform, not Teams."',
    ],
    desiredOutcome:
      'Tom agrees to a 20-minute technical session mapping Vbrick alongside his Teams/Stream stack, with a peer reference at another M365-heavy enterprise who runs both.',
    coachingNote:
      'You will NEVER win Tom by attacking Microsoft. The pattern: respect the investment, name the specific M365 gap (scale, search, governance), and position Vbrick as complementary. If Tom volunteers a Teams Live Events failure, acknowledge it without gloating — "Yeah, that\'s the gap most M365 shops hit at your scale." Then bridge to a peer reference. He has to save face — let him.',
    topMistakes: [
      'Attacking Microsoft or Teams',
      'Positioning Vbrick as a Teams replacement',
      'Ignoring the M365 renewal signal and pitching on budget he doesn\'t have',
    ],
    topWinMoves: [
      'Naming Teams Live Events scale issues specifically and early',
      'Framing Vbrick as "underneath M365, not replacing it"',
      'Offering a peer reference at another M365-heavy enterprise',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You run Digital Workplace at a 60K-employee global tech company. You own Teams/SharePoint/Stream. Two all-hands failed on Teams Live Events in the last year (one froze, one had 20 minutes of audio drop). Stream search is bad. You have not escalated.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES: "Yeah, it sits under me — but we\'re a Microsoft shop."',
      '',
      'SHARE (only when earned):',
      '- Two Teams Live Events failures — only if BDR asks about scale or major broadcasts specifically',
      '- Stream search is weak — only if asked about discoverability',
      '- You will NOT share the M365 renewal amount',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You lead with the renewal signal: "Our CIO just signed the M365 renewal." This is bait. If the BDR tries to out-pitch Microsoft, push back once ("not looking to replace Teams") and give them a chance to reframe. Do not exit on the first slip.',
      'You will admit the Teams Live Events failures if the BDR asks about any large-event or all-hands pain — they do not have to name it perfectly.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Tom Reynolds?" → "Yeah, this is Tom."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Respect-first opener', hint: '"Ok, cool. I\'m calling because we work with M365 shops who love Teams for collab but hit walls on large broadcasts — not replacing Teams, complementing it."' },
      { label: '5. Acknowledge objection', hint: '"Totally fair — you\'re a Microsoft shop. Have you had any all-hands where Teams Live struggled with scale?"' },
      { label: '6. Frame the complement', hint: '"Teams for collab, Vbrick underneath for broadcast scale + governance. Most of our customers run both."' },
      { label: '7. Soft close', hint: '"20 minutes with your Teams admin, not a demo. Fair?"' },
    ],
  },

  'internal-external-blur': {
    id: 'internal-external-blur',
    title: 'Internal + External Video Strategy Blur',
    subtitle:
      'Director of Digital Experience with fuzzy scope. Navigate ambiguity. Move the conversation forward anyway.',
    estimatedMinutes: 4,
    defaultPersonaId: 'digital-experience-director',
    defaultAccent: 'general',
    difficultyScore: 3,
    whyVbrickFits:
      'Ambiguous scope is exactly where Vbrick wins — one platform that handles both internal (employee experience) and external (brand, sales enablement, partner) video under unified governance.',
    repGoal:
      'Handle "both, honestly" without getting confused. Map the ambiguity. Offer a cross-functional followup that brings in the right stakeholders from Marketing AND Internal Comms.',
    openingContinuation:
      '"...we work with digital experience leaders whose role sits between Marketing and Internal Comms — and the video question gets messy because no one owns the middle. I\'m curious, where does that line actually land for you?"',
    prospectTone:
      'Open, strategic, a little tired of the ambiguity. Will reward a rep who handles the fuzziness instead of trying to force a clean answer.',
    likelyProspectResponses: [
      '"Honestly, I\'m not sure who owns this internally."',
      '"Ownership is split between me, Marketing, and Internal Comms."',
      '"External video lives with my agency partners."',
      '"I\'d have to involve three other people to say yes to anything."',
      '"Is this internal-facing or external-facing? It changes who should be on the call."',
      '"I own employee experience — internal content — but brand video is Marketing."',
      '"No one has the full picture right now."',
      '"If you can solve that ambiguity problem, I\'d actually love to hear about it."',
    ],
    strongRepResponses: [
      '"Perfect — that\'s exactly the conversation I\'m trying to have. Quick question — does your CEO think about this as one video strategy or two?"',
      '"That\'s actually where Vbrick fits best. One platform that handles internal AND external under unified governance."',
      '"Happy to structure this so it works for both sides. Who in Marketing should I loop in so we\'re not duplicating work?"',
      '"Let\'s not force the question. 20 minutes with you, your VP of Comms, and someone from Marketing — map the current state together. Fair?"',
    ],
    weakRepResponses: [
      '"So is this internal or external?"',
      '"I need to talk to Marketing instead."',
      '"Let\'s get a demo on the calendar and you can bring whoever."',
    ],
    desiredOutcome:
      'A 20-minute cross-functional mapping session with Aisha + her VP of Comms + a Marketing counterpart, framed as "we solve the ambiguity by handling both."',
    coachingNote:
      'Ambiguity is not a problem for Vbrick — it\'s the whole pitch. When she says "both," most reps get confused and try to force the question back into internal OR external. The win is to stay calm, acknowledge the mess, and reframe: "That\'s exactly where we fit — one platform for both." Then recruit her as your internal coordinator by asking WHO should be in the room, not trying to figure it out yourself.',
    topMistakes: [
      'Forcing her to pick internal OR external',
      'Getting visibly confused by the ambiguity',
      'Asking her to organize the cross-functional meeting alone instead of helping structure it',
    ],
    topWinMoves: [
      'Saying "that\'s exactly where Vbrick fits" without hesitation',
      'Asking her who should be in the room so you\'re doing the work with her, not for her',
      'Structuring the followup as a joint mapping session, not a sales demo',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are Director of Digital Experience at a 35K-employee global consumer goods brand. Your role straddles internal (employee experience, intranet) and external (brand video, sales enablement). Ownership is split across Marketing, Internal Comms, and you. It\'s genuinely messy.',
      '',
      'OPENING STRUCTURE: your answer to qualification is BOTH, and it\'s complicated: "Honestly, both — and it\'s complicated."',
      '',
      'SHARE (only when earned):',
      '- Internal: employee experience, intranet content',
      '- External: brand video sits with Marketing + agencies',
      '- You will NOT volunteer specific VP names until asked',
      '- You WILL admit the ambiguity is painful',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You will open with "Is this internal or external? It changes who should be on the call." This is a test. If the BDR picks one and loses the other side, gently point it out ("OK — but the external side is really where the budget is") and give them a chance to broaden. You are rooting for them to solve this.',
      'You are happy to name who in Marketing and Internal Comms should be in the room if the BDR asks. You will not organize the meeting alone, but you will help scope it together.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Aisha Thompson?" → "Yes."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Acknowledge the mess', hint: '"Ok, cool. I\'m calling because we work with digital experience leaders whose role sits between Marketing and Internal Comms — no one owns the middle."' },
      { label: '5. Reframe as the fit', hint: '"That\'s actually where Vbrick fits best — one platform for internal AND external under unified governance."' },
      { label: '6. Recruit her', hint: '"Who in Marketing and Internal Comms should I loop in so we\'re not duplicating work?"' },
      { label: '7. Joint mapping close', hint: '"20 minutes — you, your VP of Comms, someone from Marketing. Map the current state together. Fair?"' },
    ],
  },

  'cfo-vendor-consolidation': {
    id: 'cfo-vendor-consolidation',
    title: 'CFO — Vendor Consolidation & TCO',
    subtitle:
      'CFO at a manufacturer staring at 5 overlapping video contracts. Lead with cost, not features. Earn a TCO conversation, not a demo.',
    estimatedMinutes: 4,
    defaultPersonaId: 'budget-conscious-cfo',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Classic Vbrick CFO buyer: $340K/yr across Zoom, Webex, Vimeo, Kaltura, and departmental Stream accounts with no central governance. Consolidation to one platform is a hard-dollar story.',
    repGoal:
      'Earn 15 minutes for a 3-year TCO conversation. Do NOT pitch features. Do NOT ask for a demo. Bridge to her procurement counterpart with a peer reference at a similar manufacturer.',
    openingContinuation:
      '"...we work with CFOs at companies your size who are paying for 4 or 5 overlapping video tools and discovering shadow Zoom Pro accounts on expense reports. The consolidation story is usually a six-figure line item. Worth two minutes?"',
    prospectTone:
      'Clipped, efficient, numbers-first. Will give 30 seconds and either extend to 5 minutes or end the call. Allergic to feature pitches and soft ROI.',
    likelyProspectResponses: [
      '"What\'s the ROI? Show me the numbers."',
      '"We just renewed Zoom Enterprise."',
      '"Total cost over three years — what\'s your number?"',
      '"Send me a TCO comparison and I\'ll have my team look."',
      '"How does this not just add a sixth tool?"',
      '"We\'re in cost-cutting mode."',
      '"Procurement handles this — talk to them."',
      '"What do you charge per user per year?"',
    ],
    strongRepResponses: [
      '"Not asking for a renewal — asking if you have visibility into total video spend across the org."',
      '"Most of our manufacturer customers were paying $250K–$400K across 4 or 5 tools. We replaced them with one line item averaging 30–40% lower."',
      '"Happy to send a 3-year TCO model with your headcount plugged in. Who on your team owns vendor consolidation?"',
      '"Not a demo. 20 minutes between you, your procurement lead, and our finance team. We do the TCO work; you decide if it\'s worth pursuing."',
    ],
    weakRepResponses: [
      '"Our platform empowers enterprise video."',
      '"Let me show you the features."',
      '"The ROI is hard to quantify but trust us."',
    ],
    desiredOutcome:
      'A 20-minute working session with Jennifer + her procurement lead, framed around 3-year TCO vs. her current stack, with a peer manufacturer reference.',
    coachingNote:
      'Jennifer does not buy features. She buys line items going down. Every sentence has to either name a dollar number or move toward one. The fastest credibility move is to name a peer manufacturer reference with a real consolidation savings figure ("they replaced Zoom + Webex + Vimeo + Stream and cut $180K annually"). DO NOT try to demo her. Route to her procurement counterpart and let the TCO model do the close.',
    topMistakes: [
      'Talking about features instead of total cost',
      'Asking for a demo instead of a TCO conversation',
      'Using soft ROI language ("better engagement," "productivity gains") with a hard-numbers buyer',
    ],
    topWinMoves: [
      'Naming a peer manufacturer with a real consolidation savings figure',
      'Offering to build the 3-year TCO model with her procurement lead',
      'Acknowledging Zoom renewal without trying to replace it day one',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are CFO at a 5,000-employee industrial manufacturer. In Q3 budget review you flagged $340K of annual video spend across Zoom, Webex, Vimeo, Kaltura, and departmental Stream accounts — plus shadow Zoom Pro expenses you suspect. You just renewed Zoom Enterprise for 2 years.',
      'You will engage with a BDR who leads with cost language and offers a 3-year TCO model.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES from a vendor-economics perspective only: "From a vendor consolidation perspective, yes."',
      '',
      'SHARE (only when earned):',
      '- Approximate spend ($340K across multiple tools) only if asked directly about total video spend',
      '- Suspected shadow IT expensing only if rep asks about unmanaged tools',
      '- You will NOT share contract dates or your CEO\'s name',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You open with "I have 90 seconds. What\'s the ROI?" If the BDR cannot name a dollar number in the first response, push back with "skip the pitch — what\'s the number?" Give them one more chance.',
      'You will admit the $340K figure ONLY if the BDR asks specifically about total video spend across the org. Generic "tell me about your stack" gets nothing.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Jennifer Hargrove?" → "This is Jennifer."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Cost-led opener', hint: '"Ok, cool. I\'m calling because we work with CFOs at companies your size paying for 4 or 5 overlapping video tools. The consolidation story is usually a six-figure line item."' },
      { label: '5. Sharp discovery', hint: '"Do you have visibility into total video spend across the org — including shadow Zoom Pro expenses on cards?"' },
      { label: '6. Peer-anchor credibility', hint: 'Name a similar manufacturer + a specific consolidation savings figure (e.g., "$180K annually after replacing 4 tools").' },
      { label: '7. Soft close', hint: '"20 minutes with you, your procurement lead, and our finance team. We build the 3-year TCO model. Fair?"' },
    ],
  },

  'marketing-webinar-leadgen': {
    id: 'marketing-webinar-leadgen',
    title: 'VP Marketing — Webinars & Lead Gen Attribution',
    subtitle:
      'B2B SaaS VP of Marketing drowning in webinar tool sprawl. Tie Vbrick to pipeline attribution and consolidation — not "better webinars."',
    estimatedMinutes: 4,
    defaultPersonaId: 'marketing-vp-saas',
    defaultAccent: 'general',
    difficultyScore: 4,
    whyVbrickFits:
      'ON24 + Zoom Webinar + GoToWebinar = 3 contracts, 3 reporting flows, broken attribution into HubSpot. Vbrick consolidates webinars + on-demand + customer-story video under one CRM-attributable platform.',
    repGoal:
      'Reframe Vbrick from "video platform" to "marketing-sourced pipeline lever." Earn 15 minutes with Diego + his marketing-ops lead, anchored on attribution and consolidation.',
    openingContinuation:
      '"...we work with VP Marketings at SaaS companies your size who run webinars across ON24, Zoom Webinar, and GoToWebinar — and the attribution back to HubSpot is broken. Most of them are quietly worried about it. Any of that resonate?"',
    prospectTone:
      'Fast, conversational, revenue-fluent. Will give the rep 60 seconds if they speak pipeline. Will polite-exit if they say "platform" twice.',
    likelyProspectResponses: [
      '"We just renewed ON24."',
      '"How is this different from ON24?"',
      '"Webinars aren\'t my biggest pain right now."',
      '"What does this do for my pipeline number?"',
      '"Our website team owns customer video, not me."',
      '"Honestly, attribution is messy."',
      '"Send me a peer reference."',
      '"I don\'t have a video buyer on my team."',
    ],
    strongRepResponses: [
      '"Not asking you to switch off ON24 day one. Quick question — when a prospect attends an ON24 webinar, can you trace that to pipeline in HubSpot today?"',
      '"That\'s the gap most SaaS marketing leaders hit. We consolidate webinars + on-demand + customer-story video and push engagement data into HubSpot at the contact level."',
      '"Most of our customers cut webinar costs 30% and finally got first-touch attribution on pipeline. Want a peer reference at a similar-stage SaaS?"',
      '"15 minutes with you and your marketing-ops lead. Map the attribution gap together. Fair?"',
    ],
    weakRepResponses: [
      '"Our enterprise video platform is the best in class."',
      '"Let me show you a demo of our webinar features."',
      '"AI-powered engagement insights will transform your marketing."',
    ],
    desiredOutcome:
      'A 15-minute working session with Diego + his marketing-ops lead, anchored on webinar consolidation and HubSpot/Salesforce attribution, with a peer SaaS reference.',
    coachingNote:
      'Diego thinks in pipeline, MQL, and CMO conversations. The WIN move is to translate every Vbrick capability into a pipeline lever. "Engagement reporting" means nothing; "first-touch attribution into HubSpot" means everything. If you bring up "platform" twice he will exit. Lead with the attribution problem — he is already worried about it.',
    topMistakes: [
      'Pitching "webinar features" instead of pipeline attribution',
      'Asking him to replace ON24 in the first sentence',
      'Ignoring that customer-story video sits with the website team and acting like he owns it',
    ],
    topWinMoves: [
      'Naming the ON24 → HubSpot attribution gap specifically',
      'Offering to bring marketing-ops into the conversation early',
      'Peer reference with a real consolidation + pipeline-lift figure',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are VP Marketing at a 1,200-employee mid-market B2B SaaS in data infrastructure. You run 8–10 webinars/quarter across ON24 (flagship), Zoom Webinar (smaller), GoToWebinar (legacy). Customer-story video sits with the website team. Attribution is messy — your CMO has asked twice this quarter.',
      'You will engage with a BDR who speaks pipeline and attribution. You will polite-exit anyone who pitches "video platform."',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES for the external/marketing side: "Yeah, external — webinars and customer content sit with my team."',
      '',
      'SHARE (only when earned):',
      '- Webinar tool sprawl (ON24 + Zoom Webinar + GoToWebinar) — only if rep asks about your webinar stack',
      '- Attribution weakness — only if rep asks about pipeline reporting from webinars',
      '- You will NOT share MQL or pipeline targets',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You open with "Make this fast — what does it do for pipeline?" If the BDR uses the word "platform" without tying it to revenue, push back: "skip the platform language — pipeline number, please."',
      'You will admit the ON24/HubSpot attribution gap ONLY if the BDR asks specifically about webinar-to-CRM data flow. Generic "tell me about your stack" gets nothing.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Diego Marquez?" → "Yeah, this is Diego."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Pipeline-led opener', hint: '"Ok, cool. I\'m calling because we work with VP Marketings running webinars across ON24, Zoom Webinar, and GoToWebinar — and attribution back to HubSpot is broken."' },
      { label: '5. Anchor discovery', hint: '"When a prospect attends a webinar today, can you trace that to pipeline in HubSpot?"' },
      { label: '6. Consolidation reframe', hint: '"We replace 3 webinar tools with one, and push engagement into HubSpot at the contact level. Most SaaS customers cut spend 30% and finally got first-touch attribution."' },
      { label: '7. Soft close', hint: '"15 minutes with you and your marketing-ops lead. Map the attribution gap. Fair?"' },
    ],
  },

  'pharma-legal-ediscovery': {
    id: 'pharma-legal-ediscovery',
    title: 'Pharma Legal — eDiscovery & FDA Archival',
    subtitle:
      'General Counsel at a mid-size pharma. Lead with retention, eDiscovery, and FDA promotional review — NOT product features.',
    estimatedMinutes: 4,
    defaultPersonaId: 'compliance-heavy-legal',
    defaultAccent: 'general',
    difficultyScore: 6,
    whyVbrickFits:
      'Pharma has FDA promotional content rules, 7-year retention requirements, and eDiscovery exposure on every video asset. Marketing has been self-publishing product videos without legal review. Vbrick provides governed publishing, retention automation, legal hold, and audit trails.',
    repGoal:
      'Establish credibility on retention + eDiscovery in the first 60 seconds. Avoid product feature pitches. Route the conversation to his compliance team with the right artifacts.',
    openingContinuation:
      '"...we work with General Counsels in pharma who are dealing with Marketing self-publishing product video without legal review — and trying to get retention, legal hold, and FDA-readable audit trails on every asset. Worth two minutes?"',
    prospectTone:
      'Formal, careful, methodical. Will pepper the BDR with retention and audit-trail questions inside 60 seconds. Zero patience for marketing fluff.',
    likelyProspectResponses: [
      '"What\'s your retention policy?"',
      '"Can you support 7-year retention with legal hold?"',
      '"How does this handle FDA promotional review workflows?"',
      '"We need everything archived and searchable for eDiscovery."',
      '"Marketing can\'t self-publish video — that\'s a regulatory risk."',
      '"What\'s your audit trail granularity? Who watched what, when?"',
      '"We need a DPA and the SOC 2 attestation."',
      '"Send me the documentation and I\'ll have my compliance team review."',
    ],
    strongRepResponses: [
      '"Retention is configurable up to 10 years per content class with automated legal hold. Happy to send the spec."',
      '"FDA-style review workflow — content can\'t publish without designated reviewer approval. Full audit log of every approval and edit."',
      '"Per-viewer audit trail: timestamps, IP, device, watch percentage. Exportable for eDiscovery in standard formats."',
      '"Not asking to close you. Who on your compliance team should I route the security and retention documentation to?"',
    ],
    weakRepResponses: [
      '"Our platform is fully compliant — trust us."',
      '"Let me show you the AI-powered features."',
      '"We work with lots of pharma customers."',
    ],
    desiredOutcome:
      'Security + retention documentation sent (SOC 2, DPA, retention spec, audit-trail capabilities), handoff to his compliance lead, and a formal review session scheduled.',
    coachingNote:
      'Robert will test you on retention, audit trail, and legal hold in the first minute. If you do not know your retention spec off the top of your head, he loses respect. The WIN move is to route to his compliance lead fast — pharma legal does not close, they route. Trying to close Robert directly is a trust-breaker. Frame yourself as the connector, not the seller.',
    topMistakes: [
      'Talking about features when he asked about retention',
      'Not knowing your audit-trail capabilities off the top of your head',
      'Trying to close him instead of routing to his compliance team',
    ],
    topWinMoves: [
      'Naming retention duration + automated legal hold in the first 30 seconds',
      'Offering per-viewer audit trail with eDiscovery export',
      'Routing to his compliance lead instead of asking him to drive',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are General Counsel at an 8,000-employee mid-size pharmaceutical company. Marketing has been posting product videos without legal review. FDA has been asking about promotional materials. You are in eDiscovery prep on an unrelated matter — video content has been requested.',
      'You will engage with a BDR who speaks retention, eDiscovery, and audit-trail language. You will polite-exit feature pitches inside 60 seconds.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES from a governance and compliance perspective: "From a governance and compliance standpoint, yes."',
      '',
      'SHARE (only when earned):',
      '- 7-year retention requirement for promotional content — only if rep asks about retention specifically',
      '- Marketing self-publishing problem — only if rep asks about content governance or review workflows',
      '- You will NOT share the eDiscovery matter or specific FDA inquiries',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You will open with "What\'s your retention policy and audit-trail granularity?" in the first minute. If the rep cannot answer concretely, accept "I\'ll confirm and send today" — but mentally note it.',
      'You will share the Marketing self-publishing problem ONLY if the rep asks about content governance or review workflows. Generic "tell me about compliance" gets nothing.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Robert Blackwell?" → "This is Robert."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video governance — internal, external, or both?"' },
      { label: '4. Governance-led opener', hint: '"Ok, cool. I\'m calling because we work with GCs in pharma where Marketing has been self-publishing product video without legal review — and need retention, legal hold, and FDA-readable audit trails."' },
      { label: '5. Credentials upfront', hint: 'Name retention duration, automated legal hold, per-viewer audit trail, SOC 2 Type II, ISO 27001 in the first 30 seconds.' },
      { label: '6. Route, don\'t close', hint: '"I don\'t need to own this. Who on your compliance team should I route the documentation to?"' },
      { label: '7. Soft close', hint: '"I\'ll send the retention spec, audit-trail overview, SOC 2 letter, and DPA today. Your compliance lead drives from there. Fair?"' },
    ],
  },

  'state-gov-rfp-active': {
    id: 'state-gov-rfp-active',
    title: 'State Gov — Active RFP (Competitive)',
    subtitle:
      'Procurement manager evaluating Vbrick vs Kaltura, Panopto, Microsoft Stream. Win the bid by understanding evaluation criteria — not by pitching features.',
    estimatedMinutes: 4,
    defaultPersonaId: 'price-shopping-procurement',
    defaultAccent: 'general',
    difficultyScore: 6,
    whyVbrickFits:
      'State agencies need single-vendor consolidation, public-sector pricing, multi-year fixed rates, and contracts via state vehicles. Vbrick has gov references, accessibility/Section 508 compliance, and on-prem/private cloud options.',
    repGoal:
      'Find out evaluation criteria, decision timeline, and what would tilt the bid toward Vbrick. Land a follow-up where the right Vbrick public-sector lead can join. Do NOT pitch features.',
    openingContinuation:
      '"...I saw the video platform RFP from your agency and wanted to make sure we\'re positioned correctly. Two questions before I send anything: what\'s the evaluation timeline, and which criteria carry the most weight?"',
    prospectTone:
      'Professional, transactional, process-fluent. Speaks RFP language: evaluation criteria, contract vehicles, multi-year terms. Will share process info but not preferences.',
    likelyProspectResponses: [
      '"Are you responding to the RFP or is this a cold call?"',
      '"We need 3 compliant bids minimum."',
      '"Pricing has to be public-sector friendly."',
      '"State contract vehicle is required — are you on one?"',
      '"Tell me about your public-sector experience."',
      '"Section 508 accessibility is non-negotiable."',
      '"We need fixed multi-year pricing."',
      '"Our timeline is 6 weeks. Can you submit?"',
    ],
    strongRepResponses: [
      '"Responding. Two questions to make sure we don\'t waste your time — what\'s the evaluation timeline, and which criteria are weighted highest?"',
      '"We\'re on [state contract vehicle]. Public-sector pricing with 3-year fixed rates is standard for us."',
      '"Section 508 compliant, with automated captioning and audit logs. Happy to send the VPAT today."',
      '"Last quarter we deployed for [peer state agency]. Want me to introduce you to their procurement lead for a reference?"',
    ],
    weakRepResponses: [
      '"Our pricing is enterprise — let me build a custom quote."',
      '"Let me schedule a demo for your evaluation committee."',
      '"We\'re the leader in enterprise video."',
    ],
    desiredOutcome:
      'Linda shares evaluation criteria + timeline, agrees to receive the VPAT + state contract vehicle confirmation + peer agency reference, and connects the Vbrick public-sector lead with the technical evaluators.',
    coachingNote:
      'Linda is not a feature buyer — she is a process buyer. The WIN move is to demonstrate you understand state RFPs: contract vehicles, multi-year fixed pricing, public-sector references, VPAT/Section 508 documentation. The fastest credibility move is naming a peer state agency and offering their procurement lead as a reference. Do NOT try to demo. Route to her technical evaluators with the right artifacts.',
    topMistakes: [
      'Treating an RFP as a cold opportunity (it is not — she has 3 competing bids)',
      'Pitching features instead of asking about evaluation criteria and weights',
      'Not knowing your state contract vehicle status off the top of your head',
    ],
    topWinMoves: [
      'Asking what is weighted highest in the evaluation',
      'Naming a peer state agency with a real deployment',
      'Sending the VPAT + contract vehicle confirmation + peer reference in one packaged email',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are Senior Procurement Manager at a 3,000-employee state government agency. You are running an active video platform RFP. Current vendor is raising prices 40% at renewal. You need 3 compliant bids. You are comparing Vbrick to Kaltura, Panopto, and Microsoft Stream. Timeline is 6 weeks.',
      'You will engage with a BDR who knows public-sector process. You will dismiss anyone who pitches features.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES, scoped to procurement: "I\'m running the procurement evaluation."',
      '',
      'SHARE (only when earned):',
      '- Active RFP and 6-week timeline — share if rep asks about evaluation timing',
      '- Competing vendors named (Kaltura, Panopto, Stream) — share only if rep asks specifically',
      '- You will NOT share evaluation weights, budget ceiling, or your preference',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You open with "Procurement. Are you responding to the RFP or is this a cold call?" Anything that sounds like an attempt to short-circuit the RFP process gets a polite "you\'ll need to go through the process."',
      'You will share evaluation criteria categories (functionality, security, accessibility, total cost) — but not weights — if the rep asks intelligently.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Linda Kowalski?" → "This is Linda."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"I saw the RFP from your agency — are you running the procurement evaluation?"' },
      { label: '4. Process-led opener', hint: '"Two quick questions so we don\'t waste your time — what\'s the evaluation timeline, and which criteria are weighted highest?"' },
      { label: '5. Public-sector credibility', hint: 'Name state contract vehicle. Confirm Section 508 / VPAT. Offer multi-year fixed pricing.' },
      { label: '6. Peer-agency reference', hint: '"Last quarter we deployed for [peer state agency]. Want their procurement lead as a reference?"' },
      { label: '7. Packaged followup', hint: '"I\'ll send the VPAT, contract vehicle confirmation, and peer agency reference in one email today. Your evaluators take it from there."' },
    ],
  },

  'sales-enablement-loom-sprawl': {
    id: 'sales-enablement-loom-sprawl',
    title: 'CRO — Sales Enablement Video Sprawl',
    subtitle:
      'CRO at a cybersecurity software company. AEs are recording rogue Loom videos. Tie Vbrick to ramp time and unapproved-claim risk — not "platform."',
    estimatedMinutes: 4,
    defaultPersonaId: 'cro-sales-enablement',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'AEs using Loom for prospect outreach create unmanaged content + unapproved-claim risk. Vbrick offers governed AE-recorded video with prospect engagement signal back to AEs, integrates with Salesforce/Highspot/Gong, and supports new-rep ramp content.',
    repGoal:
      'Reframe Vbrick from "video platform" to "ramp time + unapproved claim risk lever." Earn 20 minutes for Sasha + her VP Enablement, with one peer CRO reference.',
    openingContinuation:
      '"...we work with CROs in enterprise software where AEs are recording rogue Loom videos for prospects, and Legal has flagged at least one unapproved claim. Most of them care because it hits ramp time or win rate. Worth two minutes?"',
    prospectTone:
      'Outcomes-only, time-aware, irritated by jargon. Will engage if you speak ramp/win/ASP. Will exit if you say "platform" twice.',
    likelyProspectResponses: [
      '"AEs use Loom — they like it."',
      '"We have Highspot for content."',
      '"How is this different from Gong?"',
      '"Enablement owns this, not me."',
      '"I don\'t want another tool to roll out to AEs."',
      '"What does this do for ramp time?"',
      '"I have 90 seconds — go."',
      '"Send me a peer CRO reference."',
    ],
    strongRepResponses: [
      '"Not asking to replace Loom — asking if you have visibility when AE-recorded video contains unapproved claims."',
      '"Most CROs who switched cut ramp time 4–6 weeks because new AEs got prospect engagement signal back when their videos got watched."',
      '"Not pitching a platform — pitching a governance layer for what your AEs are already doing."',
      '"Want a peer CRO reference at a similar-stage cybersecurity company with a real ramp-time number?"',
    ],
    weakRepResponses: [
      '"Our enterprise video platform empowers your revenue team."',
      '"Let me show you a demo of our AE features."',
      '"AI-powered video coaching transforms your sales motion."',
    ],
    desiredOutcome:
      'A 20-minute working session with Sasha + her VP Enablement, anchored on ramp time and unapproved-claim risk, with a peer CRO reference at a similar-stage cybersecurity firm.',
    coachingNote:
      'Sasha will polite-exit anyone using "platform" twice. Every Vbrick capability has to translate into a revenue lever: ramp time, win rate, ASP, deal velocity. The fastest credibility move is naming the unapproved-claim risk — she has lived this and Legal has flagged it. Do NOT try to close her. Route to her VP Enablement.',
    topMistakes: [
      'Using the word "platform" — she will exit',
      'Pitching features instead of ramp/win/ASP impact',
      'Asking her to roll out a new tool to AEs (the wrong frame)',
    ],
    topWinMoves: [
      'Naming the unapproved-claim risk early',
      'Translating every capability into ramp time or win rate',
      'Routing to her VP Enablement with a peer CRO reference',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are CRO at a 4,500-employee enterprise cybersecurity software company. AEs use Loom for prospect outreach. Legal flagged one unapproved-claim video last quarter. New-rep ramp is 7 months; the board wants 5. You have Highspot (content) and Gong (calls). Sales-recorded video is the gap.',
      'You will engage with a BDR who speaks ramp/win/ASP. You will exit if they say "platform" twice.',
      '',
      'OPENING STRUCTURE: your answer to qualification is partial NO with a redirect: "Video strategy? No. Revenue strategy, yes. What does this do for it?"',
      '',
      'SHARE (only when earned):',
      '- Loom usage and the unapproved-claim flag — only if rep asks about AE-recorded video specifically',
      '- 7-month ramp time — only if rep asks about ramp',
      '- You will NOT share the board ramp target',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You open with "I have 90 seconds. What does this do for ramp or win rate?" Anything generic gets one push back ("skip the platform language — number, please?") and one more chance.',
      'You will admit the unapproved-claim flag ONLY if the rep asks about AE-recorded video governance or Legal review specifically.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Sasha Kerrigan?" → "Speaking."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your company\'s video strategy — internal, external, or both?"' },
      { label: '4. Revenue-led opener', hint: '"Ok, cool. I\'m calling because we work with CROs where AEs are recording rogue Loom videos and Legal has flagged unapproved claims — and ramp time hasn\'t moved."' },
      { label: '5. Anchor discovery', hint: '"Do you have visibility when AE-recorded video contains unapproved claims?" — then shut up.' },
      { label: '6. Ramp/win reframe', hint: '"Most CROs who switched cut ramp time 4–6 weeks because new AEs got engagement signal back when prospects watched."' },
      { label: '7. Soft close', hint: '"20 minutes with you and your VP Enablement, one peer CRO reference at a similar-stage cybersecurity firm. Fair?"' },
    ],
  },

  'higher-ed-lecture-capture-renewal': {
    id: 'higher-ed-lecture-capture-renewal',
    title: 'Higher Ed — Lecture Capture Renewal Window',
    subtitle:
      'R1 university Director of Academic Tech. Panopto renewal in 9 months with a 32% price hike. Win with peer R1 references + LMS integration + accessibility.',
    estimatedMinutes: 4,
    defaultPersonaId: 'higher-ed-academic-tech',
    defaultAccent: 'general',
    difficultyScore: 4,
    whyVbrickFits:
      'Higher Ed needs faculty-friendly lecture capture, LMS integration (Canvas/Blackboard), automatic Section 508 / WCAG captioning, and peer R1 references. Panopto pricing pressure + faculty UX complaints create a switch window.',
    repGoal:
      'Pass the peer-institution test in the first 90 seconds. Earn a 30-minute working session with Ramon + his LMS counterpart. Stay out of feature-comparison wars.',
    openingContinuation:
      '"...we work with R1 universities whose Panopto renewals are coming up with 30%+ increases — and whose faculty are quietly saying the recording experience is too clunky. Worth two minutes?"',
    prospectTone:
      'Thoughtful, academic, polite-but-rigorous. Will test the rep on peer institutions early. Allergic to corporate-y language.',
    likelyProspectResponses: [
      '"Which peer R1 institutions do you work with?"',
      '"We are a Panopto shop."',
      '"Our faculty senate would have to weigh in."',
      '"Accessibility has to be baked in, not bolted on."',
      '"How does this integrate with Canvas / Blackboard?"',
      '"Public university — pricing clears procurement."',
      '"What\'s the faculty experience like?"',
      '"How is caption accuracy on technical / STEM lectures?"',
    ],
    strongRepResponses: [
      '"We deployed at [peer R1 university] last academic year. Happy to introduce you to their Academic Tech Director for a reference."',
      '"Faculty workflow is one-click record from Canvas — the recording lives in the course shell automatically. No extra logins."',
      '"Auto-captioning runs WCAG-AA out of the box; for STEM we offer per-discipline language models. Accuracy at peer institutions is averaging 96%."',
      '"30-minute working session with you and your LMS counterpart. Map the integration against your current Panopto setup. Fair?"',
    ],
    weakRepResponses: [
      '"Our platform transforms the academic experience."',
      '"AI-powered learning analytics empower your faculty."',
      '"We work with enterprises too, so we can scale."',
    ],
    desiredOutcome:
      'A 30-minute working session with Ramon + his LMS administrator, anchored on faculty experience and LMS integration, with a peer R1 reference offered.',
    coachingNote:
      'Ramon will test you on peer R1 references inside 90 seconds. If you cannot name one, the call effectively ends — politely. The WIN move is to lead with a named peer institution and offer their Academic Tech Director as a reference. Stay in faculty-experience language. Avoid corporate words. Procurement gets involved later — first earn the academic-side advocate.',
    topMistakes: [
      'Not having a peer R1 reference ready',
      'Using corporate-y language ("transformation," "synergies") with an academic',
      'Pitching features without mentioning LMS integration',
    ],
    topWinMoves: [
      'Naming a peer R1 institution with a real deployment',
      'Leading with faculty workflow ("one click from Canvas")',
      'Owning the accessibility conversation with concrete numbers',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are Director of Academic Technology Services at a 38,000-student public R1 research university. Panopto renewal is 9 months out with a 32% price hike. Faculty survey flagged the recording experience 11 times. Campus accessibility audit flagged STEM caption quality.',
      'You will engage with a BDR who has peer R1 references and speaks academic-side language. You will polite-exit corporate-speak.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES for academic-side video: "Yes — lecture capture and academic-tech video."',
      '',
      'SHARE (only when earned):',
      '- Panopto renewal window and price hike — only if rep asks about current vendor or renewal timing',
      '- Faculty UX complaints (11 mentions in survey) — only if rep asks about faculty experience',
      '- Accessibility audit flag — only if rep asks about accessibility or captioning',
      '- You will NOT share the exact renewal dollar figure',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You open with "Which peer R1 institutions do you work with?" within the first 90 seconds. If the rep cannot name one, you say "appreciate the call but we tend to deploy where our peers have deployed" and start to wind down.',
      'You will share Panopto renewal pain ONLY if rep asks about current stack or renewal specifically. Accessibility flag ONLY if asked about captioning or accessibility.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Dr. Ramon Patel?" → "This is Ramon, yes."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your university\'s lecture capture and academic-tech video?"' },
      { label: '4. Renewal-led opener', hint: '"Ok, cool. I\'m calling because we work with R1 universities whose Panopto renewals are coming up with 30%+ price increases — and whose faculty say the recording experience is too clunky."' },
      { label: '5. Peer-institution credibility', hint: 'Name a peer R1 institution and offer their Academic Tech Director as a reference unprompted.' },
      { label: '6. Faculty + accessibility frame', hint: '"One-click record from Canvas. WCAG-AA captions out of the box, STEM language models for technical lectures."' },
      { label: '7. Soft close', hint: '"30 minutes with you and your LMS counterpart. Map the integration against your Panopto setup. Fair?"' },
    ],
  },

  'chro-global-onboarding': {
    id: 'chro-global-onboarding',
    title: 'CHRO — Global Onboarding & Mobile EX',
    subtitle:
      'CHRO at a global services firm. Onboarding video fragmented across 40 countries. Lead with consistency, multilingual captions, and Board-level reporting.',
    estimatedMinutes: 4,
    defaultPersonaId: 'chro-services',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Global services firm with 40 country offices means inconsistent onboarding video, weak multilingual captioning, and no Board-ready engagement reporting. Vbrick provides one platform with localized captions, mobile-first delivery, and exec-level analytics.',
    repGoal:
      'Pass the peer-firm test in the first 90 seconds (Big 4 / MBB references). Earn 30 minutes for Helena + her global head of learning operations.',
    openingContinuation:
      '"...we work with CHROs at global professional services firms where onboarding video is scattered across country offices, multilingual captions are uneven, and the Board People Committee is asking for engagement reporting. Worth two minutes?"',
    prospectTone:
      'Polished, peer-aware, deliberate. Tests reps with "what are other firms doing?" inside the first minute. Allergic to fluff.',
    likelyProspectResponses: [
      '"What are other Big-4 / MBB firms doing here?"',
      '"We are a Workday Learning shop."',
      '"Onboarding sits with regional managing partners."',
      '"We just refreshed our intranet last year."',
      '"Anything global takes 18 months to roll out."',
      '"Mobile is the daily reality for our consultants."',
      '"How does multilingual captioning actually work?"',
      '"The Board People Committee wants engagement reporting — I do not have it."',
    ],
    strongRepResponses: [
      '"[Peer services firm] rolled out global onboarding video on Vbrick last year. Happy to introduce you to their Head of Learning Operations."',
      '"We layer on Workday Learning — not replace it. Captions auto-localize into your top 8 languages with native-speaker QA on top."',
      '"Mobile-first by default. Most consultants finish leadership content in under 4 minutes on phone."',
      '"30 minutes with you and your global head of learning operations. Map the rollout against your Workday setup. Fair?"',
    ],
    weakRepResponses: [
      '"Our platform transforms employee experience."',
      '"AI-powered learning empowers your workforce."',
      '"Let me set up a demo for your HR team."',
    ],
    desiredOutcome:
      'A 30-minute working session with Helena + her global head of learning operations, anchored on global rollout pattern and Workday integration, with a peer professional-services firm reference.',
    coachingNote:
      'Helena will test you on peer firms (Big 4, MBB) inside the first 90 seconds. If you cannot name one, the conversation cools fast. The WIN move is to lead with a peer services-firm reference and offer their Head of Learning Operations as a contact. Frame Vbrick as a layer on top of Workday Learning — never a replacement. Mobile-first language is non-negotiable.',
    topMistakes: [
      'Not having a peer services-firm reference ready',
      'Positioning Vbrick as a Workday Learning replacement',
      'Ignoring the mobile-first reality of her consultant workforce',
    ],
    topWinMoves: [
      'Naming a peer Big-4 / MBB firm with a real deployment',
      'Framing as "layer on top of Workday Learning"',
      'Speaking specifically to mobile + multilingual captioning',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are CHRO at a 18,000-employee global professional services firm in 40 countries. Onboarding video is fragmented (Workday Learning + regional SharePoint + country YouTube channels). Multilingual caption quality is uneven. Board People Committee wants engagement reporting on leadership content. You do not have it.',
      'You will engage with a BDR who has peer Big-4 / MBB references and speaks Workday + mobile + multilingual language. You will dismiss feature pitches.',
      '',
      'OPENING STRUCTURE: your answer to qualification is YES for employee experience: "Yes — onboarding, leadership comms, employee experience video."',
      '',
      'SHARE (only when earned):',
      '- Multilingual caption complaints from non-English markets — only if rep asks about global rollout or localization',
      '- Board People Committee engagement-reporting gap — only if rep asks about leadership reporting',
      '- You will NOT share country-specific issues or named partners unprompted',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You open with "What are other Big-4 firms doing here?" inside the first minute. If the rep cannot name one, you say "let me know when you have a peer firm we can talk to" and start to wind down.',
      'You will share the Board People Committee gap ONLY if rep asks about exec reporting or leadership content. Multilingual caption complaints ONLY if rep asks about localization.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Helena Stroud?" → "Speaking."' },
      { label: '2. Help request', hint: '"I was hoping you could help me out, real quick."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for your firm\'s employee experience video — onboarding, leadership comms, internal events?"' },
      { label: '4. Global-led opener', hint: '"Ok, cool. I\'m calling because we work with CHROs at global services firms where onboarding video is scattered across country offices and the Board People Committee is asking for engagement reporting."' },
      { label: '5. Peer-firm credibility', hint: 'Name a peer Big-4 / MBB firm and offer their Head of Learning Operations as a reference.' },
      { label: '6. Workday + mobile frame', hint: '"We layer on Workday Learning — not replace it. Mobile-first by default. Native multilingual captions with local-speaker QA."' },
      { label: '7. Soft close', hint: '"30 minutes with you and your global head of learning operations. Map the rollout against your Workday setup. Fair?"' },
    ],
  },

  'telecom-ceo-gatekeeper': {
    id: 'telecom-ceo-gatekeeper',
    title: 'F500 CEO Gatekeeper — Earning the Pass-Through',
    subtitle:
      'Telecom F500 Executive Assistant blocks the CEO line. Skill: respect the gatekeeper, name a known CEO pain, route through her — never around her.',
    estimatedMinutes: 3,
    defaultPersonaId: 'busy-exec-assistant',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'F500 CEOs with quarterly all-hands at 50K employees are exactly Vbrick\'s sweet spot — broadcast scale, engagement reporting, captions. The challenge is getting past the gatekeeper without burning her.',
    repGoal:
      'Earn either (a) a pass-through to the CEO or (b) a named handoff to the right operating leader (typically CCO, CHRO, or Head of IT). Never disrespect the EA. Never try to go around her.',
    openingContinuation:
      '"...I work with CEOs at Fortune 500 companies running quarterly all-hands at scale — usually 30K+ employees on the broadcast. Wanted to ask Patricia first: is this the kind of thing she\'d want me to route through her or directly to whoever owns it?"',
    prospectTone:
      'Professional, formal, polite-but-firm. Has heard every pitch. Will pass you through ONLY if you treat her as a partner, not an obstacle.',
    likelyProspectResponses: [
      '"The CEO doesn\'t take cold calls."',
      '"What is this regarding?"',
      '"Can you send materials and I\'ll review?"',
      '"We\'re not currently evaluating video platforms."',
      '"We have an RFP process for new vendors."',
      '"What company are you with?"',
      '"I can pass this along — what\'s the value proposition for the CEO?"',
      '"Your timing is terrible — we just renewed contracts."',
    ],
    strongRepResponses: [
      '"Totally understand — and that\'s why I\'m calling you first. Quick context: most F500 CEOs we work with care about all-hands quality at scale. Has that been on the CEO\'s radar?"',
      '"Not trying to put a meeting on the calendar. I want to make sure I\'m routing to the right person. Should this go to Comms, HR, or IT inside your org?"',
      '"Last month [peer F500 CEO] and our CEO had a 15-minute call about how we fixed their all-hands. Happy to send a one-page summary you can decide whether to forward."',
      '"Patricia, thank you. I won\'t go around you. What\'s the best way to make sure this lands with the right person on your team?"',
    ],
    weakRepResponses: [
      '"Can you just put me through to the CEO?"',
      '"What\'s the CEO\'s direct email?"',
      '"This is urgent — I really need to speak with him today."',
    ],
    desiredOutcome:
      'Patricia agrees to either (a) pass the one-pager to the CEO with her endorsement, or (b) hand you the name + email of the right operating leader (Comms, HR, or IT), with permission to use Patricia\'s name in the intro.',
    coachingNote:
      'Patricia gets pitched 50 times a month. She decides which ones reach the CEO. The win move is treating her as a partner: ask her where this fits, defer to her judgment, never try to go around her. The fastest credibility move is naming a peer F500 CEO who had a similar all-hands problem. Always thank her by name. The pass-through she controls is the most valuable referral in BDR work.',
    topMistakes: [
      'Asking for the CEO\'s direct line or email',
      'Trying to manufacture urgency ("this is critical")',
      'Treating her like an obstacle instead of a partner',
    ],
    topWinMoves: [
      'Asking HER where this should be routed inside the org',
      'Naming a peer F500 CEO with a real all-hands problem solved',
      'Thanking her by name and respecting her judgment on next step',
    ],
    scenarioContext: [
      'CALL CONTEXT:',
      'You are EA to the CEO at a Fortune 500 telecom. The CEO is frustrated with video quality on monthly town halls (50K employees on the broadcast). The current contract just renewed for 2 years and the CEO hates it. The CEO is also slammed with merger discussions. You protect the CEO\'s time fiercely.',
      'You will engage with a BDR who treats you as a partner. You will polite-exit anyone who tries to go around you.',
      '',
      'OPENING STRUCTURE: BDR is calling the CEO line. You answer first. Your answer to qualification is YES, but as gatekeeper: "I can help — what\'s this about?"',
      '',
      'SHARE (only when earned):',
      '- The CEO\'s frustration with town-hall video quality — only if rep asks about all-hands or broadcast pain',
      '- That the current contract just renewed — only if rep asks about timing',
      '- You will NOT share the CEO\'s schedule, direct email, or the merger context',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You open with "This is Patricia. The CEO doesn\'t take cold calls — but I can help. What\'s this regarding?" If the rep asks for the CEO directly, you politely shut it down: "I handle all incoming for the CEO."',
      'You will share the town-hall pain ONLY if the rep asks about large-event or all-hands quality specifically. You will share the just-renewed contract ONLY if rep asks about timing.',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: '"Patricia Langley?" → "This is Patricia, Executive Assistant to the CEO."' },
      { label: '2. Help request (adjusted)', hint: '"I was hoping you could help me out — and route me, not around you."' },
      { label: '3. Qualification (adjusted)', hint: '"Quick context — I work with CEOs running quarterly all-hands at F500 scale. Is that something Patricia would want routed through her, or directly to whoever owns it?"' },
      { label: '4. Treat her as partner', hint: '"I won\'t go around you. What\'s the best way to make sure this lands with the right person on your team?"' },
      { label: '5. Peer-CEO credibility', hint: 'Name a peer F500 CEO with a real all-hands problem solved.' },
      { label: '6. One-pager offer', hint: '"Let me send a one-pager you can decide whether to forward — or who else on your team should see it first."' },
      { label: '7. Clean exit', hint: '"Patricia, thank you. I\'ll send that today. Anyone else on your team I should copy?"' },
    ],
  },
}

export function getScenarioById(id: string | null | undefined): SparringScenario | null {
  if (!id) return null
  return SPARRING_SCENARIOS[id] ?? null
}
