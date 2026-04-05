import { createClient } from '@/utils/supabase/server';
import DashboardOverview from './DashboardOverview';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null; // Should be handled by layout, but for safety

    // Community contributions this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Parallelize all data fetching
    const [profileRes, contributionsRes, alertsRes] = await Promise.all([
        supabase
            .from('profiles')
            .select('full_name, is_premium, points_balance, wallet_balance, role')
            .eq('id', user.id)
            .single(),
        supabase
            .from('community_routes')
            .select('*', { count: 'exact', head: true })
            .eq('submitted_by', user.id)
            .gte('created_at', monthStart),
        supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', monthStart)
    ]);

    return (
        <DashboardOverview
            profile={profileRes.data}
            contributions={contributionsRes.count ?? 0}
            alertContributions={alertsRes.count ?? 0}
        />
    );
}
