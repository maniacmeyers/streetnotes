-- Phase 5: CRM Push Logging
-- Tracks every push attempt with full audit trail

CREATE TABLE crm_push_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  contact_id TEXT,
  contact_created BOOLEAN DEFAULT false,
  deal_id TEXT,
  deal_created BOOLEAN DEFAULT false,
  task_ids JSONB DEFAULT '[]',
  note_crm_id TEXT,
  error_message TEXT,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notes ADD COLUMN IF NOT EXISTS push_status TEXT DEFAULT NULL;

ALTER TABLE crm_push_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push logs"
  ON crm_push_log FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own push logs"
  ON crm_push_log FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own push logs"
  ON crm_push_log FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX crm_push_log_note_id_idx ON crm_push_log (note_id);
CREATE INDEX crm_push_log_user_id_idx ON crm_push_log (user_id);
CREATE INDEX notes_push_status_idx ON notes (push_status) WHERE push_status IS NOT NULL;
