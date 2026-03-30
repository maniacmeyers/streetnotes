-- Migration 007: ServiceNow Focus for CI Dashboard
-- Extends ci_mentions with ServiceNow-specific categorization and acknowledgment tracking.

-- Add ServiceNow category column (nullable — only set for ServiceNow-related mentions)
ALTER TABLE ci_mentions ADD COLUMN IF NOT EXISTS sn_category TEXT CHECK (sn_category IS NULL OR sn_category IN (
  'servicenow_adoption', 'servicenow_pain', 'servicenow_expansion',
  'servicenow_competitor', 'integration_opportunity', 'general_competitor'
));

-- Add account name for CI attribution
ALTER TABLE ci_mentions ADD COLUMN IF NOT EXISTS account_name TEXT;

-- Add AI confidence score
ALTER TABLE ci_mentions ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2);

-- Add acknowledgment tracking
ALTER TABLE ci_mentions ADD COLUMN IF NOT EXISTS acknowledged BOOLEAN DEFAULT false;
ALTER TABLE ci_mentions ADD COLUMN IF NOT EXISTS acknowledged_by TEXT;
ALTER TABLE ci_mentions ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;

-- Update source_type constraint to allow 'live-call' (for Phase 3: Real-Time Coaching)
ALTER TABLE ci_mentions DROP CONSTRAINT IF EXISTS ci_mentions_source_type_check;
ALTER TABLE ci_mentions ADD CONSTRAINT ci_mentions_source_type_check
  CHECK (source_type IN ('debrief', 'bdr-call', 'live-call'));

-- Index for ServiceNow-specific queries
CREATE INDEX IF NOT EXISTS idx_ci_mentions_sn_category ON ci_mentions(sn_category) WHERE sn_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ci_mentions_acknowledged ON ci_mentions(acknowledged) WHERE acknowledged = false;
CREATE INDEX IF NOT EXISTS idx_ci_mentions_account ON ci_mentions(account_name) WHERE account_name IS NOT NULL;

-- Weekly intelligence briefs
CREATE TABLE IF NOT EXISTS ci_weekly_briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_domain TEXT NOT NULL,
  week_start DATE NOT NULL,
  brief_content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(email_domain, week_start)
);

ALTER TABLE ci_weekly_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all ci_weekly_briefs" ON ci_weekly_briefs FOR ALL USING (true) WITH CHECK (true);
