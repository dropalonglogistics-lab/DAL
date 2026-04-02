import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// POST /api/orders/[id]/location — rider updates GPS
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const { lat, lng } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return NextResponse.json({ error: 'lat and lng are required numbers' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify caller is the assigned rider
    const { data: order } = await supabase.from('express_orders').select('rider_id').eq('id', id).single();
    if (!order || order.rider_id !== auth.data.id) {
        return NextResponse.json({ error: 'Forbidden — must be the assigned rider' }, { status: 403 });
    }

    await supabase.from('express_orders').update({
        rider_location_lat: lat,
        rider_location_lng: lng,
        updated_at: new Date().toISOString(),
    }).eq('id', id);

    return NextResponse.json({ success: true });
}

// GET /api/orders/[id]/location — get rider location
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('express_orders')
        .select('status, rider_location_lat, rider_location_lng, rider_id')
        .eq('id', id)
        .single();
        
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    
    let rider = null;
    if (data.rider_id) {
        const { data: p } = await supabase.from('profiles').select('full_name, avatar_url, phone, reputation_score').eq('id', data.rider_id).single();
        rider = p;
    }

    return NextResponse.json({ ...data, rider });
}
