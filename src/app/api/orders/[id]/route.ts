import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/orders/[id] — order detail (owner or admin)
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', auth.data.id)
        .single();

    let query = supabase
        .from('express_orders')
        .select('*, rider:rider_id(full_name, phone, avatar_url, reputation_score)')
        .eq('id', id);

    if (!profile?.is_admin) {
        query = query.eq('user_id', auth.data.id);
    }

    const { data, error } = await query.single();
    if (error || !data) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({ order: data });
}
