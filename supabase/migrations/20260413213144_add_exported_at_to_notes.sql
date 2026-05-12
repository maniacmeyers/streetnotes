-- Migration 015: Track CSV export status per note
ALTER TABLE notes ADD COLUMN IF NOT EXISTS exported_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS notes_exported_at_idx ON notes (exported_at) WHERE exported_at IS NULL;
