-- Enable Supabase Realtime for the key tables
-- This allows the dashboards to receive instant updates without page refreshes

BEGIN;

-- Check if publication exists and add tables if they are not already part of it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add relevant tables to the publication
-- We use 'ALTER' because 'supabase_realtime' usually exists but might not have these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.routes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
-- profiles is also useful for global commuter counts
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Ensure RLS allows the subscription based on the same policies as SELECT
-- (By default, Supabase Realtime respects RLS)

COMMIT;
