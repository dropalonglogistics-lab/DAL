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
        .select('id, origin, destination, fare_min, fare_max, duration_minutes, vehicle_type, description, verified, created_at')
        .eq('verified', true);

    // Try exact match first, then partial
    const { data: exact } = await query
        .ilike('origin', `%${from}%`)
        .ilike('destination', `%${to}%`);

    const routes = exact ?? [];

    // Enrich with active alerts count for each route
    const enriched = await Promise.all(
        routes.map(async (route) => {
            const { count: alertCount } = await supabase
                .from('alerts')
                .select('*', { count: 'exact', head: true })
                .ilike('area', `%${route.origin}%`)
                .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

            // Build structured legs from vehicle_type
            const vehicles = (route.vehicle_type || 'bus').split(',').map((v: string) => v.trim());
            const legs = vehicles.map((vehicle: string, i: number) => ({
                step: i + 1,
                vehicle: vehicle.toLowerCase(),
                description: `${vehicle} from ${i === 0 ? route.origin : 'connection'} to ${i === vehicles.length - 1 ? route.destination : 'connection'}`,
                estimated_fare: route.fare_min ? Math.round(route.fare_min / vehicles.length) : null,
            }));

            return {
                ...route,
                legs,
                activeAlerts: alertCount ?? 0,
            };
        })
    );

    return NextResponse.json(
        { routes: enriched, count: enriched.length },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
    );
}
