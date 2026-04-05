-- ─── STEP 1 — Fix RLS Policies on the profiles table ─────────────────

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;

-- Safe SELECT policy (no subquery back to profiles)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Safe UPDATE policy
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Safe admin SELECT using auth.jwt() instead of querying profiles again
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  (auth.jwt() ->> 'role') = 'admin'
  OR auth.uid() = id
);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─── STEP 2 — Add indexes to prevent slow loads ───────────────────────

CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
-- In Supabase, the primary key is 'id'. Checking if 'user_id' exists as a separate field.
-- If not, profiles_id_idx is sufficient.
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(id) WHERE id IS NOT NULL;
