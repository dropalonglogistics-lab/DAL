import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/routes/search?from=&to= — PUBLIC, returns routes with legs
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from')?.trim();
    const to = searchParams.get('to')?.trim();

    if (!from || !to) {
        return NextResponse.json({ error: 'from and to are required' }, { status: 400 });
    }

    const supabase = await createClient();

    let query = supabase
        .from('routes')
        .select('id, name, origin, destination, legs, created_at')
        .eq('status', 'approved');

    // Try partial match on origin and destination
    const { data: routes, error: queryError } = await query
        .ilike('origin', `%${from}%`)
        .ilike('destination', `%${to}%`);

    if (queryError) {
        return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    const results = routes ?? [];

    // Enrich with active alerts count for each route
    const enriched = await Promise.all(
        results.map(async (route) => {
            const { count: alertCount } = await supabase
                .from('alerts')
                .select('*', { count: 'exact', head: true })
                .ilike('area', `%${route.origin}%`)
                .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

            return {
                ...route,
                activeAlerts: alertCount ?? 0,
            };
        })
    );

    return NextResponse.json(
        { routes: enriched, count: enriched.length },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
    );
}
