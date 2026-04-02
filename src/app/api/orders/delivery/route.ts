import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// POST /api/orders/delivery — create order, trigger rider assignment
export async function POST(req: Request) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const {
        pickup_address, pickup_lat, pickup_lng,
        dropoff_address, dropoff_lat, dropoff_lng,
        package_description, declared_value,
        recipient_name, recipient_phone,
        payment_method = 'wallet'
    } = body;

    if (!pickup_address || !dropoff_address || !recipient_phone) {
        return NextResponse.json({ error: 'pickup_address, dropoff_address, and recipient_phone are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const reference = `DEL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const { data: order, error } = await supabase
        .from('express_orders')
        .insert({
            user_id: auth.data.id,
            pickup_address,
            pickup_lat: pickup_lat ?? null,
            pickup_lng: pickup_lng ?? null,
            dropoff_address,
            dropoff_lat: dropoff_lat ?? null,
            dropoff_lng: dropoff_lng ?? null,
            package_description: package_description ?? null,
            declared_value: declared_value ?? null,
            recipient_name: recipient_name ?? null,
            recipient_phone,
            payment_method,
            reference,
            status: 'pending',
        })
        .select('id')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Trigger rider assignment asynchronously
    try {
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/internal/assign-rider`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-bot-secret': process.env.BOT_SECRET! },
            body: JSON.stringify({
                orderId: order.id,
                pickup_lat: pickup_lat ?? null,
                pickup_lng: pickup_lng ?? null,
            }),
        });
    } catch (_) { /* Fire and forget */ }

    return NextResponse.json({ id: order.id, reference }, { status: 201 });
}
