import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// POST /api/orders/[id]/rate — customer rates delivery (1-5 stars + comment)
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const { rating, comment } = await req.json();
    if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 });
    }

    const supabase = await createClient();

    // Ensure caller is the order owner and order is delivered
    const { data: order } = await supabase
        .from('express_orders')
        .select('user_id, status, rider_id, rating')
        .eq('id', id)
        .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.user_id !== auth.data.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (order.status !== 'delivered') return NextResponse.json({ error: 'Can only rate delivered orders' }, { status: 400 });
    if (order.rating) return NextResponse.json({ error: 'Order already rated' }, { status: 400 });

    // Save rating on the order
    await supabase.from('express_orders').update({ rating, rating_comment: comment ?? null }).eq('id', id);

    // Update rider's reputation score (rolling average)
    if (order.rider_id) {
        const { data: riderRatings } = await supabase
            .from('express_orders')
            .select('rating')
            .eq('rider_id', order.rider_id)
            .not('rating', 'is', null);

        const ratings = [...(riderRatings ?? []).map(r => r.rating), rating];
        const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
        await supabase.from('profiles').update({ reputation_score: Math.round(avg * 10) / 10 }).eq('id', order.rider_id);
    }

    return NextResponse.json({ success: true });
}
