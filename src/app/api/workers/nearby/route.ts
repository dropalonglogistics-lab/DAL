import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { haversineKm } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/workers/nearby?lat=&lng=&type= — nearby available workers
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const type = searchParams.get('type'); // rider, errand, driver

    if (isNaN(lat) || isNaN(lng) || !type) {
        return NextResponse.json({ error: 'lat, lng, and type are required' }, { status: 400 });
    }

    const supabase = await createClient();
    let workers: any[] = [];

    if (type === 'rider') {
        const { data } = await supabase
            .from('rider_profiles')
            .select('id, user_id, vehicle_type, status, last_lat, last_lng, profiles(full_name, avatar_url, reputation_score)')
            .eq('status', 'ONLINE');
        workers = data || [];
    } else if (type === 'errand') {
        const { data } = await supabase
            .from('errand_worker_profiles')
            .select('id, user_id, transport_type, status, last_lat, last_lng, profiles(full_name, avatar_url, reputation_score)')
            .eq('status', 'AVAILABLE');
        workers = data || [];
    } else if (type === 'driver') {
        const { data } = await supabase
            .from('driver_profiles')
            .select('id, user_id, vehicle_make, status, last_lat, last_lng, profiles(full_name, avatar_url, reputation_score)')
            .eq('status', 'AVAILABLE');
        workers = data || [];
    }

    // Filter by proximity (e.g., 5km)
    const nearby = workers.filter(w => {
        if (!w.last_lat || !w.last_lng) return false;
        const dist = haversineKm(lat, lng, w.last_lat, w.last_lng);
        return dist <= 5;
    }).map(w => ({
        id: w.id,
        userId: w.user_id,
        name: w.profiles?.full_name,
        avatar: w.profiles?.avatar_url,
        rating: w.profiles?.reputation_score,
        vehicle: w.vehicle_type || w.transport_type || `${w.vehicle_make} ${w.vehicle_model || ''}`,
        distance: haversineKm(lat, lng, w.last_lat, w.last_lng)
    }));

    return NextResponse.json({ workers: nearby });
}
