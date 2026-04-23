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
        label: '5. K26 follow-up',
        hint:
          '"Oh by the way, would you happen to be attending K26 in a few weeks?" If yes → booth/coffee. If no → "Do you know if anybody from your org is going?" → name → "Should I say hello for you?"',
      },
    ],
  },

  'k26-registration-push': {
    id: 'k26-registration-push',
    title: 'K26 — Registration Push',
    subtitle:
      'ServiceNow customer hasn\'t registered for Knowledge 26. Drive enrollment using the certified ServiceNow integration as the reason to go.',
    estimatedMinutes: 3,
    defaultPersonaId: 'disinterested-it-manager',
    defaultAccent: 'general',
    scenarioContext: [
      'CALL CONTEXT:',
      'Your company is an existing ServiceNow customer. Knowledge 26 is ServiceNow\'s annual conference, a few weeks away in Las Vegas. You have heard about it but have not registered. Budget, timing, and whether it\'s worth the trip are all open questions for you.',
      'The BDR is calling from VBrick (enterprise video platform with a certified ServiceNow integration). They will pitch K26 attendance as a chance to see the integration live, meet the ServiceNow product team, and walk away with a concrete reason to justify the trip.',
      '',
      'REACT HONESTLY based on your personality. You can be any of:',
      '- Curious about the integration and on the fence about K26',
      '- Already heard about K26 but dismissive ("maybe someone else on my team goes")',
      '- Blocked by travel budget or timing',
      '- Interested IF you can justify the trip to your boss',
      '',
      'Do NOT volunteer that you\'re interested in K26 yourself. Let the BDR raise it.',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You have a travel freeze in effect, OR your manager would have to approve the K26 ticket and you don\'t want to ask. Push back on "it\'s free to register" — the real cost is the flight, hotel, and three days away from your team.',
      'You have also been pitched K26 three times this week by other vendors. The BDR needs to give you a concrete, substance-first reason — not a generic "you should come."',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: 'They answer "Hello?". You say their first and last name inquisitive ("Marcus Delgado?"). They confirm.' },
      { label: '2. Help request', hint: '"Great, [first name], I was hoping you could help me out for a moment."' },
      { label: '3. Qualification', hint: '"[First name], are you on the team that manages your ServiceNow and enterprise video stack?"' },
      {
        label: '4. K26 hook',
        hint:
          '"Okay cool. Quick reason for the call — VBrick just rolled out a certified ServiceNow integration, and the K26 team is walking through it live. Any chance you\'re going to be at Knowledge 26?"',
      },
      {
        label: '5a. NOT REGISTERED path',
        hint:
          '"Would it help if I sent you the registration link and a 2-minute overview of the integration? That way if your manager asks why you\'re going, you\'ve got something concrete to point at."',
      },
      {
        label: '5b. NOT ATTENDING path',
        hint:
          '"Totally understand. Would anyone else on your team be going? I can send them the link. And if it\'s okay, can I tell them you said hello?"',
      },
      {
        label: '6. Bridge to integration',
        hint:
          '"Either way, the integration is the thing worth looking at — happy to send you the overview."',
      },
    ],
  },

  'k26-booth-drive': {
    id: 'k26-booth-drive',
    title: 'K26 — Booth Drive',
    subtitle:
      'ServiceNow customer already registered for K26. Pre-book a booth visit so they don\'t miss it in the floor chaos.',
    estimatedMinutes: 3,
    defaultPersonaId: 'enthusiastic-innovator',
    defaultAccent: 'general',
    scenarioContext: [
      'CALL CONTEXT:',
      'Your company is a ServiceNow customer and you are registered for Knowledge 26. You are attending — flight is booked, agenda is filling up.',
      'The BDR is calling from VBrick. They will ask you to lock in a 15-minute booth slot to see the certified ServiceNow integration live, meet the integration lead, and walk away with something concrete.',
      '',
      'REACT HONESTLY based on your personality. You can be any of:',
      '- Genuinely interested in the ServiceNow + video integration story',
      '- Packed schedule, hard to find a window',
      '- Skeptical of booth pitches in general',
      '- Willing to stop by IF it\'s a specific, timed slot (not "come by anytime")',
      '- Dismissive ("I walk the floor, I don\'t schedule booths")',
      '',
      'Do NOT volunteer that you\'re interested — let the BDR earn the time on the calendar.',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'Your schedule is already triple-booked with ServiceNow partner meetings and your own company\'s sessions. You push back on anything that feels like a walk-by — you only take meetings that are pre-briefed with a clear agenda.',
      'You also had a bad booth experience at a past event (vendor wasted 20 minutes on a generic demo). You will explicitly ask: "What\'s the agenda? Who from your team will be there? How long?"',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: 'They answer. You say their first and last name inquisitive. They confirm.' },
      { label: '2. Help request', hint: '"Great, [first name], I was hoping you could help me out for a moment."' },
      { label: '3. Qualification', hint: '"Are you planning to be at Knowledge 26?"' },
      {
        label: '4. Booth pre-book hook',
        hint:
          '"Okay cool. The reason I\'m calling — I\'d like to lock in a 15-minute booth slot so you\'re not walking the floor hoping to catch us. We\'ll have our certified ServiceNow integration live on screen. Does Tuesday or Wednesday work better?"',
      },
      { label: '5. Agenda qualifier', hint: '"I\'ll have our ServiceNow integration lead there. I\'ll send you an agenda beforehand so it\'s not a generic demo."' },
      {
        label: '6. Session cross-sell',
        hint:
          '"We\'re also hosting a breakout session walking through a customer case study — happy to send the time and abstract so you can decide if it fits your agenda."',
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
      'You have been cold-called by three enterprise video vendors in the last month (Brightcove, Kaltura, Panopto). Your pattern-matching triggers instantly. The BDR has to say something in the first 20 seconds that differentiates from the other three or you will politely exit.',
      'You also dislike the word "platform." Any vendor who says "we\'re the platform for X" loses you immediately. Make the BDR speak in outcomes, not categories.',
      'If the BDR uses "EVP program" without explaining it, push back: "What do you mean by that? I\'ve seen different definitions."',
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

  'k26-session-drive': {
    id: 'k26-session-drive',
    title: 'K26 — Session Attendance Drive',
    subtitle:
      'ServiceNow customer attending K26. Drive attendance at the VBrick breakout session — customer case study, not a demo.',
    estimatedMinutes: 3,
    defaultPersonaId: 'overwhelmed-cto',
    defaultAccent: 'general',
    scenarioContext: [
      'CALL CONTEXT:',
      'Your company is a ServiceNow customer and you are registered for Knowledge 26.',
      'The BDR is calling from VBrick. They will pitch you on attending VBrick\'s breakout session — a customer case study on using the certified ServiceNow integration inside Agentforce and Now Assist.',
      '',
      'REACT HONESTLY based on your personality. You can be any of:',
      '- Sessions are the reason you attend — open to a good one',
      '- Already built a full agenda, no room',
      '- Will attend IF the speaker or topic is compelling',
      '- Skeptical of vendor sessions (usually thinly-veiled product pitches)',
      '- Will block it if it\'s at a conflicting time',
      '',
      'Do NOT volunteer your schedule — let the BDR ask.',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'Your Knowledge 26 agenda is already locked and the VBrick session conflicts with a ServiceNow roadmap keynote you care about. Push back hard — "why should I skip the roadmap keynote for your session?"',
      'You are also tired of vendor sessions that are 40 minutes of product demo. You will ask: "Is this a case study or a demo? Who\'s the speaker? What will I walk away with?"',
    ].join('\n'),
    cheatCard: [
      { label: '1. Name confirmation', hint: 'They answer. You say their first and last name inquisitive. They confirm.' },
      { label: '2. Help request', hint: '"Great, [first name], I was hoping you could help me out for a moment."' },
      { label: '3. Qualification', hint: '"Are you attending Knowledge 26?" → "Have you built out your session agenda yet?"' },
      {
        label: '4. Session hook',
        hint:
          '"Okay cool. The reason I\'m calling — VBrick is hosting a breakout on how our certified ServiceNow integration is being used inside Agentforce and Now Assist. It\'s a customer case study, not a demo."',
      },
      {
        label: '5. Substance qualifier',
        hint:
          '"The speaker is [customer name / title]. I\'ll send you the abstract and the session time so you can decide if it\'s worth blocking on your agenda."',
      },
      {
        label: '6. Booth cross-sell',
        hint:
          '"If the session doesn\'t fit, I can lock in a 15-minute booth slot instead so you\'re not walking by hoping to catch us."',
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
    difficultyScore: 3,
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
      'You are mid-email with your CFO when the call comes in. You will give the BDR 20 seconds to make the referral-ask clean, then you will politely exit whether they got it or not.',
      'You will NOT spell Priya\'s name unless asked twice. You will NOT give her title, email, or phone number — only her name and role.',
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
    difficultyScore: 6,
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
      'You have 12 minutes before the CHRO call. You will test the BDR with "How is this different from Zoom?" in the first 30 seconds. If they answer with buzzwords, you exit.',
      'You will NOT share the EMEA caption story unless the BDR asks specifically about captions OR names the problem before you do.',
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
    difficultyScore: 7,
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
      'You are troubleshooting a VPN issue when the call comes in. You have 45 seconds of patience. If the BDR uses the word "platform" in the first 30 seconds, you will politely exit.',
      'You will NOT admit to the bandwidth problem unless the BDR asks about WAN, multicast, or all-hands scale specifically.',
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
    difficultyScore: 6,
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
      'You have been pitched by three "learning platforms" this month. You are skeptical by default. If the BDR tries to replace Cornerstone or uses the word "transformation," you exit politely.',
      'You will NOT agree to a demo — only a working session with your head of Learning Tech, and only if the BDR names the Cornerstone integration specifically.',
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
    difficultyScore: 8,
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
      'You will open the call with "What\'s your SOC 2 Type II status?" in the first 20 seconds. If the BDR cannot answer cleanly, you will politely exit.',
      'You will push hard on "Teams already does this." If the BDR tries to replace Teams, you exit. If they position Vbrick as complementary with specific audit-trail gaps Teams doesn\'t address, you engage.',
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
    difficultyScore: 8,
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
      'You lead with the renewal signal: "Our CIO just signed the M365 renewal." This is bait. If the BDR tries to out-pitch Microsoft, you exit.',
      'You will NOT admit the Teams Live Events failures unless the BDR names scale failures or audio drops specifically.',
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
    difficultyScore: 7,
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
      'You will open with "Is this internal or external? It changes who should be on the call." This is a test. If the BDR picks one and loses the other side, you disengage.',
      'You will NOT commit to organizing a cross-functional meeting yourself. The BDR has to structure it.',
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
}

export function getScenarioById(id: string | null | undefined): SparringScenario | null {
  if (!id) return null
  return SPARRING_SCENARIOS[id] ?? null
}
