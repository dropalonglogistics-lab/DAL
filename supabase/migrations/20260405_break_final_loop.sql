-- 1. Remove the recursive policy on the admin roles table
-- This was causing the "infinite loop" during security checks.
DROP POLICY IF EXISTS "Admins can view roles" ON public.admin_roles;

-- 2. Implement the high-performance non-recursive replacement
-- Allows every user to have their own admin rank checked instantly.
CREATE POLICY "Admins can view roles" ON public.admin_roles 
FOR SELECT USING (user_id = auth.uid());

-- 3. Confirm global function Search Path for stability
ALTER FUNCTION public.check_is_admin() SET search_path = public;

-- 4. Final confirmation of function permissions
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO anon;
