import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// PUT /api/riders/[id]/status — toggle ONLINE/OFFLINE
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const { status } = await req.json();
    if (!['ONLINE', 'OFFLINE'].includes(status)) {
        return NextResponse.json({ error: 'status must be ONLINE or OFFLINE' }, { status: 400 });
    }

    const supabase = await createClient();

    // Must be own rider profile or admin
    const { data: riderProfile } = await supabase.from('rider_profiles').select('user_id').eq('id', id).single();
    if (!riderProfile) return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', auth.data.id).single();
    if (riderProfile.user_id !== auth.data.id && !profile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await supabase.from('rider_profiles').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ success: true, status });
}
