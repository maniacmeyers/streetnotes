import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  STANDARD_PITCHES,
  STANDARD_PITCH_DOMAINS,
  seedStandardPitchesForDomain,
} from '@/lib/vbrick/seeds/standard-pitches'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Idempotent re-seed of the standard Vbrick elevator pitches across all
 * authorized domains. The actual seeding logic lives in
 * `lib/vbrick/seeds/standard-pitches` so the team-vault GET endpoint can
 * lazily fill missing pitches without going through this route.
 *
 * Usage: POST /api/vbrick/stories/seed-standards
 */
export async function POST() {
  const supabase = createAdminClient()
  const results = []
  for (const domain of STANDARD_PITCH_DOMAINS) {
    results.push(await seedStandardPitchesForDomain(supabase, domain))
  }
  const totalInserted = results.reduce((acc, r) => acc + r.inserted, 0)
  const errors = results.flatMap((r) => r.errors.map((e) => `${r.domain}: ${e}`))
  return NextResponse.json({
    domains: STANDARD_PITCH_DOMAINS,
    pitches: STANDARD_PITCHES.map((p) => p.title),
    inserted_count: totalInserted,
    results,
    errors,
  })
}
