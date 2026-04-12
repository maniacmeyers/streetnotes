-- CRM Export Log: audit trail for CSV activity exports
CREATE TABLE crm_export_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flavor TEXT NOT NULL CHECK (flavor IN ('salesforce','hubspot')),
  date_from TIMESTAMPTZ,
  date_to TIMESTAMPTZ,
  row_count INTEGER NOT NULL CHECK (row_count >= 0),
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  client_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE crm_export_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own export logs"
  ON crm_export_log FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own export logs"
  ON crm_export_log FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own export logs"
  ON crm_export_log FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own export logs"
  ON crm_export_log FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX crm_export_log_user_date_idx ON crm_export_log (user_id, created_at DESC);
