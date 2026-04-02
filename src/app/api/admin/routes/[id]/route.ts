import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/api-helpers';

// PUT /api/admin/routes/[id] — approve or deny a route
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { action } = await req.json(); // 'approve' or 'deny'
    const supabase = await createClient();

    if (action === 'approve') {
        const { error } = await supabase.from('routes').update({ verified: true }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Route approved' });
    } else if (action === 'deny') {
        const { error } = await supabase.from('routes').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Route denied (deleted)' });
    }

    return NextResponse.json({ error: 'Invalid action. Use "approve" or "deny"' }, { status: 400 });
}
