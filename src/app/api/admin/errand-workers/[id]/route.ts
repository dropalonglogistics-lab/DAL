import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/api-helpers';

// PUT /api/admin/errand-workers/[id] — approve or reject errand worker
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { action, reason } = await req.json(); // 'approve' or 'reject'
    const supabase = await createClient();

    if (action === 'approve') {
        const { error } = await supabase.from('errand_worker_profiles').update({ status: 'AVAILABLE', updated_at: new Date().toISOString() }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Errand worker approved' });
    } else if (action === 'reject') {
        const { error } = await supabase.from('errand_worker_profiles').update({ status: 'REJECTED', status_note: reason ?? null, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Errand worker rejected' });
    }

    return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject"' }, { status: 400 });
}
