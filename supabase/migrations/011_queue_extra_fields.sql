-- Add extra_fields JSONB column to vbrick_call_queue
-- Stores all CSV columns beyond the 5 mapped ones (name, title, company, phone, notes)
ALTER TABLE vbrick_call_queue ADD COLUMN extra_fields jsonb DEFAULT '{}'::jsonb;
