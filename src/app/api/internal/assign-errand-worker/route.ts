import { NextResponse } from 'next/server';
import { serviceRoleClient, haversineKm } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// POST /api/internal/assign-errand-worker — find and assign worker after payment
export async function POST(req: Request) {
    const { orderId, pickup_lat, pickup_lng } = await req.json();

    if (!orderId || !pickup_lat || !pickup_lng) {
        return NextResponse.json({ error: 'orderId, pickup_lat, and pickup_lng are required' }, { status: 400 });
    }

    const supabase = serviceRoleClient();

    // ALGORITHM: 
    // Tier 1 (0-5 min): errand_worker profile with AVAILABLE status.
    // Tier 2 (5-10 min): rider profiles with errand_opt_in=true and ONLINE.
    // Tier 3 (10-13 min): driver profiles with errand_opt_in=true and AVAILABLE.
    // After 13 min: Admin alert + customer notification.

    // TIER 1: Errand Workers (Proximity 3km)
    const { data: errandWorkers } = await supabase
        .from('errand_worker_profiles')
        .select('id, user_id, last_lat, last_lng, profiles!inner(full_name, reputation_score)')
        .eq('status', 'AVAILABLE');

    let match = (errandWorkers ?? []).find(w => w.last_lat && w.last_lng && haversineKm(pickup_lat, pickup_lng, w.last_lat, w.last_lng) <= 3);

    // TIER 2: Riders (Proximity 3km)
    if (!match) {
        const { data: riders } = await supabase
            .from('rider_profiles')
            .select('id, user_id, last_lat, last_lng, profiles!inner(full_name, reputation_score)')
            .eq('status', 'ONLINE')
            .eq('errand_opt_in', true);
            
        match = (riders ?? []).find(r => r.last_lat && r.last_lng && haversineKm(pickup_lat, pickup_lng, r.last_lat, r.last_lng) <= 3);
    }

    // TIER 3: Drivers (Proximity 5km)
    if (!match) {
        const { data: drivers } = await supabase
            .from('driver_profiles')
            .select('id, user_id, last_lat, last_lng, profiles!inner(full_name, reputation_score)')
            .eq('status', 'AVAILABLE')
            .eq('errand_opt_in', true);
            
        match = (drivers ?? []).find(d => d.last_lat && d.last_lng && haversineKm(pickup_lat, pickup_lng, d.last_lat, d.last_lng) <= 5);
    }

    if (match) {
        await supabase.from('errand_orders').update({ 
            worker_id: match.user_id, 
            status: 'assigned' 
        }).eq('id', orderId);

        // Push notification to worker
        try {
            fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/push`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: match.user_id,
                    title: 'New Errand Assigned! 🚀',
                    body: 'A customer needs assistance with an errand. Check your tasks!'
                }),
            });
        } catch (_) {}

        return NextResponse.json({ success: true, workerId: match.user_id });
    }

    return NextResponse.json({ success: false, message: 'No worker matching the criteria was found.' });
}
