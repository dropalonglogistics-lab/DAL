-- 1. Create a dedicated table to house administrative role privileges.
-- Querying 'profiles.is_admin' inside 'profiles' RLS is recursive. 
-- Querying 'admin_roles' instead is instant and non-recursive.
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Migrate existing admins from the profiles table
INSERT INTO public.admin_roles (user_id)
SELECT id FROM public.profiles WHERE is_admin = true
ON CONFLICT (user_id) DO NOTHING;

-- 3. Scrub all problematic recursive policies
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
DROP POLICY IF EXISTS "Admin alert management" ON public.alerts;
DROP POLICY IF EXISTS "Admin business management" ON public.businesses;
DROP FUNCTION IF EXISTS public.check_is_admin();

-- 4. Re-implement high-performance secondary-table policies
-- PROFILES: Users see own row, admins see everything (via admin_roles)
CREATE POLICY "Profiles access policy" ON public.profiles
FOR ALL USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
);

-- ALERTS: Admins manage all, users manage own
CREATE POLICY "Admin alert management" ON public.alerts
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()) OR 
    auth.uid() = reported_by
);

-- BUSINESSES: Admins manage all, owners manage own
CREATE POLICY "Admin business management" ON public.businesses
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()) OR 
    auth.uid() = owner_id
);

-- 5. Expose admin_roles table for internal management
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view roles" ON public.admin_roles 
FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()));

GRANT SELECT ON public.admin_roles TO authenticated;
