CREATE TABLE IF NOT EXISTS waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Ensure public access for the homepage form
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing if any to avoid conflict
DROP POLICY IF EXISTS "Allow anon insert" ON waitlist;
CREATE POLICY "Allow anon insert" ON waitlist FOR INSERT WITH CHECK (true);
