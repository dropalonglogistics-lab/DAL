-- 1. Global Admin Check Function (Simplified & High-Performance)
-- This function will now check the static 'admin_roles' table 
-- instead of the dynamic 'profiles' table, breaking all possible 
-- recursion across the entire database.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.admin_roles 
        WHERE user_id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Bulk-Update Policies for ALL platform tables
-- We drop and recreate the admin-level policies across all core domains.

-- ORDERS
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
CREATE POLICY "Admins view all orders" ON public.orders 
FOR SELECT USING (public.check_is_admin());

-- ROUTES
DROP POLICY IF EXISTS "Admins manage routes" ON public.routes;
CREATE POLICY "Admins manage routes" ON public.routes 
FOR ALL USING (public.check_is_admin() OR auth.uid() = submitted_by);

-- ALERTS
DROP POLICY IF EXISTS "Admins manage alerts" ON public.alerts;
CREATE POLICY "Admins manage alerts" ON public.alerts 
FOR ALL USING (public.check_is_admin() OR auth.uid() = reported_by);

-- BUSINESSES
DROP POLICY IF EXISTS "Admins manage all businesses" ON public.businesses;
CREATE POLICY "Admins manage all businesses" ON public.businesses 
FOR ALL USING (public.check_is_admin() OR auth.uid() = owner_id);

-- POINTS HISTORY
DROP POLICY IF EXISTS "Admins manage points history" ON public.points_history;
CREATE POLICY "Admins manage points history" ON public.points_history 
FOR ALL USING (public.check_is_admin() OR auth.uid() = user_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications" ON public.notifications 
FOR ALL USING (public.check_is_admin() OR auth.uid() = user_id);

-- PLATFORM CONFIG (Critical)
DROP POLICY IF EXISTS "Admins manage config" ON public.platform_config;
CREATE POLICY "Admins manage config" ON public.platform_config 
FOR ALL USING (public.check_is_admin());

-- 3. Profiles Sync & Cleanup
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
CREATE POLICY "Profiles access policy" ON public.profiles
FOR ALL USING (auth.uid() = id OR public.check_is_admin());

-- 4. Grant Permissions
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO anon;
