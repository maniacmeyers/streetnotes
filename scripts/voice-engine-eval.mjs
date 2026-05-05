import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturePath = path.join(__dirname, '..', 'test-fixtures', 'voice-engine', 'aesthetic-debriefs.json')
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))

const requiredExpectedKeys = [
  'dealSegment',
  'modality',
  'competitorsMentioned',
  'mustMention',
]

let failures = 0

for (const fixture of fixtures) {
  const prefix = `[${fixture.id}]`
  if (!fixture.transcript || fixture.transcript.length < 40) {
    console.error(`${prefix} transcript is too short`)
    failures += 1
  }
  for (const key of requiredExpectedKeys) {
    if (!(key in fixture.expected)) {
      console.error(`${prefix} missing expected.${key}`)
      failures += 1
    }
  }
  if (!Array.isArray(fixture.expected.competitorsMentioned)) {
    console.error(`${prefix} expected.competitorsMentioned must be an array`)
    failures += 1
  }
  if (!Array.isArray(fixture.expected.mustMention)) {
    console.error(`${prefix} expected.mustMention must be an array`)
    failures += 1
  }
}

if (failures > 0) {
  console.error(`Voice-engine fixture validation failed with ${failures} issue(s).`)
  process.exit(1)
}

console.log(`Voice-engine fixture validation passed for ${fixtures.length} aesthetic scenarios.`)
