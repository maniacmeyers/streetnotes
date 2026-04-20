-- Sparring Sessions Table (Enhanced for Framework Practice)
CREATE TABLE IF NOT EXISTS sparring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session metadata
  persona_id TEXT NOT NULL,
  duration_seconds INTEGER,
  bdr_accent TEXT DEFAULT 'general', -- 'irish', 'newZealand', 'general'
  
  -- Scoring (Framework-specific)
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  framework_score INTEGER CHECK (framework_score >= 0 AND framework_score <= 100),
  accent_score INTEGER CHECK (accent_score >= 0 AND accent_score <= 100),
  dimensions JSONB NOT NULL, -- array of {name, score, weight, feedback}
  
  -- Content
  transcription TEXT,
  summary TEXT,
  
  -- Framework tracking
  framework_data JSONB, -- {name_captured, qualification_asked, pivot_executed, etc.}
  accent_feedback TEXT,
  key_strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  script_improvements JSONB, -- {original, improved, reason}[]
  
  -- AI evaluation
  would_meet BOOLEAN,
  meeting_likelihood INTEGER CHECK (meeting_likelihood >= 0 AND meeting_likelihood <= 100),
  persona_reaction TEXT,
  
  -- Gamification
  badges_earned TEXT[] DEFAULT '{}',
  xp_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sparring_sessions_user_id ON sparring_sessions(user_id);
CREATE INDEX idx_sparring_sessions_created_at ON sparring_sessions(created_at DESC);
CREATE INDEX idx_sparring_sessions_persona ON sparring_sessions(persona_id);

-- RLS Policies
ALTER TABLE sparring_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sparring sessions"
  ON sparring_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sparring sessions"
  ON sparring_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sparring sessions"
  ON sparring_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Stats view for quick aggregated data
CREATE OR REPLACE VIEW sparring_stats AS
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  AVG(total_score)::INTEGER as average_score,
  MAX(total_score) as best_score,
  MIN(total_score) as worst_score,
  COUNT(DISTINCT persona_id) as unique_personas,
  COUNT(*) FILTER (WHERE would_meet = true) as meetings_booked,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as sessions_last_7_days
FROM sparring_sessions
GROUP BY user_id;

-- Function to get daily practice streak
CREATE OR REPLACE FUNCTION get_sparring_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_session BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM sparring_sessions 
      WHERE user_id = p_user_id 
      AND DATE(created_at) = check_date
    ) INTO has_session;
    
    EXIT WHEN NOT has_session;
    
    streak := streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql;
