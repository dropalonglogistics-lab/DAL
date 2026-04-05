-- 1. Create the trigger function to update user points automatically
CREATE OR REPLACE FUNCTION public.handle_points_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the points on the profile
    UPDATE public.profiles
    SET points = COALESCE(points, 0) + NEW.points_change
    WHERE id = NEW.user_id;

    -- Update total contributor stats if needed (from 20260403_complete_platform_schema.sql)
    -- total_routes_suggested and total_alerts_submitted
    IF NEW.action = 'route_suggestion' THEN
        UPDATE public.profiles SET total_routes_suggested = COALESCE(total_routes_suggested, 0) + 1 WHERE id = NEW.user_id;
    ELSIF NEW.action = 'alert_submission' THEN
        UPDATE public.profiles SET total_alerts_submitted = COALESCE(total_alerts_submitted, 0) + 1 WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the points_history table
DROP TRIGGER IF EXISTS tr_sync_points ON public.points_history;
CREATE TRIGGER tr_sync_points
AFTER INSERT ON public.points_history
FOR EACH ROW
EXECUTE FUNCTION public.handle_points_sync();

-- 3. Ensure RLS allows the system role to update points (should be covered by SECURITY DEFINER)
-- No additional RLS changes needed as the function is SECURITY DEFINER.
