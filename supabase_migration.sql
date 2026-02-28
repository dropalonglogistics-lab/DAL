-- Step 1: Add new columns to the `community_routes` table
ALTER TABLE community_routes
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN DEFAULT false;

-- Step 2: Ensure itinerary uses JSONB for our complex nested objects
-- Note: if `itinerary` is currently text or a simple array, we can safely just alter it if it's empty, 
-- or you can manually cast it if you have existing data:
-- ALTER TABLE community_routes ALTER COLUMN itinerary TYPE JSONB USING itinerary::jsonb;
ALTER TABLE community_routes 
ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;

-- Reload schema caches for PostgREST to make it available to the Next.js client
NOTIFY pgrst, 'reload schema';
