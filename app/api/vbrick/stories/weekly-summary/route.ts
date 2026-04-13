import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLevel } from '@/lib/vbrick/gamification'
import { sendHTMLEmail } from '@/lib/resend'
import { buildWeeklySummaryHTML } from '@/lib/vbrick/weekly-email-template'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch all BDRs with gamification state
  const { data: allGam } = await supabase
    .from('bdr_gamification')
    .select('*')

  if (!allGam || allGam.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No BDRs found' })
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const emails = allGam.map((g) => g.bdr_email)

  // Fetch practice sessions for all BDRs in last 14 days
  const { data: sessions } = await supabase
    .from('story_practice_sessions')
    .select('bdr_email, composite_score, improvement_notes, created_at')
    .in('bdr_email', emails)
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  // Fetch XP events in last 7 days
  const { data: xpEvents } = await supabase
    .from('bdr_xp_events')
    .select('bdr_email, xp_awarded')
    .in('bdr_email', emails)
    .gte('created_at', sevenDaysAgo.toISOString())

  let sentCount = 0
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://streetnotes.ai'

  for (const gam of allGam) {
    const bdrSessions = (sessions || []).filter((s) => s.bdr_email === gam.bdr_email)
    const thisWeek = bdrSessions.filter((s) => new Date(s.created_at) >= sevenDaysAgo)
    const lastWeek = bdrSessions.filter(
      (s) => new Date(s.created_at) >= fourteenDaysAgo && new Date(s.created_at) < sevenDaysAgo
    )

    const bestThisWeek = thisWeek.length > 0
      ? Math.max(...thisWeek.map((s) => s.composite_score || 0))
      : null

    // XP earned this week
    const weekXP = (xpEvents || [])
      .filter((e) => e.bdr_email === gam.bdr_email)
      .reduce((sum, e) => sum + (e.xp_awarded || 0), 0)

    // Coaching tip: find weakest dimension from most recent session
    let coachingTip = 'Keep practicing all three story types to build well-rounded skills.'
    if (thisWeek.length > 0) {
      const latest = thisWeek[0]
      const notes = latest.improvement_notes as Record<string, string> | null
      if (notes) {
        // Find first non-empty improvement note
        const dimensions = ['framework', 'clarity', 'confidence', 'pacing', 'specificity', 'brevity']
        for (const dim of dimensions) {
          if (notes[dim]) {
            coachingTip = notes[dim]
            break
          }
        }
      }
    } else {
      coachingTip = "You didn't practice this week. Even one session keeps your skills sharp and your streak alive."
    }

    const displayName = gam.bdr_email
      .split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase())

    const level = getLevel(gam.xp_total)

    const html = buildWeeklySummaryHTML({
      name: displayName,
      sessionsThisWeek: thisWeek.length,
      sessionsLastWeek: lastWeek.length,
      bestScoreThisWeek: bestThisWeek,
      currentStreak: gam.current_streak,
      xpEarned: weekXP,
      xpTotal: gam.xp_total,
      levelName: level.name,
      level: level.level,
      coachingTip,
      dashboardUrl: `${baseUrl}/vbrick/dashboard/stories`,
    })

    await sendHTMLEmail(
      gam.bdr_email,
      `Your Story Vault Week: ${thisWeek.length} sessions${bestThisWeek ? `, best score ${bestThisWeek.toFixed(1)}` : ''}`,
      html
    )

    sentCount++
  }

  return NextResponse.json({ sent: sentCount, message: `Sent ${sentCount} weekly summaries` })
}
