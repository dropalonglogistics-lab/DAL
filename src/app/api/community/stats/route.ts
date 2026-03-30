import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Verified Route Count
        const { count: verifiedCount } = await supabase
            .from('community_routes')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');

        // 2. Alert Count (Last 24 Hours)
        const { count: alertCount } = await supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // 3. Member Count (Profiles)
        const { count: memberCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            verifiedCount: verifiedCount || 0,
            alertCount: alertCount || 0,
            memberCount: memberCount || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
