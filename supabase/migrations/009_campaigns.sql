-- ============================================================
-- Migration 009: Campaign Hub
-- Manages campaign materials, AI-generated channel messaging,
-- per-contact personalization, and approval workflows.
-- ============================================================

-- Campaigns (one active at a time per org)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_name TEXT,
  event_date DATE,
  target_audience TEXT,
  created_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'generating', 'pending_approval', 'approved', 'active', 'archived')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  frameworks TEXT[] NOT NULL DEFAULT '{jmm,career_maniacs}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns (created_by);

-- Uploaded source materials (docs, PDFs, scripts)
CREATE TABLE IF NOT EXISTS campaign_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  extracted_text TEXT,
  file_size INT,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_files_campaign ON campaign_files (campaign_id);

-- AI-generated channel content (5 channels x 2 frameworks = up to 10 rows per campaign)
CREATE TABLE IF NOT EXISTS campaign_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL
    CHECK (channel_type IN ('cold_call', 'voicemail', 'email_sequence', 'linkedin', 'objection_handling')),
  framework TEXT NOT NULL
    CHECK (framework IN ('jmm', 'career_maniacs')),
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, channel_type, framework)
);

CREATE INDEX IF NOT EXISTS idx_campaign_channels_campaign ON campaign_channels (campaign_id);

-- Per-contact personalized scripts
CREATE TABLE IF NOT EXISTS campaign_contact_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES campaign_channels(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_title TEXT,
  company TEXT NOT NULL,
  module_stack TEXT[] DEFAULT '{}',
  company_size TEXT,
  industry TEXT,
  personalized_content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_scripts_campaign ON campaign_contact_scripts (campaign_id);
CREATE INDEX IF NOT EXISTS idx_contact_scripts_channel ON campaign_contact_scripts (channel_id);
CREATE INDEX IF NOT EXISTS idx_contact_scripts_company ON campaign_contact_scripts (company);
