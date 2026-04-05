import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardOverview from './DashboardOverview';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 1. Fetch Profile first (to decide on redirect/creation)
    let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // 2. Auto-create profile if missing (Crucial for new users)
    if ((profileError && profileError.code === 'PGRST116') || !profile) {
        console.log("[Dashboard] Profile missing for user, auto-creating...", user.id);
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || 'Member',
                onboarding_completed: false
            })
            .select()
            .single();
        
        if (createError) {
            console.error("[Dashboard] Profile creation failed:", createError);
            // Fallback to minimal profile object to avoid crash
            profile = { id: user.id, full_name: 'Member', onboarding_completed: false } as any;
        } else {
            profile = newProfile;
        }
    }

    // 3. ENFORCE ONBOARDING
    if (profile && profile.onboarding_completed === false) {
        console.log("[Dashboard] Redirecting new user to onboarding:", user.id);
        redirect('/welcome');
    }

    // 4. Parallelize remaining dashboard data
    const [contributionsRes, alertsRes, ordersRes, routesRes] = await Promise.all([
        supabase.from('community_routes').select('*', { count: 'exact', head: true }).eq('submitted_by', user.id).gte('created_at', monthStart),
        supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthStart),
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('routes').select('*').eq('submitted_by', user.id).order('created_at', { ascending: false }).limit(5)
    ]);

    return (
        <DashboardOverview
            profile={profile}
            contributions={contributionsRes.count || 0}
            alertContributions={alertsRes.count || 0}
            initialOrders={ordersRes.data || []}
            initialRoutes={routesRes.data || []}
        />
    );
}
