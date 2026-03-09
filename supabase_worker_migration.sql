-- Adds the required fields for Riders, Errand Workers, and Drivers

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS home_area TEXT,
  ADD COLUMN IF NOT EXISTS bvn TEXT,
  ADD COLUMN IF NOT EXISTS bvn_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS nin_number TEXT,
  
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_reg_number TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_year TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_make_model TEXT,
  
  ADD COLUMN IF NOT EXISTS vehicle_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS nin_slip_url TEXT,
  ADD COLUMN IF NOT EXISTS driver_licence_url TEXT,
  ADD COLUMN IF NOT EXISTS headshot_url TEXT,
  
  ADD COLUMN IF NOT EXISTS availability_preferences JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS transport_available TEXT,
  ADD COLUMN IF NOT EXISTS operating_areas JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS driving_hours TEXT,
  
  ADD COLUMN IF NOT EXISTS errand_opt_in BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_rider BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_errand_worker BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_driver BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS driver_subscription_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS driver_subscription_expires_at TIMESTAMPTZ;

-- Create the worker_documents storage bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('worker_documents', 'worker_documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for public reading of the documents
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'worker_documents');

-- Policies for authenticated users uploading files
CREATE POLICY "Auth Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'worker_documents' AND 
    auth.role() = 'authenticated'
  );

-- Reload schema caches for PostgREST to make it available to the Next.js client
NOTIFY pgrst, 'reload schema';
