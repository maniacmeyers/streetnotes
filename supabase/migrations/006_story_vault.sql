-- Migration 006: Story Vault — AI-assisted story drafting, practice, scoring, and gamification

-- Story drafts: AI-assisted creation per framework type
CREATE TABLE story_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email TEXT NOT NULL,
  story_type TEXT NOT NULL CHECK (story_type IN ('elevator_pitch', 'feel_felt_found', 'abt_customer_story')),
  title TEXT,
  draft_content TEXT NOT NULL DEFAULT '',
  ai_conversation JSONB DEFAULT '[]',
  framework_metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'practicing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Practice sessions: recordings scored across 6 dimensions
CREATE TABLE story_practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_draft_id UUID NOT NULL REFERENCES story_drafts(id) ON DELETE CASCADE,
  bdr_email TEXT NOT NULL,
  transcript TEXT,
  duration_seconds INT,
  score_framework DECIMAL(4,2),
  score_clarity DECIMAL(4,2),
  score_confidence DECIMAL(4,2),
  score_pacing DECIMAL(4,2),
  score_specificity DECIMAL(4,2),
  score_brevity DECIMAL(4,2),
  composite_score DECIMAL(4,2),
  improvement_notes JSONB DEFAULT '{}',
  coaching_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Vault entries: best-scoring stories per BDR per type
CREATE TABLE story_vault_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID NOT NULL REFERENCES story_practice_sessions(id) ON DELETE CASCADE,
  story_draft_id UUID NOT NULL REFERENCES story_drafts(id) ON DELETE CASCADE,
  bdr_email TEXT NOT NULL,
  story_type TEXT NOT NULL CHECK (story_type IN ('elevator_pitch', 'feel_felt_found', 'abt_customer_story')),
  title TEXT NOT NULL,
  transcript TEXT NOT NULL,
  composite_score DECIMAL(4,2) NOT NULL,
  is_personal_best BOOLEAN DEFAULT false,
  shared_to_team BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Gamification state: XP, levels, streaks, badges per BDR
CREATE TABLE bdr_gamification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email TEXT NOT NULL UNIQUE,
  xp_total INT DEFAULT 0,
  level INT DEFAULT 1,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_practice_date DATE,
  streak_freeze_available BOOLEAN DEFAULT true,
  streak_freeze_used_this_week DATE,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- XP event audit trail
CREATE TABLE bdr_xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  xp_awarded INT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_story_drafts_email ON story_drafts(bdr_email);
CREATE INDEX idx_story_drafts_type ON story_drafts(bdr_email, story_type);
CREATE INDEX idx_practice_sessions_draft ON story_practice_sessions(story_draft_id);
CREATE INDEX idx_practice_sessions_score ON story_practice_sessions(bdr_email, composite_score DESC);
CREATE INDEX idx_vault_entries_email_type ON story_vault_entries(bdr_email, story_type);
CREATE INDEX idx_vault_entries_team ON story_vault_entries(story_type, composite_score DESC) WHERE shared_to_team = true;
CREATE INDEX idx_gamification_email ON bdr_gamification(bdr_email);
CREATE INDEX idx_xp_events_email ON bdr_xp_events(bdr_email, created_at DESC);

-- RLS: open for MVP (same pattern as debrief_sessions and ci_mentions)
ALTER TABLE story_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all story_drafts" ON story_drafts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE story_practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all story_practice_sessions" ON story_practice_sessions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE story_vault_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all story_vault_entries" ON story_vault_entries FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE bdr_gamification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all bdr_gamification" ON bdr_gamification FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE bdr_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all bdr_xp_events" ON bdr_xp_events FOR ALL USING (true) WITH CHECK (true);
