-- 1. Create a Security Definer function to break the RLS recursion
-- This function runs with the privileges of the creator (Supabase Admin), 
-- bypassing the RLS internally to check the is_admin flag instantly.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT is_admin 
        FROM public.profiles 
        WHERE id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the old recursive policies
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own row" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.alerts;
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;

-- 3. Implement high-performance non-recursive policies
-- PROFILES: Users see own row, admins see everything
CREATE POLICY "Profiles access policy" ON public.profiles
FOR ALL USING (
    auth.uid() = id OR public.check_is_admin()
);

-- ALERTS: Admins can view and manage all alerts
CREATE POLICY "Admin alert management" ON public.alerts
FOR ALL USING (
    public.check_is_admin() OR auth.uid() = reported_by
);

-- BUSINESSES: Admins can view and manage all businesses
CREATE POLICY "Admin business management" ON public.businesses
FOR ALL USING (
    public.check_is_admin() OR auth.uid() = owner_id
);

-- 4. Restore standard user policies
CREATE POLICY "Points history view" ON public.points_history
FOR SELECT USING (auth.uid() = user_id);

GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO anon;
