import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// POST /api/errands/[id]/messages — send chat message
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const { message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: 'message is required' }, { status: 400 });

    const supabase = await createClient();

    // Ensure caller is the customer or assigned worker
    const { data: errand } = await supabase.from('errand_orders').select('user_id, worker_id').eq('id', id).single();
    if (!errand) return NextResponse.json({ error: 'Errand not found' }, { status: 404 });
    if (errand.user_id !== auth.data.id && errand.worker_id !== auth.data.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('errand_messages')
        .insert({ errand_id: id, sender_id: auth.data.id, message: message.trim() })
        .select('id, message, sender_id, created_at')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: data }, { status: 201 });
}

// GET /api/errands/[id]/messages — get chat history
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    const { data: errand } = await supabase.from('errand_orders').select('user_id, worker_id').eq('id', id).single();
    if (!errand) return NextResponse.json({ error: 'Errand not found' }, { status: 404 });
    if (errand.user_id !== auth.data.id && errand.worker_id !== auth.data.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data } = await supabase
        .from('errand_messages')
        .select('id, message, sender_id, created_at, sender:sender_id(full_name, avatar_url)')
        .eq('errand_id', id)
        .order('created_at', { ascending: true });

    return NextResponse.json({ messages: data ?? [] });
}
