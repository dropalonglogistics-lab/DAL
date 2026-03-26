-- Add all new columns (safe — only adds if missing)
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS route_title TEXT,
  ADD COLUMN IF NOT EXISTS start_location TEXT,
  ADD COLUMN IF NOT EXISTS stops_along_the_way TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_type_used TEXT,
  ADD COLUMN IF NOT EXISTS estimated_travel_time_min INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_travel_time_max INTEGER,
  ADD COLUMN IF NOT EXISTS fare_price_range_min INTEGER,
  ADD COLUMN IF NOT EXISTS fare_price_range_max INTEGER,
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging')),
  ADD COLUMN IF NOT EXISTS detailed_directions TEXT,
  ADD COLUMN IF NOT EXISTS tips_and_warnings TEXT;

-- Drop all old columns that are no longer used
ALTER TABLE routes
  DROP COLUMN IF EXISTS origin,
  DROP COLUMN IF EXISTS vehicle_type,
  DROP COLUMN IF EXISTS price_estimated,
  DROP COLUMN IF EXISTS duration_minutes,
  DROP COLUMN IF EXISTS itinerary,
  DROP COLUMN IF EXISTS fare_min,
  DROP COLUMN IF EXISTS fare_max;
