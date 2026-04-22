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
}

export function getScenarioById(id: string | null | undefined): SparringScenario | null {
  if (!id) return null
  return SPARRING_SCENARIOS[id] ?? null
}
