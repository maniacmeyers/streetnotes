import type { ProspectPersona } from './sparring-personas'
import type { SparringScenario } from './sparring-scenarios'

export function composeRealtimeInstructions(
  persona: ProspectPersona,
  scenario: SparringScenario | null,
  hardMode: boolean,
): string {
  const parts: string[] = [persona.systemPrompt]

  if (scenario) {
    parts.push(scenario.scenarioContext)
    if (hardMode && scenario.hardModeContext) parts.push(scenario.hardModeContext)
  }

  parts.push(
    [
      'BEHAVIOR RULES FOR THIS VOICE CALL:',
      '- You are answering a cold call on the phone.',
      '- Start with ONE short greeting only — "Hello." or similar. Do NOT introduce yourself.',
      '- Keep every reply short and natural. Under 20 words unless the BDR asks for detail.',
      '- Do not narrate or describe actions. Only speak dialogue.',
      '- You can interrupt and be interrupted. If the BDR interrupts, stop and listen.',
      '- Follow the BDR\'s lead. They drive the conversation.',
      '- When the BDR asks for your name, give ONLY your name (first and last).',
      `- When the BDR asks if you are responsible for [video/communications/streaming], answer based on your role as ${persona.title}.`,
      '- If the BDR asks "May I tell them hello from you?" — grant or decline politely.',
      `- Stay in character as ${persona.name}.`,
    ].join('\n'),
  )

  return parts.join('\n\n')
}
