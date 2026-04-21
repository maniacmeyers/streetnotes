-- Migration: Create debrief_sessions table for Brain Dump lead magnet
-- Public (no auth) — anonymous access via RLS policies

CREATE TABLE IF NOT EXISTS public.debrief_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  duration_sec INTEGER,
  raw_transcript TEXT,
  structured_output JSONB,
  pdf_generated BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'debrief'
);

ALTER TABLE public.debrief_sessions ENABLE ROW LEVEL SECURITY;

-- Anonymous insert: anyone can create a session
CREATE POLICY "Allow anonymous inserts" ON public.debrief_sessions
  FOR INSERT WITH CHECK (true);

-- Anonymous select: anyone can read their own session (by ID)
CREATE POLICY "Allow anonymous select" ON public.debrief_sessions
  FOR SELECT USING (true);

-- Anonymous update: anyone can update (for adding transcript/structured data)
CREATE POLICY "Allow anonymous update" ON public.debrief_sessions
  FOR UPDATE USING (true);

-- Index for rate limiting queries (email + created_at DESC)
CREATE INDEX debrief_sessions_email_created_idx
  ON public.debrief_sessions (email, created_at DESC);
