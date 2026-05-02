import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { seedK26Campaign } from '@/lib/vbrick/seeds/k26'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Idempotent re-seed of the ServiceNow K26 — Booth Campaign. The actual
 * seeding logic lives in `lib/vbrick/seeds/k26` so the campaigns GET
 * endpoint can lazily seed K26 on first request without going through
 * this route.
 *
 * Usage: POST /api/vbrick/campaigns/seed-k26
 */
export async function POST() {
  const supabase = createAdminClient()
  const result = await seedK26Campaign(supabase)

  if (!result.campaignId) {
    return NextResponse.json(
      { error: result.errors.join('; ') || 'Failed to seed K26' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    campaignId: result.campaignId,
    filesInserted: result.filesInserted,
    cleanedUp: result.cleanedUp,
    errors: result.errors,
    nextSteps: [
      'Open Campaigns in the dashboard — K26 is now visible to all BDRs.',
      `Optionally trigger AI generation: POST /api/vbrick/campaigns/${result.campaignId}/generate`,
    ],
  })
}
