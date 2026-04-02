import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/admin/analytics — administrative overview stats
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    // Today's starts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: newUsersToday } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayISO);
    
    const { count: ordersCount } = await supabase.from('express_orders').select('*', { count: 'exact', head: true });
    const { count: ordersToday } = await supabase.from('express_orders').select('*', { count: 'exact', head: true }).gte('created_at', todayISO);
    
    const { count: errandsCount } = await supabase.from('errand_orders').select('*', { count: 'exact', head: true });
    
    const { data: revenueData } = await supabase.from('express_orders').select('declared_value').eq('status', 'delivered');
    const totalRevenue = (revenueData ?? []).reduce((sum, order) => sum + (order.declared_value || 0), 0);

    const { count: pendingRoutes } = await supabase.from('routes').select('*', { count: 'exact', head: true }).eq('verified', false);
    const { count: pendingBusinesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return NextResponse.json({
        users: { total: usersCount ?? 0, today: newUsersToday ?? 0 },
        orders: { total: ordersCount ?? 0, today: ordersToday ?? 0 },
        errands: { total: errandsCount ?? 0 },
        revenue: { total: totalRevenue },
        pending: { routes: pendingRoutes ?? 0, businesses: pendingBusinesses ?? 0 }
    });
}
