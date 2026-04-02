import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Verified Route Count (Primary Search Table)
        const { count: verifiedCount } = await supabase
            .from('routes')
            .select('*', { count: 'exact', head: true });

        // 2. Alert Count (Last 24 Hours)
        const { count: alertCount } = await supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // 3. Member Count (Active Profiles)
        const { count: memberCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            verifiedCount: verifiedCount || 0,
            alertCount: alertCount || 0,
            memberCount: memberCount || 0
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60'
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
