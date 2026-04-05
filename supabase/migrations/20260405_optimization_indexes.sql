-- Add performance indexes for the User Dashboard
-- These indexes speed up the "this month" contribution counts

-- Index for community_routes to speed up filtering by submitted_by and created_at
CREATE INDEX IF NOT EXISTS idx_community_routes_user_date 
ON community_routes (submitted_by, created_at DESC);

-- Index for alerts to speed up filtering by user_id and created_at
CREATE INDEX IF NOT EXISTS idx_alerts_user_date 
ON alerts (user_id, created_at DESC);

-- Optional: Index on points for leaderboard/profile lookup if not already there
CREATE INDEX IF NOT EXISTS idx_profiles_points 
ON profiles (points DESC);

-- Note: profiles(id) is already a Primary Key (indexed)
