import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLevel, getNextLevel, getLevelProgress, getDailyChallenge } from '@/lib/vbrick/gamification'

export const runtime = 'nodejs'

// GET: Fetch gamification state for a BDR
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const supabase = await createClient()

  // Fetch gamification state
  const { data: state } = await supabase
    .from('bdr_gamification')
    .select('*')
    .eq('bdr_email', email)
    .single()

  if (!state) {
    // No gamification state yet — return defaults
    return NextResponse.json({
      state: {
        xp_total: 0,
        level: 1,
        level_name: 'Rookie',
        level_progress: 0,
        next_level: { level: 2, name: 'Storyteller', xpRequired: 200 },
        current_streak: 0,
        longest_streak: 0,
        badges: [],
      },
      daily_challenge: {
        type: 'practice_type',
        description: 'Start your Story Vault journey — record your first elevator pitch',
        storyType: 'elevator_pitch',
      },
    })
  }

  // Fetch recent practice sessions for daily challenge calculation
  const { data: recentPractice } = await supabase
    .from('story_practice_sessions')
    .select('story_draft_id, composite_score')
    .eq('bdr_email', email)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get story types for recent practice
  const draftIds = Array.from(new Set((recentPractice || []).map((p) => p.story_draft_id)))
  const { data: drafts } = await supabase
    .from('story_drafts')
    .select('id, story_type')
    .in('id', draftIds.length > 0 ? draftIds : ['none'])

  const draftTypeMap = new Map((drafts || []).map((d) => [d.id, d.story_type]))

  const practiceHistory = (recentPractice || []).map((p) => ({
    story_type: (draftTypeMap.get(p.story_draft_id) || 'elevator_pitch') as 'elevator_pitch' | 'feel_felt_found' | 'abt_customer_story',
    composite_score: p.composite_score || 0,
  }))

  const level = getLevel(state.xp_total)
  const nextLevel = getNextLevel(state.xp_total)
  const progress = getLevelProgress(state.xp_total)
  const challenge = getDailyChallenge(state, practiceHistory)

  return NextResponse.json({
    state: {
      ...state,
      level_name: level.name,
      level_progress: progress,
      next_level: nextLevel,
    },
    daily_challenge: challenge,
  })
}
