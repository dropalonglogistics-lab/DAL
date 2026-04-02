import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// PUT /api/orders/[id]/status — update status (rider or admin)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const { status, note } = await req.json();

    const validStatuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify caller is the assigned rider or an admin
    const { data: order } = await supabase
        .from('express_orders')
        .select('rider_id, user_id')
        .eq('id', id)
        .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', auth.data.id).single();
    const isRider = order.rider_id === auth.data.id;
    const isAdmin = profile?.is_admin;

    if (!isRider && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden — must be assigned rider or admin' }, { status: 403 });
    }

    await supabase.from('express_orders').update({
        status,
        status_note: note ?? null,
        updated_at: new Date().toISOString()
    }).eq('id', id);

    // Push notification to customer on delivery
    if (status === 'delivered') {
        try {
            fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/push`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: order.user_id,
                    title: 'Delivery Complete ✅',
                    body: 'Your package has been delivered!'
                }),
            });
        } catch (_) {}
    }

    return NextResponse.json({ success: true, status });
}
