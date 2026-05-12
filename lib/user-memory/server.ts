import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { debriefOutputToCRMNote } from '@/lib/debrief/adapter'
import type { CRMNote } from '@/lib/notes/schema'
import { aggregateEntities, EMPTY_USER_MEMORY, type UserMemory } from './scoring'
import type { DebriefStructuredOutput } from '@/lib/debrief/types'

type CacheEntry = { memory: UserMemory; expiresAt: number }

const CACHE_TTL_MS = 5 * 60 * 1000
const RECENT_NOTES_LIMIT = 100

const memoryCache = new Map<string, CacheEntry>()
const debriefMemoryCache = new Map<string, CacheEntry>()

function isDebriefOutput(value: unknown): value is DebriefStructuredOutput {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dealSnapshot' in value &&
    'followUpTasks' in value
  )
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function extractCRMNote(value: unknown): CRMNote | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  if ('crmNote' in record && record.crmNote && typeof record.crmNote === 'object') {
    return record.crmNote as CRMNote
  }

  return value as CRMNote
}

export async function getUserMemory(userId: string): Promise<UserMemory> {
  if (!userId) return EMPTY_USER_MEMORY

  const now = Date.now()
  const cached = memoryCache.get(userId)
  if (cached && cached.expiresAt > now) {
    return cached.memory
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('notes')
      .select('structured_output, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(RECENT_NOTES_LIMIT)

    if (error || !data) {
      if (error && process.env.DEBUG_USER_MEMORY) {
        console.error('[user-memory] fetch error:', error)
      }
      return EMPTY_USER_MEMORY
    }

    const rows = data
      .filter((row): row is { structured_output: unknown; created_at: string } =>
        row.structured_output != null && typeof row.created_at === 'string'
      )
      .map((row) => {
        const crmNote = extractCRMNote(row.structured_output)
        if (!crmNote) return null
        return {
          structured_output: crmNote,
          created_at: row.created_at,
        }
      })
      .filter((row): row is { structured_output: CRMNote; created_at: string } => row !== null)

    const memory = aggregateEntities(rows)
    memoryCache.set(userId, { memory, expiresAt: now + CACHE_TTL_MS })
    return memory
  } catch (err) {
    if (process.env.DEBUG_USER_MEMORY) {
      console.error('[user-memory] getUserMemory threw:', err)
    }
    return EMPTY_USER_MEMORY
  }
}

export function invalidateUserMemory(userId: string): void {
  if (!userId) return
  memoryCache.delete(userId)
}

export async function getDebriefMemory(email: string): Promise<UserMemory> {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) return EMPTY_USER_MEMORY

  const now = Date.now()
  const cached = debriefMemoryCache.get(cleanEmail)
  if (cached && cached.expiresAt > now) {
    return cached.memory
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('debrief_sessions')
      .select('structured_output, created_at')
      .eq('email', cleanEmail)
      .not('structured_output', 'is', null)
      .order('created_at', { ascending: false })
      .limit(RECENT_NOTES_LIMIT)

    if (error || !data) {
      if (error && process.env.DEBUG_USER_MEMORY) {
        console.error('[debrief-memory] fetch error:', error)
      }
      return EMPTY_USER_MEMORY
    }

    const rows = data
      .filter((row): row is { structured_output: unknown; created_at: string } =>
        row.structured_output != null && typeof row.created_at === 'string'
      )
      .map((row) => {
        const structured = row.structured_output
        const crmNote = isDebriefOutput(structured)
          ? debriefOutputToCRMNote(structured)
          : (structured as CRMNote)
        return {
          structured_output: crmNote,
          created_at: row.created_at,
        }
      })

    const memory = aggregateEntities(rows)
    debriefMemoryCache.set(cleanEmail, { memory, expiresAt: now + CACHE_TTL_MS })
    return memory
  } catch (err) {
    if (process.env.DEBUG_USER_MEMORY) {
      console.error('[debrief-memory] getDebriefMemory threw:', err)
    }
    return EMPTY_USER_MEMORY
  }
}

export function invalidateDebriefMemory(email: string): void {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) return
  debriefMemoryCache.delete(cleanEmail)
}
