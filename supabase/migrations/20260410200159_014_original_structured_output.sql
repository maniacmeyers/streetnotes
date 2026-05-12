-- Phase 6: Self-learning — preserve the pre-edit AI output
-- Enables edit-rate telemetry and unlocks future correction learning.

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS original_structured_output JSONB;
