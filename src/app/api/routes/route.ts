import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/routes — PUBLIC, paginated list of verified routes
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;
    const area = searchParams.get('area');
    const vehicle = searchParams.get('vehicle');

    const supabase = await createClient();

    let query = supabase
        .from('routes')
        .select('id, origin, destination, fare_min, fare_max, duration_minutes, vehicle_type, verified, vote_score, created_at', { count: 'exact' })
        .eq('verified', true)
        .order('vote_score', { ascending: false })
        .range(offset, offset + limit - 1);

    if (area) query = query.or(`origin.ilike.%${area}%,destination.ilike.%${area}%`);
    if (vehicle) query = query.ilike('vehicle_type', `%${vehicle}%`);

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
        routes: data ?? [],
        total: count ?? 0,
        page,
        hasMore: (offset + limit) < (count ?? 0),
    }, { headers: { 'Cache-Control': 'public, s-maxage=300' } });
}

// POST /api/routes — Submit route suggestion (authenticated)
export async function POST(req: Request) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { origin, destination, vehicle_type, fare_min, fare_max, duration_minutes, description } = body;

    if (!origin || !destination || !vehicle_type) {
        return NextResponse.json({ error: 'origin, destination, and vehicle_type are required' }, { status: 400 });
    }

    const validVehicles = ['keke', 'taxi', 'shuttle', 'bus', 'bike', 'walk'];
    const vehicles = vehicle_type.split(',').map((v: string) => v.trim().toLowerCase());
    const invalid = vehicles.filter((v: string) => !validVehicles.includes(v));
    if (invalid.length > 0) {
        return NextResponse.json({ error: `Invalid vehicle types: ${invalid.join(', ')}. Valid: ${validVehicles.join(', ')}` }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('routes')
        .insert({
            origin,
            destination,
            vehicle_type,
            fare_min: fare_min ?? null,
            fare_max: fare_max ?? null,
            duration_minutes: duration_minutes ?? null,
            description: description ?? null,
            user_id: auth.data.id,
            verified: false, // Requires admin approval
        })
        .select('id')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Award points for route suggestion
    try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/points/award`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-bot-secret': process.env.BOT_SECRET! },
            body: JSON.stringify({ userId: auth.data.id, action: 'ROUTE_SUGGESTION', points: 5, description: 'Submitted a route suggestion' }),
        });
    } catch (_) { /* Non-critical */ }

    return NextResponse.json({ id: data.id, message: 'Route submitted for review' }, { status: 201 });
}
