-- ─── 1. EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── 2. PROFILES (UPGRADE) ───────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_routes_suggested INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_alerts_submitted INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS errand_opt_in BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS transport_type TEXT;

-- ─── 3. ROUTES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    origin TEXT NOT NULL,
    origin_area TEXT,
    destination TEXT NOT NULL,
    destination_area TEXT,
    description TEXT,
    legs JSONB, -- array of {vehicle_type, description, estimated_minutes, estimated_fare}
    status TEXT DEFAULT 'pending', -- pending, approved, denied
    submitted_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    upvote_count INTEGER DEFAULT 0,
    search_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_origin_area ON public.routes(origin_area);

-- ─── 4. ALERTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    type TEXT NOT NULL, -- police, traffic, flood, accident, blocked, other
    title TEXT,
    description TEXT,
    location TEXT,
    area TEXT,
    coordinates GEOMETRY(POINT, 4326),
    severity TEXT DEFAULT 'info', -- info, warning, critical
    status TEXT DEFAULT 'active', -- active, verified, dismissed, expired
    reported_by UUID REFERENCES public.profiles(id),
    upvote_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '6 hours')
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_area ON public.alerts(area);
CREATE INDEX IF NOT EXISTS idx_alerts_created_desc ON public.alerts(created_at DESC);

-- ─── 5. ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL, -- DAL+8chars
    type TEXT NOT NULL, -- delivery, errand
    user_id UUID REFERENCES public.profiles(id),
    worker_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    
    -- Pickup/Dropoff
    pickup_address TEXT,
    pickup_lat DECIMAL,
    pickup_lng DECIMAL,
    dropoff_address TEXT,
    dropoff_lat DECIMAL,
    dropoff_lng DECIMAL,
    
    -- Errand Specifics
    errand_type TEXT,
    errand_description TEXT,
    item_budget INTEGER DEFAULT 0,
    deadline_preference TEXT,
    
    -- Delivery Specifics
    item_name TEXT,
    item_category TEXT,
    declared_value INTEGER,
    
    -- Financials
    fee_amount INTEGER NOT NULL, -- in kobo
    payment_status TEXT DEFAULT 'unpaid',
    payment_reference TEXT,
    payment_method TEXT,
    
    -- Tracking & Proof
    worker_lat DECIMAL,
    worker_lng DECIMAL,
    worker_last_updated TIMESTAMPTZ,
    customer_rating INTEGER,
    photo_proof_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_worker ON public.orders(worker_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders(reference);

-- ─── 6. ERRAND MESSAGES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.errand_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 7. BUSINESSES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    type TEXT,
    address TEXT,
    operating_areas TEXT[],
    operating_hours JSONB,
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_urls TEXT[],
    whatsapp TEXT,
    email TEXT,
    phone TEXT,
    delivery_zones TEXT[],
    min_order_value INTEGER DEFAULT 0,
    fulfilment_time TEXT,
    status TEXT DEFAULT 'pending', -- pending, active, suspended
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    rating_average DECIMAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 8. PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- in kobo
    compare_at_price INTEGER,
    category TEXT,
    images TEXT[],
    is_in_stock BOOLEAN DEFAULT true,
    is_delivery_eligible BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'draft', -- draft, published
    order_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 9. WAITLISTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT,
    phone TEXT,
    email TEXT,
    feature TEXT NOT NULL, -- f2, f3
    user_id UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_waitlists_feature ON public.waitlists(feature);

-- ─── 10. COMPETITIONS (UPGRADE) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    prize TEXT NOT NULL,
    rules TEXT,
    status TEXT DEFAULT 'active', -- active, ended
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    metric TEXT, -- total_points, routes_verified, alerts_confirmed, combined
    created_by UUID REFERENCES public.profiles(id),
    ended_by UUID REFERENCES public.profiles(id)
);

-- ─── 11. POINTS HISTORY ─────────────────────────────────────────
DROP TABLE IF EXISTS public.points_history CASCADE;
CREATE TABLE public.points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    action TEXT NOT NULL,
    points_change INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_id UUID,
    competition_id UUID REFERENCES public.competitions(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_points_user ON public.points_history(user_id);
CREATE INDEX idx_points_action ON public.points_history(action);

-- ─── 12. POINTS ADMIN LOG ───────────────────────────────────────
DROP TABLE IF EXISTS public.points_admin_log CASCADE;
CREATE TABLE public.points_admin_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) NOT NULL,
    direction TEXT NOT NULL, -- award, deduct
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    balance_before INTEGER,
    balance_after INTEGER,
    ip_address TEXT,
    competition_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 13. NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id public.profiles(id) NOT NULL,
    type TEXT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON public.notifications(user_id, is_read);

-- ─── 14. PLATFORM CONFIG ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 15. PAYOUTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount INTEGER NOT NULL, -- in kobo
    bank_code TEXT,
    account_number TEXT,
    paystack_recipient_code TEXT,
    paystack_transfer_ref TEXT,
    status TEXT DEFAULT 'pending', -- pending, processed, failed
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 16. ROW LEVEL SECURITY (RLS) ────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.errand_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_admin_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can manage own row" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Orders Policies
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() = worker_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Routes Policies
CREATE POLICY "Public view approved routes" ON public.routes FOR SELECT USING (status = 'approved');
CREATE POLICY "Authenticated users suggest routes" ON public.routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins manage routes" ON public.routes FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Alerts Policies
CREATE POLICY "Public view active alerts" ON public.alerts FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users submit alerts" ON public.alerts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins manage alerts" ON public.alerts FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Businesses Policies
CREATE POLICY "Public view active businesses" ON public.businesses FOR SELECT USING (status = 'active');
CREATE POLICY "Owners manage their business" ON public.businesses FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins manage all businesses" ON public.businesses FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Products Policies
CREATE POLICY "Public view published products" ON public.products FOR SELECT USING (status = 'published');
CREATE POLICY "Owners manage their products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Notifications Policies
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Points Policies
CREATE POLICY "Users view own points history" ON public.points_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Superadmin only log view" ON public.points_admin_log FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Waitlist Policies
CREATE POLICY "Public join waitlist" ON public.waitlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view waitlist" ON public.waitlists FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Competitions Policies
CREATE POLICY "Public view competitions" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Admins manage competitions" ON public.competitions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- ─── SEED DATA ───────────────────────────────────────────────────
INSERT INTO public.platform_config (key, value) VALUES
('f2_express_live', 'false'),
('f3_shopper_live', 'false'),
('delivery_base_fee', '500'),
('per_km_rate', '80'),
('rider_commission_pct', '20'),
('errand_commission_pct', '25'),
('driver_errand_commission_pct', '20'),
('points_route_suggestion', '50'),
('points_alert_verified', '30'),
('points_alert_confirmed', '20'),
('points_order', '10'),
('points_referral', '100')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
