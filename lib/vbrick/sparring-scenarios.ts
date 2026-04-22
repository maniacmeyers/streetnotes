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
}

export function getScenarioById(id: string | null | undefined): SparringScenario | null {
  if (!id) return null
  return SPARRING_SCENARIOS[id] ?? null
}
