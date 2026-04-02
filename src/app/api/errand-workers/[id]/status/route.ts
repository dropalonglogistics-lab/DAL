import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// PUT /api/errand-workers/[id]/status — toggle AVAILABLE/BUSY
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const { status } = await req.json();
    if (!['AVAILABLE', 'BUSY'].includes(status)) {
        return NextResponse.json({ error: 'status must be AVAILABLE or BUSY' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: worker } = await supabase.from('errand_worker_profiles').select('user_id').eq('id', id).single();
    if (!worker) return NextResponse.json({ error: 'Errand worker profile not found' }, { status: 404 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', auth.data.id).single();
    if (worker.user_id !== auth.data.id && !profile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await supabase.from('errand_worker_profiles').update({ status }).eq('id', id);
    return NextResponse.json({ success: true, status });
}
