/**
 * Content-contract check for the Vbrick sparring scenarios.
 * tsc already enforces required fields exist; this catches empty arrays,
 * bad persona references, and roster drift. Run: npx tsx scripts/check-sparring-scenarios.ts
 */
import { SPARRING_SCENARIOS } from '../lib/vbrick/sparring-scenarios'
import { ALL_PERSONAS } from '../lib/vbrick/sparring-personas'

const personaIds = new Set(ALL_PERSONAS.map((p) => p.id))
const scenarios = Object.values(SPARRING_SCENARIOS)
const errors: string[] = []

const EXPECTED_COUNT = 12
if (scenarios.length !== EXPECTED_COUNT) {
  errors.push(`Expected ${EXPECTED_COUNT} scenarios, found ${scenarios.length}`)
}

for (const s of scenarios) {
  const req = (cond: boolean, msg: string) => {
    if (!cond) errors.push(`[${s.id}] ${msg}`)
  }
  req(s.id === Object.keys(SPARRING_SCENARIOS).find((k) => SPARRING_SCENARIOS[k] === s), 'id mismatch with key')
  req(personaIds.has(s.defaultPersonaId), `unknown defaultPersonaId "${s.defaultPersonaId}"`)
  req(s.scenarioContext.trim().length > 40, 'scenarioContext too short / empty')
  req(s.hardModeContext.trim().length > 20, 'hardModeContext too short / empty')
  req(s.cheatCard.length >= 4, 'cheatCard needs >= 4 steps')
  req(s.likelyProspectResponses.length >= 4, 'needs >= 4 likelyProspectResponses')
  req(s.strongRepResponses.length >= 3, 'needs >= 3 strongRepResponses')
  req(s.weakRepResponses.length >= 2, 'needs >= 2 weakRepResponses')
  req(s.topMistakes.length >= 2, 'needs >= 2 topMistakes')
  req(s.topWinMoves.length >= 2, 'needs >= 2 topWinMoves')
  req(s.winningPathBeats.length >= 3, 'needs >= 3 winningPathBeats')
  req(s.winningPathBeats.every((b) => b.idealLine.trim().length > 10), 'a winningPathBeat has an empty idealLine')
  req(s.difficultyScore >= 1 && s.difficultyScore <= 10, 'difficultyScore out of 1-10 range')
}

if (errors.length) {
  console.error(`sparring_scenarios_contract_FAILED (${errors.length}):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

console.log(`sparring_scenarios_contract_ok — ${scenarios.length} scenarios, all fields populated, persona refs valid`)
