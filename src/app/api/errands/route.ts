import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// POST /api/errands — create errand, trigger worker assignment
export async function POST(req: Request) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const {
        task_description, pickup_area, delivery_area,
        budget, items, urgency = 'normal',
        pickup_lat, pickup_lng,
    } = body;

    if (!task_description || !pickup_area) {
        return NextResponse.json({ error: 'task_description and pickup_area are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const reference = `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const { data: errand, error } = await supabase
        .from('errand_orders')
        .insert({
            user_id: auth.data.id,
            task_description,
            pickup_area,
            delivery_area: delivery_area ?? null,
            budget: budget ?? null,
            items: items ?? null,
            urgency,
            reference,
            status: 'pending',
        })
        .select('id')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Trigger 3-tier assignment asynchronously
    try {
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/internal/assign-errand-worker`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-bot-secret': process.env.BOT_SECRET! },
            body: JSON.stringify({ orderId: errand.id, pickup_lat, pickup_lng }),
        });
    } catch (_) {}

    return NextResponse.json({ id: errand.id, reference }, { status: 201 });
}
