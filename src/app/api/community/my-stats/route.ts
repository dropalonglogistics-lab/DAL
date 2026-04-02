import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/community/my-stats — current user's community stats
export async function GET() {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    // Fetch user's profile points and city
    const { data: profile } = await supabase
        .from('profiles')
        .select('points, city')
        .eq('id', auth.data.id)
        .single();

    // Fetch user's contribution counts
    const { count: routesCount } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', auth.data.id);

    const { count: alertsCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', auth.data.id);

    // Fetch user's rank
    const { count: aboveCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('points', profile?.points ?? 0);

    const { count: totalParticipants } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    return NextResponse.json({
        points: profile?.points ?? 0,
        city: profile?.city || 'Port Harcourt',
        rank: (aboveCount ?? 0) + 1,
        totalParticipants: totalParticipants ?? 0,
        contributions: {
            routes: routesCount ?? 0,
            alerts: alertsCount ?? 0
        }
    });
}
