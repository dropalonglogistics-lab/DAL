-- Add road_condition to route_suggestions to match routes table categories
ALTER TABLE public.route_suggestions
  ADD COLUMN IF NOT EXISTS road_condition TEXT DEFAULT 'Good';
