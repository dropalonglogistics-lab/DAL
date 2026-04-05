-- 1. Create the roles table without the strict foreign key for the migration phase
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID PRIMARY KEY,
    role TEXT DEFAULT 'admin'
);

-- 2. Populate only VALID users who exist in BOTH profiles and auth.users
-- This prevents the "23503: violates foreign key constraint" error caused by orphan profile records.
INSERT INTO public.admin_roles (user_id)
SELECT p.id 
FROM public.profiles p
WHERE p.is_admin = true 
AND EXISTS (SELECT 1 FROM auth.users WHERE id = p.id)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Now that data is safe, add the relationship for future integrity
ALTER TABLE public.admin_roles 
ADD CONSTRAINT admin_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Clean up old security loops
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
DROP FUNCTION IF EXISTS public.check_is_admin();

-- 5. Deploy High-Performance Policy
CREATE POLICY "Profiles access policy" ON public.profiles
FOR ALL USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
);
