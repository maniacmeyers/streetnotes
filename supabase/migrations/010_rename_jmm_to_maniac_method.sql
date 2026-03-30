-- ============================================================
-- Migration 010: Rename JMM to Maniac Method
-- Replaces 'jmm' with 'maniac_method' across all campaign tables.
-- Consolidates to a single framework: The Maniac Method.
-- ============================================================

-- 1. Update existing campaign_channels rows
UPDATE campaign_channels SET framework = 'maniac_method' WHERE framework = 'jmm';

-- 2. Update existing campaigns framework arrays
UPDATE campaigns SET frameworks = '{maniac_method}' WHERE 'jmm' = ANY(frameworks);

-- 3. Drop and recreate CHECK constraint on campaign_channels.framework
ALTER TABLE campaign_channels DROP CONSTRAINT IF EXISTS campaign_channels_framework_check;
ALTER TABLE campaign_channels ADD CONSTRAINT campaign_channels_framework_check
  CHECK (framework IN ('maniac_method', 'career_maniacs'));

-- 4. Update default on campaigns.frameworks
ALTER TABLE campaigns ALTER COLUMN frameworks SET DEFAULT '{maniac_method}';

-- 5. Delete duplicate channels that may conflict after rename
-- (If a campaign had both jmm and career_maniacs for the same channel_type,
--  the jmm row is now maniac_method, keeping career_maniacs rows intact)
