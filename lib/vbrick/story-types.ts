/* ─── Story Types ─── */

export type StoryType = 'elevator_pitch' | 'feel_felt_found' | 'abt_customer_story'

export type StoryStatus = 'draft' | 'practicing' | 'completed'

/* ─── Database Row Types ─── */

export interface StoryDraft {
  id: string
  bdr_email: string
  story_type: StoryType
  title: string | null
  draft_content: string
  ai_conversation: AIMessage[]
  framework_metadata: Record<string, string>
  status: StoryStatus
  created_at: string
  updated_at: string
}

export interface AIMessage {
  role: 'assistant' | 'user'
  content: string
}

export interface PracticeSession {
  id: string
  story_draft_id: string
  bdr_email: string
  transcript: string | null
  duration_seconds: number | null
  score_framework: number | null
  score_clarity: number | null
  score_confidence: number | null
  score_pacing: number | null
  score_specificity: number | null
  score_brevity: number | null
  composite_score: number | null
  improvement_notes: StoryImprovementNotes
  coaching_note: string | null
  created_at: string
}

export interface StoryImprovementNotes {
  framework?: string
  clarity?: string
  confidence?: string
  pacing?: string
  specificity?: string
  brevity?: string
}

export interface VaultEntry {
  id: string
  practice_session_id: string
  story_draft_id: string
  bdr_email: string
  story_type: StoryType
  title: string
  transcript: string
  composite_score: number
  is_personal_best: boolean
  shared_to_team: boolean
  created_at: string
}

/* ─── Scoring ─── */

export interface StoryScore {
  framework: number
  clarity: number
  confidence: number
  pacing: number
  specificity: number
  brevity: number
  composite: number
  improvements: StoryImprovementNotes
  coaching_note: string
}

export const SCORE_WEIGHTS = {
  framework: 0.25,
  clarity: 0.20,
  confidence: 0.20,
  pacing: 0.15,
  specificity: 0.10,
  brevity: 0.10,
} as const

/* ─── Gamification ─── */

export interface GamificationState {
  id: string
  bdr_email: string
  xp_total: number
  level: number
  current_streak: number
  longest_streak: number
  last_practice_date: string | null
  streak_freeze_available: boolean
  streak_freeze_used_this_week: string | null
  badges: Badge[]
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned_at: string
}

export interface XPEvent {
  id: string
  bdr_email: string
  event_type: string
  xp_awarded: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface Level {
  level: number
  name: string
  xpRequired: number
}

/* ─── Framework Config ─── */

export interface FrameworkQuestion {
  key: string
  label: string
  hint: string
  placeholder: string
  maxLength?: number
}

export interface StoryFrameworkConfig {
  type: StoryType
  name: string
  description: string
  icon: string
  questions: FrameworkQuestion[]
  targetDurationSec: number
}

/* ─── Display Helpers ─── */

export const STORY_TYPE_LABELS: Record<StoryType, string> = {
  elevator_pitch: 'Elevator Pitch',
  feel_felt_found: 'Feel / Felt / Found',
  abt_customer_story: 'Customer Story (ABT)',
}

export const STORY_TYPE_ICONS: Record<StoryType, string> = {
  elevator_pitch: 'Rocket',
  feel_felt_found: 'Shield',
  abt_customer_story: 'BookOpen',
}
