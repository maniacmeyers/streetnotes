import type { CRMNote } from '@/lib/notes/schema'
import type { MemoryEntry, UserMemory } from './scoring'

const MIN_CANONICAL_SCORE = 2

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const m = a.length
  const n = b.length
  let prev = new Array<number>(n + 1)
  let curr = new Array<number>(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      )
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

function allowedDistance(a: string, b: string): number {
  const len = Math.max(a.length, b.length)
  if (len <= 4) return 0
  if (len <= 10) return 2
  return 3
}

type Candidate = { canonical: MemoryEntry; distance: number }

function findCanonical(
  value: string,
  entries: MemoryEntry[]
): MemoryEntry | null {
  if (!value) return null
  const raw = value.trim()
  if (!raw) return null
  const lower = raw.toLowerCase()

  let best: Candidate | null = null
  for (const entry of entries) {
    if (entry.score < MIN_CANONICAL_SCORE) continue
    const canonicalLower = entry.value.toLowerCase()
    if (canonicalLower === lower) return entry

    // First-name / substring containment: "Mike" ⊂ "Mike Johnson"
    const rawTokens = lower.split(/\s+/).filter(Boolean)
    const canonicalTokens = canonicalLower.split(/\s+/).filter(Boolean)
    if (
      rawTokens.length === 1 &&
      canonicalTokens.length > 1 &&
      canonicalTokens[0] === rawTokens[0]
    ) {
      const candidate = { canonical: entry, distance: 0 }
      if (!best || candidate.distance < best.distance) best = candidate
      continue
    }

    const distance = levenshtein(lower, canonicalLower)
    if (distance <= allowedDistance(lower, canonicalLower)) {
      if (!best || distance < best.distance) {
        best = { canonical: entry, distance }
      }
    }
  }

  return best ? best.canonical : null
}

function debugLog(from: string, to: string, field: string) {
  if (process.env.DEBUG_USER_MEMORY) {
    console.log(`[user-memory] reconcile ${field}: "${from}" → "${to}"`)
  }
}

function substituteScalar(
  value: string | undefined,
  entries: MemoryEntry[],
  field: string
): string | undefined {
  if (!value) return value
  const canonical = findCanonical(value, entries)
  if (!canonical || canonical.value === value) return value
  debugLog(value, canonical.value, field)
  return canonical.value
}

function substituteArray(
  values: string[] | undefined,
  entries: MemoryEntry[],
  field: string
): string[] | undefined {
  if (!values || values.length === 0) return values
  return values.map((v) => {
    const canonical = findCanonical(v, entries)
    if (!canonical || canonical.value === v) return v
    debugLog(v, canonical.value, field)
    return canonical.value
  })
}

export function reconcileCRMNote(note: CRMNote, memory: UserMemory): CRMNote {
  const next: CRMNote = { ...note }

  next.contactName = substituteScalar(note.contactName, memory.contacts, 'contactName')
  next.company = substituteScalar(note.company, memory.companies, 'company')
  next.competitorsMentioned = substituteArray(
    note.competitorsMentioned,
    memory.competitors,
    'competitorsMentioned'
  )
  next.productsDiscussed = substituteArray(
    note.productsDiscussed,
    memory.products,
    'productsDiscussed'
  )

  if (note.attendees && note.attendees.length > 0) {
    next.attendees = note.attendees.map((attendee) => {
      if (!attendee.name) return attendee
      const canonical = findCanonical(attendee.name, memory.contacts)
      if (!canonical || canonical.value === attendee.name) return attendee
      debugLog(attendee.name, canonical.value, 'attendees[].name')
      return { ...attendee, name: canonical.value }
    })
  }

  return next
}
