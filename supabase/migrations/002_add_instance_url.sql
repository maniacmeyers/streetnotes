-- Phase 4: CRM OAuth Connections
-- Add instance_url for Salesforce org-specific API endpoints
-- Add unique constraint on deal_stage_cache for upsert support

ALTER TABLE crm_connections ADD COLUMN IF NOT EXISTS instance_url TEXT;

-- Required for deal stage cache upsert (one cache row per user per CRM)
ALTER TABLE deal_stage_cache ADD CONSTRAINT deal_stage_cache_user_crm_unique
  UNIQUE (user_id, crm_type);
