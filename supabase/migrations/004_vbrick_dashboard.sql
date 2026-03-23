-- Vbrick Daily Intentions
CREATE TABLE vbrick_daily_intentions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  know_answer text NOT NULL,
  feel_answer text NOT NULL,
  do_answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(bdr_email, date)
);

-- Vbrick Calling Sessions
CREATE TABLE vbrick_calling_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  total_calls int DEFAULT 0,
  connected_count int DEFAULT 0,
  appointments_count int DEFAULT 0,
  average_spin decimal(4,1) DEFAULT 0,
  best_spin decimal(4,1) DEFAULT 0,
  csv_imported boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Vbrick Call Queue
CREATE TABLE vbrick_call_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES vbrick_calling_sessions(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_title text,
  company text NOT NULL,
  phone text,
  salesforce_notes text,
  queue_position int NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  debrief_session_id uuid REFERENCES debrief_sessions(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Vbrick BDR Weekly Stats
CREATE TABLE vbrick_bdr_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_email text NOT NULL,
  week_start_date date NOT NULL,
  total_calls int DEFAULT 0,
  connected_calls int DEFAULT 0,
  appointments_booked int DEFAULT 0,
  call_to_conversation_rate decimal(5,2) DEFAULT 0,
  conversation_to_appointment_rate decimal(5,2) DEFAULT 0,
  average_spin decimal(4,1) DEFAULT 0,
  best_spin decimal(4,1) DEFAULT 0,
  best_spin_contact text,
  streak_days int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bdr_email, week_start_date)
);

-- Indexes
CREATE INDEX idx_vbrick_intentions_email_date ON vbrick_daily_intentions(bdr_email, date);
CREATE INDEX idx_vbrick_sessions_email ON vbrick_calling_sessions(bdr_email);
CREATE INDEX idx_vbrick_queue_session ON vbrick_call_queue(session_id);
CREATE INDEX idx_vbrick_stats_email_week ON vbrick_bdr_stats(bdr_email, week_start_date);
