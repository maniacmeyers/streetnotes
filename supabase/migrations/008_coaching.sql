-- Migration 008: Real-Time AI Coaching Sessions
-- Tracks live coaching sessions during outbound calls.

CREATE TABLE vbrick_coaching_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calling_session_id UUID REFERENCES vbrick_calling_sessions(id) ON DELETE SET NULL,
  bdr_email TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ended_at TIMESTAMPTZ,
  full_transcript TEXT,
  talk_time_bdr_pct DECIMAL(5,2),
  intents_detected JSONB DEFAULT '[]',
  coaching_summary JSONB,
  quality_score DECIMAL(4,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_coaching_sessions_email ON vbrick_coaching_sessions(bdr_email);
CREATE INDEX idx_coaching_sessions_calling ON vbrick_coaching_sessions(calling_session_id);
CREATE INDEX idx_coaching_sessions_created ON vbrick_coaching_sessions(created_at DESC);

-- RLS: open for MVP
ALTER TABLE vbrick_coaching_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all coaching_sessions" ON vbrick_coaching_sessions FOR ALL USING (true) WITH CHECK (true);
