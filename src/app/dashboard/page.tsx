import { createClient } from '@/utils/supabase/server';
import DashboardOverview from './DashboardOverview';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Parallelize real data fetching for the user
    // 1. Profile
    // 2. Contributions counts
    // 3. Recent Orders
    // 4. Saved/Recent Routes
    const [profileRes, contributionsRes, alertsRes, ordersRes, routesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('community_routes').select('*', { count: 'exact', head: true }).eq('submitted_by', user.id).gte('created_at', monthStart),
        supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthStart),
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('routes').select('*').eq('submitted_by', user.id).order('created_at', { ascending: false }).limit(5)
    ]);

    return (
        <DashboardOverview
            profile={profileRes.data}
            contributions={contributionsRes.count || 0}
            alertContributions={alertsRes.count || 0}
            initialOrders={ordersRes.data || []}
            initialRoutes={routesRes.data || []}
        />
    );
}
