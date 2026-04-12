-- CRM Schema Cache: stores describe API results per user per CRM
CREATE TABLE crm_schema_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_type TEXT NOT NULL CHECK (crm_type IN ('salesforce','hubspot')),
  schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  schema_hash TEXT NOT NULL DEFAULT '',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stale_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  fetch_error TEXT,
  UNIQUE (user_id, crm_type)
);

ALTER TABLE crm_schema_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schema cache"
  ON crm_schema_cache FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own schema cache"
  ON crm_schema_cache FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own schema cache"
  ON crm_schema_cache FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own schema cache"
  ON crm_schema_cache FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX crm_schema_cache_user_crm_idx ON crm_schema_cache (user_id, crm_type);
CREATE INDEX crm_schema_cache_stale_idx ON crm_schema_cache (stale_at);
