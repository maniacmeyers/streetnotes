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
  personaId: PersonaId
  defaultAccent: BDRAccent
  scenarioContext: string
  hardModeContext: string
  cheatCard: ScenarioScriptStep[]
}

export const SPARRING_SCENARIOS: Record<string, SparringScenario> = {
  'bending-spoons-k26': {
    id: 'bending-spoons-k26',
    title: 'Bending Spoons Check-in + K26 Invite',
    subtitle:
      'Call a VP at a recently acquired company. Check on integration friction, pitch the K26 booth.',
    estimatedMinutes: 3,
    personaId: 'bending-spoons-vp',
    defaultAccent: 'general',
    scenarioContext: [
      'SCENARIO CONTEXT:',
      'The BDR is calling to do three specific things:',
      '1. Confirm they are speaking to the right person.',
      '2. Ask about friction from the Bending Spoons acquisition (especially anything touching internal comms or video tooling).',
      '3. Ask whether you plan to attend K26 next month. If so, invite you to stop by the VBRICK booth to see the multi-modal AI demo — "pull the exact frame of a video you need, whenever you need it."',
      'Respond as Dana, realistically. You can be positive, guarded, or busy depending on how the BDR opens.',
    ].join('\n'),
    hardModeContext: [
      'HARD MODE MODIFIERS:',
      'You have been contacted three separate times this month about the Bending Spoons acquisition — once by a consultant, twice by SaaS vendors. You are protective of your time. Push back on generic openers like "How are things going?". You expect specifics. You will end the call within 30 seconds if the BDR has not given you a concrete reason to stay on the line. You are NOT attending K26 unless someone gives you a concrete reason tied to a problem you actually have.',
    ].join('\n'),
    cheatCard: [
      {
        label: 'Confirm you are speaking to the right person',
        hint: 'Short and direct: "Is this Dana? Quick question for you."',
      },
      {
        label: 'Ask about Bending Spoons friction',
        hint: '"What has felt different since the deal closed?" — then listen.',
      },
      {
        label: 'Ask about K26 and pitch the booth',
        hint: '"While I have you — are you going to K26? If so, stop by. We are showing multi-modal AI that pulls the exact frame of a video you need."',
      },
    ],
  },
}

export function getScenarioById(id: string | null | undefined): SparringScenario | null {
  if (!id) return null
  return SPARRING_SCENARIOS[id] ?? null
}
