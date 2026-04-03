-- 20260403_harmonize_routes.sql
-- Harmonize the 'routes' table schema ensuring data preservation of existing 508+ routes.

-- 1. Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

--- 2. Rename columns safely if they exist with old names
DO $$ 
BEGIN
    -- Rename route_title to name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'route_title') THEN
        ALTER TABLE public.routes RENAME COLUMN route_title TO name;
    END IF;

    -- Rename start_location to origin
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'start_location') THEN
        ALTER TABLE public.routes RENAME COLUMN start_location TO origin;
    END IF;

    -- Handle other common variations found in existing code
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'fare_price_range_min') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'fare_min') THEN
        ALTER TABLE public.routes RENAME COLUMN fare_price_range_min TO fare_min;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'fare_price_range_max') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'fare_max') THEN
        ALTER TABLE public.routes RENAME COLUMN fare_price_range_max TO fare_max;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'estimated_travel_time_min') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'duration_minutes') THEN
        ALTER TABLE public.routes RENAME COLUMN estimated_travel_time_min TO duration_minutes;
    END IF;
END $$;

-- 3. Add missing columns to ensure the full v2 schema is supported
ALTER TABLE public.routes 
ADD COLUMN IF NOT EXISTS origin_area TEXT,
ADD COLUMN IF NOT EXISTS destination_area TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS legs JSONB,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved', -- Default to approved for existing routes
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_count INTEGER DEFAULT 0;

-- 4. Data Patch: If 'legs' is empty but we have 'fare_min' or 'vehicle_type', we could potentially populate it.
-- For now, we ensure 'status' is 'approved' for all existing routes if it was null.
UPDATE public.routes SET status = 'approved' WHERE status IS NULL;

-- 5. Performance: Add B-tree indexes for fast prefix/partial search
CREATE INDEX IF NOT EXISTS idx_routes_origin ON public.routes (origin);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON public.routes (destination);
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes (status);

-- 6. Clean up old columns that are no longer used in the V2 logic (Optional, but safer for now to keep them)
-- ALTER TABLE public.routes DROP COLUMN IF EXISTS "detailed_directions";
-- ALTER TABLE public.routes DROP COLUMN IF EXISTS "tips_and_warnings";
