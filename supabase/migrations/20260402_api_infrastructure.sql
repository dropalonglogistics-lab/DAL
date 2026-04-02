-- Migration to support new API infrastructure: Saved Routes and Points Logging

-- 1. SAVED ROUTES TABLE (for premium notifications)
CREATE TABLE IF NOT EXISTS public.saved_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL, -- e.g. "Home -> Work" or just "Mile 3" for area matching
    origin_name TEXT,
    destination_name TEXT,
    origin_lat DOUBLE PRECISION,
    origin_lng DOUBLE PRECISION,
    destination_lat DOUBLE PRECISION,
    destination_lng DOUBLE PRECISION,
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own saved routes" ON public.saved_routes
    FOR ALL USING (auth.uid() = user_id);

-- 2. POINTS HISTORY TABLE (Standardized naming)
CREATE TABLE IF NOT EXISTS public.points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL, -- e.g. "ROUTE_SUGGESTION", "ALERT_POSTED"
    points INTEGER NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own points history" ON public.points_history
    FOR SELECT USING (auth.uid() = user_id);

-- 3. POINTS ADMIN LOG TABLE
CREATE TABLE IF NOT EXISTS public.points_admin_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Admin only table, no policy needed for regular users
ALTER TABLE public.points_admin_log ENABLE ROW LEVEL SECURITY;

-- 4. PROFILE ENHANCEMENTS (Ensure points and premium status exist)
-- (Already handled in previous migrations but double-check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_premium') THEN
        ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;
    END IF;
END $$;
