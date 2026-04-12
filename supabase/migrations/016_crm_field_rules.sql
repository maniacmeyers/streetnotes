-- CRM Field Rules: sticky user overrides for AI field routing
CREATE TABLE crm_field_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_type TEXT NOT NULL CHECK (crm_type IN ('salesforce','hubspot')),
  source_field TEXT NOT NULL,
  target_object TEXT NOT NULL CHECK (target_object IN ('contact','account','opportunity','activity')),
  target_field TEXT NOT NULL,
  learned_from_note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, crm_type, source_field)
);

ALTER TABLE crm_field_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own field rules"
  ON crm_field_rules FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own field rules"
  ON crm_field_rules FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own field rules"
  ON crm_field_rules FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own field rules"
  ON crm_field_rules FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX crm_field_rules_user_crm_idx ON crm_field_rules (user_id, crm_type);
