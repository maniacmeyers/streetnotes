-- Migration 005: Competitive Intelligence Dashboard
-- Auto-extracts competitor mentions from every voice note into a real-time CI dashboard.

-- Core CI mentions table: one row per competitor mention per debrief session
CREATE TABLE ci_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  debrief_session_id UUID NOT NULL REFERENCES debrief_sessions(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  competitor_name_normalized TEXT NOT NULL,
  context_quote TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  mention_category TEXT NOT NULL CHECK (mention_category IN (
    'pricing', 'features', 'switching', 'satisfaction',
    'comparison', 'contract', 'migration', 'general'
  )),
  rep_email TEXT NOT NULL,
  rep_name TEXT,
  company_name TEXT,
  deal_stage TEXT,
  deal_segment TEXT,
  territory TEXT,
  source_type TEXT NOT NULL DEFAULT 'debrief' CHECK (source_type IN ('debrief', 'bdr-call')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Competitor aliases: maps variations to canonical names
-- e.g. "SFDC" -> "Salesforce", "MS Stream" -> "Microsoft Stream"
CREATE TABLE ci_competitor_aliases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alias TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Team configuration per email domain
CREATE TABLE ci_team_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_domain TEXT NOT NULL UNIQUE,
  team_name TEXT NOT NULL,
  territory_mapping JSONB DEFAULT '{}',
  tracked_competitors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for dashboard queries
CREATE INDEX idx_ci_mentions_competitor ON ci_mentions(competitor_name_normalized);
CREATE INDEX idx_ci_mentions_created ON ci_mentions(created_at DESC);
CREATE INDEX idx_ci_mentions_rep ON ci_mentions(rep_email);
CREATE INDEX idx_ci_mentions_session ON ci_mentions(debrief_session_id);
CREATE INDEX idx_ci_mentions_category ON ci_mentions(mention_category);
CREATE INDEX idx_ci_mentions_sentiment ON ci_mentions(sentiment);
CREATE INDEX idx_ci_mentions_competitor_time ON ci_mentions(competitor_name_normalized, created_at DESC);

-- RLS: open for MVP (matches debrief_sessions pattern)
ALTER TABLE ci_mentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all ci_mentions" ON ci_mentions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE ci_competitor_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all ci_aliases" ON ci_competitor_aliases FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE ci_team_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all ci_team_config" ON ci_team_config FOR ALL USING (true) WITH CHECK (true);
