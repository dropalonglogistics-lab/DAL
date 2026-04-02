import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// PUT /api/errands/[id]/status — worker updates status
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const { status, note } = await req.json();
    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. One of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: errand } = await supabase.from('errand_orders').select('worker_id, user_id').eq('id', id).single();
    if (!errand) return NextResponse.json({ error: 'Errand not found' }, { status: 404 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', auth.data.id).single();
    const isWorker = errand.worker_id === auth.data.id;
    if (!isWorker && !profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await supabase.from('errand_orders').update({ status, status_note: note ?? null, updated_at: new Date().toISOString() }).eq('id', id);

    if (status === 'completed') {
        try {
            fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/push`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: errand.user_id, title: 'Errand Complete ✅', body: 'Your errand has been completed!' }),
            });
        } catch (_) {}
    }

    return NextResponse.json({ success: true, status });
}
