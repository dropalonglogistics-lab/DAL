import { createClient } from '@/utils/supabase/server';
import DashboardOverview from './DashboardOverview';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, is_premium, points_balance, wallet_balance, role')
        .eq('id', user!.id)
        .single();

    // Community contributions this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: contributions } = await supabase
        .from('community_routes')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', user!.id)
        .gte('created_at', monthStart);

    const { count: alertsCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('created_at', monthStart);

    return (
        <DashboardOverview
            profile={profile}
            contributions={contributions ?? 0}
            alertContributions={alertsCount ?? 0}
        />
    );
}
