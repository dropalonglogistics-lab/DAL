-- 1. Optimize Profile Visibility Tracking
-- Indexing last_visited_at (DESC) ensures the "Recent Visitors" list is returned instantly.
CREATE INDEX IF NOT EXISTS idx_profiles_last_visited ON public.profiles(last_visited_at DESC NULLS LAST);

-- 2. Optimize Alert & Route Metric Aggregation
-- Status-based counts ('pending', 'active', 'approved') are extremely common in the dashboard.
-- Adding single-column indexes for these solves potential slow counts on larger datasets.
CREATE INDEX IF NOT EXISTS idx_alerts_status_combined ON public.alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_routes_status_combined ON public.routes(status, created_at DESC);

-- 3. Optimize Order Metric Aggregation
CREATE INDEX IF NOT EXISTS idx_orders_status_combined ON public.orders(status, created_at DESC);

-- 4. Final Verification
-- ANALYZE; -- Recommended for Postgres after adding multiple indexes 
