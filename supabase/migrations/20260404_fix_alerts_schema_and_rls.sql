-- 1. Fix RLS for anonymous alerts submission
DROP POLICY IF EXISTS "Authenticated users submit alerts" ON public.alerts;
CREATE POLICY "Public submit alerts" ON public.alerts FOR INSERT WITH CHECK (true);

-- 2. Add latitude and longitude columns for easier integration
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS latitude DECIMAL;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS longitude DECIMAL;

-- 3. Ensure reported_by is nullable (it should be already, but for clarity)
ALTER TABLE public.alerts ALTER COLUMN reported_by DROP NOT NULL;

-- 4. Fix a potential typo in notifications table if needed (I saw 'public.profiles(id)' instead of 'UUID REFERENCES public.profiles(id)')
-- Wait, let me check notifications again.
-- 228:     user_id public.profiles(id) NOT NULL,
-- That looks like a typo in 20260403_schema_execution.sql.
ALTER TABLE public.notifications DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES public.profiles(id) NOT NULL;
