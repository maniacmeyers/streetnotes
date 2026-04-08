import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { transcribeAudio } from '@/lib/openai/transcribe'
import { getScoringPrompt } from '@/lib/vbrick/story-prompts'
import { calculatePracticeXP, checkStreak, XP_AWARDS } from '@/lib/vbrick/gamification'
import { SCORE_WEIGHTS } from '@/lib/vbrick/story-types'
import type { StoryType, StoryScore } from '@/lib/vbrick/story-types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const draftId = formData.get('draftId') as string
  const email = formData.get('email') as string
  const audio = formData.get('audio')

  if (!draftId || !email) {
    return NextResponse.json({ error: 'Missing draftId or email' }, { status: 400 })
  }
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: 'Missing audio file' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch the draft
  const { data: draft } = await supabase
    .from('story_drafts')
    .select('*')
    .eq('id', draftId)
    .single()

  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })

  try {
    // Step 1: Transcribe
    const transcript = await transcribeAudio(audio)

    // Step 2: Score with GPT-4o
    const { system, user } = getScoringPrompt(
      draft.story_type as StoryType,
      transcript,
      draft.draft_content
    )

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const rawScore = completion.choices[0]?.message?.content
    if (!rawScore) return NextResponse.json({ error: 'Scoring returned empty' }, { status: 502 })

    // GPT returns { scores: {...}, composite, improvements, coaching_note }
    const parsed = JSON.parse(rawScore) as {
      scores: { framework: number; clarity: number; confidence: number; pacing: number; specificity: number; brevity: number }
      composite: number
      improvements: Record<string, string>
      coaching_note: string
    }

    // Compute weighted composite (override GPT's to ensure consistency)
    const composite = Number((
      parsed.scores.framework * SCORE_WEIGHTS.framework +
      parsed.scores.clarity * SCORE_WEIGHTS.clarity +
      parsed.scores.confidence * SCORE_WEIGHTS.confidence +
      parsed.scores.pacing * SCORE_WEIGHTS.pacing +
      parsed.scores.specificity * SCORE_WEIGHTS.specificity +
      parsed.scores.brevity * SCORE_WEIGHTS.brevity
    ).toFixed(1))

    // Map to StoryScore
    const score: StoryScore = {
      framework: parsed.scores.framework,
      clarity: parsed.scores.clarity,
      confidence: parsed.scores.confidence,
      pacing: parsed.scores.pacing,
      specificity: parsed.scores.specificity,
      brevity: parsed.scores.brevity,
      composite,
      improvements: parsed.improvements,
      coaching_note: parsed.coaching_note,
    }

    // Step 3: Save practice session
    const { data: session, error: sessionError } = await supabase
      .from('story_practice_sessions')
      .insert({
        story_draft_id: draftId,
        bdr_email: email,
        transcript,
        duration_seconds: Math.round(audio.size / 16000), // rough estimate
        score_framework: score.framework,
        score_clarity: score.clarity,
        score_confidence: score.confidence,
        score_pacing: score.pacing,
        score_specificity: score.specificity,
        score_brevity: score.brevity,
        composite_score: composite,
        improvement_notes: score.improvements,
        coaching_note: score.coaching_note,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('[practice] Session insert error:', sessionError)
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Step 4: Check if this is a personal best → update vault
    const { data: existingVault } = await supabase
      .from('story_vault_entries')
      .select('id, composite_score')
      .eq('bdr_email', email)
      .eq('story_type', draft.story_type)
      .eq('is_personal_best', true)
      .single()

    const isNewBest = !existingVault || composite > (existingVault.composite_score || 0)
    let vaultEntryId: string | null = existingVault?.id || null

    if (isNewBest) {
      // Mark old best as not personal best
      if (existingVault) {
        await supabase
          .from('story_vault_entries')
          .update({ is_personal_best: false })
          .eq('id', existingVault.id)
      }

      // Insert new vault entry
      const { data: newVaultEntry } = await supabase.from('story_vault_entries').insert({
        practice_session_id: session.id,
        story_draft_id: draftId,
        bdr_email: email,
        story_type: draft.story_type,
        title: draft.title || `${draft.story_type} practice`,
        transcript,
        composite_score: composite,
        is_personal_best: true,
        shared_to_team: false,
      }).select('id').single()

      vaultEntryId = newVaultEntry?.id || null
    }

    // Step 5: Update gamification
    const { data: gamState } = await supabase
      .from('bdr_gamification')
      .select('*')
      .eq('bdr_email', email)
      .single()

    const xpResult = calculatePracticeXP(composite)
    const today = new Date().toISOString().split('T')[0]

    if (gamState) {
      const streakResult = checkStreak(
        gamState.last_practice_date,
        gamState.current_streak,
        gamState.streak_freeze_available
      )

      const streakXP = streakResult.newStreak > gamState.current_streak ? XP_AWARDS.streak_day : 0
      const totalXP = xpResult.total + streakXP

      await supabase
        .from('bdr_gamification')
        .update({
          xp_total: gamState.xp_total + totalXP,
          current_streak: streakResult.newStreak,
          longest_streak: Math.max(gamState.longest_streak, streakResult.newStreak),
          last_practice_date: today,
          streak_freeze_available: streakResult.freezeUsed ? false : gamState.streak_freeze_available,
          updated_at: new Date().toISOString(),
        })
        .eq('bdr_email', email)

      // Log XP event
      await supabase.from('bdr_xp_events').insert({
        bdr_email: email,
        event_type: 'practice_completed',
        xp_awarded: totalXP,
        metadata: {
          composite_score: composite,
          story_type: draft.story_type,
          is_new_best: isNewBest,
          streak: streakResult.newStreak,
        },
      })
    } else {
      // First practice ever — create gamification state
      await supabase.from('bdr_gamification').insert({
        bdr_email: email,
        xp_total: xpResult.total,
        level: 1,
        current_streak: 1,
        longest_streak: 1,
        last_practice_date: today,
        badges: [{ id: 'first_story', name: 'First Story', description: 'Complete your first practice recording', icon: 'Star', earned_at: new Date().toISOString() }],
      })

      await supabase.from('bdr_xp_events').insert({
        bdr_email: email,
        event_type: 'practice_completed',
        xp_awarded: xpResult.total + XP_AWARDS.badge_earned,
        metadata: { composite_score: composite, story_type: draft.story_type, first_ever: true },
      })
    }

    return NextResponse.json({
      session: session,
      score: { ...score, composite },
      is_new_best: isNewBest,
      xp_earned: xpResult.total,
      vault_entry_id: vaultEntryId,
    })
  } catch (error) {
    console.error('[practice] Error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Practice scoring failed: ${msg.substring(0, 200)}` }, { status: 502 })
  }
}
