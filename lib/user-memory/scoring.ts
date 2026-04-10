import type { CRMNote } from '@/lib/notes/schema'

export type MemoryCategory =
  | 'contacts'
  | 'companies'
  | 'competitors'
  | 'products'
  | 'dealStages'

export type MemoryEntry = {
  value: string
  score: number
  lastSeen: string
}

export type UserMemory = {
  contacts: MemoryEntry[]
  companies: MemoryEntry[]
  competitors: MemoryEntry[]
  products: MemoryEntry[]
  dealStages: MemoryEntry[]
}

export const EMPTY_USER_MEMORY: UserMemory = {
  contacts: [],
  companies: [],
  competitors: [],
  products: [],
  dealStages: [],
}

const HALF_LIFE_DAYS = 60
const TOP_N = 20
const DAY_MS = 1000 * 60 * 60 * 24

export function recencyScore(ageDays: number): number {
  const safe = Math.max(0, ageDays)
  return Math.exp(-(Math.LN2 * safe) / HALF_LIFE_DAYS)
}

type ScoredAccumulator = Map<string, { score: number; lastSeen: string; display: string }>

function bump(
  acc: ScoredAccumulator,
  raw: string | undefined | null,
  score: number,
  createdAt: string
) {
  if (!raw) return
  const trimmed = raw.trim()
  if (!trimmed) return
  const key = trimmed.toLowerCase()
  const existing = acc.get(key)
  if (existing) {
    existing.score += score
    if (createdAt > existing.lastSeen) {
      existing.lastSeen = createdAt
      existing.display = trimmed
    }
  } else {
    acc.set(key, { score, lastSeen: createdAt, display: trimmed })
  }
}

function topEntries(acc: ScoredAccumulator): MemoryEntry[] {
  return Array.from(acc.values())
    .sort((a, b) => b.score - a.score || (a.lastSeen < b.lastSeen ? 1 : -1))
    .slice(0, TOP_N)
    .map(({ display, score, lastSeen }) => ({ value: display, score, lastSeen }))
}

export function aggregateEntities(
  notes: Array<{ structured_output: CRMNote; created_at: string }>,
  now: Date = new Date()
): UserMemory {
  const contacts: ScoredAccumulator = new Map()
  const companies: ScoredAccumulator = new Map()
  const competitors: ScoredAccumulator = new Map()
  const products: ScoredAccumulator = new Map()
  const dealStages: ScoredAccumulator = new Map()

  for (const row of notes) {
    const structured = row.structured_output
    if (!structured) continue
    const createdAt = row.created_at
    const created = new Date(createdAt).getTime()
    const ageDays = Number.isFinite(created)
      ? Math.max(0, (now.getTime() - created) / DAY_MS)
      : 0
    const score = recencyScore(ageDays)

    bump(contacts, structured.contactName, score, createdAt)
    bump(companies, structured.company, score, createdAt)
    bump(dealStages, structured.dealStage, score, createdAt)

    for (const competitor of structured.competitorsMentioned ?? []) {
      bump(competitors, competitor, score, createdAt)
    }
    for (const product of structured.productsDiscussed ?? []) {
      bump(products, product, score, createdAt)
    }
    for (const attendee of structured.attendees ?? []) {
      bump(contacts, attendee.name, score, createdAt)
    }
  }

  return {
    contacts: topEntries(contacts),
    companies: topEntries(companies),
    competitors: topEntries(competitors),
    products: topEntries(products),
    dealStages: topEntries(dealStages),
  }
}

function formatEntries(entries: MemoryEntry[], limit: number): string {
  if (entries.length === 0) return ''
  return entries
    .slice(0, limit)
    .map((entry) => entry.value)
    .join(', ')
}

export function isMemoryEmpty(memory: UserMemory): boolean {
  return (
    memory.contacts.length === 0 &&
    memory.companies.length === 0 &&
    memory.competitors.length === 0 &&
    memory.products.length === 0 &&
    memory.dealStages.length === 0
  )
}

export function buildClaudeContextBlock(memory: UserMemory): string {
  if (isMemoryEmpty(memory)) return ''

  const lines: string[] = []
  const contacts = formatEntries(memory.contacts, 15)
  const companies = formatEntries(memory.companies, 15)
  const competitors = formatEntries(memory.competitors, 10)
  const products = formatEntries(memory.products, 10)
  const stages = formatEntries(memory.dealStages, 8)

  if (contacts) lines.push(`Known Contacts: ${contacts}`)
  if (companies) lines.push(`Known Companies: ${companies}`)
  if (competitors) lines.push(`Known Competitors: ${competitors}`)
  if (products) lines.push(`Known Products: ${products}`)
  if (stages) lines.push(`Recent Deal Stages: ${stages}`)

  const raw = lines.join('\n')
  const MAX_CHARS = 2000
  return raw.length > MAX_CHARS ? raw.slice(0, MAX_CHARS) : raw
}
