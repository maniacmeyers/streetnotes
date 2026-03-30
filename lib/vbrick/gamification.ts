import type { GamificationState, Level, StoryType } from './story-types'

/* ─── XP Awards ─── */

export const XP_AWARDS = {
  practice_completed: 50,
  score_above_70: 25,
  score_above_90: 50,
  streak_day: 10,
  badge_earned: 100,
  triple_threat: 75,
} as const

/* ─── Levels ─── */

export const LEVELS: Level[] = [
  { level: 1, name: 'Rookie', xpRequired: 0 },
  { level: 2, name: 'Storyteller', xpRequired: 200 },
  { level: 3, name: 'Narrative Builder', xpRequired: 500 },
  { level: 4, name: 'Pitch Pro', xpRequired: 1000 },
  { level: 5, name: 'Story Craftsman', xpRequired: 1800 },
  { level: 6, name: 'Persuasion Specialist', xpRequired: 3000 },
  { level: 7, name: 'Objection Slayer', xpRequired: 5000 },
  { level: 8, name: 'Master Narrator', xpRequired: 8000 },
  { level: 9, name: 'Vault Legend', xpRequired: 12000 },
  { level: 10, name: 'Story Vault Champion', xpRequired: 18000 },
]

export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getNextLevel(xp: number): Level | null {
  const current = getLevel(xp)
  const next = LEVELS.find((l) => l.level === current.level + 1)
  return next || null
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const range = next.xpRequired - current.xpRequired
  const progress = xp - current.xpRequired
  return Math.round((progress / range) * 100)
}

/* ─── Badges ─── */

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first_story', name: 'First Story', description: 'Complete your first practice recording', icon: 'Star' },
  { id: 'perfect_pitch', name: 'Perfect Pitch', description: 'Score 95+ on an elevator pitch', icon: 'Target' },
  { id: 'objection_master', name: 'Objection Master', description: 'Score 90+ on 3 different objection handling stories', icon: 'Shield' },
  { id: 'abt_architect', name: 'ABT Architect', description: 'Score 90+ on a customer story', icon: 'BookOpen' },
  { id: 'streak_7', name: '7-Day Streak', description: 'Practice 7 consecutive days', icon: 'Flame' },
  { id: 'streak_30', name: '30-Day Streak', description: 'Practice 30 consecutive days', icon: 'Flame' },
  { id: 'triple_threat', name: 'Triple Threat', description: 'Practice all 3 story types in one day', icon: 'Zap' },
  { id: 'most_improved', name: 'Most Improved', description: 'Biggest score improvement in a single week', icon: 'TrendingUp' },
  { id: 'top_vault', name: 'Top of the Vault', description: 'Have the highest-scoring story on the team', icon: 'Trophy' },
  { id: 'century_club', name: 'Century Club', description: 'Complete 100 practice sessions', icon: 'Award' },
]

/* ─── XP Calculation ─── */

export function calculatePracticeXP(compositeScore: number): { base: number; bonus: number; total: number } {
  const base = XP_AWARDS.practice_completed
  let bonus = 0
  if (compositeScore >= 9.0) bonus = XP_AWARDS.score_above_90
  else if (compositeScore >= 7.0) bonus = XP_AWARDS.score_above_70
  return { base, bonus, total: base + bonus }
}

/* ─── Streak ─── */

export function checkStreak(
  lastPracticeDate: string | null,
  currentStreak: number,
  streakFreezeAvailable: boolean
): { newStreak: number; streakBroken: boolean; freezeUsed: boolean } {
  if (!lastPracticeDate) return { newStreak: 1, streakBroken: false, freezeUsed: false }

  const last = new Date(lastPracticeDate)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // Already practiced today
    return { newStreak: currentStreak, streakBroken: false, freezeUsed: false }
  }
  if (diffDays === 1) {
    // Consecutive day
    return { newStreak: currentStreak + 1, streakBroken: false, freezeUsed: false }
  }
  if (diffDays === 2 && streakFreezeAvailable) {
    // Missed one day, use freeze
    return { newStreak: currentStreak + 1, streakBroken: false, freezeUsed: true }
  }
  // Streak broken
  return { newStreak: 1, streakBroken: true, freezeUsed: false }
}

/* ─── Daily Challenge ─── */

export interface DailyChallenge {
  type: 'beat_score' | 'practice_type' | 'triple_threat' | 'speed_run'
  description: string
  storyType?: StoryType
  targetScore?: number
}

export function getDailyChallenge(state: GamificationState, practiceHistory: { story_type: StoryType; composite_score: number }[]): DailyChallenge {
  const day = new Date().getDay()

  // Rotate challenge types by day of week
  if (day % 4 === 0) {
    return {
      type: 'triple_threat',
      description: 'Practice all 3 story types today for bonus XP',
    }
  }

  // Find the weakest story type
  const typeScores: Record<StoryType, number[]> = {
    elevator_pitch: [],
    feel_felt_found: [],
    abt_customer_story: [],
  }
  for (const p of practiceHistory) {
    if (p.composite_score) typeScores[p.story_type].push(p.composite_score)
  }

  let weakestType: StoryType = 'elevator_pitch'
  let lowestAvg = Infinity
  for (const [type, scores] of Object.entries(typeScores)) {
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    if (avg < lowestAvg) {
      lowestAvg = avg
      weakestType = type as StoryType
    }
  }

  if (day % 4 === 1) {
    const target = Math.min(10, Math.round(lowestAvg + 0.5))
    return {
      type: 'beat_score',
      description: `Beat your average score on your weakest story type (target: ${target})`,
      storyType: weakestType,
      targetScore: target,
    }
  }

  if (day % 4 === 2) {
    return {
      type: 'practice_type',
      description: `Focus on your ${weakestType === 'elevator_pitch' ? 'Elevator Pitch' : weakestType === 'feel_felt_found' ? 'objection handling' : 'customer story'} today`,
      storyType: weakestType,
    }
  }

  return {
    type: 'speed_run',
    description: 'Record a story in under 60 seconds while scoring 7+',
  }
}
