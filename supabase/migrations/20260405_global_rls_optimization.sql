-- 1. Create a high-performance, non-recursive check function (Essential)
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

-- 2. Comprehensive Table Update (With Column Detection)
-- We use a DO block to ensure the script doesn't fail if column names 
-- differ between development and production environments.
DO $$
BEGIN
    -- Fix Profiles (Primary bottleneck)
    DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
    CREATE POLICY "Profiles access policy" ON public.profiles 
    FOR ALL USING (auth.uid() = id OR public.check_is_admin());

    -- Fix Routes (If submitted_by exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'submitted_by') THEN
        DROP POLICY IF EXISTS "Admins manage routes" ON public.routes;
        CREATE POLICY "Admins manage routes" ON public.routes 
        FOR ALL USING (public.check_is_admin() OR auth.uid() = submitted_by);
    END IF;

    -- Fix Alerts (If reported_by exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'reported_by') THEN
        DROP POLICY IF EXISTS "Admins manage alerts" ON public.alerts;
        CREATE POLICY "Admins manage alerts" ON public.alerts 
        FOR ALL USING (public.check_is_admin() OR auth.uid() = reported_by);
    END IF;

    -- Fix Businesses (If owner_id exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'owner_id') THEN
        DROP POLICY IF EXISTS "Admins manage all businesses" ON public.businesses;
        CREATE POLICY "Admins manage all businesses" ON public.businesses 
        FOR ALL USING (public.check_is_admin() OR auth.uid() = owner_id);
    END IF;

    -- Fix Orders (If user_id exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
        CREATE POLICY "Admins view all orders" ON public.orders 
        FOR SELECT USING (public.check_is_admin());
    END IF;
END $$;

-- 3. Grant Permissions
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO anon;
