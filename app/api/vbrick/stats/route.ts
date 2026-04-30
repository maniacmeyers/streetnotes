import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getWeeklyStats,
  getLastWeekStats,
  getPersonalBests,
  calculateStreakDays,
  getTodayCallCount,
  updateWeeklyStats,
  getStoryPracticeCounts,
  getWeekStart,
} from '@/lib/vbrick/stats'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const [thisWeek, lastWeek, personalBests, streak, todayCalls] = await Promise.all([
      getWeeklyStats(email, supabase),
      getLastWeekStats(email, supabase),
      getPersonalBests(email, supabase),
      calculateStreakDays(email, supabase),
      getTodayCallCount(email, supabase),
    ])

    // Get stats for all BDRs (for leaderboard)
    const thisWeekStart = getWeekStart(new Date())
    const lastWeekStartDate = new Date(thisWeekStart)
    lastWeekStartDate.setDate(lastWeekStartDate.getDate() - 7)
    const lastWeekStartISO = lastWeekStartDate.toISOString()
    const lastWeekEndISO = new Date(thisWeekStart).toISOString()
    const thisWeekStartISO = new Date(thisWeekStart).toISOString()

    const allBdrs = await Promise.all(
      VBRICK_CONFIG.bdrEmails.map(async (bdrEmail) => {
        const [stats, lastStats, bdrStreak, thisWeekPractice, lastWeekPractice] = await Promise.all([
          getWeeklyStats(bdrEmail, supabase),
          getLastWeekStats(bdrEmail, supabase),
          calculateStreakDays(bdrEmail, supabase),
          getStoryPracticeCounts(bdrEmail, supabase, thisWeekStartISO),
          getStoryPracticeCounts(bdrEmail, supabase, lastWeekStartISO, lastWeekEndISO),
        ])
        const fallbackName = bdrEmail.split('@')[0].split('.')[0]
        const displayName = VBRICK_CONFIG.bdrDisplayNames[bdrEmail]
          || fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)
        return {
          email: bdrEmail,
          name: displayName,
          ...stats,
          lastWeek: lastStats,
          streak: bdrStreak,
          convTrend: stats.callToConversationRate - lastStats.callToConversationRate,
          apptTrend: stats.conversationToAppointmentRate - lastStats.conversationToAppointmentRate,
          spinTrend: stats.averageSpin - lastStats.averageSpin,
          practiceThisWeek: thisWeekPractice,
          practiceLastWeek: lastWeekPractice,
          elevatorTrend: thisWeekPractice.elevatorPitch - lastWeekPractice.elevatorPitch,
          objectionTrend: thisWeekPractice.objectionHandling - lastWeekPractice.objectionHandling,
          customerTrend: thisWeekPractice.customerStory - lastWeekPractice.customerStory,
        }
      })
    )

    return NextResponse.json({
      thisWeek,
      lastWeek,
      personalBests,
      streak,
      todayCalls,
      allBdrs,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const supabase = createAdminClient()
    await updateWeeklyStats(email, supabase)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 })
  }
}
