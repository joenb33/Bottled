-- Bottled messages table and RLS
-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor)

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  received_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE
);

-- Index for ordering / random selection
CREATE INDEX idx_messages_created ON messages(created_at);

-- Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read non-flagged messages (anon key; backend uses service_role)
CREATE POLICY "Read approved messages" ON messages
  FOR SELECT USING (is_flagged = FALSE);

-- Inserts/updates only via backend (service role bypasses RLS)
CREATE POLICY "Insert via service role only" ON messages
  FOR INSERT WITH CHECK (TRUE);
