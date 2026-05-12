import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  structureTranscript,
  StructureProviderAuthError,
  StructureProviderModelError,
  StructureValidationError,
} from '@/lib/voice-engine/structure'
import { EMPTY_USER_MEMORY } from '@/lib/user-memory/scoring'
import { getUserMemory } from '@/lib/user-memory/server'
import { getPreferredCrm, getCachedSchema, getStickyRules } from '@/lib/crm/schema/cache'
import type { CrmSchema, StickyRule } from '@/lib/crm/schema/types'
import { isRateLimited } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60
const STRUCTURE_LIMIT = 60
const STRUCTURE_WINDOW_MS = 15 * 60 * 1000

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  const key = `structure:${user.id}`
  if (isRateLimited(key, STRUCTURE_LIMIT, STRUCTURE_WINDOW_MS)) {
    return jsonError('Too many structuring requests. Please try again shortly.', 429)
  }

  let body: { transcript: string }
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const { transcript } = body
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return jsonError('Missing or empty transcript', 400)
  }

  let memory = EMPTY_USER_MEMORY
  try {
    memory = await getUserMemory(user.id)
  } catch (err) {
    if (process.env.DEBUG_USER_MEMORY) {
      console.error('[structure] getUserMemory failed, continuing without:', err)
    }
  }

  let crmSchema: CrmSchema | null = null
  let stickyRules: StickyRule[] = []
  try {
    const preferredCrm = await getPreferredCrm(supabase, user.id)
    if (preferredCrm) {
      const cached = await getCachedSchema(supabase, user.id, preferredCrm)
      if (cached) crmSchema = cached.schema
      stickyRules = await getStickyRules(supabase, user.id, preferredCrm)
    }
  } catch (err) {
    console.error('[structure] schema/rules load failed, continuing without:', err)
  }

  try {
    const structured = await structureTranscript({
      transcript,
      memory,
      crmSchema,
      stickyRules,
    })

    return NextResponse.json({ structured })
  } catch (error) {
    console.error('Structure API error:', error)
    if (error instanceof StructureProviderAuthError) {
      return jsonError('AI provider authentication failed', 502)
    }
    if (error instanceof StructureProviderModelError) {
      return jsonError('AI extraction model is unavailable', 502)
    }
    if (error instanceof StructureValidationError) {
      return jsonError(error.message, 502)
    }
    return jsonError('Failed to structure transcript', 502)
  }
}
