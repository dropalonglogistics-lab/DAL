import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/orders/status/[reference] — get order status by reference
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ reference: string }> }
) {
    const { reference } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('express_orders')
        .select('id, reference, status, created_at, updated_at, pickup_address, dropoff_address, rider_id, rider_location_lat, rider_location_lng')
        .eq('reference', reference)
        .single();

    if (error || !data) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({ status: data.status, order: data });
}
