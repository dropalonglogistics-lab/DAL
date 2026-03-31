-- Update route_suggestions to match routes schema
ALTER TABLE public.route_suggestions
  ADD COLUMN IF NOT EXISTS route_title TEXT,
  ADD COLUMN IF NOT EXISTS start_location TEXT,
  ADD COLUMN IF NOT EXISTS destination TEXT,
  ADD COLUMN IF NOT EXISTS stops_along_the_way JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS vehicle_type_used TEXT,
  ADD COLUMN IF NOT EXISTS estimated_travel_time_min INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_travel_time_max INTEGER,
  ADD COLUMN IF NOT EXISTS fare_price_range_min INTEGER,
  ADD COLUMN IF NOT EXISTS fare_price_range_max INTEGER,
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging')),
  ADD COLUMN IF NOT EXISTS detailed_directions TEXT,
  ADD COLUMN IF NOT EXISTS tips_and_warnings TEXT;

-- Drop old columns once data is migrated (Optional, keeping for safety for now)
-- ALTER TABLE public.route_suggestions DROP COLUMN IF EXISTS from_location;
-- ALTER TABLE public.route_suggestions DROP COLUMN IF EXISTS to_location;
-- ALTER TABLE public.route_suggestions DROP COLUMN IF EXISTS expected_fare;
-- ALTER TABLE public.route_suggestions DROP COLUMN IF EXISTS vehicle_type;
