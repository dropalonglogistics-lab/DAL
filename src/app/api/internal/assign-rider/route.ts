import { NextResponse } from 'next/server';
import { serviceRoleClient, haversineKm, requireBotSecret } from '@/utils/api-helpers';

// POST /api/internal/assign-rider — find and assign rider after payment
export async function POST(req: Request) {
    const auth = requireBotSecret(req);
    if (!auth.ok) return auth.response;

    const { orderId, pickup_lat, pickup_lng } = await req.json();

    if (!orderId || !pickup_lat || !pickup_lng) {
        return NextResponse.json({ error: 'orderId, pickup_lat, and pickup_lng are required' }, { status: 400 });
    }

    const supabase = serviceRoleClient();

    // 1. Find ONLINE riders
    const { data: riders } = await supabase
        .from('rider_profiles')
        .select('id, user_id, last_lat, last_lng')
        .eq('status', 'ONLINE');

    if (!riders || riders.length === 0) {
        return NextResponse.json({ success: false, message: 'No online riders found' });
    }

    // 2. Filter by 3km then 5km
    let candidate = riders.find(r => r.last_lat && r.last_lng && haversineKm(pickup_lat, pickup_lng, r.last_lat, r.last_lng) <= 3);
    
    if (!candidate) {
        candidate = riders.find(r => r.last_lat && r.last_lng && haversineKm(pickup_lat, pickup_lng, r.last_lat, r.last_lng) <= 5);
    }

    if (!candidate) {
        // Trigger admin alert for manual assignment
        return NextResponse.json({ success: false, message: 'No riders within range' });
    }

    // 3. Assign rider
    const { error: assignErr } = await supabase
        .from('express_orders')
        .update({ rider_id: candidate.user_id, status: 'assigned' })
        .eq('id', orderId);

    if (assignErr) return NextResponse.json({ error: assignErr.message }, { status: 500 });

    // 4. Send push notification to rider
    try {
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: candidate.user_id,
                title: 'New Delivery Job 📦',
                body: 'A new delivery request is available near you!'
            }),
        });
    } catch (_) {}

    return NextResponse.json({ success: true, riderId: candidate.user_id });
}
