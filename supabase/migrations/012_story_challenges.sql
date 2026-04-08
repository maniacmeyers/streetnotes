-- Migration 012: Story Challenges — "Beat My Score" viral sharing mechanic

CREATE TABLE story_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_entry_id UUID NOT NULL REFERENCES story_vault_entries(id) ON DELETE CASCADE,
  created_by_email TEXT NOT NULL,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  view_count INT DEFAULT 0,
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_challenges_token ON story_challenges(share_token);
CREATE INDEX idx_challenges_vault ON story_challenges(vault_entry_id);

ALTER TABLE story_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all story_challenges" ON story_challenges FOR ALL USING (true) WITH CHECK (true);
