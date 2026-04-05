-- 1. Create the 'profiles' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for the profiles bucket with UNIQUE names

-- 2.1 Allow public read access (Unique name to avoid conflict with worker_documents)
DROP POLICY IF EXISTS "Public Avatar Read Access" ON storage.objects;
CREATE POLICY "Public Avatar Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

-- 2.2 Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "Owners can upload avatars" ON storage.objects;
CREATE POLICY "Owners can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles' AND 
    auth.role() = 'authenticated'
  );

-- 2.3 Allow users to update or delete their own avatar
DROP POLICY IF EXISTS "Owners can update/delete avatars" ON storage.objects;
CREATE POLICY "Owners can update/delete avatars" ON storage.objects
  FOR ALL USING (
    bucket_id = 'profiles'
  );

-- 3. Reload schema caches for PostgREST
NOTIFY pgrst, 'reload schema';
