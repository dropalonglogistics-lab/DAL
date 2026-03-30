-- ─── 1. ROUTE SUGGESTIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.route_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    expected_fare TEXT,
    peak_hours TEXT,
    description TEXT,
    submitted_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' -- pending, approved, rejected
);

ALTER TABLE public.route_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can suggest a route" ON public.route_suggestions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own suggestions" ON public.route_suggestions
    FOR SELECT USING (auth.uid() = submitted_by);

-- ─── 2. COMMUNITY POINTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.community_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.community_points
    FOR SELECT USING (auth.uid() = user_id);

-- ─── 3. COMPETITIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    prize TEXT NOT NULL,
    rules TEXT,
    status TEXT DEFAULT 'active', -- active, ended, upcoming
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view competitions" ON public.competitions
    FOR SELECT USING (true);

-- ─── 4. BLOG SUBSCRIBERS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active'
);

ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to blog" ON public.blog_subscribers
    FOR INSERT WITH CHECK (true);

-- ─── 5. CONTACT SUBMISSIONS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new'
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

-- ─── 6. PROFILE ENHANCEMENTS (POINTS COLUMN) ─────────────────
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') THEN
        ALTER TABLE public.profiles ADD COLUMN points INTEGER DEFAULT 0;
    END IF;
END $$;
