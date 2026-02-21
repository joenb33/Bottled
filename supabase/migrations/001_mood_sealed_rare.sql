-- Run this if you already have the main schema; adds mood, time capsule, and rare bottle support.
-- New installs: use schema.sql which will be updated to include these columns.

ALTER TABLE messages ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sealed_until TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS one_time_use BOOLEAN DEFAULT FALSE;

-- RPC: only messages that are not flagged and (if sealed) past their seal date
CREATE OR REPLACE FUNCTION get_random_message()
RETURNS SETOF messages
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM messages
  WHERE is_flagged = FALSE
    AND (sealed_until IS NULL OR sealed_until <= NOW())
  ORDER BY random()
  LIMIT 1;
$$;
