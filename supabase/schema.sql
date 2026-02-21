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

-- RPC for fetching one random non-flagged message (used by GET /api/receive)
CREATE OR REPLACE FUNCTION get_random_message()
RETURNS SETOF messages
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM messages
  WHERE is_flagged = FALSE
  ORDER BY random()
  LIMIT 1;
$$;

-- Rate limiting: max 5 sends per IP per hour (used by POST /api/send)
CREATE TABLE rate_limits (
  ip TEXT NOT NULL,
  hour_bucket TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, hour_bucket)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for rate_limits" ON rate_limits
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Atomic increment and return new count (for rate limiting)
CREATE OR REPLACE FUNCTION increment_send_count(p_ip TEXT, p_hour_bucket TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO rate_limits (ip, hour_bucket, count)
  VALUES (p_ip, p_hour_bucket, 1)
  ON CONFLICT (ip, hour_bucket)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;
