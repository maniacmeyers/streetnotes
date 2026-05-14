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
  getLastPracticeAt,
  getWeekStart,
} from '@/lib/vbrick/stats'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'

type PracticeCounts = {
  elevatorPitch: number
  objectionHandling: number
  customerStory: number
  total: number
}

type LeaderboardOverride = {
  practiceThisWeek?: PracticeCounts
  practiceLastWeek?: PracticeCounts
  lastPracticeAt?: string | null
  sparringThisWeek?: number
  sparringLastWeek?: number
}

function counts(elevator: number, objection: number, customer: number): PracticeCounts {
  return {
    elevatorPitch: elevator,
    objectionHandling: objection,
    customerStory: customer,
    total: elevator + objection + customer,
  }
}

const DEMO_LEADERBOARD_OVERRIDES: Record<string, LeaderboardOverride> = {
  'dylan.fawsitt@vbrick.com': {
    practiceThisWeek: counts(9, 7, 5),
    practiceLastWeek: counts(6, 5, 3),
    lastPracticeAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sparringThisWeek: 6,
    sparringLastWeek: 4,
  },
  'kara.pryor@vbrick.com': {
    practiceThisWeek: counts(0, 0, 0),
    practiceLastWeek: counts(0, 0, 0),
    lastPracticeAt: null,
    sparringThisWeek: 0,
    sparringLastWeek: 0,
  },
  'annabelle.frost@vbrick.com': {
    practiceThisWeek: counts(0, 0, 0),
    practiceLastWeek: counts(0, 0, 0),
    lastPracticeAt: null,
    sparringThisWeek: 0,
    sparringLastWeek: 0,
  },
}

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

    // Floor practice counts at the leaderboard kickoff so older sessions
    // never appear in the head-to-head — fair start for all BDRs.
    const kickoff = VBRICK_CONFIG.leaderboardStartDate
    const flooredThisWeekStart = thisWeekStartISO > kickoff ? thisWeekStartISO : kickoff
    const flooredLastWeekStart = lastWeekStartISO > kickoff ? lastWeekStartISO : kickoff
    const flooredLastWeekEnd = lastWeekEndISO > kickoff ? lastWeekEndISO : kickoff

    const allBdrs = await Promise.all(
      VBRICK_CONFIG.bdrEmails.map(async (bdrEmail) => {
        const [stats, lastStats, bdrStreak, thisWeekPractice, lastWeekPractice, lastPracticeAt] = await Promise.all([
          getWeeklyStats(bdrEmail, supabase),
          getLastWeekStats(bdrEmail, supabase),
          calculateStreakDays(bdrEmail, supabase),
          getStoryPracticeCounts(bdrEmail, supabase, flooredThisWeekStart),
          getStoryPracticeCounts(bdrEmail, supabase, flooredLastWeekStart, flooredLastWeekEnd),
          getLastPracticeAt(bdrEmail, supabase),
        ])
        const fallbackName = bdrEmail.split('@')[0].split('.')[0]
        const displayName = VBRICK_CONFIG.bdrDisplayNames[bdrEmail]
          || fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)

        const demo = DEMO_LEADERBOARD_OVERRIDES[bdrEmail]
        const practiceThisWeek = demo?.practiceThisWeek ?? thisWeekPractice
        const practiceLastWeek = demo?.practiceLastWeek ?? lastWeekPractice
        const effectiveLastPracticeAt = demo?.lastPracticeAt !== undefined ? demo.lastPracticeAt : lastPracticeAt
        const sparringThisWeek = demo?.sparringThisWeek ?? 0
        const sparringLastWeek = demo?.sparringLastWeek ?? 0

        return {
          email: bdrEmail,
          name: displayName,
          ...stats,
          lastWeek: lastStats,
          streak: bdrStreak,
          convTrend: stats.callToConversationRate - lastStats.callToConversationRate,
          apptTrend: stats.conversationToAppointmentRate - lastStats.conversationToAppointmentRate,
          spinTrend: stats.averageSpin - lastStats.averageSpin,
          practiceThisWeek,
          practiceLastWeek,
          elevatorTrend: practiceThisWeek.elevatorPitch - practiceLastWeek.elevatorPitch,
          objectionTrend: practiceThisWeek.objectionHandling - practiceLastWeek.objectionHandling,
          customerTrend: practiceThisWeek.customerStory - practiceLastWeek.customerStory,
          sparringThisWeek,
          sparringTrend: sparringThisWeek - sparringLastWeek,
          lastPracticeAt: effectiveLastPracticeAt,
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
