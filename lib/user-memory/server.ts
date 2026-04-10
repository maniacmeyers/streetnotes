import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { CRMNote } from '@/lib/notes/schema'
import { aggregateEntities, EMPTY_USER_MEMORY, type UserMemory } from './scoring'

type CacheEntry = { memory: UserMemory; expiresAt: number }

const CACHE_TTL_MS = 5 * 60 * 1000
const RECENT_NOTES_LIMIT = 100

const memoryCache = new Map<string, CacheEntry>()

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
      .filter(
        (row): row is { structured_output: CRMNote; created_at: string } =>
          row.structured_output != null && typeof row.created_at === 'string'
      )
      .map((row) => ({
        structured_output: row.structured_output as CRMNote,
        created_at: row.created_at,
      }))

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
